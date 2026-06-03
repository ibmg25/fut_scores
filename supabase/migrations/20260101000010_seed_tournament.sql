INSERT INTO tournaments (name, year, is_active)
VALUES ('FIFA World Cup', 2026, true)
ON CONFLICT DO NOTHING;
