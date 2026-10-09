import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Consulta, Paciente, Profissional } from '../database/entities';
import { TeleconsultController } from './teleconsult.controller';
import { TeleconsultService } from './teleconsult.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Consulta, Paciente, Profissional]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'dev-secret-change-me'),
      }),
    }),
  ],
  controllers: [TeleconsultController],
  providers: [TeleconsultService, JwtAuthGuard],
})
export class TeleconsultModule {}
