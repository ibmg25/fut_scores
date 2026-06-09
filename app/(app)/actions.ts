'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  displayName: z.string().min(2).max(12).trim(),
})

export async function updateDisplayNameAction(
  _prev: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.', success: false }

  const parsed = schema.safeParse({ displayName: formData.get('displayName') })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input.', success: false }

  const { error } = await supabase
    .from('users_profiles')
    .update({ display_name: parsed.data.displayName })
    .eq('id', user.id)

  if (error) return { error: error.message, success: false }

  revalidatePath('/', 'layout')
  return { error: null, success: true }
}
