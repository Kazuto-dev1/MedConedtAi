import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import {
  Agenda,
  Avaliacao,
  Consulta,
  Especialidade,
  Notificacao,
  Paciente,
  Pagamento,
  PrevisaoNoShow,
  Profissional,
  Triagem,
  Usuario,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3' as const,
        database: config.get<string>(
          'SQLITE_PATH',
          '../../db/sqlite/medconecta.dev.sqlite',
        ),
        synchronize: true,
        entities: [
          Usuario,
          Paciente,
          Profissional,
          Especialidade,
          Agenda,
          Triagem,
          Consulta,
          Pagamento,
          PrevisaoNoShow,
          Notificacao,
          Avaliacao,
        ],
        namingStrategy: new SnakeNamingStrategy(),
      }),
    }),
  ],
})
export class DatabaseModule {}
