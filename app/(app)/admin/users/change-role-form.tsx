'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { changeRoleAction } from './actions'
import type { UserRole } from '@/lib/supabase/types'

export default function ChangeRoleForm({
  userId,
  currentRole,
}: {
  userId: string
  currentRole: Extract<UserRole, 'user' | 'admin'>
}) {
  const [selectedRole, setSelectedRole] = useState(currentRole)
  const [state, action, pending] = useActionState(changeRoleAction, { error: null })
  const isDirty = selectedRole !== currentRole

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value as typeof currentRole)}
        className="text-sm border border-border rounded px-2 py-1 bg-background"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      {isDirty && (
        <button
          type="submit"
          disabled={pending}
          className="text-xs text-primary hover:underline disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save'}
        </button>
      )}
      {state.error && (
        <span className="text-xs text-destructive">{state.error}</span>
      )}
    </form>
  )
}
