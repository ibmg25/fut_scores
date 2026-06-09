'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  matchId: z.string().uuid(),
  homeScore: z.coerce.number().int().min(0).max(99),
  awayScore: z.coerce.number().int().min(0).max(99),
  penaltyWinnerId: z.preprocess(
    v => (!v ? null : v),
    z.string().uuid().nullable().optional()
  ),
})

export async function upsertPrediction(
  _prevState: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const parsed = schema.safeParse({
    matchId: formData.get('matchId'),
    homeScore: formData.get('homeScore'),
    awayScore: formData.get('awayScore'),
    penaltyWinnerId: formData.get('penaltyWinnerId'),
  })

  if (!parsed.success) {
    return { error: 'Invalid scores.', success: false }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.', success: false }

  // Null out the pick if scores are not equal.
  let penaltyWinnerId = parsed.data.penaltyWinnerId ?? null
  if (parsed.data.homeScore !== parsed.data.awayScore) {
    penaltyWinnerId = null
  }

  // If a pick is present, validate the match is knockout and the team is valid.
  if (penaltyWinnerId !== null) {
    const { data: matchRow } = await supabase
      .from('matches')
      .select('is_knockout, home_team_id, away_team_id')
      .eq('id', parsed.data.matchId)
      .single()

    const isValidTeam = matchRow &&
      (penaltyWinnerId === matchRow.home_team_id || penaltyWinnerId === matchRow.away_team_id)

    if (!matchRow?.is_knockout || !isValidTeam) penaltyWinnerId = null
  }

  const { error } = await supabase.from('predictions').upsert(
    {
      user_id: user.id,
      match_id: parsed.data.matchId,
      predicted_home_score: parsed.data.homeScore,
      predicted_away_score: parsed.data.awayScore,
      predicted_penalty_winner_team_id: penaltyWinnerId,
    },
    { onConflict: 'user_id,match_id' }
  )

  if (error) {
    if (error.message.includes('locked') || error.message.includes('kickoff')) {
      return { error: 'Predictions are locked for this match.', success: false }
    }
    return { error: error.message, success: false }
  }

  revalidatePath('/matches')
  return { error: null, success: true }
}
