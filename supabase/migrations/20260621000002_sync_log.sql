-- sync_log: records every automated match-sync run for audit and admin UI display.
CREATE TABLE IF NOT EXISTS sync_log (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  kickoff_updates  INT         NOT NULL DEFAULT 0,
  results_loaded   INT         NOT NULL DEFAULT 0,
  matches_created  INT         NOT NULL DEFAULT 0,
  error            TEXT
);

ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;

-- Admins and above can read; service_role (used by sync) bypasses RLS automatically.
CREATE POLICY "sync_log_select_admin"
  ON sync_log FOR SELECT TO authenticated
  USING (is_admin_or_above());
