import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type TipoUsuario = 'paciente' | 'profissional';
export type NivelRisco = 'baixo' | 'medio' | 'alto';
export type Modalidade = 'presencial' | 'teleconsulta';
export type StatusConsulta =
  | 'pendente'
  | 'confirmada'
  | 'cancelada'
  | 'concluida';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  senhaHash: string;

  @Column({ type: 'text' })
  tipo: TipoUsuario;

  @Column({ type: 'boolean', default: false })
  consentimentoLgpd: boolean;

  @Column({ type: 'boolean', default: false })
  mfaAtivo: boolean;

  @Column({ type: 'text', nullable: true })
  mfaSecret: string | null;

  @Column({ type: 'text', nullable: true })
  resetTokenHash: string | null;

  @Column({ type: 'datetime', nullable: true })
  resetTokenExpira: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('paciente')
export class Paciente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  usuarioId: string;

  @Column()
  nome: string;

  @Column({ type: 'date', nullable: true })
  dataNascimento: string | null;

  @Column({ type: 'text', nullable: true })
  telefone: string | null;
}

@Entity('profissional')
export class Profissional {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  usuarioId: string;

  @Column()
  nome: string;

  @Column({ unique: true })
  registroCrm: string;

  @Column({ type: 'boolean', default: false })
  registroValidado: boolean;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'boolean', default: true })
  ativo: boolean;
}

@Entity('especialidade')
export class Especialidade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nome: string;
}

@Entity('agenda')
export class Agenda {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  profissionalId: string;

  @Column()
  especialidadeId: string;

  @Column({ type: 'text', nullable: true })
  local: string | null;

  @Column({ type: 'integer' })
  diaSemana: number;

  @Column({ type: 'text' })
  horaInicio: string;

  @Column({ type: 'text' })
  horaFim: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  preco: number;
}

@Entity('triagem')
export class Triagem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pacienteId: string;

  @Column({ type: 'text' })
  respostas: string;

  @Column({ type: 'text' })
  nivelRisco: NivelRisco;

  @Column({ type: 'float', nullable: true })
  probabilidade: number | null;

  @Column({ type: 'text', nullable: true })
  especialidadeSugeridaId: string | null;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('consulta')
export class Consulta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pacienteId: string;

  @Column()
  profissionalId: string;

  @Column({ type: 'text', nullable: true })
  triagemId: string | null;

  @Column({ type: 'text' })
  modalidade: Modalidade;

  @Column({ type: 'text', default: 'pendente' })
  status: StatusConsulta;

  @Column({ type: 'datetime' })
  inicio: string;

  @Column({ type: 'datetime' })
  fim: string;

  @Column({ type: 'text', nullable: true })
  linkTeleconsulta: string | null;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('pagamento')
export class Pagamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  consultaId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorTotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorPlataforma: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorProfissional: number;

  @Column({ type: 'text', default: 'pendente' })
  status: 'pendente' | 'aprovado' | 'recusado' | 'estornado';

  @Column({ type: 'text', nullable: true })
  gatewayRef: string | null;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('previsao_no_show')
export class PrevisaoNoShow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  consultaId: string;

  @Column({ type: 'float' })
  probabilidade: number;

  @Column({ type: 'text' })
  risco: NivelRisco;

  @Column({ type: 'boolean', default: false })
  lembreteReforcado: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('notificacao')
export class Notificacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  usuarioId: string;

  @Column({ type: 'text' })
  canal: 'push' | 'sms' | 'email';

  @Column({ type: 'text' })
  tipo: string;

  @Column({ type: 'text', nullable: true })
  titulo: string | null;

  @Column({ type: 'text', nullable: true })
  mensagem: string | null;

  @Column({ type: 'text', default: 'pendente' })
  status: 'enviado' | 'falha' | 'pendente';

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('avaliacao')
export class Avaliacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  consultaId: string;

  @Column({ type: 'integer' })
  nota: number;

  @Column({ type: 'text', nullable: true })
  comentario: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
