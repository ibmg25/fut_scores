import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MatchCard from '@/components/features/MatchCard'
import type { MatchWithTeams, Prediction } from '@/lib/supabase/types'

const PAGE_SIZE = 15

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('id')
    .eq('is_active', true)
    .single()

  if (!tournament) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No active tournament found.
      </div>
    )
  }

  // eslint-disable-next-line react-hooks/purity -- Server Component; purity rule does not apply
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: rawMatches } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*),
      penalty_winner_team:teams!matches_penalty_winner_team_id_fkey(*)
    `)
    .eq('tournament_id', tournament.id)
    .or(`status.eq.pending,and(status.eq.finished,results_set_at.gt.${cutoff})`)
    .order('kickoff_time', { ascending: true })
    .range(offset, offset + PAGE_SIZE) // fetches PAGE_SIZE + 1 to detect next page

  const hasNextPage = (rawMatches?.length ?? 0) > PAGE_SIZE
  const matches = (rawMatches?.slice(0, PAGE_SIZE) ?? []) as MatchWithTeams[]

  let predictions: Prediction[] = []
  if (matches.length > 0) {
    const matchIds = matches.map(m => m.id)
    const { data } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id)
      .in('match_id', matchIds)
    predictions = (data ?? []) as Prediction[]
  }

  const predMap = new Map(predictions.map(p => [p.match_id, p]))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Home</h1>

      {matches.length === 0 ? (
        <p className="text-center py-20 text-muted-foreground">
          No upcoming matches right now.
        </p>
      ) : (
        <div className="space-y-3">
          {matches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              prediction={predMap.get(match.id)}
            />
          ))}
        </div>
      )}

      {(page > 1 || hasNextPage) && (
        <div className="flex items-center justify-between mt-6">
          {page > 1 ? (
            <Link
              href={`/home?page=${page - 1}`}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Link>
          ) : (
            <div />
          )}
          {hasNextPage && (
            <Link
              href={`/home?page=${page + 1}`}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors ml-auto"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
