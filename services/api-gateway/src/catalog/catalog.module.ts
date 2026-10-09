import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agenda, Especialidade, Profissional } from '../database/entities';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';

@Module({
  imports: [TypeOrmModule.forFeature([Profissional, Especialidade, Agenda])],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
