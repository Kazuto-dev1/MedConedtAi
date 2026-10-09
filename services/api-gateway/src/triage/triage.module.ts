import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Especialidade, Paciente, Triagem } from '../database/entities';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RiskService } from './risk.service';
import { TriageController } from './triage.controller';
import { TriageService } from './triage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Triagem, Paciente, Especialidade]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'dev-secret-change-me'),
      }),
    }),
  ],
  controllers: [TriageController],
  providers: [TriageService, RiskService, JwtAuthGuard],
})
export class TriageModule {}
