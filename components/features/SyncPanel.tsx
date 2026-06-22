'use client'

import { useState } from 'react'
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

export default function SyncPanel({ recentRuns }: { recentRuns: SyncLog[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [latestResult, setLatestResult] = useState<SyncResult | null>(null)

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

  const lastRun = recentRuns[0]

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
      {lastRun && (
        <div className="rounded-lg border border-border p-4 space-y-1 text-sm">
          <p className="font-medium">Last sync</p>
          <p className="text-muted-foreground">
            {new Intl.DateTimeFormat('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
              timeZone: 'UTC',
            }).format(new Date(lastRun.run_at))}{' '}
            UTC
          </p>
          {lastRun.error ? (
            <p className="text-destructive">{lastRun.error}</p>
          ) : (
            <p className="text-muted-foreground">
              {lastRun.kickoff_updates} kickoff updates · {lastRun.results_loaded} results loaded ·{' '}
              {lastRun.matches_created} matches created
            </p>
          )}
        </div>
      )}

      {/* Recent run log */}
      {recentRuns.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Recent runs
          </h2>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Time (UTC)</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Kickoff</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Results</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Created</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-muted/20">
                    <td className="px-4 py-2 text-muted-foreground">
                      {new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'UTC',
                      }).format(new Date(run.run_at))}
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
        </section>
      )}

      {recentRuns.length === 0 && (
        <p className="text-muted-foreground text-sm">No sync runs recorded yet.</p>
      )}
    </div>
  )
}
