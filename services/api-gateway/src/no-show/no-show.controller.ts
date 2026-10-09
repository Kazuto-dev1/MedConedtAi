import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard, UsuarioPayload } from '../auth/jwt.guard';
import { NoShowService } from './no-show.service';

@Controller('no-show')
@UseGuards(JwtAuthGuard)
export class NoShowController {
  constructor(private readonly noShow: NoShowService) {}

  @Get('panel')
  painel(@CurrentUser() usuario: UsuarioPayload) {
    return this.noShow.painel(usuario);
  }

  @Get(':appointmentId')
  consultar(
    @CurrentUser() usuario: UsuarioPayload,
    @Param('appointmentId') appointmentId: string,
  ) {
    return this.noShow.consultar(usuario, appointmentId);
  }
}
