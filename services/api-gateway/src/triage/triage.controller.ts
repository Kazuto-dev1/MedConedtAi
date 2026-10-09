import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard, UsuarioPayload } from '../auth/jwt.guard';
import { TriageDto } from './dto';
import { TriageService } from './triage.service';

@Controller('triage')
@UseGuards(JwtAuthGuard)
export class TriageController {
  constructor(private readonly triage: TriageService) {}

  @Post()
  executar(@CurrentUser() usuario: UsuarioPayload, @Body() dto: TriageDto) {
    return this.triage.executar(usuario, dto);
  }
}
