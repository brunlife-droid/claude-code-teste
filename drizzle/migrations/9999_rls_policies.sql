-- Migration 9999 · políticas Row-Level Security.
-- Rodar DEPOIS de drizzle-kit push (que cria as tabelas).
--
-- Política: cada query filtra automaticamente por current_setting('app.tenant_id').
-- Se a GUC não estiver definida, nenhuma linha é retornada (deny by default).

-- Helper: extrai tenant atual da sessão, retorna NULL se não setado.
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS text AS $$
  SELECT NULLIF(current_setting('app.tenant_id', true), '')
$$ LANGUAGE sql STABLE;

-- Tabelas tenant-scoped. RLS habilitada + política única "tenant_isolation".
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'memberships',
    'schools',
    'classes',
    'students',
    'student_proficiency',
    'conversations',
    'messages',
    'consent_log',
    'sre_cases'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I FOR ALL ' ||
      'USING (tenant_id = current_tenant_id()) ' ||
      'WITH CHECK (tenant_id = current_tenant_id())',
      tbl
    );
  END LOOP;
END $$;

-- audit_log: pode ser lido apenas pelo tenant dono OU por admin_nexus
-- (admin checking feito na app, RLS só por tenant).
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON audit_log FOR ALL
  USING (tenant_id = current_tenant_id() OR tenant_id IS NULL)
  WITH CHECK (tenant_id = current_tenant_id() OR tenant_id IS NULL);

-- documents/chunks: tenant_id NULL = biblioteca nacional (público a todos)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_or_global ON documents FOR ALL
  USING (tenant_id IS NULL OR tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_or_global ON chunks FOR ALL
  USING (tenant_id IS NULL OR tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

-- Índice vetorial HNSW para retrieval (768/1536 dims comum):
CREATE INDEX IF NOT EXISTS chunks_embedding_hnsw_idx
  ON chunks USING hnsw (embedding vector_cosine_ops);
