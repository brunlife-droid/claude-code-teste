-- Migration 0001 · material da turma + foco pedagógico + config macro LLM
--
-- Como aplicar (quando tiver Neon configurado):
--   psql $DATABASE_URL -f drizzle/migrations/0001_class_materials_focus_and_llm_config.sql
--
-- O que entra:
--   - Colunas novas em `documents` (class_id, uploaded_by, kind, status, size_bytes, error)
--   - Tabela `class_focus_skills` (turma × habilidade BNCC priorizada)
--   - Tabela `llm_routes` (rota ativa por capability)
--   - Tabela `system_prompts` (prompts versionados editáveis pelo admin)

-- ── DOCUMENTS (estende) ──────────────────────────────────────────────
ALTER TABLE documents ADD COLUMN IF NOT EXISTS class_id text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS uploaded_by text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'national_library';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'ready';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS size_bytes integer;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS error text;

DO $$ BEGIN
  ALTER TABLE documents
    ADD CONSTRAINT documents_class_id_fk FOREIGN KEY (class_id)
    REFERENCES classes(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE documents
    ADD CONSTRAINT documents_uploaded_by_fk FOREIGN KEY (uploaded_by)
    REFERENCES users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS documents_class_idx ON documents (class_id);

-- ── FOCO PEDAGÓGICO ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS class_focus_skills (
  tenant_id text NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  class_id text NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  hability_code text NOT NULL REFERENCES habilities(code) ON DELETE RESTRICT,
  set_by text REFERENCES users(id) ON DELETE SET NULL,
  note text,
  created_at timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY (class_id, hability_code)
);

CREATE INDEX IF NOT EXISTS class_focus_skills_tenant_idx
  ON class_focus_skills (tenant_id);

-- ── LLM ROUTES (config macro de modelo por capability) ───────────────
CREATE TABLE IF NOT EXISTS llm_routes (
  capability text PRIMARY KEY,
  provider text NOT NULL,
  model text NOT NULL,
  temperature real,
  max_tokens integer,
  fallback_provider text,
  fallback_model text,
  active boolean NOT NULL DEFAULT true,
  updated_by text REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamp NOT NULL DEFAULT now()
);

-- ── SYSTEM PROMPTS (versionados, editáveis no admin) ─────────────────
CREATE TABLE IF NOT EXISTS system_prompts (
  id text PRIMARY KEY,
  capability text NOT NULL,
  version text NOT NULL,
  content text NOT NULL,
  active boolean NOT NULL DEFAULT false,
  created_by text REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS system_prompts_capability_idx
  ON system_prompts (capability);

-- Garante apenas uma versão ativa por capability.
CREATE UNIQUE INDEX IF NOT EXISTS system_prompts_active_per_capability
  ON system_prompts (capability) WHERE active;

-- ── ÍNDICE HNSW PARA RAG (pgvector) ──────────────────────────────────
-- Idempotente: só cria se ainda não existir. Acelera busca por similaridade.
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS chunks_embedding_hnsw_idx
    ON chunks USING hnsw (embedding vector_cosine_ops);
EXCEPTION WHEN undefined_object THEN NULL; END $$;
