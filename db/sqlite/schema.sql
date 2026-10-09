-- ============================================================================
-- MedConecta AI - Banco provisorio (SQLite)
-- ----------------------------------------------------------------------------
-- Escopo : SOMENTE requisitos de prioridade "Must" (MVP).
-- Uso    : desenvolvimento e testes locais. Producao usa PostgreSQL.
-- Ref    : docs/database.md (secao "Banco Provisorio (SQLite)")
--          docs/specs/requisitos-funcionais.md (prioridades MoSCoW)
--
-- Diferencas em relacao ao PostgreSQL:
--   - UUID  -> TEXT (gerado por expressao DEFAULT; sem pgcrypto)
--   - JSON  -> TEXT (string JSON)
--   - Datas -> TEXT em ISO-8601 (datetime('now'))
--   - TIME  -> TEXT 'HH:MM'
--   - bool  -> INTEGER 0/1
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------------
-- usuario  (RF001, RF002, RF003, RF006)
-- Deferidos (Should): MFA (RF004), recuperacao de senha (RF005)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuario (
    id                 TEXT PRIMARY KEY
        DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' ||
                       hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' ||
                       hex(randomblob(6)))),
    email              TEXT NOT NULL UNIQUE,
    senha_hash         TEXT NOT NULL,
    tipo               TEXT NOT NULL CHECK (tipo IN ('paciente', 'profissional')),
    consentimento_lgpd INTEGER NOT NULL DEFAULT 0 CHECK (consentimento_lgpd IN (0, 1)),
    created_at         TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario (email);

-- ----------------------------------------------------------------------------
-- paciente  (RF001)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS paciente (
    id              TEXT PRIMARY KEY
        DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' ||
                       hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' ||
                       hex(randomblob(6)))),
    usuario_id      TEXT NOT NULL UNIQUE REFERENCES usuario (id) ON DELETE CASCADE,
    nome            TEXT NOT NULL,
    data_nascimento TEXT,
    telefone        TEXT
);

-- ----------------------------------------------------------------------------
-- profissional  (RF002, RF010, RF013)
-- Deferido (Should): multiplos locais (RF082)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profissional (
    id                TEXT PRIMARY KEY
        DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' ||
                       hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' ||
                       hex(randomblob(6)))),
    usuario_id        TEXT NOT NULL UNIQUE REFERENCES usuario (id) ON DELETE CASCADE,
    nome              TEXT NOT NULL,
    registro_crm      TEXT NOT NULL UNIQUE,
    registro_validado INTEGER NOT NULL DEFAULT 0 CHECK (registro_validado IN (0, 1)),
    bio               TEXT,
    ativo             INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1))
);

-- ----------------------------------------------------------------------------
-- especialidade  (RF010, RF011)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS especialidade (
    id   TEXT PRIMARY KEY
        DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' ||
                       hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' ||
                       hex(randomblob(6)))),
    nome TEXT NOT NULL UNIQUE
);

-- ----------------------------------------------------------------------------
-- agenda  (RF010, RF080, RF081 - blocos de disponibilidade e preco)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agenda (
    id               TEXT PRIMARY KEY
        DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' ||
                       hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' ||
                       hex(randomblob(6)))),
    profissional_id  TEXT NOT NULL REFERENCES profissional (id) ON DELETE CASCADE,
    especialidade_id TEXT NOT NULL REFERENCES especialidade (id),
    local            TEXT,
    dia_semana       INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    hora_inicio      TEXT NOT NULL, -- 'HH:MM'
    hora_fim         TEXT NOT NULL, -- 'HH:MM'
    preco            NUMERIC NOT NULL CHECK (preco >= 0),
    CHECK (hora_fim > hora_inicio)
);
CREATE INDEX IF NOT EXISTS idx_agenda_profissional ON agenda (profissional_id);

-- ----------------------------------------------------------------------------
-- triagem  (RF020-RF024, RF030-RF032)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS triagem (
    id                        TEXT PRIMARY KEY
        DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' ||
                       hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' ||
                       hex(randomblob(6)))),
    paciente_id               TEXT NOT NULL REFERENCES paciente (id) ON DELETE CASCADE,
    respostas                 TEXT NOT NULL, -- JSON
    nivel_risco               TEXT NOT NULL CHECK (nivel_risco IN ('baixo', 'medio', 'alto')),
    probabilidade             NUMERIC CHECK (probabilidade BETWEEN 0 AND 1),
    especialidade_sugerida_id TEXT REFERENCES especialidade (id),
    created_at                TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_triagem_paciente ON triagem (paciente_id);

