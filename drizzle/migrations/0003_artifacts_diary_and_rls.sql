-- Migration 0003 · persistência dedicada para artefatos e diário.
--
-- Objetivo:
-- - Tirar artefatos de estudo/professor do uso primário de audit_log.
-- - Preparar tabela real para diário pedagógico.
-- - Completar RLS das tabelas tenant-scoped adicionadas depois do 9999 inicial.

CREATE TABLE IF NOT EXISTS "student_artifacts" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL REFERENCES "tenants"("id") ON DELETE restrict,
  "student_id" text REFERENCES "students"("id") ON DELETE cascade,
  "actor_user_id" text REFERENCES "users"("id") ON DELETE set null,
  "conversation_id" text REFERENCES "conversations"("id") ON DELETE set null,
  "kind" text NOT NULL,
  "title" text NOT NULL,
  "content" jsonb NOT NULL,
  "request" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "provider" text,
  "model" text,
  "prompt_version" text,
  "input_tokens" integer,
  "output_tokens" integer,
  "latency_ms" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "teacher_artifacts" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL REFERENCES "tenants"("id") ON DELETE restrict,
  "actor_user_id" text REFERENCES "users"("id") ON DELETE set null,
  "kind" text NOT NULL,
  "title" text NOT NULL,
  "content" text NOT NULL,
  "request" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "provider" text,
  "model" text,
  "prompt_version" text,
  "input_tokens" integer,
  "output_tokens" integer,
  "latency_ms" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "pedagogical_diary_entries" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL REFERENCES "tenants"("id") ON DELETE restrict,
  "class_id" text NOT NULL REFERENCES "classes"("id") ON DELETE cascade,
  "author_user_id" text REFERENCES "users"("id") ON DELETE set null,
  "entry_date" timestamp DEFAULT now() NOT NULL,
  "title" text NOT NULL,
  "summary" text,
  "content" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "status" text DEFAULT 'draft' NOT NULL,
  "signed_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "student_artifacts_tenant_student_idx"
  ON "student_artifacts" ("tenant_id", "student_id", "created_at");

CREATE INDEX IF NOT EXISTS "student_artifacts_actor_idx"
  ON "student_artifacts" ("actor_user_id", "created_at");

CREATE INDEX IF NOT EXISTS "student_artifacts_conversation_idx"
  ON "student_artifacts" ("conversation_id");

CREATE INDEX IF NOT EXISTS "teacher_artifacts_tenant_actor_idx"
  ON "teacher_artifacts" ("tenant_id", "actor_user_id", "created_at");

CREATE INDEX IF NOT EXISTS "teacher_artifacts_kind_idx"
  ON "teacher_artifacts" ("tenant_id", "kind", "created_at");

CREATE INDEX IF NOT EXISTS "pedagogical_diary_entries_class_date_idx"
  ON "pedagogical_diary_entries" ("tenant_id", "class_id", "entry_date");

CREATE INDEX IF NOT EXISTS "pedagogical_diary_entries_author_idx"
  ON "pedagogical_diary_entries" ("author_user_id", "created_at");

-- Helper pode ainda não existir se o 9999 não foi aplicado no ambiente.
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS text AS $$
  SELECT NULLIF(current_setting('app.tenant_id', true), '')
$$ LANGUAGE sql STABLE;

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'student_announcements',
    'student_announcement_reads',
    'class_focus_skills',
    'student_artifacts',
    'teacher_artifacts',
    'pedagogical_diary_entries'
  ]
  LOOP
    IF to_regclass(tbl) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
      IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = current_schema()
          AND tablename = tbl
          AND policyname = 'tenant_isolation'
      ) THEN
        EXECUTE format(
          'CREATE POLICY tenant_isolation ON %I FOR ALL ' ||
          'USING (tenant_id = current_tenant_id()) ' ||
          'WITH CHECK (tenant_id = current_tenant_id())',
          tbl
        );
      END IF;
    END IF;
  END LOOP;
END $$;
