import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard, UsuarioPayload } from './jwt.guard';
import {
  ForgotPasswordDto,
  LoginDto,
  MfaCodeDto,
  MfaValidateDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  registrar(@Body() dto: RegisterDto) {
    return this.auth.registrar(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('mfa/validate')
  validarMfa(@Body() dto: MfaValidateDto) {
    return this.auth.validarMfa(dto);
  }

  @Post('forgot-password')
  esqueciSenha(@Body() dto: ForgotPasswordDto) {
    return this.auth.esqueciSenha(dto);
  }

  @Post('reset-password')
  redefinirSenha(@Body() dto: ResetPasswordDto) {
    return this.auth.redefinirSenha(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() usuario: UsuarioPayload) {
    return this.auth.me(usuario);
  }

  @Post('mfa/setup')
  @UseGuards(JwtAuthGuard)
  setupMfa(@CurrentUser() usuario: UsuarioPayload) {
    return this.auth.setupMfa(usuario);
  }

  @Post('mfa/confirm')
  @UseGuards(JwtAuthGuard)
  confirmarMfa(@CurrentUser() usuario: UsuarioPayload, @Body() dto: MfaCodeDto) {
    return this.auth.confirmarMfa(usuario, dto);
  }

  @Post('mfa/disable')
  @UseGuards(JwtAuthGuard)
  desativarMfa(@CurrentUser() usuario: UsuarioPayload, @Body() dto: MfaCodeDto) {
    return this.auth.desativarMfa(usuario, dto);
  }
}
