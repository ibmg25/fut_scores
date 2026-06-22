import { requireSuperadmin } from '@/lib/auth/get-user-profile'
import { createClient } from '@/lib/supabase/server'
import SyncPanel from '@/components/features/SyncPanel'
import type { SyncLog } from '@/lib/supabase/types'

export default async function AdminSyncPage() {
  await requireSuperadmin()
  const supabase = await createClient()

  const { data: runs } = await supabase
    .from('sync_log')
    .select('*')
    .order('run_at', { ascending: false })
    .limit(10)

  return <SyncPanel recentRuns={(runs ?? []) as SyncLog[]} />
}
