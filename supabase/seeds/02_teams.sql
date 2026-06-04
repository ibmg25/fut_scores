-- 48 teams participating in FIFA World Cup 2026
-- Flags from flagcdn.com (free, no API key)
INSERT INTO teams (name, flag_url) VALUES
  -- Group A
  ('Mexico',                 'https://flagcdn.com/w80/mx.png'),
  ('South Africa',           'https://flagcdn.com/w80/za.png'),
  ('South Korea',            'https://flagcdn.com/w80/kr.png'),
  ('Czech Republic',         'https://flagcdn.com/w80/cz.png'),
  -- Group B
  ('Canada',                 'https://flagcdn.com/w80/ca.png'),
  ('Bosnia and Herzegovina', 'https://flagcdn.com/w80/ba.png'),
  ('Qatar',                  'https://flagcdn.com/w80/qa.png'),
  ('Switzerland',            'https://flagcdn.com/w80/ch.png'),
  -- Group C
  ('Brazil',                 'https://flagcdn.com/w80/br.png'),
  ('Morocco',                'https://flagcdn.com/w80/ma.png'),
  ('Haiti',                  'https://flagcdn.com/w80/ht.png'),
  ('Scotland',               'https://flagcdn.com/w80/gb-sct.png'),
  -- Group D
  ('United States',          'https://flagcdn.com/w80/us.png'),
  ('Paraguay',               'https://flagcdn.com/w80/py.png'),
  ('Australia',              'https://flagcdn.com/w80/au.png'),
  ('Turkiye',                'https://flagcdn.com/w80/tr.png'),
  -- Group E
  ('Germany',                'https://flagcdn.com/w80/de.png'),
  ('Curacao',                'https://flagcdn.com/w80/cw.png'),
  ('Ivory Coast',            'https://flagcdn.com/w80/ci.png'),
  ('Ecuador',                'https://flagcdn.com/w80/ec.png'),
  -- Group F
  ('Netherlands',            'https://flagcdn.com/w80/nl.png'),
  ('Japan',                  'https://flagcdn.com/w80/jp.png'),
  ('Sweden',                 'https://flagcdn.com/w80/se.png'),
  ('Tunisia',                'https://flagcdn.com/w80/tn.png'),
  -- Group G
  ('Belgium',                'https://flagcdn.com/w80/be.png'),
  ('Egypt',                  'https://flagcdn.com/w80/eg.png'),
  ('Iran',                   'https://flagcdn.com/w80/ir.png'),
  ('New Zealand',            'https://flagcdn.com/w80/nz.png'),
  -- Group H
  ('Spain',                  'https://flagcdn.com/w80/es.png'),
  ('Cape Verde',             'https://flagcdn.com/w80/cv.png'),
  ('Saudi Arabia',           'https://flagcdn.com/w80/sa.png'),
  ('Uruguay',                'https://flagcdn.com/w80/uy.png'),
  -- Group I
  ('France',                 'https://flagcdn.com/w80/fr.png'),
  ('Senegal',                'https://flagcdn.com/w80/sn.png'),
  ('Iraq',                   'https://flagcdn.com/w80/iq.png'),
  ('Norway',                 'https://flagcdn.com/w80/no.png'),
  -- Group J
  ('Argentina',              'https://flagcdn.com/w80/ar.png'),
  ('Algeria',                'https://flagcdn.com/w80/dz.png'),
  ('Austria',                'https://flagcdn.com/w80/at.png'),
  ('Jordan',                 'https://flagcdn.com/w80/jo.png'),
  -- Group K
  ('Portugal',               'https://flagcdn.com/w80/pt.png'),
  ('DR Congo',               'https://flagcdn.com/w80/cd.png'),
  ('Uzbekistan',             'https://flagcdn.com/w80/uz.png'),
  ('Colombia',               'https://flagcdn.com/w80/co.png'),
  -- Group L
  ('England',                'https://flagcdn.com/w80/gb-eng.png'),
  ('Croatia',                'https://flagcdn.com/w80/hr.png'),
  ('Ghana',                  'https://flagcdn.com/w80/gh.png'),
  ('Panama',                 'https://flagcdn.com/w80/pa.png')
ON CONFLICT (name) DO NOTHING;
