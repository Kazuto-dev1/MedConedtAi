import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioPayload } from '../auth/jwt.guard';
import { Notificacao } from '../database/entities';

export type CanalNotificacao = 'push' | 'sms' | 'email';

export interface EnviarParams {
  usuarioId: string;
  canal: CanalNotificacao;
  tipo: string;
  titulo: string;
  mensagem: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger('Notificacao');

  constructor(
    @InjectRepository(Notificacao)
    private readonly notificacoes: Repository<Notificacao>,
  ) {}

  private async dispatch(p: EnviarParams): Promise<boolean> {
    const provider =
      p.canal === 'push' ? 'Firebase Cloud Messaging' : 'Twilio';
    this.logger.log(
      `[${p.canal}] via ${provider} -> usuario ${p.usuarioId}: "${p.titulo}" - ${p.mensagem}`,
    );
    return true;
  }

  async enviar(p: EnviarParams) {
    let ok = false;
    try {
      ok = await this.dispatch(p);
    } catch {
      ok = false;
    }
    const row = await this.notificacoes.save(
      this.notificacoes.create({
        usuarioId: p.usuarioId,
        canal: p.canal,
        tipo: p.tipo,
        titulo: p.titulo,
        mensagem: p.mensagem,
        status: ok ? 'enviado' : 'falha',
      }),
    );
    return { id: row.id, status: row.status };
  }

  async listar(usuario: UsuarioPayload) {
    return this.notificacoes.find({
      where: { usuarioId: usuario.sub },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async confirmacaoConsulta(usuarioId: string, descricao: string) {
    await Promise.all([
      this.enviar({
        usuarioId,
        canal: 'push',
        tipo: 'confirmacao',
        titulo: 'Consulta confirmada',
        mensagem: descricao,
      }),
      this.enviar({
        usuarioId,
        canal: 'email',
        tipo: 'confirmacao',
        titulo: 'Consulta confirmada',
        mensagem: descricao,
      }),
    ]);
  }

  async lembreteReforcado(usuarioId: string, descricao: string) {
    await Promise.all([
      this.enviar({
        usuarioId,
        canal: 'push',
        tipo: 'lembrete_reforcado',
        titulo: 'Confirme sua consulta',
        mensagem: descricao,
      }),
      this.enviar({
        usuarioId,
        canal: 'sms',
        tipo: 'lembrete_reforcado',
        titulo: 'Confirme sua consulta',
        mensagem: descricao,
      }),
    ]);
  }
}
