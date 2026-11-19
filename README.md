# 🩺 MEDCONECTA AI - PLATAFORMA WEB DE AGENDAMENTO, TELECONSULTA E TRIAGEM INTELIGENTE PARA O RASTREAMENTO DO CÂNCER DO COLO DO ÚTERO

Este projeto é uma plataforma web interativa desenvolvida para aproximar pacientes e profissionais de saúde, com triagem conversacional, estratificação de risco, matching de profissionais e gestão de agenda médica. Utiliza **NestJS** na API e **React** no front-end, com autenticação por JWT e MFA.

> Protótipo acadêmico (TCC – Análise e Desenvolvimento de Sistemas, CEUNI FAMETRO). A triagem é um **apoio à decisão** e não substitui o diagnóstico médico.

- **Link de acesso:** `<URL_DO_SISTEMA>`
- **Repositório:** `<URL_DO_REPOSITORIO>`

## 🎥 Vídeo de Apresentação do Projeto

📌 Assista ao vídeo de apresentação do MedConecta AI: 👉 `<LINK_DO_VIDEO>`

## 📸 Capturas de Tela

### Tela Inicial

<img width="1597" height="1022" alt="image" src="https://github.com/user-attachments/assets/72979229-e88d-4075-98ce-078510d005ad" />


### Tela de Login
<img width="1701" height="906" alt="login-desktop" src="https://github.com/user-attachments/assets/efcd973f-9731-4b6c-b40b-51268e6cf191" />


### Triagem Conversacional

A paciente responde a perguntas sobre idade, tempo desde o último exame preventivo, alteração em exame anterior e sinal de alerta. Ao final, o sistema mostra a prioridade, a especialidade sugerida e o nível de risco, com o botão **Ver profissionais**. O exemplo usa dados de teste.

<img width="1593" height="992" alt="image" src="https://github.com/user-attachments/assets/94c6cdf6-0254-457e-911e-0ffbb90ed418" />


## 🚀 Funcionalidades

- ✅ Cadastro e login de usuários (paciente e profissional) com JWT
- ✅ MFA (TOTP) para o profissional e recuperação de senha
- ✅ Triagem conversacional com estratificação de risco (heurística)
- ✅ Busca e matching de profissionais por especialidade
- ✅ Agendamento presencial e por teleconsulta, com cancelamento
- ✅ Painel de agenda do profissional
- ✅ Previsão de no-show (heurística)
- ✅ Avaliações e reputação dos profissionais
- ✅ Notificações push, SMS e e-mail (envio simulado)
- ✅ Recursos de acessibilidade na interface
- ✅ Aviso de que a triagem não substitui o diagnóstico médico
- ⏳ Vídeo real na teleconsulta, pagamento com split, modelos scikit-learn e app mobile (pendentes)

## 🧩 Estrutura do Projeto

```text
MEDCONECTA/
├── web/                        # Front-end web (React + Vite)
├── mobile/                     # App mobile (React Native) - a iniciar
├── services/api-gateway/       # API NestJS (todos os módulos do MVP)
│   ├── src/
│   │   ├── auth/               # register, login, MFA, reset de senha
│   │   ├── catalog/            # especialidades, profissionais, matching
│   │   ├── agenda/             # blocos de agenda do profissional
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
├── docs/
│   └── screenshots/            # Capturas de tela usadas neste README
└── README.md                   # Este arquivo
```

## 🛠 Tecnologias Utilizadas

| Tecnologia | Descrição |
| --- | --- |
| React 18 + TypeScript | Interface web reativa e tipada |
| Vite | Desenvolvimento e build do front-end |
| Tailwind CSS 4 | Estilização e responsividade |
| Node.js + NestJS | API REST organizada por módulos |
| SQLite (`better-sqlite3`) | Banco provisório de desenvolvimento |
| PostgreSQL + Redis | Banco e cache planejados para produção |
| Python + FastAPI | Serviço reservado para os modelos de IA |
| JWT + bcrypt + otplib | Autenticação, hash de senha e MFA (TOTP) |
| Docker Swarm + Traefik + nginx | Publicação com HTTPS |

## ⚙️ Pré-requisitos

- Node.js 20+ (testado no 24) e npm
- Navegador web moderno
- Editor de código (recomendado: VS Code)
- Não é preciso instalar banco de dados: o ambiente de desenvolvimento usa SQLite (arquivo local)

## ⚙️ Configuração

1. Clone o repositório e instale as dependências da API:

   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd MedConecta/services/api-gateway
   npm install
   ```

2. Crie o `.env` a partir do `.env.example`:

   ```ini
   PORT=3000
   SQLITE_PATH=../../db/sqlite/medconecta.dev.sqlite
   JWT_SECRET=dev-secret-change-me
   JWT_EXPIRES_IN=1h
   ```

3. Opcional: popule especialidades, profissionais e agenda de exemplo:

   ```bash
   npm run seed
   ```

## 🚦 Como Executar o Projeto

### Opção 1: Ambiente completo (API + front-end)

```bash
# Terminal 1 - API (http://localhost:3000)
cd services/api-gateway
npm run start:dev

# Terminal 2 - Front-end (http://localhost:5173, com proxy /api -> :3000)
cd web
npm install
npm run dev
```

Acesse **http://localhost:5173**.

### Opção 2: Somente a API

```bash
cd services/api-gateway
npm run start:dev
```

Teste com `GET http://localhost:3000/api/v1/health`.

Scripts úteis da API: `npm run build`, `npm run start`, `npm run start:dev` e `npm run seed`.

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

- Questionário guiado em formato de conversa
- Resultado com prioridade, especialidade sugerida e nível de risco com probabilidade
- Acesso direto à lista de profissionais pelo botão **Ver profissionais**

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

## 🔑 Contas de Teste

Disponíveis depois do `npm run seed`. Senha padrão: `senha12345`.

| Perfil | E-mail | Observação |
| --- | --- | --- |
| Paciente | `mariana@teste.com` | conta principal de teste |
| Profissional | `ricardo@teste.com` | Ginecologia |
| Profissional | `helena@teste.com` | Dermatologia |
| Profissional | `kleber@teste.com` | Pediatria |

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

## ⚠️ Limitações Conhecidas

- **Pagamento** com split está **adiado** (DEC-005); a consulta é confirmada sem pagamento.
- **Risco e no-show** usam heurística no gateway; os modelos scikit-learn entram depois.
- **Triagem** é um questionário guiado (LLM pendente — DEC-004).
- **Teleconsulta** entrega a sala e a sessão; o vídeo real (WebRTC/Daily.co) não está integrado.
- **Notificações** usam provedor simulado, sem FCM ou Twilio reais.
- O banco de dev usa SQLite com `synchronize: true` (apenas desenvolvimento).

## 🔒 Aviso LGPD

Dados de saúde são dados pessoais sensíveis. O SQLite provisório **não** possui criptografia de coluna: use apenas dados de teste ou sintéticos, nunca dados reais.

## 📄 Licença

`<LICENCA>`

## 👤 Autores

- Eliandra de Souza Vasconcelos
- Marley Vinicius Pereira Catarino

Orientadora: Profª Luana Leal — CEUNI FAMETRO, Análise e Desenvolvimento de Sistemas.
