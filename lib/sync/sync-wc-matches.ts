import { createAdminClient } from '@/lib/supabase/admin'
import { fetchWcMatches, type ApiMatch } from './football-data-client'
import type { MatchPhase } from '@/lib/supabase/types'

export interface SyncResult {
  kickoffUpdates: number
  resultsLoaded: number
  matchesCreated: number
}

interface PendingMatch {
  id: string
  external_id: number
  kickoff_time: string
  home_team_id: string
  away_team_id: string
  is_knockout: boolean
}

// Maps API stage + group values to DB match_phase enum values.
function apiStageToPhase(stage: string, group: string | null): MatchPhase | null {
  switch (stage) {
    case 'GROUP_STAGE':
      if (!group) return null
      return ('group_' + group.replace('GROUP_', '').toLowerCase()) as MatchPhase
    case 'LAST_32':
      return 'r32'
    case 'LAST_16':
      return 'r16'
    case 'QUARTER_FINALS':
      return 'qf'
    case 'SEMI_FINALS':
      return 'sf'
    case 'THIRD_PLACE':
      return 'third_place'
    case 'FINAL':
      return 'final'
    default:
      return null
  }
}

// Links DB matches (without external_id) to their API counterparts by matching
// home/away team external_ids. Runs every sync but is a no-op once all matches
// are linked.
async function bootstrapMatchExternalIds(
  adminClient: ReturnType<typeof createAdminClient>,
  apiMatches: ApiMatch[]
): Promise<void> {
  const { data: unlinked } = await adminClient
    .from('matches')
    .select(`
      id,
      home_team:teams!matches_home_team_id_fkey(external_id),
      away_team:teams!matches_away_team_id_fkey(external_id)
    `)
    .is('external_id', null)
    .eq('status', 'pending')

  if (!unlinked?.length) return

  const apiByTeams = new Map<string, ApiMatch>()
  for (const m of apiMatches) {
    if (m.homeTeam.id != null && m.awayTeam.id != null) {
      apiByTeams.set(`${m.homeTeam.id}:${m.awayTeam.id}`, m)
    }
  }

  const updates: { id: string; external_id: number }[] = []

  for (const dbMatch of unlinked) {
    const homeExt = (dbMatch.home_team as unknown as { external_id: number | null })?.external_id
    const awayExt = (dbMatch.away_team as unknown as { external_id: number | null })?.external_id
    if (homeExt == null || awayExt == null) continue

    const apiMatch = apiByTeams.get(`${homeExt}:${awayExt}`)
    if (!apiMatch) continue

    updates.push({ id: dbMatch.id, external_id: apiMatch.id })
  }

  if (updates.length > 0) {
    await Promise.all(
      updates.map(({ id, external_id }) =>
        adminClient.from('matches').update({ external_id }).eq('id', id)
      )
    )
  }
}

// Updates kickoff_time for pending linked matches where the API date differs.
async function syncKickoffTimes(
  adminClient: ReturnType<typeof createAdminClient>,
  apiMatches: ApiMatch[],
  pendingMatches: PendingMatch[]
): Promise<number> {
  if (!pendingMatches.length) return 0

  const apiById = new Map(apiMatches.map((m) => [m.id, m]))
  let count = 0

  for (const dbMatch of pendingMatches) {
    const apiMatch = apiById.get(dbMatch.external_id)
    if (!apiMatch) continue

    const apiDate = new Date(apiMatch.utcDate).toISOString()
    const dbDate = new Date(dbMatch.kickoff_time).toISOString()
    if (apiDate === dbDate) continue

    const { error } = await adminClient
      .from('matches')
      .update({ kickoff_time: apiDate })
      .eq('id', dbMatch.id)

    if (!error) count++
  }

  return count
}

