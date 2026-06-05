-- FIFA World Cup 2026 — Knockout Stage Fixtures (TEST SEED)
-- 32 qualifiers: top 2 from each of 12 groups + 8 best 3rd-place teams
-- All knockout matches have is_knockout = true
-- Idempotent: ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING
--
-- Qualifiers used
--   A: Mexico (1st), South Korea (2nd), Czech Republic (3rd)
--   B: Canada (1st), Switzerland (2nd), Qatar (3rd)
--   C: Brazil (1st), Morocco (2nd), Scotland (3rd)
--   D: United States (1st), Australia (2nd), Turkiye (3rd)
--   E: Germany (1st), Ivory Coast (2nd), Ecuador (3rd)
--   F: Netherlands (1st), Japan (2nd), Sweden (3rd)
--   G: Belgium (1st), Egypt (2nd), Iran (3rd)
--   H: Spain (1st), Uruguay (2nd), Saudi Arabia (3rd)
--   I: France (1st), Norway (2nd)
--   J: Argentina (1st), Austria (2nd)
--   K: Portugal (1st), Colombia (2nd)
--   L: England (1st), Croatia (2nd)


-- ── ROUND OF 32 (16 matches · Jul 1–4) ───────────────────────────────────────

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Mexico'), (SELECT id FROM teams WHERE name='Qatar'),
  '2026-07-01 19:00:00+00', 'r32', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Germany'), (SELECT id FROM teams WHERE name='Sweden'),
  '2026-07-01 23:00:00+00', 'r32', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Brazil'), (SELECT id FROM teams WHERE name='Iran'),
  '2026-07-02 02:00:00+00', 'r32', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Spain'), (SELECT id FROM teams WHERE name='Saudi Arabia'),
  '2026-07-02 19:00:00+00', 'r32', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='France'), (SELECT id FROM teams WHERE name='Ecuador'),
  '2026-07-02 23:00:00+00', 'r32', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Argentina'), (SELECT id FROM teams WHERE name='Czech Republic'),
  '2026-07-03 02:00:00+00', 'r32', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Portugal'), (SELECT id FROM teams WHERE name='Turkiye'),
  '2026-07-03 19:00:00+00', 'r32', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='England'), (SELECT id FROM teams WHERE name='Scotland'),
  '2026-07-03 23:00:00+00', 'r32', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='South Korea'), (SELECT id FROM teams WHERE name='Switzerland'),
  '2026-07-04 02:00:00+00', 'r32', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Netherlands'), (SELECT id FROM teams WHERE name='Egypt'),
  '2026-07-04 19:00:00+00', 'r32', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='United States'), (SELECT id FROM teams WHERE name='Morocco'),
  '2026-07-04 23:00:00+00', 'r32', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Belgium'), (SELECT id FROM teams WHERE name='Uruguay'),
  '2026-07-05 02:00:00+00', 'r32', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Canada'), (SELECT id FROM teams WHERE name='Austria'),
  '2026-07-05 19:00:00+00', 'r32', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Norway'), (SELECT id FROM teams WHERE name='Ivory Coast'),
  '2026-07-05 23:00:00+00', 'r32', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Australia'), (SELECT id FROM teams WHERE name='Japan'),
  '2026-07-06 02:00:00+00', 'r32', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Colombia'), (SELECT id FROM teams WHERE name='Croatia'),
  '2026-07-06 19:00:00+00', 'r32', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;


-- ── ROUND OF 16 (8 matches · Jul 7–9) ────────────────────────────────────────

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Brazil'), (SELECT id FROM teams WHERE name='Germany'),
  '2026-07-07 19:00:00+00', 'r16', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Spain'), (SELECT id FROM teams WHERE name='France'),
  '2026-07-07 23:00:00+00', 'r16', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Argentina'), (SELECT id FROM teams WHERE name='Portugal'),
  '2026-07-08 02:00:00+00', 'r16', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='England'), (SELECT id FROM teams WHERE name='Netherlands'),
  '2026-07-08 19:00:00+00', 'r16', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Mexico'), (SELECT id FROM teams WHERE name='Canada'),
  '2026-07-08 23:00:00+00', 'r16', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='United States'), (SELECT id FROM teams WHERE name='Belgium'),
  '2026-07-09 02:00:00+00', 'r16', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='South Korea'), (SELECT id FROM teams WHERE name='Australia'),
  '2026-07-09 19:00:00+00', 'r16', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Norway'), (SELECT id FROM teams WHERE name='Colombia'),
  '2026-07-09 23:00:00+00', 'r16', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;


-- ── QUARTER-FINALS (4 matches · Jul 12–13) ───────────────────────────────────

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Brazil'), (SELECT id FROM teams WHERE name='Spain'),
  '2026-07-12 19:00:00+00', 'qf', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Argentina'), (SELECT id FROM teams WHERE name='England'),
  '2026-07-12 23:00:00+00', 'qf', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Mexico'), (SELECT id FROM teams WHERE name='United States'),
  '2026-07-13 02:00:00+00', 'qf', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='South Korea'), (SELECT id FROM teams WHERE name='Norway'),
  '2026-07-13 19:00:00+00', 'qf', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;


-- ── SEMI-FINALS (2 matches · Jul 16–17) ──────────────────────────────────────

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Brazil'), (SELECT id FROM teams WHERE name='Argentina'),
  '2026-07-16 23:00:00+00', 'sf', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Mexico'), (SELECT id FROM teams WHERE name='South Korea'),
  '2026-07-17 23:00:00+00', 'sf', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;


-- ── THIRD PLACE (1 match · Jul 19) ───────────────────────────────────────────

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Argentina'), (SELECT id FROM teams WHERE name='South Korea'),
  '2026-07-19 19:00:00+00', 'third_place', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;


-- ── FINAL (1 match · Jul 20) ─────────────────────────────────────────────────

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase, is_knockout)
SELECT t.id, (SELECT id FROM teams WHERE name='Brazil'), (SELECT id FROM teams WHERE name='Mexico'),
  '2026-07-20 19:00:00+00', 'final', true
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;
