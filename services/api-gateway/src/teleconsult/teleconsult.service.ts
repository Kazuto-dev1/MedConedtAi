import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioPayload } from '../auth/jwt.guard';
import { Consulta, Paciente, Profissional } from '../database/entities';

export type StatusSala = 'aguardando' | 'em_andamento' | 'encerrada';

const JANELA_ANTES_MS = 15 * 60 * 1000; // entra 15 min antes
const JANELA_DEPOIS_MS = 30 * 60 * 1000; // tolera 30 min apos o fim

@Injectable()
export class TeleconsultService {
  constructor(
    @InjectRepository(Consulta)
    private readonly consultas: Repository<Consulta>,
    @InjectRepository(Paciente)
    private readonly pacientes: Repository<Paciente>,
    @InjectRepository(Profissional)
    private readonly profissionais: Repository<Profissional>,
  ) {}

  private salaId(id: string): string {
    return `medconecta-${id.replace(/-/g, '').slice(0, 12)}`;
  }

  private statusSala(inicioMs: number, fimMs: number, agora: number): StatusSala {
    if (agora < inicioMs) return 'aguardando';
    if (agora <= fimMs) return 'em_andamento';
    return 'encerrada';
  }

  private async contraparte(usuario: UsuarioPayload, consulta: Consulta): Promise<string> {
    if (usuario.tipo === 'paciente') {
      const prof = await this.profissionais.findOne({
        where: { id: consulta.profissionalId },
      });
      return prof?.nome ?? '';
    }
    const paciente = await this.pacientes.findOne({ where: { id: consulta.pacienteId } });
    return paciente?.nome ?? '';
  }

  private async validarAcesso(
    usuario: UsuarioPayload,
    appointmentId: string,
  ): Promise<Consulta> {
    const consulta = await this.consultas.findOne({ where: { id: appointmentId } });
    if (!consulta) {
      throw new NotFoundException('Consulta nao encontrada');
    }

    if (usuario.tipo === 'paciente') {
      const paciente = await this.pacientes.findOne({
        where: { usuarioId: usuario.sub },
      });
      if (!paciente || consulta.pacienteId !== paciente.id) {
        throw new ForbiddenException('Sem permissao sobre esta consulta');
      }
    } else {
      const prof = await this.profissionais.findOne({
        where: { usuarioId: usuario.sub },
      });
      if (!prof || consulta.profissionalId !== prof.id) {
        throw new ForbiddenException('Sem permissao sobre esta consulta');
      }
    }
    return consulta;
  }

  async abrirSessao(usuario: UsuarioPayload, appointmentId: string) {
    const consulta = await this.validarAcesso(usuario, appointmentId);

    if (consulta.modalidade !== 'teleconsulta') {
      throw new BadRequestException('Esta consulta nao e uma teleconsulta');
    }
    if (consulta.status === 'cancelada') {
      throw new BadRequestException('Consulta cancelada');
    }

    const salaId = this.salaId(consulta.id);
    const url = `https://meet.medconecta.local/${salaId}`;

    if (consulta.linkTeleconsulta !== url) {
      consulta.linkTeleconsulta = url;
      await this.consultas.save(consulta);
    }

    const inicioMs = new Date(consulta.inicio).getTime();
    const fimMs = new Date(consulta.fim).getTime();
    const agora = Date.now();
    const status = this.statusSala(inicioMs, fimMs, agora);
    const canJoin =
      agora >= inicioMs - JANELA_ANTES_MS && agora <= fimMs + JANELA_DEPOIS_MS;

    return {
      appointmentId: consulta.id,
      salaId,
      url,
      provider: 'medconecta-webrtc',
      status,
      canJoin,
      inicio: consulta.inicio,
      fim: consulta.fim,
      contraparte: await this.contraparte(usuario, consulta),
      consultaStatus: consulta.status,
    };
  }

  async encerrar(usuario: UsuarioPayload, appointmentId: string) {
    const consulta = await this.validarAcesso(usuario, appointmentId);
    if (consulta.status !== 'confirmada') {
      throw new BadRequestException('Consulta nao esta confirmada');
    }
    consulta.status = 'concluida';
    await this.consultas.save(consulta);
    return { id: consulta.id, status: consulta.status };
  }
}
