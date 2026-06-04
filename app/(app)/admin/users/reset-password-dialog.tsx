'use client'

import { useActionState, useState } from 'react'
import { resetPasswordAction } from './actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const initialState = { error: null, tempPassword: null }

function ResetForm({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initialState)

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="userId" value={userId} />
      {state.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}
      {state.tempPassword ? (
        <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-3 space-y-1">
          <p className="text-sm font-medium text-yellow-400">Password reset!</p>
          <p className="text-xs text-muted-foreground">
            Share this temporary password with the user (shown once):
          </p>
          <code className="block text-sm font-mono bg-secondary rounded px-2 py-1 text-foreground select-all">
            {state.tempPassword}
          </code>
        </div>
      ) : (
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Resetting…' : 'Confirm Reset'}
        </Button>
      )}
    </form>
  )
}

export default function ResetPasswordDialog({
  userId,
  userName,
}: {
  userId: string
  userName: string
}) {
  const [open, setOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) setFormKey((k) => k + 1)
    setOpen(isOpen)
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Reset Password
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset password</DialogTitle>
            <DialogDescription>
              A new temporary password will be generated for {userName}. They will be required to change it on next login.
            </DialogDescription>
          </DialogHeader>
          <ResetForm key={formKey} userId={userId} />
        </DialogContent>
      </Dialog>
    </>
  )
}
