'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { randomBytes } from 'crypto'

const schema = z.object({
  email: z.string().email(),
  displayName: z.string().min(2).max(50).trim(),
})

function generateTempPassword(): string {
  return randomBytes(12).toString('base64url').slice(0, 16)
}

export async function createUserAction(
  _prevState: { error: string | null; tempPassword: string | null },
  formData: FormData
): Promise<{ error: string | null; tempPassword: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.', tempPassword: null }

  const { data: profile } = await supabase
    .from('users_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'superadmin') {
    return { error: 'Permission denied.', tempPassword: null }
  }

  const parsed = schema.safeParse({
    email: formData.get('email'),
    displayName: formData.get('displayName'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.', tempPassword: null }
  }

  const tempPassword = generateTempPassword()
  const adminClient = createAdminClient()

  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email: parsed.data.email,
    password: tempPassword,
    email_confirm: true,
  })

  if (createError) {
    return { error: createError.message, tempPassword: null }
  }

  const { error: profileError } = await adminClient
    .from('users_profiles')
    .insert({
      id: newUser.user.id,
      display_name: parsed.data.displayName,
      role: 'user',
      must_change_password: true,
    })

  if (profileError) {
    // Rollback user creation
    await adminClient.auth.admin.deleteUser(newUser.user.id)
    return { error: profileError.message, tempPassword: null }
  }

  revalidatePath('/admin/users')
  return { error: null, tempPassword }
}
