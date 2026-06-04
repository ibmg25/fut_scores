'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createGroupSchema = z.object({
  name: z.string().min(2).max(50).trim(),
})

const memberSchema = z.object({
  groupId: z.string().uuid(),
  userId: z.string().uuid(),
})

async function checkSuperadmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('users_profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'superadmin') return null
  return user
}

export async function createGroupAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const user = await checkSuperadmin()
  if (!user) return { error: 'Permission denied.' }

  const parsed = createGroupSchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('groups')
    .insert({ name: parsed.data.name, created_by: user.id })

  if (error) return { error: error.message }

  revalidatePath('/admin/groups')
  return { error: null }
}

export async function addMemberAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const user = await checkSuperadmin()
  if (!user) return { error: 'Permission denied.' }

  const parsed = memberSchema.safeParse({
    groupId: formData.get('groupId'),
    userId: formData.get('userId'),
  })
  if (!parsed.success) return { error: 'Invalid input.' }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('group_members')
    .insert({ group_id: parsed.data.groupId, user_id: parsed.data.userId })

  if (error) return { error: error.message }

  revalidatePath(`/admin/groups/${parsed.data.groupId}`)
  return { error: null }
}

export async function removeMemberAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const user = await checkSuperadmin()
  if (!user) return { error: 'Permission denied.' }

  const parsed = memberSchema.safeParse({
    groupId: formData.get('groupId'),
    userId: formData.get('userId'),
  })
  if (!parsed.success) return { error: 'Invalid input.' }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('group_members')
    .delete()
    .eq('group_id', parsed.data.groupId)
    .eq('user_id', parsed.data.userId)

  if (error) return { error: error.message }

  revalidatePath(`/admin/groups/${parsed.data.groupId}`)
  return { error: null }
}
