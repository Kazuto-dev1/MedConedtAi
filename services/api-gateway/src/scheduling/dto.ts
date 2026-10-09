import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  profissionalId: string;

  @IsIn(['presencial', 'teleconsulta'])
  modalidade: 'presencial' | 'teleconsulta';

  @IsString()
  inicio: string; // 'YYYY-MM-DDTHH:MM:00'

  @IsOptional()
  @IsString()
  triagemId?: string;
}

export class AvailabilityDto {
  @IsString()
  profissionalId: string;

  @IsString()
  data: string; // 'YYYY-MM-DD'
}
