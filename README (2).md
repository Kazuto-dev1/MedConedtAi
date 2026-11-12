# 🩺 MEDCONECTA AI — PLATAFORMA DE AGENDAMENTO, TELECONSULTA E TRIAGEM INTELIGENTE

Plataforma web para agendamento de consultas, teleconsulta e triagem inteligente com priorização
de risco, aplicada ao rastreamento do câncer do colo do útero. A paciente responde a uma triagem
conversacional, recebe a prioridade e a especialidade sugerida, encontra profissionais compatíveis
e agenda a consulta presencial ou por teleconsulta. O sistema reúne busca, matching, agenda do
profissional, previsão de faltas, avaliações e notificações em uma única aplicação.

Pacientes usam o MedConecta AI para chegar mais rápido ao profissional certo, e médicos para gerir
a própria agenda com menos faltas.

> Protótipo acadêmico (TCC – Análise e Desenvolvimento de Sistemas, CEUNI FAMETRO). A triagem é um
> **apoio à decisão**: não substitui o diagnóstico médico.

- **Acesso:** `<URL_DO_SISTEMA>`
- **Repositório:** `<URL_DO_REPOSITORIO>`

## 📸 Capturas de Tela

### Tela inicial

![Tela inicial do MedConecta AI](docs/screenshots/inicial-desktop.png)

### Tela de acesso (login)

![Tela de login do MedConecta AI](docs/screenshots/login-desktop.png)

### Triagem conversacional

![Triagem com priorização de risco e especialidade sugerida](docs/screenshots/triagem-desktop.png)

> Exemplo gerado com dados de teste.

## ✅ Funcionalidades

- ✅ Autenticação com login, token JWT e MFA (TOTP) para profissionais
- ✅ Recuperação de senha
- ✅ Busca e matching de profissionais por especialidade
- ✅ Triagem conversacional com estratificação de risco (heurística)
- ✅ Agendamento presencial e por teleconsulta, com cancelamento
- ✅ Painel de agenda do profissional
- ✅ Previsão de no-show (heurística)
- ✅ Sessão de teleconsulta
- ✅ Avaliações e reputação dos profissionais
- ✅ Notificações push, SMS e e-mail (envio simulado)
- ✅ Funcionalidades de acessibilidade na interface
- ✅ Aviso de que a triagem não substitui o diagnóstico médico
- ⏳ Vídeo real na teleconsulta (WebRTC/Daily.co) — pendente
- ⏳ Pagamento com split — adiado (DEC-005)
- ⏳ Modelos de IA com scikit-learn — planejado
- ⏳ App mobile (React Native) — não iniciado

## 🧩 Estrutura do Projeto

```text
MedConecta/
├── web/                        # Front-end web (React + Vite + TypeScript)
├── mobile/                     # App mobile (React Native) - a iniciar
├── services/api-gateway/       # API NestJS (todos os módulos do MVP)
│   ├── src/
│   │   ├── auth/               # register, login, MFA, reset de senha
│   │   ├── catalog/            # especialidades, profissionais, matching
│   │   ├── agenda/             # CRUD de blocos de agenda (profissional)
│   │   ├── triage/             # triagem + risco
│   │   ├── scheduling/         # disponibilidade, agendamento, cancelamento
│   │   ├── no-show/            # previsão de faltas
│   │   ├── teleconsult/        # sessão de teleconsulta
│   │   ├── reviews/            # avaliações e reputação
│   │   ├── notifications/      # despacho de notificações
│   │   ├── database/           # DataSource + entidades
│   │   └── health/
│   └── scripts/seed.js         # dados de exemplo
├── ai/                         # Serviço de IA (FastAPI) - stub
├── db/sqlite/                  # schema.sql + banco provisório
├── infra/                      # docker-compose de dev
├── docs/                       # Especificações, implementação e capturas de tela
└── README.md                   # Este arquivo
```

## 🛠 Tecnologias Utilizadas

| Tecnologia | Descrição |
| --- | --- |
| Node.js + NestJS | API REST organizada por módulos |
| React 18 + TypeScript | Interface web reativa e tipada |
| Vite | Desenvolvimento e build do frontend |
| Tailwind CSS 4 | Estilização e responsividade |
| SQLite (`better-sqlite3`) | Banco provisório de desenvolvimento |
| PostgreSQL + Redis | Banco e cache planejados para produção |
| Python + FastAPI | Serviço reservado para os modelos de IA (scikit-learn) |
| JWT + bcrypt + otplib | Autenticação, hash de senha e MFA (TOTP) |
| Docker Swarm + Traefik + nginx | Publicação com HTTPS |

## ⚙ Pré-requisitos

- Node.js 20+ (testado no 24) e npm
- Navegador web moderno
- Editor de código (recomendado: VS Code)
- Não requer banco externo: o ambiente de desenvolvimento usa SQLite (arquivo local)

## ⚙ Configuração