// Calls finalize_match for pending linked matches that the API reports as FINISHED.
async function syncResults(
  adminClient: ReturnType<typeof createAdminClient>,
  apiMatches: ApiMatch[],
  pendingMatches: PendingMatch[]
): Promise<number> {
  if (!pendingMatches.length) return 0

  const apiById = new Map(apiMatches.map((m) => [m.id, m]))
  let count = 0

  for (const dbMatch of pendingMatches) {
    const apiMatch = apiById.get(dbMatch.external_id)
    if (!apiMatch || apiMatch.status !== 'FINISHED') continue

    // For EXTRA_TIME: fullTime holds 90-min goals only; add regularTime + extraTime
    // for the true final score. REGULAR and PENALTY_SHOOTOUT use fullTime directly.
    let homeScore: number
    let awayScore: number

    if (apiMatch.score.duration === 'EXTRA_TIME') {
      const rt = apiMatch.score.regularTime
      const et = apiMatch.score.extraTime
      if (rt?.home == null || rt?.away == null || et?.home == null || et?.away == null) continue
      homeScore = rt.home + et.home
      awayScore = rt.away + et.away
    } else {
      const ft = apiMatch.score.fullTime
      if (ft.home == null || ft.away == null) continue
      homeScore = ft.home
      awayScore = ft.away
    }

    let penaltyWinner: string | null = null
    if (apiMatch.score.duration === 'PENALTY_SHOOTOUT' && dbMatch.is_knockout) {
      const winner = apiMatch.score.winner
      if (winner === 'HOME_TEAM') penaltyWinner = dbMatch.home_team_id
      else if (winner === 'AWAY_TEAM') penaltyWinner = dbMatch.away_team_id
      else continue // winner null or 'DRAW' — API data not ready yet, skip
    }

    const { error } = await adminClient.rpc('finalize_match', {
      p_match_id: dbMatch.id,
      p_home: homeScore,
      p_away: awayScore,
      p_penalty_winner: penaltyWinner,
    })

    if (!error) count++
  }

  return count
}

// Creates DB rows for knockout matches whose teams are now confirmed in the API.
// Skips matches where either team is still TBD or that already exist by external_id.
async function syncKnockoutMatches(
  adminClient: ReturnType<typeof createAdminClient>,
  apiMatches: ApiMatch[]
): Promise<number> {
  const knockoutStages = new Set(['LAST_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL'])
  const knockoutApiMatches = apiMatches.filter(
    (m) => knockoutStages.has(m.stage) && m.homeTeam.id != null && m.awayTeam.id != null
  )
  if (!knockoutApiMatches.length) return 0

  const [{ data: existingExternalIds }, { data: activeTournament }, { data: teams }] =
    await Promise.all([
      adminClient.from('matches').select('external_id').not('external_id', 'is', null),
      adminClient.from('tournaments').select('id').eq('is_active', true).single(),
      adminClient.from('teams').select('id, external_id').not('external_id', 'is', null),
    ])

  if (!activeTournament) return 0

  const linkedExternalIds = new Set(existingExternalIds?.map((r) => r.external_id) ?? [])
  const teamByExternalId = new Map(
    (teams ?? []).map((t) => [t.external_id as number, t.id as string])
  )

  let count = 0

  for (const apiMatch of knockoutApiMatches) {
    if (linkedExternalIds.has(apiMatch.id)) continue

    const homeTeamId = teamByExternalId.get(apiMatch.homeTeam.id!)
    const awayTeamId = teamByExternalId.get(apiMatch.awayTeam.id!)
    if (!homeTeamId || !awayTeamId) continue

    const phase = apiStageToPhase(apiMatch.stage, apiMatch.group)
    if (!phase) continue

    const { error } = await adminClient.from('matches').insert({
      tournament_id: activeTournament.id,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      kickoff_time: new Date(apiMatch.utcDate).toISOString(),
      phase,
      is_knockout: true,
      external_id: apiMatch.id,
    })

    if (!error) count++
  }

  return count
}

// Main orchestrator: fetches all WC matches from the API and runs the four sync operations.
export async function syncWcMatches(): Promise<SyncResult> {
  const adminClient = createAdminClient()
  const apiMatches = await fetchWcMatches()

  await bootstrapMatchExternalIds(adminClient, apiMatches)

  // Single query shared by syncKickoffTimes and syncResults.
  const { data: rawPending } = await adminClient
    .from('matches')
    .select('id, external_id, kickoff_time, home_team_id, away_team_id, is_knockout')
    .not('external_id', 'is', null)
    .eq('status', 'pending')

  const pendingMatches = (rawPending ?? []) as PendingMatch[]

  const kickoffUpdates = await syncKickoffTimes(adminClient, apiMatches, pendingMatches)
  const resultsLoaded = await syncResults(adminClient, apiMatches, pendingMatches)
  const matchesCreated = await syncKnockoutMatches(adminClient, apiMatches)

  return { kickoffUpdates, resultsLoaded, matchesCreated }
}
