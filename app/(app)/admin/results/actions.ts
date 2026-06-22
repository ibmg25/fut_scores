'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const kickoffSchema = z.object({
  matchId: z.string().uuid(),
  kickoffTime: z.string().datetime({ offset: true }),
})

export async function updateKickoffTimeAction(
  _: unknown,
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const parsed = kickoffSchema.safeParse({
    matchId: formData.get('matchId'),
    kickoffTime: formData.get('kickoffTime'),
  })
  if (!parsed.success) return { error: 'Invalid input.', success: false }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', success: false }

  const { data: profile } = await supabase
    .from('users_profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
    return { error: 'Unauthorized', success: false }
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('matches')
    .update({ kickoff_time: parsed.data.kickoffTime })
    .eq('id', parsed.data.matchId)

  if (error) return { error: error.message, success: false }

  revalidatePath('/admin/results')
  revalidatePath('/matches')
  return { error: null, success: true }
}

const schema = z.object({
  matchId: z.string().uuid(),
  homeScore: z.string().min(1).regex(/^\d{1,2}$/).transform(Number),
  awayScore: z.string().min(1).regex(/^\d{1,2}$/).transform(Number),
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
  const { error } = await supabase.rpc('finalize_match', {
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
