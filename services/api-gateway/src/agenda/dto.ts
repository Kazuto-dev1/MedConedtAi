import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateAgendaDto {
  @IsString()
  especialidadeId: string;

  @IsOptional()
  @IsString()
  local?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(6)
  diaSemana: number;

  @Matches(HORA, { message: 'horaInicio deve ser HH:MM' })
  horaInicio: string;

  @Matches(HORA, { message: 'horaFim deve ser HH:MM' })
  horaFim: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  preco: number;
}

export class UpdateAgendaDto {
  @IsOptional()
  @IsString()
  especialidadeId?: string;

  @IsOptional()
  @IsString()
  local?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(6)
  diaSemana?: number;

  @IsOptional()
  @Matches(HORA, { message: 'horaInicio deve ser HH:MM' })
  horaInicio?: string;

  @IsOptional()
  @Matches(HORA, { message: 'horaFim deve ser HH:MM' })
  horaFim?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  preco?: number;
}
