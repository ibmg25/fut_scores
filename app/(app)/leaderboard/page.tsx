import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PodiumSection from '@/components/features/PodiumSection'
import RankingList from '@/components/features/RankingList'
import GroupSelector from '@/components/features/GroupSelector'
import { computeCompetitionRanks } from '@/lib/scoring/compute-ranks'

export default async function LeaderboardPage(props: {
  searchParams: Promise<{ group?: string }>
}) {
  const { group } = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdminOrAbove = profile?.role === 'superadmin' || profile?.role === 'admin'

  // Fetch the user's group memberships
  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)

  const groupIds = (memberships ?? []).map((m) => m.group_id)

  let userGroups: { id: string; name: string }[] = []
  if (groupIds.length > 0) {
    const { data } = await supabase
      .from('groups')
      .select('id, name')
      .in('id', groupIds)
      .order('name', { ascending: true })
    userGroups = data ?? []
  }

  // Non-admin with no groups: nothing to show
  if (!isAdminOrAbove && userGroups.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <span className="text-5xl">🏆</span>
          <p className="text-lg font-semibold">No group yet.</p>
          <p className="text-sm text-muted-foreground">Ask the admin to add you to a group.</p>
        </div>
      </div>
    )
  }

  // Validate the selected group belongs to this user
  const selectedGroupId = group && userGroups.some((g) => g.id === group) ? group : null

  // Non-admins fall back to their first group when no valid group param is present
  const effectiveGroupId = selectedGroupId ?? (isAdminOrAbove ? null : (userGroups[0]?.id ?? null))

  // Fetch leaderboard data: group-specific or global
  const profilesQuery = effectiveGroupId
    ? supabase
        .from('v_group_leaderboard')
        .select('id, display_name, total_points, exact_results_count')
        .eq('group_id', effectiveGroupId)
        .order('total_points', { ascending: false })
        .order('exact_results_count', { ascending: false })
        .order('display_name', { ascending: true })
    : supabase
        .from('v_leaderboard')
        .select('id, display_name, total_points, exact_results_count')
        .order('total_points', { ascending: false })
        .order('exact_results_count', { ascending: false })
        .order('display_name', { ascending: true })

  const { data: profiles } = await profilesQuery

  if (!profiles || profiles.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
        <GroupSelector groups={userGroups} selectedGroupId={effectiveGroupId} showAllPlayers={isAdminOrAbove} />
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <span className="text-5xl">🏆</span>
          <p className="text-lg font-semibold">No participants yet.</p>
          <p className="text-sm text-muted-foreground">Check back once players have joined.</p>
        </div>
      </div>
    )
  }

  const rankedProfiles = computeCompetitionRanks(profiles)
  const anyoneHasScored = rankedProfiles[0].total_points > 0

  const top3 = rankedProfiles.slice(0, 3)
  const rest = anyoneHasScored ? rankedProfiles.slice(3) : rankedProfiles
  const currentUserInTop3 = anyoneHasScored && top3.some((p) => p.id === user.id)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
      <GroupSelector groups={userGroups} selectedGroupId={effectiveGroupId} showAllPlayers={isAdminOrAbove} />
      {anyoneHasScored && <PodiumSection top3={top3} />}
      <RankingList
        entries={rest}
        currentUserId={user.id}
        currentUserInTop3={currentUserInTop3}
      />
    </div>
  )
}
