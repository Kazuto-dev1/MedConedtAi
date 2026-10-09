import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioPayload } from '../auth/jwt.guard';
import { Especialidade, Paciente, Triagem } from '../database/entities';
import { TriageDto } from './dto';
import { RiskService } from './risk.service';

const AVISO =
  'Esta triagem e um apoio a decisao e nao substitui o diagnostico medico.';

@Injectable()
export class TriageService {
  constructor(
    @InjectRepository(Triagem)
    private readonly triagens: Repository<Triagem>,
    @InjectRepository(Paciente)
    private readonly pacientes: Repository<Paciente>,
    @InjectRepository(Especialidade)
    private readonly especialidades: Repository<Especialidade>,
    private readonly risk: RiskService,
  ) {}

  async executar(usuario: UsuarioPayload, dto: TriageDto) {
    if (usuario.tipo !== 'paciente') {
      throw new ForbiddenException('Apenas pacientes realizam triagem');
    }

    const paciente = await this.pacientes.findOne({
      where: { usuarioId: usuario.sub },
    });
    if (!paciente) {
      throw new NotFoundException('Paciente nao encontrado para o usuario');
    }

    const risco = this.risk.avaliar(dto);

    const especialidade = await this.especialidades.findOne({
      where: { nome: 'Ginecologia' },
    });

    const triagem = await this.triagens.save(
      this.triagens.create({
        pacienteId: paciente.id,
        respostas: JSON.stringify(dto),
        nivelRisco: risco.nivel,
        probabilidade: risco.probabilidade,
        especialidadeSugeridaId: especialidade?.id ?? null,
      }),
    );

    return {
      triagemId: triagem.id,
      nivelRisco: risco.nivel,
      probabilidade: risco.probabilidade,
      especialidadeSugerida: especialidade?.nome ?? null,
      especialidadeSugeridaId: especialidade?.id ?? null,
      aviso: AVISO,
    };
  }
}
