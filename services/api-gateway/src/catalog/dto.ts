import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SearchProfessionalsDto {
  @IsOptional()
  @IsString()
  especialidadeId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precoMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perPage?: number;
}
