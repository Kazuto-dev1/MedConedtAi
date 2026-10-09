import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioPayload } from '../auth/jwt.guard';
import { Agenda, Especialidade, Profissional } from '../database/entities';
import { CreateAgendaDto, UpdateAgendaDto } from './dto';

@Injectable()
export class AgendaService {
  constructor(
    @InjectRepository(Agenda)
    private readonly agendas: Repository<Agenda>,
    @InjectRepository(Profissional)
    private readonly profissionais: Repository<Profissional>,
    @InjectRepository(Especialidade)
    private readonly especialidades: Repository<Especialidade>,
  ) {}

  private async meuProfissional(usuario: UsuarioPayload): Promise<Profissional> {
    if (usuario.tipo !== 'profissional') {
      throw new ForbiddenException('Acesso exclusivo do profissional');
    }
    const prof = await this.profissionais.findOne({
      where: { usuarioId: usuario.sub },
    });
    if (!prof) {
      throw new NotFoundException('Profissional nao encontrado');
    }
    return prof;
  }

  private async validarEspecialidade(id: string) {
    const esp = await this.especialidades.findOne({ where: { id } });
    if (!esp) {
      throw new BadRequestException('Especialidade invalida');
    }
  }

  async listar(usuario: UsuarioPayload) {
    const prof = await this.meuProfissional(usuario);
    const [blocos, especialidades] = await Promise.all([
      this.agendas.find({
        where: { profissionalId: prof.id },
        order: { diaSemana: 'ASC', horaInicio: 'ASC' },
      }),
      this.especialidades.find(),
    ]);
    const nome = new Map(especialidades.map((e) => [e.id, e.nome]));
    return blocos.map((b) => ({
      id: b.id,
      especialidadeId: b.especialidadeId,
      especialidade: nome.get(b.especialidadeId) ?? null,
      local: b.local,
      diaSemana: b.diaSemana,
      horaInicio: b.horaInicio,
      horaFim: b.horaFim,
      preco: Number(b.preco),
    }));
  }

  async criar(usuario: UsuarioPayload, dto: CreateAgendaDto) {
    const prof = await this.meuProfissional(usuario);
    await this.validarEspecialidade(dto.especialidadeId);
    if (dto.horaFim <= dto.horaInicio) {
      throw new BadRequestException('horaFim deve ser maior que horaInicio');
    }

    const bloco = await this.agendas.save(
      this.agendas.create({
        profissionalId: prof.id,
        especialidadeId: dto.especialidadeId,
        local: dto.local ?? null,
        diaSemana: dto.diaSemana,
        horaInicio: dto.horaInicio,
        horaFim: dto.horaFim,
        preco: dto.preco,
      }),
    );
    return { id: bloco.id };
  }

  async atualizar(usuario: UsuarioPayload, id: string, dto: UpdateAgendaDto) {
    const prof = await this.meuProfissional(usuario);
    const bloco = await this.agendas.findOne({ where: { id } });
    if (!bloco || bloco.profissionalId !== prof.id) {
      throw new NotFoundException('Bloco de agenda nao encontrado');
    }

    if (dto.especialidadeId) {
      await this.validarEspecialidade(dto.especialidadeId);
      bloco.especialidadeId = dto.especialidadeId;
    }
    if (dto.local !== undefined) bloco.local = dto.local ?? null;
    if (dto.diaSemana !== undefined) bloco.diaSemana = dto.diaSemana;
    if (dto.horaInicio) bloco.horaInicio = dto.horaInicio;
    if (dto.horaFim) bloco.horaFim = dto.horaFim;
    if (dto.preco !== undefined) bloco.preco = dto.preco;

    if (bloco.horaFim <= bloco.horaInicio) {
      throw new BadRequestException('horaFim deve ser maior que horaInicio');
    }

    await this.agendas.save(bloco);
    return { id: bloco.id };
  }

  async remover(usuario: UsuarioPayload, id: string) {
    const prof = await this.meuProfissional(usuario);
    const bloco = await this.agendas.findOne({ where: { id } });
    if (!bloco || bloco.profissionalId !== prof.id) {
      throw new NotFoundException('Bloco de agenda nao encontrado');
    }
    await this.agendas.remove(bloco);
    return { id, removido: true };
  }
}
