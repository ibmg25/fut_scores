const API_BASE = 'https://api.football-data.org/v4'

export interface ApiTeam {
  id: number | null
  name: string | null
  shortName: string | null
  tla: string | null
}

export interface ApiScore {
  winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null
  duration: 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT'
  fullTime: { home: number | null; away: number | null }
  halfTime: { home: number | null; away: number | null }
  regularTime: { home: number | null; away: number | null } | null
  extraTime: { home: number | null; away: number | null } | null
}

export interface ApiMatch {
  id: number
  utcDate: string
  status:
    | 'SCHEDULED'
    | 'TIMED'
    | 'IN_PLAY'
    | 'PAUSED'
    | 'FINISHED'
    | 'SUSPENDED'
    | 'POSTPONED'
    | 'CANCELLED'
    | 'AWARDED'
  stage: string
  group: string | null
  homeTeam: ApiTeam
  awayTeam: ApiTeam
  score: ApiScore
}

export async function fetchWcMatches(): Promise<ApiMatch[]> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY
  if (!apiKey) throw new Error('FOOTBALL_DATA_API_KEY is not set')

  const res = await fetch(`${API_BASE}/competitions/WC/matches?season=2026`, {
    headers: { 'X-Auth-Token': apiKey },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`football-data.org API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  return data.matches as ApiMatch[]
}
