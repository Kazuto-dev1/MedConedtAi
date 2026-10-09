import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/jwt.guard';
import {
  Consulta,
  Paciente,
  PrevisaoNoShow,
  Profissional,
} from '../database/entities';
import { NotificationsModule } from '../notifications/notification.module';
import { NoShowController } from './no-show.controller';
import { NoShowService } from './no-show.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Consulta,
      PrevisaoNoShow,
      Paciente,
      Profissional,
    ]),
    NotificationsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'dev-secret-change-me'),
      }),
    }),
  ],
  controllers: [NoShowController],
  providers: [NoShowService, JwtAuthGuard],
  exports: [NoShowService],
})
export class NoShowModule {}
