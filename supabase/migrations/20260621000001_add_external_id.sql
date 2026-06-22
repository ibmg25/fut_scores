-- Add external_id columns to teams and matches for football-data.org API linking.
-- Both nullable — fully backwards-compatible with existing data.
ALTER TABLE teams   ADD COLUMN IF NOT EXISTS external_id INT UNIQUE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS external_id INT UNIQUE;
