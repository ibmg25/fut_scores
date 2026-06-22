-- 48 teams participating in FIFA World Cup 2026
-- Flags from flagcdn.com (free, no API key)
-- external_id: football-data.org numeric team IDs (several API names differ from DB names)
INSERT INTO teams (name, flag_url, external_id) VALUES
  -- Group A
  ('Mexico',                 'https://flagcdn.com/w80/mx.png',     769),
  ('South Africa',           'https://flagcdn.com/w80/za.png',     774),
  ('South Korea',            'https://flagcdn.com/w80/kr.png',     772),
  ('Czech Republic',         'https://flagcdn.com/w80/cz.png',     798),  -- API: "Czechia"
  -- Group B
  ('Canada',                 'https://flagcdn.com/w80/ca.png',     828),
  ('Bosnia and Herzegovina', 'https://flagcdn.com/w80/ba.png',    1060),  -- API: "Bosnia-Herzegovina"
  ('Qatar',                  'https://flagcdn.com/w80/qa.png',    8030),
  ('Switzerland',            'https://flagcdn.com/w80/ch.png',     788),
  -- Group C
  ('Brazil',                 'https://flagcdn.com/w80/br.png',     764),
  ('Morocco',                'https://flagcdn.com/w80/ma.png',     815),
  ('Haiti',                  'https://flagcdn.com/w80/ht.png',     836),
  ('Scotland',               'https://flagcdn.com/w80/gb-sct.png', 8873),
  -- Group D
  ('United States',          'https://flagcdn.com/w80/us.png',     771),
  ('Paraguay',               'https://flagcdn.com/w80/py.png',     761),
  ('Australia',              'https://flagcdn.com/w80/au.png',     779),
  ('Turkiye',                'https://flagcdn.com/w80/tr.png',     803),   -- API: "Turkey"
  -- Group E
  ('Germany',                'https://flagcdn.com/w80/de.png',     759),
  ('Curacao',                'https://flagcdn.com/w80/cw.png',    9460),   -- API: "Curaçao"
  ('Ivory Coast',            'https://flagcdn.com/w80/ci.png',    1935),
  ('Ecuador',                'https://flagcdn.com/w80/ec.png',     791),
  -- Group F
  ('Netherlands',            'https://flagcdn.com/w80/nl.png',    8601),
  ('Japan',                  'https://flagcdn.com/w80/jp.png',     766),
  ('Sweden',                 'https://flagcdn.com/w80/se.png',     792),
  ('Tunisia',                'https://flagcdn.com/w80/tn.png',     802),
  -- Group G
  ('Belgium',                'https://flagcdn.com/w80/be.png',     805),
  ('Egypt',                  'https://flagcdn.com/w80/eg.png',     825),
  ('Iran',                   'https://flagcdn.com/w80/ir.png',     840),
  ('New Zealand',            'https://flagcdn.com/w80/nz.png',     783),
  -- Group H
  ('Spain',                  'https://flagcdn.com/w80/es.png',     760),
  ('Cape Verde',             'https://flagcdn.com/w80/cv.png',    1930),   -- API: "Cape Verde Islands"
  ('Saudi Arabia',           'https://flagcdn.com/w80/sa.png',     801),
  ('Uruguay',                'https://flagcdn.com/w80/uy.png',     758),
  -- Group I
  ('France',                 'https://flagcdn.com/w80/fr.png',     773),
  ('Senegal',                'https://flagcdn.com/w80/sn.png',     804),
  ('Iraq',                   'https://flagcdn.com/w80/iq.png',    8062),
  ('Norway',                 'https://flagcdn.com/w80/no.png',    8872),
  -- Group J
  ('Argentina',              'https://flagcdn.com/w80/ar.png',     762),
  ('Algeria',                'https://flagcdn.com/w80/dz.png',     778),
  ('Austria',                'https://flagcdn.com/w80/at.png',     816),
  ('Jordan',                 'https://flagcdn.com/w80/jo.png',    8049),
  -- Group K
  ('Portugal',               'https://flagcdn.com/w80/pt.png',     765),
  ('DR Congo',               'https://flagcdn.com/w80/cd.png',    1934),   -- API: "Congo DR"
  ('Uzbekistan',             'https://flagcdn.com/w80/uz.png',    8070),
  ('Colombia',               'https://flagcdn.com/w80/co.png',     818),
  -- Group L
  ('England',                'https://flagcdn.com/w80/gb-eng.png', 770),
  ('Croatia',                'https://flagcdn.com/w80/hr.png',     799),
  ('Ghana',                  'https://flagcdn.com/w80/gh.png',     763),
  ('Panama',                 'https://flagcdn.com/w80/pa.png',    1836)
ON CONFLICT (name) DO NOTHING;