1. Clone o repositório:

   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd MedConecta
   ```

2. Instale as dependências do backend:

   ```bash
   cd services/api-gateway
   npm install
   ```

3. Crie o `.env` do backend a partir do modelo (`services/api-gateway/.env.example`):

   ```ini
   PORT=3000
   SQLITE_PATH=../../db/sqlite/medconecta.dev.sqlite
   JWT_SECRET=dev-secret-change-me
   JWT_EXPIRES_IN=1h
   ```

4. Opcional: popule especialidades, profissionais e agenda de exemplo:

   ```bash
   npm run seed
   ```

## 🚦 Como Executar o Projeto

### Ambiente completo (API + frontend)

1. Suba a API a partir de `services/api-gateway`:

   ```bash
   npm run start:dev   # http://localhost:3000
   ```

2. Em outro terminal, suba o frontend:

   ```bash
   cd web
   npm install
   npm run dev         # http://localhost:5173 (proxy /api -> :3000)
   ```

3. Acesse **http://localhost:5173**.

Comandos úteis do backend: `npm run build`, `npm run start` e `npm run seed`.

## 🔑 Contas de Teste

Todas com senha **`senha12345`** (exceto a conta admin):

| Perfil | E-mail | Observação |
| --- | --- | --- |
| Paciente | `mariana@teste.com` | conta principal de teste |
| Paciente | `admin@admin.com` | senha `admin1234` |
| Profissional | `ricardo@teste.com` | Ginecologia |
| Profissional | `helena@teste.com` | Dermatologia |
| Profissional | `kleber@teste.com` | Pediatria |

Demais profissionais de teste: `beatriz`, `camila`, `ana`, `diego`, `elisa`, `carlos`,
`fernanda`, `gabriel`, `igor`, `julia`, `larissa`, `marcos` — todos `@teste.com`.

## 📋 Funcionalidades Detalhadas

### Autenticação

- Cadastro de paciente e de profissional
- Login com e-mail e senha e emissão de token JWT (`Authorization: Bearer <token>`)
- MFA (TOTP) para o profissional, com segunda etapa no login
- Recuperação e redefinição de senha

### Busca e matching

- Lista de especialidades
- Busca de profissionais com filtros e matching
- Perfil do profissional com agenda e reputação

### Triagem e risco

- Questionário guiado em formato de conversa: idade, tempo desde o último exame preventivo, alteração em exame anterior e sinal de alerta
- Resultado com prioridade, especialidade sugerida e nível de risco com probabilidade
- Botão **Ver profissionais**, que leva ao matching
- Aviso de que a triagem é apoio à decisão e não substitui o diagnóstico médico

### Agendamento e teleconsulta

- Consulta de horários disponíveis
- Agendamento presencial ou por teleconsulta e cancelamento
- Sessão da teleconsulta, com encerramento pelo profissional

### Painel do profissional

- Gestão da própria agenda (criar, alterar e remover blocos)
- Painel de faltas, com a previsão de no-show de cada consulta

### Avaliações e notificações

- Avaliação da consulta pela paciente e reputação do profissional
- Notificações por provedor simulado (push, SMS e e-mail)

## 🔌 Principais Endpoints

Base: `http://localhost:3000/api/v1`.

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/health` | Healthcheck |
| POST | `/auth/register` | Cadastro (paciente/profissional) |
| POST | `/auth/login` | Login (pode exigir 2ª etapa) |
| POST | `/auth/mfa/validate` | Conclui login com código MFA |
| POST | `/auth/mfa/setup` \| `/confirm` \| `/disable` | MFA do profissional |
| POST | `/auth/forgot-password` \| `/reset-password` | Recuperação de senha |
| GET | `/auth/me` | Dados da conta |
| GET | `/especialidades` | Lista especialidades |
| GET | `/professionals` | Busca com matching (filtros) |
| GET | `/professionals/:id` | Perfil + agenda + reputação |
| GET/POST/PATCH/DELETE | `/agenda` | Agenda do profissional |
| POST | `/triage` | Triagem (paciente) |
| GET | `/availability` | Horários disponíveis |
| GET/POST | `/appointments` | Lista / agenda consulta |
| PATCH | `/appointments/:id/cancel` | Cancela consulta |
| GET | `/no-show/panel` | Painel de faltas (profissional) |
| GET | `/no-show/:appointmentId` | Previsão de uma consulta |
| GET | `/teleconsult/:id/session` | Sessão da teleconsulta |
| PATCH | `/teleconsult/:id/end` | Encerra teleconsulta |
| POST | `/reviews` | Avalia consulta (paciente) |
| GET | `/reviews/professional/:id` | Avaliações do profissional |
| GET | `/notifications` | Notificações do usuário |

## 🚀 Publicação

O sistema é empacotado com Docker e publicado com Docker Swarm, Traefik e nginx, com HTTPS.
O `docker-compose` de desenvolvimento fica em `infra/`.

## ⚠ Limitações Conhecidas

- **Pagamento** com split está **adiado** (DEC-005); a consulta é confirmada sem pagamento.
- **IA** de risco e de no-show usa **heurística** no gateway; os modelos scikit-learn entram depois.
- **Triagem conversacional** é um questionário guiado (LLM pendente — DEC-004).
- **Teleconsulta** entrega a sala/sessão; o vídeo real (WebRTC/Daily.co) não está integrado.
- **Notificações** são despachadas por provedor **simulado** (sem FCM/Twilio reais).
- O banco de dev usa SQLite com `synchronize: true` (apenas desenvolvimento).

## 🔒 Aviso LGPD

Dados de saúde são dados pessoais sensíveis. O SQLite provisório **não** possui criptografia de
coluna — use apenas dados de teste/sintéticos, nunca dados reais.

## 📚 Documentação

- `docs/index.md` — índice geral
- `docs/specs/` — especificações (requisitos, regras, dados, API, UX)
- `docs/*.md` — implementação (arquitetura, banco, API, core-logic, front, deploy)
- `docs/specs/decisoes.md` — decisões (ADRs)

## 📄 Licença

`<LICENCA>`

## 👤 Autores

- Eliandra de Souza Vasconcelos
- Marley Vinicius Pereira Catarino

Orientadora: Profª Luana Leal — CEUNI FAMETRO, Análise e Desenvolvimento de Sistemas.
