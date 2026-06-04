'use client'

import { useActionState } from 'react'
import { removeMemberAction } from '../actions'
import { Button } from '@/components/ui/button'

const initialState = { error: null }

export default function RemoveMemberForm({
  groupId,
  userId,
}: {
  groupId: string
  userId: string
}) {
  const [state, action, pending] = useActionState(removeMemberAction, initialState)

  return (
    <form action={action}>
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="userId" value={userId} />
      {state.error && (
        <p className="text-xs text-red-500 mb-1">{state.error}</p>
      )}
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={pending}
        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
      >
        {pending ? 'Removing…' : 'Remove'}
      </Button>
    </form>
  )
}
