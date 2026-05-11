import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRoutes } from '../../lib/api/contracts'
import { request } from '../../lib/api/client'
import type { Team, TeamDiscussion } from '../../lib/domain'

const queryKey = ['teams']

export function useTeamsQuery() {
  return useQuery({
    queryKey,
    queryFn: () => request<Team[]>(apiRoutes.teams),
  })
}

export function useTeamMutations() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (payload: Omit<Team, 'id' | 'updatedAt'>) =>
      request<Team>(apiRoutes.teams, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Omit<Team, 'id' | 'updatedAt'> }) =>
      request<Team>(apiRoutes.team(id), {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      request<{ id: string }>(apiRoutes.team(id), {
        method: 'DELETE',
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const discussionMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: { prompt: string; target: 'team' | 'agent'; targetAgentId?: string }
    }) =>
      request<TeamDiscussion>(apiRoutes.teamDiscussions(id), {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  })

  return { createMutation, updateMutation, deleteMutation, discussionMutation }
}