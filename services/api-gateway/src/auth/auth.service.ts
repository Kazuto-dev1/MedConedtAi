import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { generateSecret, generateURI, verify as verifyOtp } from 'otplib';
import * as QRCode from 'qrcode';
import { Repository } from 'typeorm';
import { Paciente, Profissional, Usuario } from '../database/entities';
import { UsuarioPayload } from './jwt.guard';
import {
  ForgotPasswordDto,
  LoginDto,
  MfaCodeDto,
  MfaValidateDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto';

const MFA_EMISSOR = 'MedConecta AI';
const RESET_TTL_MS = 60 * 60 * 1000; // 1 hora

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarios: Repository<Usuario>,
    @InjectRepository(Paciente)
    private readonly pacientes: Repository<Paciente>,
    @InjectRepository(Profissional)
    private readonly profissionais: Repository<Profissional>,
    private readonly jwt: JwtService,
  ) {}

  async registrar(dto: RegisterDto) {
    const existe = await this.usuarios.findOne({ where: { email: dto.email } });
    if (existe) {
      throw new ConflictException('Email ja cadastrado');
    }

    if (dto.tipo === 'profissional' && !dto.registroCrm) {
      throw new BadRequestException('registroCrm e obrigatorio para profissional');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);
    const usuario = await this.usuarios.save(
      this.usuarios.create({
        email: dto.email,
        senhaHash,
        tipo: dto.tipo,
        consentimentoLgpd: true,
      }),
    );

    if (dto.tipo === 'paciente') {
      await this.pacientes.save(
        this.pacientes.create({ usuarioId: usuario.id, nome: dto.nome }),
      );
    } else {
      await this.profissionais.save(
        this.profissionais.create({
          usuarioId: usuario.id,
          nome: dto.nome,
          registroCrm: dto.registroCrm!,
        }),
      );
    }

    return { id: usuario.id, email: usuario.email, tipo: usuario.tipo };
  }

  private async emitirToken(usuario: Usuario) {
    const accessToken = await this.jwt.signAsync({
      sub: usuario.id,
      tipo: usuario.tipo,
    });
    return { access_token: accessToken, token_type: 'Bearer', tipo: usuario.tipo };
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuarios.findOne({ where: { email: dto.email } });
    if (!usuario) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    const senhaOk = await bcrypt.compare(dto.senha, usuario.senhaHash);
    if (!senhaOk) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    if (usuario.mfaAtivo) {
      const mfaToken = await this.jwt.signAsync(
        { sub: usuario.id, purpose: 'mfa' },
        { expiresIn: 300 },
      );
      return { mfaRequired: true, mfaToken };
    }

    return this.emitirToken(usuario);
  }

  async validarMfa(dto: MfaValidateDto) {
    let payload: { sub: string; purpose?: string };
    try {
      payload = await this.jwt.verifyAsync(dto.mfaToken);
    } catch {
      throw new UnauthorizedException('Token de MFA invalido ou expirado');
    }
    if (payload.purpose !== 'mfa') {
      throw new UnauthorizedException('Token de MFA invalido');
    }

    const usuario = await this.usuarios.findOne({ where: { id: payload.sub } });
    if (!usuario || !usuario.mfaAtivo || !usuario.mfaSecret) {
      throw new UnauthorizedException('MFA nao configurado');
    }

    const ok = (await verifyOtp({ token: dto.codigo, secret: usuario.mfaSecret })).valid;
    if (!ok) {
      throw new UnauthorizedException('Codigo de verificacao invalido');
    }

    return this.emitirToken(usuario);
  }

  async me(usuarioLogado: UsuarioPayload) {
    const usuario = await this.usuarios.findOne({ where: { id: usuarioLogado.sub } });
    if (!usuario) {
      throw new NotFoundException('Usuario nao encontrado');
    }
    return {
      id: usuario.id,
      email: usuario.email,
      tipo: usuario.tipo,
      mfaAtivo: usuario.mfaAtivo,
    };
  }

  async setupMfa(usuarioLogado: UsuarioPayload) {
    const usuario = await this.usuarios.findOne({ where: { id: usuarioLogado.sub } });
    if (!usuario) {
      throw new NotFoundException('Usuario nao encontrado');
    }
    if (usuario.tipo !== 'profissional') {
      throw new BadRequestException('MFA disponivel apenas para profissionais');
    }

    const secret = generateSecret();
    usuario.mfaSecret = secret;
    usuario.mfaAtivo = false;
    await this.usuarios.save(usuario);

    const otpauthUrl = generateURI({ issuer: MFA_EMISSOR, label: usuario.email, secret });
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl);
    return { secret, otpauthUrl, qrDataUrl };
  }

  async confirmarMfa(usuarioLogado: UsuarioPayload, dto: MfaCodeDto) {
    const usuario = await this.usuarios.findOne({ where: { id: usuarioLogado.sub } });
    if (!usuario) {
      throw new NotFoundException('Usuario nao encontrado');
    }
    if (!usuario.mfaSecret) {
      throw new BadRequestException('Inicie a configuracao do MFA primeiro');
    }

    const ok = (await verifyOtp({ token: dto.codigo, secret: usuario.mfaSecret })).valid;
    if (!ok) {
      throw new UnauthorizedException('Codigo de verificacao invalido');
    }

    usuario.mfaAtivo = true;
    await this.usuarios.save(usuario);
    return { mfaAtivo: true };
  }

  async desativarMfa(usuarioLogado: UsuarioPayload, dto: MfaCodeDto) {
    const usuario = await this.usuarios.findOne({ where: { id: usuarioLogado.sub } });
    if (!usuario) {
      throw new NotFoundException('Usuario nao encontrado');
    }
    if (!usuario.mfaAtivo || !usuario.mfaSecret) {
      return { mfaAtivo: false };
    }

    const ok = (await verifyOtp({ token: dto.codigo, secret: usuario.mfaSecret })).valid;
    if (!ok) {
      throw new UnauthorizedException('Codigo de verificacao invalido');
    }

    usuario.mfaAtivo = false;
    usuario.mfaSecret = null;
    await this.usuarios.save(usuario);
    return { mfaAtivo: false };
  }

  async esqueciSenha(dto: ForgotPasswordDto) {
    const usuario = await this.usuarios.findOne({ where: { email: dto.email } });
    // Resposta generica evita revelar se o e-mail existe.
    const resposta: { message: string; token?: string } = {
      message: 'Se o e-mail existir, enviaremos instrucoes de recuperacao.',
    };
    if (!usuario) {
      return resposta;
    }

    const token = randomBytes(32).toString('hex');
    usuario.resetTokenHash = sha256(token);
    usuario.resetTokenExpira = new Date(Date.now() + RESET_TTL_MS);
    await this.usuarios.save(usuario);

    // Em producao o token iria por e-mail; em dev retornamos para teste.
    if (process.env.NODE_ENV !== 'production') {
      resposta.token = token;
    }
    return resposta;
  }

  async redefinirSenha(dto: ResetPasswordDto) {
    const hash = sha256(dto.token);
    const usuario = await this.usuarios.findOne({
      where: { resetTokenHash: hash },
    });
    if (
      !usuario ||
      !usuario.resetTokenExpira ||
      new Date(usuario.resetTokenExpira).getTime() < Date.now()
    ) {
      throw new BadRequestException('Token invalido ou expirado');
    }

    usuario.senhaHash = await bcrypt.hash(dto.novaSenha, 10);
    usuario.resetTokenHash = null;
    usuario.resetTokenExpira = null;
    await this.usuarios.save(usuario);
    return { message: 'Senha redefinida com sucesso' };
  }
}
