-- Allow any authenticated user to read predictions for finished matches.
-- Predictions for pending/locked matches remain private (only owner can read).
-- The page component enforces an additional group-membership guard above this.
CREATE POLICY "predictions_select_finished"
  ON predictions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = predictions.match_id
        AND matches.status = 'finished'
    )
  );
