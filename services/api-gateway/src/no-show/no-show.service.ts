import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioPayload } from '../auth/jwt.guard';
import {
  Consulta,
  Notificacao,
  Paciente,
  PrevisaoNoShow,
  Profissional,
} from '../database/entities';

export type NivelNoShow = 'baixo' | 'medio' | 'alto';

export interface ResultadoNoShow {
  probabilidade: number;
  risco: NivelNoShow | 'nao_avaliado';
  lembreteReforcado: boolean;
}

const DIAS_MS = 86_400_000;

/**
 * Previsao de no-show provisoria (heuristica), alinha ao stub do servico de IA
 * (ai/app/main.py). Limiar de alto risco: >= 0.50 (DEC-003). Sera substituida pelo
 * modelo scikit-learn.
 */
@Injectable()
export class NoShowService {
  constructor(
    @InjectRepository(Consulta)
    private readonly consultas: Repository<Consulta>,
    @InjectRepository(PrevisaoNoShow)
    private readonly previsoes: Repository<PrevisaoNoShow>,
    @InjectRepository(Notificacao)
    private readonly notificacoes: Repository<Notificacao>,
    @InjectRepository(Paciente)
    private readonly pacientes: Repository<Paciente>,
    @InjectRepository(Profissional)
    private readonly profissionais: Repository<Profissional>,
  ) {}

  private calcular(antecedenciaDias: number, historicoFaltas: number): {
    probabilidade: number;
    risco: NivelNoShow;
  } {
    let score = 0.2 + 0.05 * historicoFaltas - 0.01 * antecedenciaDias;
    score = Math.max(0, Math.min(0.99, Number(score.toFixed(4))));
    const risco: NivelNoShow =
      score >= 0.5 ? 'alto' : score >= 0.25 ? 'medio' : 'baixo';
    return { probabilidade: score, risco };
  }

  private antecedenciaDias(consulta: Consulta): number {
    const ms =
      new Date(consulta.inicio).getTime() - new Date(consulta.createdAt).getTime();
    return Math.max(0, Math.round(ms / DIAS_MS));
  }

  private historicoFaltas(pacienteId: string): Promise<number> {
    return this.consultas.count({ where: { pacienteId, status: 'cancelada' } });
  }

  /** Calcula, persiste a previsao e aciona lembrete reforcado se risco alto. */
  async avaliarConsulta(consulta: Consulta): Promise<ResultadoNoShow> {
    const historico = await this.historicoFaltas(consulta.pacienteId);
    const { probabilidade, risco } = this.calcular(
      this.antecedenciaDias(consulta),
      historico,
    );
    const lembreteReforcado = risco === 'alto';

    const existente = await this.previsoes.findOne({
      where: { consultaId: consulta.id },
    });
    if (existente) {
      existente.probabilidade = probabilidade;
      existente.risco = risco;
      existente.lembreteReforcado = lembreteReforcado;
      await this.previsoes.save(existente);
    } else {
      await this.previsoes.save(
        this.previsoes.create({
          consultaId: consulta.id,
          probabilidade,
          risco,
          lembreteReforcado,
        }),
      );
    }

    if (lembreteReforcado) {
      const paciente = await this.pacientes.findOne({
        where: { id: consulta.pacienteId },
      });
      if (paciente) {
        await this.notificacoes.save(
          this.notificacoes.create({
            usuarioId: paciente.usuarioId,
            canal: 'push',
            tipo: 'lembrete_reforcado',
            status: 'pendente',
          }),
        );
      }
    }

    return { probabilidade, risco, lembreteReforcado };
  }

  async consultar(
    usuario: UsuarioPayload,
    appointmentId: string,
  ): Promise<ResultadoNoShow> {
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

    const prev = await this.previsoes.findOne({
      where: { consultaId: appointmentId },
    });
    if (prev) {
      return {
        probabilidade: Number(prev.probabilidade),
        risco: prev.risco,
        lembreteReforcado: prev.lembreteReforcado,
      };
    }
    return this.avaliarConsulta(consulta);
  }

  async painel(usuario: UsuarioPayload) {
    if (usuario.tipo !== 'profissional') {
      throw new ForbiddenException('Painel exclusivo do profissional');
    }

    const prof = await this.profissionais.findOne({
      where: { usuarioId: usuario.sub },
    });
    if (!prof) {
      throw new NotFoundException('Profissional nao encontrado');
    }

    const [consultas, previsoes, pacientes] = await Promise.all([
      this.consultas.find({
        where: { profissionalId: prof.id },
        order: { inicio: 'ASC' },
      }),
      this.previsoes.find(),
      this.pacientes.find(),
    ]);
    const prevPorConsulta = new Map(previsoes.map((p) => [p.consultaId, p]));
    const nomePaciente = new Map(pacientes.map((p) => [p.id, p.nome]));

    return consultas
      .filter((c) => c.status !== 'cancelada')
      .map((c) => {
        const p = prevPorConsulta.get(c.id);
        return {
          consultaId: c.id,
          inicio: c.inicio,
          modalidade: c.modalidade,
          status: c.status,
          paciente: nomePaciente.get(c.pacienteId) ?? '',
          risco: p?.risco ?? 'nao_avaliado',
          probabilidade: p ? Number(p.probabilidade) : null,
          lembreteReforcado: p?.lembreteReforcado ?? false,
        };
      })
      .sort((a, b) => (b.probabilidade ?? -1) - (a.probabilidade ?? -1));
  }
}
