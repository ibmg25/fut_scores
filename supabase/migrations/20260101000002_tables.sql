CREATE TABLE tournaments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  year       INT  NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE teams (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  flag_url   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE matches (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id          UUID NOT NULL REFERENCES tournaments(id),
  home_team_id           UUID NOT NULL REFERENCES teams(id),
  away_team_id           UUID NOT NULL REFERENCES teams(id),
  kickoff_time           TIMESTAMPTZ NOT NULL,
  phase                  match_phase NOT NULL,
  home_score             INT  NULL,
  away_score             INT  NULL,
  penalty_winner_team_id UUID NULL REFERENCES teams(id),
  status                 match_status NOT NULL DEFAULT 'pending',
  results_set_by         UUID NULL REFERENCES auth.users(id),
  results_set_at         TIMESTAMPTZ NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_teams_differ
    CHECK (home_team_id <> away_team_id),
  CONSTRAINT chk_finished_has_scores
    CHECK (status = 'pending' OR (home_score IS NOT NULL AND away_score IS NOT NULL)),
  CONSTRAINT chk_penalty_winner_valid
    CHECK (
      penalty_winner_team_id IS NULL
      OR penalty_winner_team_id IN (home_team_id, away_team_id)
    )
);

CREATE TABLE users_profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name         TEXT NOT NULL,
  role                 user_role NOT NULL DEFAULT 'user',
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  total_points         INT NOT NULL DEFAULT 0,
  exact_results_count  INT NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE predictions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id             UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  predicted_home_score INT NOT NULL CHECK (predicted_home_score >= 0),
  predicted_away_score INT NOT NULL CHECK (predicted_away_score >= 0),
  points_earned        INT NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (user_id, match_id)
);

-- Unique constraint for idempotent seeding of fixtures
CREATE UNIQUE INDEX idx_matches_natural_key
  ON matches (tournament_id, home_team_id, away_team_id, kickoff_time);

-- Performance indexes
CREATE INDEX idx_matches_tournament_kickoff ON matches (tournament_id, kickoff_time);
CREATE INDEX idx_matches_status ON matches (status);
CREATE INDEX idx_predictions_match ON predictions (match_id);
CREATE INDEX idx_predictions_user ON predictions (user_id);
