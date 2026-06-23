-- Adds a nullable JSONB column to sync_log for storing match-level change details.
-- Old rows remain valid with NULL; existing RLS policy covers the new column automatically.
ALTER TABLE sync_log
  ADD COLUMN IF NOT EXISTS details JSONB;
