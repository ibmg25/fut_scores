'use client'

import { useActionState, useState, useEffect, useRef } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import { updateKickoffTimeAction } from './actions'

interface Props {
  matchId: string
  kickoffTime: string
}

function toDatetimeLocal(isoString: string): string {
  const d = new Date(isoString)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const initialState = { error: null as string | null, success: false }

export default function EditKickoffForm({ matchId, kickoffTime }: Props) {
  const [open, setOpen] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)
  const [state, formAction, pending] = useActionState(updateKickoffTimeAction, initialState)
  const localInputRef = useRef<HTMLInputElement>(null)
  const hiddenUtcRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state.success) {
      setOpen(false)
      setSavedMsg(true)
      const t = setTimeout(() => setSavedMsg(false), 2000)
      return () => clearTimeout(t)
    }
  }, [state.success])

  function handleSubmit() {
    const localVal = localInputRef.current?.value
    if (localVal && hiddenUtcRef.current) {
      hiddenUtcRef.current.value = new Date(localVal).toISOString()
    }
  }

  if (!open) {
    return (
      <span className="flex items-center gap-1">
        {savedMsg && <span className="text-xs text-primary">Saved!</span>}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Edit kickoff time"
        >
          <Pencil className="w-3 h-3" />
        </button>
      </span>
    )
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="flex items-center gap-1">
      <input type="hidden" name="matchId" value={matchId} />
      <input type="hidden" name="kickoffTime" ref={hiddenUtcRef} />
      <input
        ref={localInputRef}
        type="datetime-local"
        defaultValue={toDatetimeLocal(kickoffTime)}
        className="text-xs h-6 px-1 rounded border border-input bg-background"
        required
      />
      <button
        type="submit"
        disabled={pending}
        className="text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
        aria-label="Save kickoff time"
      >
        <Check className="w-3 h-3" />
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Cancel"
      >
        <X className="w-3 h-3" />
      </button>
      {state.error && <span className="text-xs text-destructive">{state.error}</span>}
    </form>
  )
}
