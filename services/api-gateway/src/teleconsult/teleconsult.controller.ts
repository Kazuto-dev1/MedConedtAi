import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard, UsuarioPayload } from '../auth/jwt.guard';
import { TeleconsultService } from './teleconsult.service';

@Controller('teleconsult')
@UseGuards(JwtAuthGuard)
export class TeleconsultController {
  constructor(private readonly teleconsult: TeleconsultService) {}

  @Get(':appointmentId/session')
  sessao(
    @CurrentUser() usuario: UsuarioPayload,
    @Param('appointmentId') appointmentId: string,
  ) {
    return this.teleconsult.abrirSessao(usuario, appointmentId);
  }

  @Patch(':appointmentId/end')
  encerrar(
    @CurrentUser() usuario: UsuarioPayload,
    @Param('appointmentId') appointmentId: string,
  ) {
    return this.teleconsult.encerrar(usuario, appointmentId);
  }
}
