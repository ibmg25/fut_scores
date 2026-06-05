'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { randomBytes } from 'crypto'

const changeRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['user', 'admin']),
})

export async function changeRoleAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { data: profile } = await supabase
    .from('users_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'superadmin') {
    return { error: 'Permission denied.' }
  }

  const parsed = changeRoleSchema.safeParse({
    userId: formData.get('userId'),
    role: formData.get('role'),
  })

  if (!parsed.success) {
    return { error: 'Invalid input.' }
  }

  if (parsed.data.userId === user.id) {
    return { error: 'Cannot change your own role.' }
  }

  const adminClient = createAdminClient()
  const { error: updateError } = await adminClient
    .from('users_profiles')
    .update({ role: parsed.data.role })
    .eq('id', parsed.data.userId)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath('/admin/users')
  return { error: null }
}

const schema = z.object({
  email: z.string().email(),
  displayName: z.string().min(2).max(50).trim(),
})

const resetSchema = z.object({
  userId: z.string().uuid(),
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

export async function resetPasswordAction(
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

  const parsed = resetSchema.safeParse({ userId: formData.get('userId') })
  if (!parsed.success) {
    return { error: 'Invalid user.', tempPassword: null }
  }

  if (parsed.data.userId === user.id) {
    return { error: 'Cannot reset your own password from here.', tempPassword: null }
  }

  const tempPassword = generateTempPassword()
  const adminClient = createAdminClient()

  const { error: updateError } = await adminClient.auth.admin.updateUserById(
    parsed.data.userId,
    { password: tempPassword }
  )

  if (updateError) {
    return { error: updateError.message, tempPassword: null }
  }

  await adminClient
    .from('users_profiles')
    .update({ must_change_password: true })
    .eq('id', parsed.data.userId)

  revalidatePath('/admin/users')
  return { error: null, tempPassword }
}
