'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Passwords do not match.',
  path: ['confirm'],
})

export async function changePasswordAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const parsed = schema.safeParse({
    password: formData.get('password'),
    confirm: formData.get('confirm'),
  })

  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return { error: issue?.message ?? 'Invalid input.' }
  }

  const supabase = await createClient()

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (updateError) {
    return { error: updateError.message }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase
      .from('users_profiles')
      .update({ must_change_password: false })
      .eq('id', user.id)
  }

  redirect('/matches')
}
