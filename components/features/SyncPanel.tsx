'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { SyncLog } from '@/lib/supabase/types'

interface SyncResult {
  kickoffUpdates: number
  resultsLoaded: number
  matchesCreated: number
  runAt: string
}

function formatRunTime(isoString: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoString))
}

export default function SyncPanel({
  lastSuccessfulRun,
  relevantRuns,
}: {
  lastSuccessfulRun: SyncLog | null
  relevantRuns: SyncLog[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [latestResult, setLatestResult] = useState<SyncResult | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const localTime = (iso: string): string =>
    mounted ? formatRunTime(iso) : '—'

  async function handleRunSync() {
    setLoading(true)
    try {
      const res = await fetch('/api/sync/matches', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Sync failed')
      } else {
        setLatestResult(data as SyncResult)
        toast.success('Sync completed')
        router.refresh()
      }
    } catch {
      toast.error('Network error — sync could not be reached')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Trigger */}
      <div className="flex items-center gap-4">
        <Button onClick={handleRunSync} disabled={loading} size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Syncing…' : 'Run sync now'}
        </Button>
        {latestResult && (
          <span className="text-sm text-muted-foreground">
            +{latestResult.kickoffUpdates} kickoff updates · +{latestResult.resultsLoaded} results ·
            +{latestResult.matchesCreated} new matches
          </span>
        )}
      </div>

      {/* Last sync status */}
      <div className="rounded-lg border border-border p-4 space-y-1 text-sm">
        <p className="font-medium">Last sync</p>
        {lastSuccessfulRun ? (
          <>
            <p className="text-muted-foreground">{localTime(lastSuccessfulRun.run_at)}</p>
            <p className="text-muted-foreground">
              {lastSuccessfulRun.kickoff_updates} kickoff updates · {lastSuccessfulRun.results_loaded} results loaded ·{' '}
              {lastSuccessfulRun.matches_created} matches created
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">No sync has run yet.</p>
        )}
      </div>

      {/* Run log — last 10 syncs with changes */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Last 10 syncs with changes
        </h2>
        {relevantRuns.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {lastSuccessfulRun
              ? 'Sync is running correctly. No data changes have been recorded yet.'
              : 'No sync runs recorded yet.'}
          </p>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Time</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Kickoff</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Results</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Created</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {relevantRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-muted/20">
                    <td className="px-4 py-2 text-muted-foreground">
                      {localTime(run.run_at)}
                    </td>
                    <td className="px-4 py-2 text-right">{run.kickoff_updates}</td>
                    <td className="px-4 py-2 text-right">{run.results_loaded}</td>
                    <td className="px-4 py-2 text-right">{run.matches_created}</td>
                    <td className="px-4 py-2">
                      {run.error ? (
                        <span
                          className="text-destructive truncate max-w-[200px] block"
                          title={run.error}
                        >
                          {run.error}
                        </span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
