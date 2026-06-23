import { requireSuperadmin } from '@/lib/auth/get-user-profile'
import { createClient } from '@/lib/supabase/server'
import SyncPanel from '@/components/features/SyncPanel'
import type { SyncLog } from '@/lib/supabase/types'

export default async function AdminSyncPage() {
  await requireSuperadmin()
  const supabase = await createClient()

  // Most recent successful run — no time window, drives the "Last sync" header card
  const { data: lastRunRows } = await supabase
    .from('sync_log')
    .select('*')
    .is('error', null)
    .order('run_at', { ascending: false })
    .limit(1)
  const lastSuccessfulRun = (lastRunRows?.[0] ?? null) as SyncLog | null

  // Last 10 runs that produced at least one change — no time window
  const { data: relevantRows } = await supabase
    .from('sync_log')
    .select('*')
    .or('kickoff_updates.gt.0,results_loaded.gt.0,matches_created.gt.0')
    .order('run_at', { ascending: false })
    .limit(10)
  const relevantRuns = (relevantRows ?? []) as SyncLog[]

  return <SyncPanel lastSuccessfulRun={lastSuccessfulRun} relevantRuns={relevantRuns} />
}
