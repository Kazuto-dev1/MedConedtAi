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
import { Avaliacao, Consulta, Paciente } from '../database/entities';
import { CreateReviewDto } from './dto';

export interface Reputacao {
  media: number;
  total: number;
}

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Avaliacao)
    private readonly avaliacoes: Repository<Avaliacao>,
    @InjectRepository(Consulta)
    private readonly consultas: Repository<Consulta>,
    @InjectRepository(Paciente)
    private readonly pacientes: Repository<Paciente>,
  ) {}

  async reputacoesPorProfissional(): Promise<Map<string, Reputacao>> {
    const [avaliacoes, consultas] = await Promise.all([
      this.avaliacoes.find(),
      this.consultas.find(),
    ]);
    const profPorConsulta = new Map(consultas.map((c) => [c.id, c.profissionalId]));

    const acc = new Map<string, { soma: number; total: number }>();
    for (const a of avaliacoes) {
      const profId = profPorConsulta.get(a.consultaId);
      if (!profId) continue;
      const cur = acc.get(profId) ?? { soma: 0, total: 0 };
      cur.soma += a.nota;
      cur.total += 1;
      acc.set(profId, cur);
    }

    const resultado = new Map<string, Reputacao>();
    for (const [profId, v] of acc) {
      resultado.set(profId, {
        media: Number((v.soma / v.total).toFixed(2)),
        total: v.total,
      });
    }
    return resultado;
  }

  async criar(usuario: UsuarioPayload, dto: CreateReviewDto) {
    if (usuario.tipo !== 'paciente') {
      throw new ForbiddenException('Apenas pacientes podem avaliar');
    }

    const paciente = await this.pacientes.findOne({
      where: { usuarioId: usuario.sub },
    });
    if (!paciente) {
      throw new NotFoundException('Paciente nao encontrado');
    }

    const consulta = await this.consultas.findOne({ where: { id: dto.consultaId } });
    if (!consulta || consulta.pacienteId !== paciente.id) {
      throw new NotFoundException('Consulta nao encontrada');
    }
    if (consulta.status === 'cancelada') {
      throw new BadRequestException('Consulta cancelada nao pode ser avaliada');
    }
    const podeAvaliar =
      consulta.status === 'concluida' ||
      new Date(consulta.inicio).getTime() < Date.now();
    if (!podeAvaliar) {
      throw new BadRequestException('So e possivel avaliar consultas realizadas');
    }

    const existente = await this.avaliacoes.findOne({
      where: { consultaId: dto.consultaId },
    });
    if (existente) {
      throw new ConflictException('Consulta ja avaliada');
    }

    const av = await this.avaliacoes.save(
      this.avaliacoes.create({
        consultaId: dto.consultaId,
        nota: dto.nota,
        comentario: dto.comentario ?? null,
      }),
    );
    return { id: av.id, nota: av.nota };
  }

  async listarPorProfissional(profissionalId: string) {
    const consultas = await this.consultas.find({ where: { profissionalId } });
    const ids = consultas.map((c) => c.id);
    if (ids.length === 0) {
      return { media: null as number | null, total: 0, avaliacoes: [] };
    }

    const avaliacoes = await this.avaliacoes.find({
      where: { consultaId: In(ids) },
      order: { createdAt: 'DESC' },
    });
    const total = avaliacoes.length;
    const media = total
      ? Number((avaliacoes.reduce((s, a) => s + a.nota, 0) / total).toFixed(2))
      : null;

    return {
      media,
      total,
      avaliacoes: avaliacoes.map((a) => ({
        id: a.id,
        nota: a.nota,
        comentario: a.comentario,
        createdAt: a.createdAt,
      })),
    };
  }
}
