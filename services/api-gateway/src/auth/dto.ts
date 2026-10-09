import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsIn(['paciente', 'profissional'])
  tipo: 'paciente' | 'profissional';

  @IsString()
  nome: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  senha: string;

  @IsOptional()
  @IsString()
  registroCrm?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  senha: string;
}

export class MfaValidateDto {
  @IsString()
  mfaToken: string;

  @IsString()
  codigo: string;
}

export class MfaCodeDto {
  @IsString()
  codigo: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @MinLength(8)
  novaSenha: string;
}
