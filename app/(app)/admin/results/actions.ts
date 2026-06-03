'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  matchId: z.string().uuid(),
  homeScore: z.coerce.number().int().min(0),
  awayScore: z.coerce.number().int().min(0),
  penaltyWinnerId: z.string().uuid().optional().nullable(),
})

export async function finalizeMatchAction(
  _prevState: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const penaltyRaw = formData.get('penaltyWinnerId')
  const parsed = schema.safeParse({
    matchId: formData.get('matchId'),
    homeScore: formData.get('homeScore'),
    awayScore: formData.get('awayScore'),
    penaltyWinnerId: penaltyRaw && penaltyRaw !== '' ? penaltyRaw : null,
  })

  if (!parsed.success) {
    return { error: 'Invalid input.', success: false }
  }

  const supabase = await createClient()
  const { error, data } = await supabase.rpc('finalize_match', {
    p_match_id: parsed.data.matchId,
    p_home: parsed.data.homeScore,
    p_away: parsed.data.awayScore,
    p_penalty_winner: parsed.data.penaltyWinnerId ?? null,
  })

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/leaderboard')
  revalidatePath('/matches')
  revalidatePath('/admin/results')

  return { error: null, success: true }
}
