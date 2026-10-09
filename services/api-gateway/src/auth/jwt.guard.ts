import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface UsuarioPayload {
  sub: string;
  tipo: 'paciente' | 'profissional';
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const header = req.headers['authorization'] as string | undefined;

    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticacao ausente');
    }

    try {
      const payload = await this.jwt.verifyAsync<UsuarioPayload>(header.slice(7));
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token invalido ou expirado');
    }
  }
}
