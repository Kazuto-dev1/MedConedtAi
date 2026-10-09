import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard, UsuarioPayload } from '../auth/jwt.guard';
import { AvailabilityDto, CreateAppointmentDto } from './dto';
import { SchedulingService } from './scheduling.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class SchedulingController {
  constructor(private readonly scheduling: SchedulingService) {}

  @Get('availability')
  disponibilidade(@Query() query: AvailabilityDto) {
    return this.scheduling.disponibilidade(query);
  }

  @Post('appointments')
  criar(@CurrentUser() usuario: UsuarioPayload, @Body() dto: CreateAppointmentDto) {
    return this.scheduling.criar(usuario, dto);
  }

  @Get('appointments')
  listar(@CurrentUser() usuario: UsuarioPayload) {
    return this.scheduling.listar(usuario);
  }

  @Patch('appointments/:id/cancel')
  cancelar(@CurrentUser() usuario: UsuarioPayload, @Param('id') id: string) {
    return this.scheduling.cancelar(usuario, id);
  }
}
