-- Fix: tournaments table had no unique constraint, making ON CONFLICT DO NOTHING
-- in the seed a no-op. Each re-seed inserted a duplicate row.
ALTER TABLE tournaments
  ADD CONSTRAINT uq_tournaments_name_year UNIQUE (name, year);
