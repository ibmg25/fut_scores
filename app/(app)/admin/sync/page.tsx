import { requireSuperadmin } from '@/lib/auth/get-user-profile'
import { createClient } from '@/lib/supabase/server'
import SyncPanel from '@/components/features/SyncPanel'
import type { SyncLog } from '@/lib/supabase/types'

export default async function AdminSyncPage() {
  await requireSuperadmin()
  const supabase = await createClient()

  // eslint-disable-next-line react-hooks/purity -- Server Component; purity rule does not apply
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: runs } = await supabase
    .from('sync_log')
    .select('*')
    .gte('run_at', since)
    .order('run_at', { ascending: false })
    .limit(100)

  return <SyncPanel recentRuns={(runs ?? []) as SyncLog[]} />
}
