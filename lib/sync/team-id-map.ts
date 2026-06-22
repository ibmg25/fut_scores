// Maps DB team names → football-data.org numeric IDs.
// DB names differ from API names for some teams — this table is the authoritative mapping.
// Keys must match exactly what is in the teams.name column.
export const TEAM_EXTERNAL_IDS: Record<string, number> = {
  // Group A
  Mexico:                   769,
  'South Africa':            774,
  'South Korea':             772,
  'Czech Republic':          798,  // API name: "Czechia"
  // Group B
  Canada:                   828,
  'Bosnia and Herzegovina': 1060,  // API name: "Bosnia-Herzegovina"
  Qatar:                    8030,
  Switzerland:               788,
  // Group C
  Brazil:                    764,
  Morocco:                   815,
  Haiti:                     836,
  Scotland:                 8873,
  // Group D
  'United States':           771,
  Paraguay:                  761,
  Australia:                 779,
  Turkiye:                   803,  // API name: "Turkey"
  // Group E
  Germany:                   759,
  Curacao:                  9460,  // API name: "Curaçao"
  'Ivory Coast':            1935,
  Ecuador:                   791,
  // Group F
  Netherlands:              8601,
  Japan:                     766,
  Sweden:                    792,
  Tunisia:                   802,
  // Group G
  Belgium:                   805,
  Egypt:                     825,
  Iran:                      840,
  'New Zealand':             783,
  // Group H
  Spain:                     760,
  'Cape Verde':             1930,  // API name: "Cape Verde Islands"
  'Saudi Arabia':            801,
  Uruguay:                   758,
  // Group I
  France:                    773,
  Senegal:                   804,
  Iraq:                     8062,
  Norway:                   8872,
  // Group J
  Argentina:                 762,
  Algeria:                   778,
  Austria:                   816,
  Jordan:                   8049,
  // Group K
  Portugal:                  765,
  'DR Congo':               1934,  // API name: "Congo DR"
  Uzbekistan:               8070,
  Colombia:                  818,
  // Group L
  England:                   770,
  Croatia:                   799,
  Ghana:                     763,
  Panama:                   1836,
}
