import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agenda, Especialidade, Profissional } from '../database/entities';
import { ReviewService } from '../reviews/review.service';
import { SearchProfessionalsDto } from './dto';

interface ProfissionalResumo {
  id: string;
  nome: string;
  registroCrm: string;
  bio: string | null;
  especialidades: string[];
  especialidadeIds: string[];
  blocos: number;
  precoMin: number | null;
  avaliacaoMedia: number | null;
  totalAvaliacoes: number;
}

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Profissional)
    private readonly profissionais: Repository<Profissional>,
    @InjectRepository(Especialidade)
    private readonly especialidades: Repository<Especialidade>,
    @InjectRepository(Agenda)
    private readonly agendas: Repository<Agenda>,
    private readonly reviews: ReviewService,
  ) {}

  listarEspecialidades() {
    return this.especialidades.find({ order: { nome: 'ASC' } });
  }

  async buscar(dto: SearchProfessionalsDto) {
    const page = dto.page ?? 1;
    const perPage = dto.perPage ?? 15;

    const [profissionais, agendas, especialidades, reputacoes] = await Promise.all([
      this.profissionais.find({ where: { ativo: true } }),
      this.agendas.find(),
      this.especialidades.find(),
      this.reviews.reputacoesPorProfissional(),
    ]);
    const nomePorId = new Map(especialidades.map((e) => [e.id, e.nome]));

    let resultados: ProfissionalResumo[] = profissionais.map((p) => {
      const agendasProf = agendas.filter((a) => a.profissionalId === p.id);
      const agendasFiltro = dto.especialidadeId
        ? agendasProf.filter((a) => a.especialidadeId === dto.especialidadeId)
        : agendasProf;

      const especialidadeIds = [...new Set(agendasProf.map((a) => a.especialidadeId))];
      const precos = agendasFiltro.map((a) => Number(a.preco));
      const rep = reputacoes.get(p.id);

      return {
        id: p.id,
        nome: p.nome,
        registroCrm: p.registroCrm,
        bio: p.bio,
        especialidadeIds,
        especialidades: especialidadeIds
          .map((id) => nomePorId.get(id))
          .filter((n): n is string => Boolean(n)),
        blocos: agendasFiltro.length,
        precoMin: precos.length ? Math.min(...precos) : null,
        avaliacaoMedia: rep?.media ?? null,
        totalAvaliacoes: rep?.total ?? 0,
      };
    });

    resultados = resultados.filter((r) => r.blocos > 0);

    if (dto.especialidadeId) {
      resultados = resultados.filter((r) =>
        r.especialidadeIds.includes(dto.especialidadeId as string),
      );
    }

    if (dto.precoMax != null) {
      resultados = resultados.filter(
        (r) => r.precoMin != null && r.precoMin <= (dto.precoMax as number),
      );
    }

    resultados.sort(
      (a, b) =>
        b.blocos - a.blocos ||
        (a.precoMin ?? Infinity) - (b.precoMin ?? Infinity) ||
        a.nome.localeCompare(b.nome),
    );

    const total = resultados.length;
    const inicio = (page - 1) * perPage;
    const itens = resultados.slice(inicio, inicio + perPage).map((r) => ({
      id: r.id,
      nome: r.nome,
      registroCrm: r.registroCrm,
      bio: r.bio,
      especialidades: r.especialidades,
      blocos: r.blocos,
      precoMin: r.precoMin,
      avaliacaoMedia: r.avaliacaoMedia,
      totalAvaliacoes: r.totalAvaliacoes,
    }));

    return { total, page, perPage, itens };
  }

  async detalhe(id: string) {
    const prof = await this.profissionais.findOne({ where: { id } });
    if (!prof) {
      return null;
    }

    const [agendas, especialidades] = await Promise.all([
      this.agendas.find({
        where: { profissionalId: id },
        order: { diaSemana: 'ASC', horaInicio: 'ASC' },
      }),
      this.especialidades.find(),
    ]);
    const nomePorId = new Map(especialidades.map((e) => [e.id, e.nome]));
    const avaliacoes = await this.reviews.listarPorProfissional(id);

    return {
      id: prof.id,
      nome: prof.nome,
      registroCrm: prof.registroCrm,
      bio: prof.bio,
      reputacao: { media: avaliacoes.media, total: avaliacoes.total },
      avaliacoes: avaliacoes.avaliacoes,
      agenda: agendas.map((a) => ({
        id: a.id,
        especialidade: nomePorId.get(a.especialidadeId) ?? null,
        local: a.local,
        diaSemana: a.diaSemana,
        horaInicio: a.horaInicio,
        horaFim: a.horaFim,
        preco: Number(a.preco),
      })),
    };
  }
}
