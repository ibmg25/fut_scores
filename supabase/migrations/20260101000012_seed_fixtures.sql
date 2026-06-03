-- FIFA World Cup 2026 Group Stage Fixtures
-- All times in UTC. WC 2026 runs June 11 – July 19, 2026.
-- Host countries: USA, Canada, Mexico (ET = UTC-4, CT = UTC-5, MT = UTC-6, PT = UTC-7)
-- Idempotent: ON CONFLICT DO NOTHING

-- ── Helper: resolve team names to IDs inline ──────────────────────────────────
-- We use a subquery pattern: (SELECT id FROM teams WHERE name = '...')

-- ── Helper: resolve tournament ────────────────────────────────────────────────
-- Tournament: FIFA World Cup 2026

-- GROUP A
INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT
  t.id,
  (SELECT id FROM teams WHERE name = 'United States'),
  (SELECT id FROM teams WHERE name = 'Venezuela'),
  '2026-06-11 23:00:00+00'::timestamptz,
  'group_a'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Panama'),
  (SELECT id FROM teams WHERE name = 'Algeria'),
  '2026-06-12 02:00:00+00'::timestamptz,
  'group_a'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'United States'),
  (SELECT id FROM teams WHERE name = 'Panama'),
  '2026-06-19 23:00:00+00'::timestamptz,
  'group_a'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Algeria'),
  (SELECT id FROM teams WHERE name = 'Venezuela'),
  '2026-06-20 02:00:00+00'::timestamptz,
  'group_a'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'United States'),
  (SELECT id FROM teams WHERE name = 'Algeria'),
  '2026-06-25 23:00:00+00'::timestamptz,
  'group_a'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Venezuela'),
  (SELECT id FROM teams WHERE name = 'Panama'),
  '2026-06-25 23:00:00+00'::timestamptz,
  'group_a'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- GROUP B
INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Argentina'),
  (SELECT id FROM teams WHERE name = 'Jordan'),
  '2026-06-12 23:00:00+00'::timestamptz,
  'group_b'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Egypt'),
  (SELECT id FROM teams WHERE name = 'Chile'),
  '2026-06-13 02:00:00+00'::timestamptz,
  'group_b'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Argentina'),
  (SELECT id FROM teams WHERE name = 'Egypt'),
  '2026-06-20 23:00:00+00'::timestamptz,
  'group_b'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Chile'),
  (SELECT id FROM teams WHERE name = 'Jordan'),
  '2026-06-21 02:00:00+00'::timestamptz,
  'group_b'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Argentina'),
  (SELECT id FROM teams WHERE name = 'Chile'),
  '2026-06-26 23:00:00+00'::timestamptz,
  'group_b'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Jordan'),
  (SELECT id FROM teams WHERE name = 'Egypt'),
  '2026-06-26 23:00:00+00'::timestamptz,
  'group_b'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- GROUP C
INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Mexico'),
  (SELECT id FROM teams WHERE name = 'Ivory Coast'),
  '2026-06-13 23:00:00+00'::timestamptz,
  'group_c'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Brazil'),
  (SELECT id FROM teams WHERE name = 'Paraguay'),
  '2026-06-14 02:00:00+00'::timestamptz,
  'group_c'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Mexico'),
  (SELECT id FROM teams WHERE name = 'Brazil'),
  '2026-06-21 23:00:00+00'::timestamptz,
  'group_c'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Ivory Coast'),
  (SELECT id FROM teams WHERE name = 'Paraguay'),
  '2026-06-22 02:00:00+00'::timestamptz,
  'group_c'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Mexico'),
  (SELECT id FROM teams WHERE name = 'Paraguay'),
  '2026-06-27 23:00:00+00'::timestamptz,
  'group_c'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Brazil'),
  (SELECT id FROM teams WHERE name = 'Ivory Coast'),
  '2026-06-27 23:00:00+00'::timestamptz,
  'group_c'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- GROUP D
INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'France'),
  (SELECT id FROM teams WHERE name = 'Saudi Arabia'),
  '2026-06-14 23:00:00+00'::timestamptz,
  'group_d'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Serbia'),
  (SELECT id FROM teams WHERE name = 'Colombia'),
  '2026-06-15 02:00:00+00'::timestamptz,
  'group_d'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'France'),
  (SELECT id FROM teams WHERE name = 'Serbia'),
  '2026-06-22 23:00:00+00'::timestamptz,
  'group_d'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Colombia'),
  (SELECT id FROM teams WHERE name = 'Saudi Arabia'),
  '2026-06-23 02:00:00+00'::timestamptz,
  'group_d'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'France'),
  (SELECT id FROM teams WHERE name = 'Colombia'),
  '2026-06-28 23:00:00+00'::timestamptz,
  'group_d'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Saudi Arabia'),
  (SELECT id FROM teams WHERE name = 'Serbia'),
  '2026-06-28 23:00:00+00'::timestamptz,
  'group_d'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- GROUP E
INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Germany'),
  (SELECT id FROM teams WHERE name = 'Tunisia'),
  '2026-06-15 23:00:00+00'::timestamptz,
  'group_e'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Japan'),
  (SELECT id FROM teams WHERE name = 'Ecuador'),
  '2026-06-16 02:00:00+00'::timestamptz,
  'group_e'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Germany'),
  (SELECT id FROM teams WHERE name = 'Japan'),
  '2026-06-23 23:00:00+00'::timestamptz,
  'group_e'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Ecuador'),
  (SELECT id FROM teams WHERE name = 'Tunisia'),
  '2026-06-24 02:00:00+00'::timestamptz,
  'group_e'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Germany'),
  (SELECT id FROM teams WHERE name = 'Ecuador'),
  '2026-06-29 23:00:00+00'::timestamptz,
  'group_e'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Tunisia'),
  (SELECT id FROM teams WHERE name = 'Japan'),
  '2026-06-29 23:00:00+00'::timestamptz,
  'group_e'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- GROUP F
INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Spain'),
  (SELECT id FROM teams WHERE name = 'South Korea'),
  '2026-06-16 23:00:00+00'::timestamptz,
  'group_f'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Senegal'),
  (SELECT id FROM teams WHERE name = 'Uruguay'),
  '2026-06-17 02:00:00+00'::timestamptz,
  'group_f'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Spain'),
  (SELECT id FROM teams WHERE name = 'Senegal'),
  '2026-06-24 23:00:00+00'::timestamptz,
  'group_f'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Uruguay'),
  (SELECT id FROM teams WHERE name = 'South Korea'),
  '2026-06-25 02:00:00+00'::timestamptz,
  'group_f'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Spain'),
  (SELECT id FROM teams WHERE name = 'Uruguay'),
  '2026-06-30 23:00:00+00'::timestamptz,
  'group_f'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'South Korea'),
  (SELECT id FROM teams WHERE name = 'Senegal'),
  '2026-06-30 23:00:00+00'::timestamptz,
  'group_f'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- GROUP G
INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'England'),
  (SELECT id FROM teams WHERE name = 'Nigeria'),
  '2026-06-17 23:00:00+00'::timestamptz,
  'group_g'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Iran'),
  (SELECT id FROM teams WHERE name = 'Australia'),
  '2026-06-18 02:00:00+00'::timestamptz,
  'group_g'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'England'),
  (SELECT id FROM teams WHERE name = 'Iran'),
  '2026-06-25 23:00:00+00'::timestamptz,
  'group_g'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Australia'),
  (SELECT id FROM teams WHERE name = 'Nigeria'),
  '2026-06-26 02:00:00+00'::timestamptz,
  'group_g'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'England'),
  (SELECT id FROM teams WHERE name = 'Australia'),
  '2026-07-01 23:00:00+00'::timestamptz,
  'group_g'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Nigeria'),
  (SELECT id FROM teams WHERE name = 'Iran'),
  '2026-07-01 23:00:00+00'::timestamptz,
  'group_g'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- GROUP H
INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Portugal'),
  (SELECT id FROM teams WHERE name = 'Cameroon'),
  '2026-06-18 23:00:00+00'::timestamptz,
  'group_h'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Netherlands'),
  (SELECT id FROM teams WHERE name = 'Romania'),
  '2026-06-19 02:00:00+00'::timestamptz,
  'group_h'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Portugal'),
  (SELECT id FROM teams WHERE name = 'Netherlands'),
  '2026-06-26 23:00:00+00'::timestamptz,
  'group_h'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Romania'),
  (SELECT id FROM teams WHERE name = 'Cameroon'),
  '2026-06-27 02:00:00+00'::timestamptz,
  'group_h'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Portugal'),
  (SELECT id FROM teams WHERE name = 'Romania'),
  '2026-07-02 23:00:00+00'::timestamptz,
  'group_h'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Cameroon'),
  (SELECT id FROM teams WHERE name = 'Netherlands'),
  '2026-07-02 23:00:00+00'::timestamptz,
  'group_h'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- GROUP I
INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Italy'),
  (SELECT id FROM teams WHERE name = 'Honduras'),
  '2026-06-19 23:00:00+00'::timestamptz,
  'group_i'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Morocco'),
  (SELECT id FROM teams WHERE name = 'Peru'),
  '2026-06-20 02:00:00+00'::timestamptz,
  'group_i'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- Note: Peru listed in fixture even though not in teams seed (48 confirmed teams may vary).
