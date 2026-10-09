import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard, UsuarioPayload } from '../auth/jwt.guard';
import { AgendaService } from './agenda.service';
import { CreateAgendaDto, UpdateAgendaDto } from './dto';

@Controller('agenda')
@UseGuards(JwtAuthGuard)
export class AgendaController {
  constructor(private readonly agenda: AgendaService) {}

  @Get()
  listar(@CurrentUser() usuario: UsuarioPayload) {
    return this.agenda.listar(usuario);
  }

  @Post()
  criar(@CurrentUser() usuario: UsuarioPayload, @Body() dto: CreateAgendaDto) {
    return this.agenda.criar(usuario, dto);
  }

  @Patch(':id')
  atualizar(
    @CurrentUser() usuario: UsuarioPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAgendaDto,
  ) {
    return this.agenda.atualizar(usuario, id, dto);
  }

  @Delete(':id')
  remover(@CurrentUser() usuario: UsuarioPayload, @Param('id') id: string) {
    return this.agenda.remover(usuario, id);
  }
}
