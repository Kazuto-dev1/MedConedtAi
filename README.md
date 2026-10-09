# MedConecta AI

Plataforma digital (web e mobile) de agendamento, teleconsulta e triagem inteligente
com priorizacao de risco, aplicada ao rastreamento do cancer do colo do utero.

O sistema integra busca de profissionais, triagem conversacional, estratificacao de
risco, matching, agendamento, teleconsulta, previsao de no-show, avaliacoes,
notificacoes e gestao autonoma de agenda medica.

> Prototipo academico (TCC - Analise e Desenvolvimento de Sistemas). A triagem e um
> **apoio a decisao**: nao substitui o diagnostico medico.

## Status

| Modulo | Estado |
|--------|--------|
| Autenticacao (JWT, MFA/TOTP, recuperacao de senha) | Implementado |
| Busca e matching de profissionais | Implementado |
| Triagem + estratificacao de risco | Implementado (heuristica) |
| Agendamento (presencial/teleconsulta) | Implementado |
| Painel de agenda do profissional | Implementado |
| Previsao de no-show | Implementado (heuristica) |
| Teleconsulta (sala/sessao) | Implementado (video real pendente) |
| Avaliacoes e reputacao | Implementado |
| Notificacoes (push/SMS/e-mail) | Implementado (envio simulado) |
| Pagamento com split | Adiado (ver DEC-005) |
| App mobile (React Native) | Nao iniciado |

## Stack

- **Frontend web**: React 18 + Vite + TypeScript + Tailwind CSS v4
- **Backend**: Node.js + NestJS (API REST, organizado por modulos)
- **Banco (dev)**: SQLite (provisorio, via `better-sqlite3`)
- **Banco (prod)**: PostgreSQL + Redis (planejado)
- **IA**: servico Python (FastAPI) reservado para os modelos scikit-learn
- **Seguranca**: OAuth2/JWT, bcrypt, MFA (TOTP/otplib)

## Estrutura

```
/
├── web/                     # Front-end web (React + Vite)
├── mobile/                  # App mobile (React Native) - a iniciar
├── services/api-gateway/    # API NestJS (todos os modulos do MVP)
│   ├── src/
│   │   ├── auth/            # register, login, MFA, reset de senha
│   │   ├── catalog/         # especialidades, profissionais, matching
│   │   ├── agenda/          # CRUD de blocos de agenda (profissional)
│   │   ├── triage/          # triagem + risco
│   │   ├── scheduling/      # disponibilidade, agendamento, cancelamento
│   │   ├── no-show/         # previsao de faltas
│   │   ├── teleconsult/     # sessao de teleconsulta
│   │   ├── reviews/         # avaliacoes e reputacao
│   │   ├── notifications/   # despacho de notificacoes
│   │   ├── database/        # DataSource + entidades
│   │   └── health/
│   └── scripts/seed.js      # dados de exemplo
├── ai/                      # Servico de IA (FastAPI) - stub
├── db/sqlite/               # schema.sql + banco provisorio
├── infra/                   # docker-compose de dev
└── docs/                    # specs (planejamento) + implementacao
```

## Como rodar (desenvolvimento)

### Pre-requisitos

- Node.js 20+ (testado no 24) e npm
- Nao requer banco externo: o dev usa SQLite (arquivo local)

### 1. Backend (API)

```bash
cd services/api-gateway
npm install
npm run seed        # opcional: popula especialidades, profissionais e agenda
npm run start:dev   # sobe em http://localhost:3000
```

### 2. Frontend (web)

```bash
cd web
npm install
npm run dev         # sobe em http://localhost:5173 (proxy /api -> :3000)
```

Acesse **http://localhost:5173**.

### Variaveis de ambiente

O backend le `services/api-gateway/.env` (ha um `.env.example`):

```ini
PORT=3000
SQLITE_PATH=../../db/sqlite/medconecta.dev.sqlite
JWT_SECRET=dev-secret-change-me
JWT_EXPIRES_IN=1h
```

## Contas de teste

Todas com senha **`senha12345`** (exceto a conta admin):

| Perfil | E-mail | Observacao |
|--------|--------|-----------|
| Paciente | `mariana@teste.com` | conta principal de teste |
| Paciente | `admin@admin.com` | senha `admin1234` |
| Profissional | `ricardo@teste.com` | Ginecologia |
| Profissional | `helena@teste.com` | Dermatologia |
| Profissional | `kleber@teste.com` | Pediatria |

Demais profissionais de teste: `beatriz`, `camila`, `ana`, `diego`, `elisa`, `carlos`,
`fernanda`, `gabriel`, `igor`, `julia`, `larissa`, `marcos` — todos `@teste.com`.

## Principais endpoints

Base: `http://localhost:3000/api/v1` (JWT via header `Authorization: Bearer <token>`).

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/health` | Healthcheck |
| POST | `/auth/register` | Cadastro (paciente/profissional) |
| POST | `/auth/login` | Login (pode exigir 2a etapa) |
| POST | `/auth/mfa/validate` | Conclui login com codigo MFA |
| POST | `/auth/mfa/setup` \| `/confirm` \| `/disable` | MFA do profissional |
| POST | `/auth/forgot-password` \| `/reset-password` | Recuperacao de senha |
| GET | `/auth/me` | Dados da conta |
| GET | `/especialidades` | Lista especialidades |
| GET | `/professionals` | Busca com matching (filtros) |
| GET | `/professionals/:id` | Perfil + agenda + reputacao |
| GET/POST/PATCH/DELETE | `/agenda` | Agenda do profissional |
| POST | `/triage` | Triagem (paciente) |
| GET | `/availability` | Horarios disponiveis |
| GET/POST | `/appointments` | Lista / agenda consulta |
| PATCH | `/appointments/:id/cancel` | Cancela consulta |
| GET | `/no-show/panel` | Painel de faltas (profissional) |
| GET | `/no-show/:appointmentId` | Previsao de uma consulta |
| GET | `/teleconsult/:id/session` | Sessao da teleconsulta |
| PATCH | `/teleconsult/:id/end` | Encerra teleconsulta |
| POST | `/reviews` | Avalia consulta (paciente) |
| GET | `/reviews/professional/:id` | Avaliacoes do profissional |
| GET | `/notifications` | Notificacoes do usuario |

## Scripts uteis (backend)

```bash
npm run build       # compila (nest build)
npm run start       # executa
npm run start:dev   # watch mode
npm run seed        # popula dados de exemplo
```

## Documentacao

- `docs/index.md` — indice geral
- `docs/specs/` — especificacoes (planejamento: requisitos, regras, dados, API, UX)
- `docs/*.md` — implementacao (arquitetura, banco, API, core-logic, front, deploy)
- `docs/specs/decisoes.md` — decisoes (ADRs)

## Limitacoes conhecidas

- **Pagamento** com split esta **adiado** (DEC-005); a consulta e confirmada sem pagamento.
- **IA** de risco/no-show usa **heuristica** no gateway; os modelos scikit-learn entram depois.
- **Triagem conversacional** e um questionario guiado (LLM pendente — DEC-004).
- **Teleconsulta** entrega a sala/sessao; o video real (WebRTC/Daily.co) nao esta integrado.
- **Notificacoes** sao despachadas por provedor **simulado** (sem FCM/Twilio reais).
- O banco de dev usa SQLite com `synchronize: true` (apenas desenvolvimento).

## Aviso LGPD

Dados de saude sao dados pessoais sensiveis. O SQLite provisorio **nao** possui
criptografia de coluna — use apenas dados de teste/sinteticos, nunca dados reais.
