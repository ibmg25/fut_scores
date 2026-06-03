-- Match phase enum covering all WC 2026 group stages and knockout rounds
CREATE TYPE match_phase AS ENUM (
  'group_a', 'group_b', 'group_c', 'group_d', 'group_e', 'group_f',
  'group_g', 'group_h', 'group_i', 'group_j', 'group_k', 'group_l',
  'r32', 'r16', 'qf', 'sf', 'third_place', 'final'
);

CREATE TYPE match_status AS ENUM ('pending', 'finished');

CREATE TYPE user_role AS ENUM ('user', 'superadmin');
