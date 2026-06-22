-- Populate teams.external_id with football-data.org numeric IDs.
-- Hardcoded values derived from GET /v4/competitions/WC/teams?season=2026.
-- Several API names differ from DB names (noted inline).
UPDATE teams SET external_id = 769  WHERE name = 'Mexico';
UPDATE teams SET external_id = 774  WHERE name = 'South Africa';
UPDATE teams SET external_id = 772  WHERE name = 'South Korea';
UPDATE teams SET external_id = 798  WHERE name = 'Czech Republic';   -- API: "Czechia"
UPDATE teams SET external_id = 828  WHERE name = 'Canada';
UPDATE teams SET external_id = 1060 WHERE name = 'Bosnia and Herzegovina'; -- API: "Bosnia-Herzegovina"
UPDATE teams SET external_id = 8030 WHERE name = 'Qatar';
UPDATE teams SET external_id = 788  WHERE name = 'Switzerland';
UPDATE teams SET external_id = 764  WHERE name = 'Brazil';
UPDATE teams SET external_id = 815  WHERE name = 'Morocco';
UPDATE teams SET external_id = 836  WHERE name = 'Haiti';
UPDATE teams SET external_id = 8873 WHERE name = 'Scotland';
UPDATE teams SET external_id = 771  WHERE name = 'United States';
UPDATE teams SET external_id = 761  WHERE name = 'Paraguay';
UPDATE teams SET external_id = 779  WHERE name = 'Australia';
UPDATE teams SET external_id = 803  WHERE name = 'Turkiye';          -- API: "Turkey"
UPDATE teams SET external_id = 759  WHERE name = 'Germany';
UPDATE teams SET external_id = 9460 WHERE name = 'Curacao';          -- API: "Curaçao"
UPDATE teams SET external_id = 1935 WHERE name = 'Ivory Coast';
UPDATE teams SET external_id = 791  WHERE name = 'Ecuador';
UPDATE teams SET external_id = 8601 WHERE name = 'Netherlands';
UPDATE teams SET external_id = 766  WHERE name = 'Japan';
UPDATE teams SET external_id = 792  WHERE name = 'Sweden';
UPDATE teams SET external_id = 802  WHERE name = 'Tunisia';
UPDATE teams SET external_id = 805  WHERE name = 'Belgium';
UPDATE teams SET external_id = 825  WHERE name = 'Egypt';
UPDATE teams SET external_id = 840  WHERE name = 'Iran';
UPDATE teams SET external_id = 783  WHERE name = 'New Zealand';
UPDATE teams SET external_id = 760  WHERE name = 'Spain';
UPDATE teams SET external_id = 1930 WHERE name = 'Cape Verde';       -- API: "Cape Verde Islands"
UPDATE teams SET external_id = 801  WHERE name = 'Saudi Arabia';
UPDATE teams SET external_id = 758  WHERE name = 'Uruguay';
UPDATE teams SET external_id = 773  WHERE name = 'France';
UPDATE teams SET external_id = 804  WHERE name = 'Senegal';
UPDATE teams SET external_id = 8062 WHERE name = 'Iraq';
UPDATE teams SET external_id = 8872 WHERE name = 'Norway';
UPDATE teams SET external_id = 762  WHERE name = 'Argentina';
UPDATE teams SET external_id = 778  WHERE name = 'Algeria';
UPDATE teams SET external_id = 816  WHERE name = 'Austria';
UPDATE teams SET external_id = 8049 WHERE name = 'Jordan';
UPDATE teams SET external_id = 765  WHERE name = 'Portugal';
UPDATE teams SET external_id = 1934 WHERE name = 'DR Congo';         -- API: "Congo DR"
UPDATE teams SET external_id = 8070 WHERE name = 'Uzbekistan';
UPDATE teams SET external_id = 818  WHERE name = 'Colombia';
UPDATE teams SET external_id = 770  WHERE name = 'England';
UPDATE teams SET external_id = 799  WHERE name = 'Croatia';
UPDATE teams SET external_id = 763  WHERE name = 'Ghana';
UPDATE teams SET external_id = 1836 WHERE name = 'Panama';
