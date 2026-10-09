import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UsuarioPayload } from '../auth/jwt.guard';
import {
  Agenda,
  Consulta,
  Especialidade,
  Paciente,
  Profissional,
} from '../database/entities';
import { NoShowService } from '../no-show/no-show.service';
import { AvailabilityDto, CreateAppointmentDto } from './dto';

const SLOT_MIN = 30;

const pad2 = (n: number) => String(n).padStart(2, '0');

@Injectable()
export class SchedulingService {
  constructor(
    @InjectRepository(Consulta)
    private readonly consultas: Repository<Consulta>,
    @InjectRepository(Agenda)
    private readonly agendas: Repository<Agenda>,
    @InjectRepository(Profissional)
    private readonly profissionais: Repository<Profissional>,
    @InjectRepository(Paciente)
    private readonly pacientes: Repository<Paciente>,
    @InjectRepository(Especialidade)
    private readonly especialidades: Repository<Especialidade>,
    private readonly noShow: NoShowService,
  ) {}

  async disponibilidade({ profissionalId, data }: AvailabilityDto) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      throw new BadRequestException('Data invalida (use YYYY-MM-DD)');
    }

    const diaSemana = new Date(`${data}T00:00:00`).getDay();
    const blocos = await this.agendas.find({ where: { profissionalId, diaSemana } });
    if (blocos.length === 0) {
      return { data, slots: [] };
    }

    const [especialidades, consultas] = await Promise.all([
      this.especialidades.find(),
      this.consultas.find({ where: { profissionalId } }),
    ]);
    const nomePorId = new Map(especialidades.map((e) => [e.id, e.nome]));

    const ocupados = new Set(
      consultas
        .filter((c) => c.status !== 'cancelada')
        .map((c) => new Date(c.inicio).getTime()),
    );

    const agora = Date.now();
    const slots: {
      inicio: string;
      hora: string;
      especialidade: string | null;
      preco: number;
    }[] = [];

    for (const b of blocos) {
      const [hI, mI] = b.horaInicio.split(':').map(Number);
      const [hF, mF] = b.horaFim.split(':').map(Number);
      const fimMin = hF * 60 + mF;

      for (let cur = hI * 60 + mI; cur + SLOT_MIN <= fimMin; cur += SLOT_MIN) {
        const hora = `${pad2(Math.floor(cur / 60))}:${pad2(cur % 60)}`;
        const inicio = `${data}T${hora}:00`;
        const t = new Date(inicio).getTime();
        if (t < agora || ocupados.has(t)) continue;

        slots.push({
          inicio,
          hora,
          especialidade: nomePorId.get(b.especialidadeId) ?? null,
          preco: Number(b.preco),
        });
      }
    }

    slots.sort((a, b) => a.inicio.localeCompare(b.inicio));
    return { data, slots };
  }

  async criar(usuario: UsuarioPayload, dto: CreateAppointmentDto) {
    if (usuario.tipo !== 'paciente') {
      throw new ForbiddenException('Apenas pacientes podem agendar');
    }

    const paciente = await this.pacientes.findOne({ where: { usuarioId: usuario.sub } });
    if (!paciente) {
      throw new NotFoundException('Paciente nao encontrado');
    }

    const prof = await this.profissionais.findOne({ where: { id: dto.profissionalId } });
    if (!prof) {
      throw new NotFoundException('Profissional nao encontrado');
    }

    const inicioData = new Date(dto.inicio);
    if (Number.isNaN(inicioData.getTime())) {
      throw new BadRequestException('Inicio invalido');
    }

    const diaSemana = inicioData.getDay();
    const hora = `${pad2(inicioData.getHours())}:${pad2(inicioData.getMinutes())}`;
    const dia = `${inicioData.getFullYear()}-${pad2(inicioData.getMonth() + 1)}-${pad2(
      inicioData.getDate(),
    )}`;
    const inicio = `${dia}T${hora}:00`;

    const blocos = await this.agendas.find({
      where: { profissionalId: dto.profissionalId, diaSemana },
    });
    const bloco = blocos.find((b) => b.horaInicio <= hora && hora < b.horaFim);
    if (!bloco) {
      throw new BadRequestException('Horario fora da disponibilidade do profissional');
    }

    const fimDate = new Date(inicioData.getTime() + SLOT_MIN * 60000);
    const fim = `${dia}T${pad2(fimDate.getHours())}:${pad2(fimDate.getMinutes())}:00`;

    const inicioMs = new Date(inicio).getTime();
    const consultasProf = await this.consultas.find({
      where: { profissionalId: dto.profissionalId },
    });
    const conflito = consultasProf.some(
      (c) => c.status !== 'cancelada' && new Date(c.inicio).getTime() === inicioMs,
    );
    if (conflito) {
      throw new ConflictException('Horario indisponivel');
    }

    const consulta = this.consultas.create({
      pacienteId: paciente.id,
      profissionalId: dto.profissionalId,
      triagemId: dto.triagemId ?? null,
      modalidade: dto.modalidade,
      status: 'confirmada', // pagamento fora de escopo nesta fase
      inicio,
      fim,
      linkTeleconsulta:
        dto.modalidade === 'teleconsulta'
          ? `https://meet.medconecta.local/${paciente.id.slice(0, 8)}`
          : null,
    });

    const salva = await this.consultas.save(consulta);
    await this.noShow.avaliarConsulta(salva);
    return this.serializar(salva, prof.nome);
  }

  async listar(usuario: UsuarioPayload) {
    if (usuario.tipo === 'paciente') {
      const paciente = await this.pacientes.findOne({ where: { usuarioId: usuario.sub } });
      if (!paciente) throw new NotFoundException('Paciente nao encontrado');

      const consultas = await this.consultas.find({
        where: { pacienteId: paciente.id },
        order: { inicio: 'ASC' },
      });
      const nomes = await this.nomesDeProfissionais(consultas.map((c) => c.profissionalId));
      return consultas.map((c) => this.serializar(c, nomes.get(c.profissionalId) ?? ''));
    }

    const prof = await this.profissionais.findOne({ where: { usuarioId: usuario.sub } });
    if (!prof) throw new NotFoundException('Profissional nao encontrado');

    const consultas = await this.consultas.find({
      where: { profissionalId: prof.id },
      order: { inicio: 'ASC' },
    });
    const nomes = await this.nomesDePacientes(consultas.map((c) => c.pacienteId));
    return consultas.map((c) => this.serializar(c, nomes.get(c.pacienteId) ?? ''));
  }

  async cancelar(usuario: UsuarioPayload, id: string) {
    const consulta = await this.consultas.findOne({ where: { id } });
    if (!consulta) {
      throw new NotFoundException('Consulta nao encontrada');
    }

    if (usuario.tipo === 'paciente') {
      const paciente = await this.pacientes.findOne({ where: { usuarioId: usuario.sub } });
      if (!paciente || consulta.pacienteId !== paciente.id) {
        throw new ForbiddenException('Sem permissao sobre esta consulta');
      }
    } else {
      const prof = await this.profissionais.findOne({ where: { usuarioId: usuario.sub } });
      if (!prof || consulta.profissionalId !== prof.id) {
        throw new ForbiddenException('Sem permissao sobre esta consulta');
      }
    }

    if (consulta.status === 'concluida') {
      throw new BadRequestException('Consulta ja concluida nao pode ser cancelada');
    }

    consulta.status = 'cancelada';
    await this.consultas.save(consulta);
    return { id: consulta.id, status: consulta.status };
  }

  private serializar(c: Consulta, contraparte: string) {
    return {
      id: c.id,
      inicio: c.inicio,
      fim: c.fim,
      status: c.status,
      modalidade: c.modalidade,
      contraparte,
      linkTeleconsulta: c.linkTeleconsulta,
    };
  }

  private async nomesDeProfissionais(ids: string[]) {
    const unicos = [...new Set(ids)];
    if (unicos.length === 0) return new Map<string, string>();
    const lista = await this.profissionais.find({ where: { id: In(unicos) } });
    return new Map(lista.map((p) => [p.id, p.nome]));
  }

  private async nomesDePacientes(ids: string[]) {
    const unicos = [...new Set(ids)];
    if (unicos.length === 0) return new Map<string, string>();
    const lista = await this.pacientes.find({ where: { id: In(unicos) } });
    return new Map(lista.map((p) => [p.id, p.nome]));
  }
}
