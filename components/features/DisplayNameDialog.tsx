'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateDisplayNameAction } from '@/app/(app)/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const initialState = { error: null as string | null, success: false }

function UpdateForm({
  currentName,
  onSuccess,
}: {
  currentName: string
  onSuccess: () => void
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState(updateDisplayNameAction, initialState)
  const [value, setValue] = useState(currentName)

  useEffect(() => {
    if (state.success) {
      toast.success('Display name updated!')
      router.refresh()
      onSuccess()
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state])

  const isDirty = value.trim() !== currentName

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          name="displayName"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={12}
          autoComplete="off"
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={!isDirty || pending}>
        {pending ? 'Updating…' : 'Update Display Name'}
      </Button>
    </form>
  )
}

export default function DisplayNameDialog({ displayName }: { displayName: string }) {
  const [open, setOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) setFormKey((k) => k + 1)
    setOpen(isOpen)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer md:text-sm"
      >
        {displayName}
      </button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change display name</DialogTitle>
            <DialogDescription>
              Update the name shown to other players.
            </DialogDescription>
          </DialogHeader>
          <UpdateForm key={formKey} currentName={displayName} onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
