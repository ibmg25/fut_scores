import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { syncWcMatches } from '@/lib/sync/sync-wc-matches'

// POST /api/sync/matches
// Accepts: Bearer <SYNC_SECRET> (GitHub Actions) OR an authenticated admin session (browser).
export async function POST(request: NextRequest) {
  const authError = await authorizeRequest(request)
  if (authError) return authError

  const adminClient = createAdminClient()
  let result: Awaited<ReturnType<typeof syncWcMatches>> | undefined
  let errorMessage: string | undefined

  try {
    result = await syncWcMatches()
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : String(err)
  }

  const logRow = {
    run_at: new Date().toISOString(),
    kickoff_updates: result?.kickoffUpdates ?? 0,
    results_loaded: result?.resultsLoaded ?? 0,
    matches_created: result?.matchesCreated ?? 0,
    error: errorMessage ?? null,
    details: result?.details ?? null,
  }

  await adminClient.from('sync_log').insert(logRow)

  if (errorMessage) {
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }

  return NextResponse.json({
    kickoffUpdates: result!.kickoffUpdates,
    resultsLoaded: result!.resultsLoaded,
    matchesCreated: result!.matchesCreated,
    runAt: logRow.run_at,
  })
}

// GET /api/sync/matches
// Returns the last 10 sync_log rows. Requires an authenticated admin session.
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: logs } = await supabase
    .from('sync_log')
    .select('*')
    .order('run_at', { ascending: false })
    .limit(10)

  return NextResponse.json(logs ?? [])
}

// Validates the request: Bearer token (GitHub Actions) OR admin Supabase session.
async function authorizeRequest(request: NextRequest): Promise<NextResponse | null> {
  const authHeader = request.headers.get('Authorization')

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const secret = process.env.SYNC_SECRET
    if (!secret) return NextResponse.json({ error: 'SYNC_SECRET not configured' }, { status: 500 })
    if (token !== secret) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return null
  }

  // Fall back to Supabase session auth (admin UI "Run sync now" button).
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return null
}
