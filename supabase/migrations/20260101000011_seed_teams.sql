-- 48 qualified teams for FIFA World Cup 2026
-- Flag URLs from flagcdn.com (free, no API key required)
-- Idempotent: ON CONFLICT (name) DO NOTHING
INSERT INTO teams (name, flag_url) VALUES
  -- CONMEBOL (6 + 0.5)
  ('Brazil',              'https://flagcdn.com/w80/br.png'),
  ('Argentina',           'https://flagcdn.com/w80/ar.png'),
  ('Colombia',            'https://flagcdn.com/w80/co.png'),
  ('Uruguay',             'https://flagcdn.com/w80/uy.png'),
  ('Ecuador',             'https://flagcdn.com/w80/ec.png'),
  ('Chile',               'https://flagcdn.com/w80/cl.png'),
  ('Venezuela',           'https://flagcdn.com/w80/ve.png'),
  ('Paraguay',            'https://flagcdn.com/w80/py.png'),
  ('Bolivia',             'https://flagcdn.com/w80/bo.png'),

  -- CONCACAF (6 + 0.5)
  ('United States',       'https://flagcdn.com/w80/us.png'),
  ('Mexico',              'https://flagcdn.com/w80/mx.png'),
  ('Canada',              'https://flagcdn.com/w80/ca.png'),
  ('Panama',              'https://flagcdn.com/w80/pa.png'),
  ('Costa Rica',          'https://flagcdn.com/w80/cr.png'),
  ('Honduras',            'https://flagcdn.com/w80/hn.png'),
  ('Jamaica',             'https://flagcdn.com/w80/jm.png'),

  -- UEFA (16)
  ('Germany',             'https://flagcdn.com/w80/de.png'),
  ('France',              'https://flagcdn.com/w80/fr.png'),
  ('England',             'https://flagcdn.com/w80/gb-eng.png'),
  ('Spain',               'https://flagcdn.com/w80/es.png'),
  ('Portugal',            'https://flagcdn.com/w80/pt.png'),
  ('Netherlands',         'https://flagcdn.com/w80/nl.png'),
  ('Italy',               'https://flagcdn.com/w80/it.png'),
  ('Belgium',             'https://flagcdn.com/w80/be.png'),
  ('Croatia',             'https://flagcdn.com/w80/hr.png'),
  ('Switzerland',         'https://flagcdn.com/w80/ch.png'),
  ('Denmark',             'https://flagcdn.com/w80/dk.png'),
  ('Austria',             'https://flagcdn.com/w80/at.png'),
  ('Serbia',              'https://flagcdn.com/w80/rs.png'),
  ('Hungary',             'https://flagcdn.com/w80/hu.png'),
  ('Scotland',            'https://flagcdn.com/w80/gb-sct.png'),
  ('Turkiye',             'https://flagcdn.com/w80/tr.png'),
  ('Romania',             'https://flagcdn.com/w80/ro.png'),
  ('Slovenia',            'https://flagcdn.com/w80/si.png'),

  -- CAF (9 + 0.5)
  ('Morocco',             'https://flagcdn.com/w80/ma.png'),
  ('Senegal',             'https://flagcdn.com/w80/sn.png'),
  ('Egypt',               'https://flagcdn.com/w80/eg.png'),
  ('Nigeria',             'https://flagcdn.com/w80/ng.png'),
  ('Ivory Coast',         'https://flagcdn.com/w80/ci.png'),
  ('Cameroon',            'https://flagcdn.com/w80/cm.png'),
  ('Tunisia',             'https://flagcdn.com/w80/tn.png'),
  ('South Africa',        'https://flagcdn.com/w80/za.png'),
  ('Mali',                'https://flagcdn.com/w80/ml.png'),
  ('Algeria',             'https://flagcdn.com/w80/dz.png'),

  -- AFC (8 + 0.5)
  ('Japan',               'https://flagcdn.com/w80/jp.png'),
  ('South Korea',         'https://flagcdn.com/w80/kr.png'),
  ('Iran',                'https://flagcdn.com/w80/ir.png'),
  ('Australia',           'https://flagcdn.com/w80/au.png'),
  ('Saudi Arabia',        'https://flagcdn.com/w80/sa.png'),
  ('Iraq',                'https://flagcdn.com/w80/iq.png'),
  ('Jordan',              'https://flagcdn.com/w80/jo.png'),
  ('Uzbekistan',          'https://flagcdn.com/w80/uz.png'),

  -- OFC (1)
  ('New Zealand',         'https://flagcdn.com/w80/nz.png'),

  -- Additional qualified teams
  ('Peru',                'https://flagcdn.com/w80/pe.png'),
  ('Scotland',            'https://flagcdn.com/w80/gb-sct.png')
ON CONFLICT (name) DO NOTHING;