-- ----------------------------------------------------------------------------
-- consulta  (RF040-RF044)
-- UNIQUE (profissional_id, inicio) evita double booking (RN050)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS consulta (
    id                TEXT PRIMARY KEY
        DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' ||
                       hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' ||
                       hex(randomblob(6)))),
    paciente_id       TEXT NOT NULL REFERENCES paciente (id),
    profissional_id   TEXT NOT NULL REFERENCES profissional (id),
    triagem_id        TEXT REFERENCES triagem (id),
    modalidade        TEXT NOT NULL CHECK (modalidade IN ('presencial', 'teleconsulta')),
    status            TEXT NOT NULL DEFAULT 'pendente'
                      CHECK (status IN ('pendente', 'confirmada', 'cancelada', 'concluida')),
    inicio            TEXT NOT NULL, -- ISO-8601
    fim               TEXT NOT NULL, -- ISO-8601
    link_teleconsulta TEXT,
    created_at        TEXT NOT NULL DEFAULT (datetime('now')),
    CHECK (fim > inicio),
    UNIQUE (profissional_id, inicio)
);
CREATE INDEX IF NOT EXISTS idx_consulta_paciente ON consulta (paciente_id);
CREATE INDEX IF NOT EXISTS idx_consulta_prof_inicio ON consulta (profissional_id, inicio);

-- ----------------------------------------------------------------------------
-- pagamento  (RF050, RF051)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pagamento (
    id                 TEXT PRIMARY KEY
        DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' ||
                       hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' ||
                       hex(randomblob(6)))),
    consulta_id        TEXT NOT NULL UNIQUE REFERENCES consulta (id) ON DELETE CASCADE,
    valor_total        NUMERIC NOT NULL CHECK (valor_total >= 0),
    valor_plataforma   NUMERIC NOT NULL CHECK (valor_plataforma >= 0),
    valor_profissional NUMERIC NOT NULL CHECK (valor_profissional >= 0),
    status             TEXT NOT NULL DEFAULT 'pendente'
                       CHECK (status IN ('pendente', 'aprovado', 'recusado', 'estornado')),
    gateway_ref        TEXT,
    created_at         TEXT NOT NULL DEFAULT (datetime('now')),
    CHECK (valor_plataforma + valor_profissional = valor_total)
);

-- ----------------------------------------------------------------------------
-- previsao_no_show  (RF070, RF071)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS previsao_no_show (
    id                 TEXT PRIMARY KEY
        DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' ||
                       hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' ||
                       hex(randomblob(6)))),
    consulta_id        TEXT NOT NULL UNIQUE REFERENCES consulta (id) ON DELETE CASCADE,
    probabilidade      NUMERIC NOT NULL CHECK (probabilidade BETWEEN 0 AND 1),
    risco              TEXT NOT NULL CHECK (risco IN ('baixo', 'medio', 'alto')),
    lembrete_reforcado INTEGER NOT NULL DEFAULT 0 CHECK (lembrete_reforcado IN (0, 1)),
    created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------------------------
-- notificacao  (RF100 - push)
-- Deferido (Should): SMS/e-mail (RF101) - usar canais 'sms'/'email' depois
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notificacao (
    id         TEXT PRIMARY KEY
        DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' ||
                       hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' ||
                       hex(randomblob(6)))),
    usuario_id TEXT NOT NULL REFERENCES usuario (id) ON DELETE CASCADE,
    canal      TEXT NOT NULL CHECK (canal IN ('push', 'sms', 'email')),
    tipo       TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'pendente'
               CHECK (status IN ('enviado', 'falha', 'pendente')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notificacao_usuario ON notificacao (usuario_id);

-- ============================================================================
-- Tabelas OMITIDAS neste banco provisorio (exigem prioridade Should/Could):
--   - avaliacao            (RF090, RF091 - Should)
--   - colunas de MFA       (RF004 - Should)
--   - reset de senha       (RF005 - Should)
--   - estorno/comprovante  (RF052, RF053)
-- Adicione-as ao evoluir o MVP para o banco definitivo (PostgreSQL).
-- ============================================================================
