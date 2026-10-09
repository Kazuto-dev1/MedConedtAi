import { Injectable } from '@nestjs/common';
import { TriageDto } from './dto';

export type NivelRisco = 'baixo' | 'medio' | 'alto';

export interface ResultadoRisco {
  nivel: NivelRisco;
  probabilidade: number;
}

@Injectable()
export class RiskService {
  avaliar(dto: TriageDto): ResultadoRisco {
    let score = 0.2;

    if (dto.idade >= 35) {
      score += 0.1;
    }
    if (dto.tempoUltimoExameMeses == null || dto.tempoUltimoExameMeses >= 36) {
      score += 0.15;
    }
    if (dto.historicoAlterado) {
      score += 0.25;
    }
    if (dto.sinaisAlerta) {
      score += 0.4;
    }

    const probabilidade = Math.min(Number(score.toFixed(4)), 0.99);
    const nivel: NivelRisco =
      probabilidade >= 0.6 ? 'alto' : probabilidade >= 0.3 ? 'medio' : 'baixo';

    return { nivel, probabilidade };
  }
}
