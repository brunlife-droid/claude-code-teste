-- Migration 0000 · preparação manual rodada uma vez antes de drizzle-kit push.
-- Cria extensão pgvector e configura GUC para tenant atual usada por RLS.
--
-- Como aplicar (quando tiver conexão Neon):
--   psql $DATABASE_URL -f drizzle/migrations/0000_prepare_pgvector_and_rls.sql

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()

-- GUC personalizada que o app vai SET no início de cada conexão/transação.
-- Postgres aceita 'app.tenant_id' como custom session var.
-- Uso no app (Drizzle):
--   await db.execute(sql`SET app.tenant_id = ${tenantId}`)
-- e logo em seguida queries são filtradas via RLS.
