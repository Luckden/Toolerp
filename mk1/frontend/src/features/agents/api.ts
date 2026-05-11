import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRoutes } from '../../lib/api/contracts'
import { request } from '../../lib/api/client'
import type { Agent } from '../../lib/domain'

const queryKey = ['agents']

export function useAgentsQuery() {
  return useQuery({
    queryKey,
    queryFn: () => request<Agent[]>(apiRoutes.agents),
  })
}

export function useAgentMutations() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (payload: Omit<Agent, 'id' | 'updatedAt'>) =>
      request<Agent>(apiRoutes.agents, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Omit<Agent, 'id' | 'updatedAt'> }) =>
      request<Agent>(apiRoutes.agent(id), {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      request<{ id: string }>(apiRoutes.agent(id), {
        method: 'DELETE',
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  return { createMutation, updateMutation, deleteMutation }
}