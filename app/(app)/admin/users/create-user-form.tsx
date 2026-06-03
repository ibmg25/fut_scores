'use client'

import { useActionState } from 'react'
import { createUserAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState = { error: null, tempPassword: null }

export default function CreateUserForm() {
  const [state, action, pending] = useActionState(createUserAction, initialState)

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          name="displayName"
          type="text"
          required
          minLength={2}
          maxLength={50}
          placeholder="John Doe"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="user@example.com"
        />
      </div>
      {state.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}
      {state.tempPassword && (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-3 space-y-1">
          <p className="text-sm font-medium text-amber-800">User created!</p>
          <p className="text-xs text-amber-700">
            Share this temporary password with the user (shown once):
          </p>
          <code className="block text-sm font-mono bg-amber-100 rounded px-2 py-1 text-amber-900 select-all">
            {state.tempPassword}
          </code>
        </div>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Creating…' : 'Create User'}
      </Button>
    </form>
  )
}
