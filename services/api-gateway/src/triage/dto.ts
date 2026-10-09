import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class TriageDto {
  @IsInt()
  @Min(0)
  @Max(120)
  idade: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1200)
  tempoUltimoExameMeses?: number;

  @IsBoolean()
  historicoAlterado: boolean;

  @IsBoolean()
  sinaisAlerta: boolean;
}
