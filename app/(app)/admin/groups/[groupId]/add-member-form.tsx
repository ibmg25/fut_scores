'use client'

import { useActionState } from 'react'
import { addMemberAction } from '../actions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface Props {
  groupId: string
  availableUsers: { id: string; display_name: string }[]
}

const initialState = { error: null }

export default function AddMemberForm({ groupId, availableUsers }: Props) {
  const [state, action, pending] = useActionState(addMemberAction, initialState)

  if (availableUsers.length === 0) {
    return <p className="text-sm text-muted-foreground">All users are already members of this group.</p>
  }

  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <input type="hidden" name="groupId" value={groupId} />
      <div className="space-y-1.5 flex-1">
        <Label htmlFor="userId">User</Label>
        <select
          id="userId"
          name="userId"
          className="w-full h-9 rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {availableUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.display_name}
            </option>
          ))}
        </select>
      </div>
      {state.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? 'Adding…' : 'Add Member'}
      </Button>
    </form>
  )
}