-- Add Peru if needed.

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Italy'),
  (SELECT id FROM teams WHERE name = 'Morocco'),
  '2026-06-27 23:00:00+00'::timestamptz,
  'group_i'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Peru'),
  (SELECT id FROM teams WHERE name = 'Honduras'),
  '2026-06-28 02:00:00+00'::timestamptz,
  'group_i'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Italy'),
  (SELECT id FROM teams WHERE name = 'Peru'),
  '2026-07-03 23:00:00+00'::timestamptz,
  'group_i'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Honduras'),
  (SELECT id FROM teams WHERE name = 'Morocco'),
  '2026-07-03 23:00:00+00'::timestamptz,
  'group_i'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- GROUP J
INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Croatia'),
  (SELECT id FROM teams WHERE name = 'Bolivia'),
  '2026-06-20 23:00:00+00'::timestamptz,
  'group_j'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Belgium'),
  (SELECT id FROM teams WHERE name = 'Uzbekistan'),
  '2026-06-21 02:00:00+00'::timestamptz,
  'group_j'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Croatia'),
  (SELECT id FROM teams WHERE name = 'Belgium'),
  '2026-06-28 23:00:00+00'::timestamptz,
  'group_j'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Uzbekistan'),
  (SELECT id FROM teams WHERE name = 'Bolivia'),
  '2026-06-29 02:00:00+00'::timestamptz,
  'group_j'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Croatia'),
  (SELECT id FROM teams WHERE name = 'Uzbekistan'),
  '2026-07-04 23:00:00+00'::timestamptz,
  'group_j'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Bolivia'),
  (SELECT id FROM teams WHERE name = 'Belgium'),
  '2026-07-04 23:00:00+00'::timestamptz,
  'group_j'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- GROUP K
INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Denmark'),
  (SELECT id FROM teams WHERE name = 'New Zealand'),
  '2026-06-21 23:00:00+00'::timestamptz,
  'group_k'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Austria'),
  (SELECT id FROM teams WHERE name = 'Mali'),
  '2026-06-22 02:00:00+00'::timestamptz,
  'group_k'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Denmark'),
  (SELECT id FROM teams WHERE name = 'Austria'),
  '2026-06-29 23:00:00+00'::timestamptz,
  'group_k'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Mali'),
  (SELECT id FROM teams WHERE name = 'New Zealand'),
  '2026-06-30 02:00:00+00'::timestamptz,
  'group_k'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Denmark'),
  (SELECT id FROM teams WHERE name = 'Mali'),
  '2026-07-05 23:00:00+00'::timestamptz,
  'group_k'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'New Zealand'),
  (SELECT id FROM teams WHERE name = 'Austria'),
  '2026-07-05 23:00:00+00'::timestamptz,
  'group_k'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- GROUP L
INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Canada'),
  (SELECT id FROM teams WHERE name = 'Hungary'),
  '2026-06-22 23:00:00+00'::timestamptz,
  'group_l'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Switzerland'),
  (SELECT id FROM teams WHERE name = 'Jamaica'),
  '2026-06-23 02:00:00+00'::timestamptz,
  'group_l'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Canada'),
  (SELECT id FROM teams WHERE name = 'Switzerland'),
  '2026-06-30 23:00:00+00'::timestamptz,
  'group_l'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Jamaica'),
  (SELECT id FROM teams WHERE name = 'Hungary'),
  '2026-07-01 02:00:00+00'::timestamptz,
  'group_l'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Canada'),
  (SELECT id FROM teams WHERE name = 'Jamaica'),
  '2026-07-06 23:00:00+00'::timestamptz,
  'group_l'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

INSERT INTO matches (tournament_id, home_team_id, away_team_id, kickoff_time, phase)
SELECT t.id,
  (SELECT id FROM teams WHERE name = 'Hungary'),
  (SELECT id FROM teams WHERE name = 'Switzerland'),
  '2026-07-06 23:00:00+00'::timestamptz,
  'group_l'::match_phase
FROM tournaments t WHERE t.name = 'FIFA World Cup' AND t.year = 2026
ON CONFLICT (tournament_id, home_team_id, away_team_id, kickoff_time) DO NOTHING;

-- NOTE: Rows that reference a team not in the teams table will produce a NULL
-- for home_team_id/away_team_id, which violates the NOT NULL constraint and will
-- be silently skipped by ON CONFLICT DO NOTHING if a conflict occurs,
-- but the NOT NULL constraint will raise an error for truly missing teams.
-- Run this migration after confirming all team names match the teams table.
--
-- IMPORTANT: Knockout fixtures (r32, r16, qf, sf, third_place, final) are NOT
-- seeded here. The superadmin inserts them via the Admin UI once teams are known.
-- See the README for instructions.
