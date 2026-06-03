'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  matchId: z.string().uuid(),
  homeScore: z.coerce.number().int().min(0),
  awayScore: z.coerce.number().int().min(0),
})

export async function upsertPrediction(
  _prevState: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const parsed = schema.safeParse({
    matchId: formData.get('matchId'),
    homeScore: formData.get('homeScore'),
    awayScore: formData.get('awayScore'),
  })

  if (!parsed.success) {
    return { error: 'Invalid scores.', success: false }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.', success: false }

  const { error } = await supabase.from('predictions').upsert(
    {
      user_id: user.id,
      match_id: parsed.data.matchId,
      predicted_home_score: parsed.data.homeScore,
      predicted_away_score: parsed.data.awayScore,
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
