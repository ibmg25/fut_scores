-- FIFA World Cup 2026 — Group Stage Fixtures
-- Source: official schedule (ET = UTC-4, all times converted to UTC)
-- 72 matches across 12 groups (6 matches per group)
-- Idempotent: ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING

-- ── GROUP A: Mexico, South Africa, South Korea, Czech Republic ────────────────

-- Matchday 1
INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Mexico'), (SELECT id FROM teams WHERE name='South Africa'),
  '2026-06-11 19:00:00+00', 'group_a'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='South Korea'), (SELECT id FROM teams WHERE name='Czech Republic'),
  '2026-06-12 02:00:00+00', 'group_a'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- Matchday 2
INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Czech Republic'), (SELECT id FROM teams WHERE name='South Africa'),
  '2026-06-18 16:00:00+00', 'group_a'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Mexico'), (SELECT id FROM teams WHERE name='South Korea'),
  '2026-06-19 01:00:00+00', 'group_a'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- Matchday 3 (simultaneous)
INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Czech Republic'), (SELECT id FROM teams WHERE name='Mexico'),
  '2026-06-25 01:00:00+00', 'group_a'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='South Africa'), (SELECT id FROM teams WHERE name='South Korea'),
  '2026-06-25 01:00:00+00', 'group_a'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- ── GROUP B: Canada, Bosnia and Herzegovina, Qatar, Switzerland ───────────────

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Canada'), (SELECT id FROM teams WHERE name='Bosnia and Herzegovina'),
  '2026-06-12 19:00:00+00', 'group_b'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Qatar'), (SELECT id FROM teams WHERE name='Switzerland'),
  '2026-06-13 19:00:00+00', 'group_b'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Switzerland'), (SELECT id FROM teams WHERE name='Bosnia and Herzegovina'),
  '2026-06-18 19:00:00+00', 'group_b'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Canada'), (SELECT id FROM teams WHERE name='Qatar'),
  '2026-06-18 22:00:00+00', 'group_b'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Switzerland'), (SELECT id FROM teams WHERE name='Canada'),
  '2026-06-24 19:00:00+00', 'group_b'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Bosnia and Herzegovina'), (SELECT id FROM teams WHERE name='Qatar'),
  '2026-06-24 19:00:00+00', 'group_b'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- ── GROUP C: Brazil, Morocco, Haiti, Scotland ─────────────────────────────────

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Brazil'), (SELECT id FROM teams WHERE name='Morocco'),
  '2026-06-13 22:00:00+00', 'group_c'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Haiti'), (SELECT id FROM teams WHERE name='Scotland'),
  '2026-06-14 01:00:00+00', 'group_c'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Scotland'), (SELECT id FROM teams WHERE name='Morocco'),
  '2026-06-19 22:00:00+00', 'group_c'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Brazil'), (SELECT id FROM teams WHERE name='Haiti'),
  '2026-06-20 01:00:00+00', 'group_c'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Scotland'), (SELECT id FROM teams WHERE name='Brazil'),
  '2026-06-24 22:00:00+00', 'group_c'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Morocco'), (SELECT id FROM teams WHERE name='Haiti'),
  '2026-06-24 22:00:00+00', 'group_c'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- ── GROUP D: United States, Paraguay, Australia, Turkiye ─────────────────────

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='United States'), (SELECT id FROM teams WHERE name='Paraguay'),
  '2026-06-13 01:00:00+00', 'group_d'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Australia'), (SELECT id FROM teams WHERE name='Turkiye'),
  '2026-06-14 04:00:00+00', 'group_d'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='United States'), (SELECT id FROM teams WHERE name='Australia'),
  '2026-06-19 19:00:00+00', 'group_d'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Turkiye'), (SELECT id FROM teams WHERE name='Paraguay'),
  '2026-06-20 04:00:00+00', 'group_d'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Turkiye'), (SELECT id FROM teams WHERE name='United States'),
  '2026-06-26 02:00:00+00', 'group_d'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Paraguay'), (SELECT id FROM teams WHERE name='Australia'),
  '2026-06-26 02:00:00+00', 'group_d'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- ── GROUP E: Germany, Curacao, Ivory Coast, Ecuador ──────────────────────────

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Germany'), (SELECT id FROM teams WHERE name='Curacao'),
  '2026-06-14 17:00:00+00', 'group_e'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Ivory Coast'), (SELECT id FROM teams WHERE name='Ecuador'),
  '2026-06-14 23:00:00+00', 'group_e'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Germany'), (SELECT id FROM teams WHERE name='Ivory Coast'),
  '2026-06-20 20:00:00+00', 'group_e'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Ecuador'), (SELECT id FROM teams WHERE name='Curacao'),
  '2026-06-21 02:00:00+00', 'group_e'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Curacao'), (SELECT id FROM teams WHERE name='Ivory Coast'),
  '2026-06-25 20:00:00+00', 'group_e'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Ecuador'), (SELECT id FROM teams WHERE name='Germany'),
  '2026-06-25 20:00:00+00', 'group_e'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- ── GROUP F: Netherlands, Japan, Sweden, Tunisia ─────────────────────────────

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Netherlands'), (SELECT id FROM teams WHERE name='Japan'),
  '2026-06-14 20:00:00+00', 'group_f'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Sweden'), (SELECT id FROM teams WHERE name='Tunisia'),
  '2026-06-15 02:00:00+00', 'group_f'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Netherlands'), (SELECT id FROM teams WHERE name='Sweden'),
  '2026-06-20 17:00:00+00', 'group_f'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Tunisia'), (SELECT id FROM teams WHERE name='Japan'),
  '2026-06-21 04:00:00+00', 'group_f'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Japan'), (SELECT id FROM teams WHERE name='Sweden'),
  '2026-06-25 23:00:00+00', 'group_f'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Tunisia'), (SELECT id FROM teams WHERE name='Netherlands'),
  '2026-06-25 23:00:00+00', 'group_f'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- ── GROUP G: Belgium, Egypt, Iran, New Zealand ───────────────────────────────

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Belgium'), (SELECT id FROM teams WHERE name='Egypt'),
  '2026-06-15 19:00:00+00', 'group_g'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Iran'), (SELECT id FROM teams WHERE name='New Zealand'),
  '2026-06-16 01:00:00+00', 'group_g'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Belgium'), (SELECT id FROM teams WHERE name='Iran'),
  '2026-06-21 19:00:00+00', 'group_g'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='New Zealand'), (SELECT id FROM teams WHERE name='Egypt'),
  '2026-06-22 01:00:00+00', 'group_g'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Egypt'), (SELECT id FROM teams WHERE name='Iran'),
  '2026-06-27 03:00:00+00', 'group_g'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='New Zealand'), (SELECT id FROM teams WHERE name='Belgium'),
  '2026-06-27 03:00:00+00', 'group_g'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- ── GROUP H: Spain, Cape Verde, Saudi Arabia, Uruguay ────────────────────────

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Spain'), (SELECT id FROM teams WHERE name='Cape Verde'),
  '2026-06-15 16:00:00+00', 'group_h'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Saudi Arabia'), (SELECT id FROM teams WHERE name='Uruguay'),
  '2026-06-15 22:00:00+00', 'group_h'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Spain'), (SELECT id FROM teams WHERE name='Saudi Arabia'),
  '2026-06-21 16:00:00+00', 'group_h'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Uruguay'), (SELECT id FROM teams WHERE name='Cape Verde'),
  '2026-06-21 22:00:00+00', 'group_h'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Cape Verde'), (SELECT id FROM teams WHERE name='Saudi Arabia'),
  '2026-06-27 00:00:00+00', 'group_h'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Uruguay'), (SELECT id FROM teams WHERE name='Spain'),
  '2026-06-27 00:00:00+00', 'group_h'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- ── GROUP I: France, Senegal, Iraq, Norway ────────────────────────────────────

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='France'), (SELECT id FROM teams WHERE name='Senegal'),
  '2026-06-16 19:00:00+00', 'group_i'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Iraq'), (SELECT id FROM teams WHERE name='Norway'),
  '2026-06-16 22:00:00+00', 'group_i'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='France'), (SELECT id FROM teams WHERE name='Iraq'),
  '2026-06-22 21:00:00+00', 'group_i'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Norway'), (SELECT id FROM teams WHERE name='Senegal'),
  '2026-06-23 00:00:00+00', 'group_i'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Norway'), (SELECT id FROM teams WHERE name='France'),
  '2026-06-26 19:00:00+00', 'group_i'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Senegal'), (SELECT id FROM teams WHERE name='Iraq'),
  '2026-06-26 19:00:00+00', 'group_i'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- ── GROUP J: Argentina, Algeria, Austria, Jordan ─────────────────────────────

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Argentina'), (SELECT id FROM teams WHERE name='Algeria'),
  '2026-06-17 01:00:00+00', 'group_j'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Austria'), (SELECT id FROM teams WHERE name='Jordan'),
  '2026-06-17 04:00:00+00', 'group_j'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Argentina'), (SELECT id FROM teams WHERE name='Austria'),
  '2026-06-22 17:00:00+00', 'group_j'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Jordan'), (SELECT id FROM teams WHERE name='Algeria'),
  '2026-06-23 03:00:00+00', 'group_j'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Algeria'), (SELECT id FROM teams WHERE name='Austria'),
  '2026-06-28 02:00:00+00', 'group_j'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Jordan'), (SELECT id FROM teams WHERE name='Argentina'),
  '2026-06-28 02:00:00+00', 'group_j'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- ── GROUP K: Portugal, DR Congo, Uzbekistan, Colombia ────────────────────────

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Portugal'), (SELECT id FROM teams WHERE name='DR Congo'),
  '2026-06-17 17:00:00+00', 'group_k'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Uzbekistan'), (SELECT id FROM teams WHERE name='Colombia'),
  '2026-06-18 02:00:00+00', 'group_k'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Portugal'), (SELECT id FROM teams WHERE name='Uzbekistan'),
  '2026-06-23 17:00:00+00', 'group_k'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Colombia'), (SELECT id FROM teams WHERE name='DR Congo'),
  '2026-06-24 02:00:00+00', 'group_k'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Colombia'), (SELECT id FROM teams WHERE name='Portugal'),
  '2026-06-27 23:30:00+00', 'group_k'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='DR Congo'), (SELECT id FROM teams WHERE name='Uzbekistan'),
  '2026-06-27 23:30:00+00', 'group_k'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- ── GROUP L: England, Croatia, Ghana, Panama ─────────────────────────────────

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='England'), (SELECT id FROM teams WHERE name='Croatia'),
  '2026-06-17 20:00:00+00', 'group_l'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Ghana'), (SELECT id FROM teams WHERE name='Panama'),
  '2026-06-17 23:00:00+00', 'group_l'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='England'), (SELECT id FROM teams WHERE name='Ghana'),
  '2026-06-23 20:00:00+00', 'group_l'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Panama'), (SELECT id FROM teams WHERE name='Croatia'),
  '2026-06-23 23:00:00+00', 'group_l'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Panama'), (SELECT id FROM teams WHERE name='England'),
  '2026-06-27 21:00:00+00', 'group_l'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id, (SELECT id FROM teams WHERE name='Croatia'), (SELECT id FROM teams WHERE name='Ghana'),
  '2026-06-27 21:00:00+00', 'group_l'
FROM tournaments t WHERE t.name='FIFA World Cup' AND t.year=2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;
