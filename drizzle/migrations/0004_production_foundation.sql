-- Production foundation: real credentials + indexes used by operational pages.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_hash text;

CREATE INDEX IF NOT EXISTS users_password_hash_idx
  ON users (id)
  WHERE password_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS messages_conversation_created_idx
  ON messages (conversation_id, created_at);

CREATE INDEX IF NOT EXISTS audit_log_action_created_idx
  ON audit_log (action, created_at);
