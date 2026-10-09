import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/jwt.guard';
import {
  Agenda,
  Consulta,
  Especialidade,
  Paciente,
  Profissional,
} from '../database/entities';
import { NoShowModule } from '../no-show/no-show.module';
import { NotificationsModule } from '../notifications/notification.module';
import { SchedulingController } from './scheduling.controller';
import { SchedulingService } from './scheduling.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Consulta,
      Agenda,
      Profissional,
      Paciente,
      Especialidade,
    ]),
    NoShowModule,
    NotificationsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'dev-secret-change-me'),
      }),
    }),
  ],
  controllers: [SchedulingController],
  providers: [SchedulingService, JwtAuthGuard],
})
export class SchedulingModule {}
