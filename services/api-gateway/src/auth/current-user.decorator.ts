import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UsuarioPayload } from './jwt.guard';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UsuarioPayload => {
    const req = context.switchToHttp().getRequest();
    return req.user as UsuarioPayload;
  },
);
