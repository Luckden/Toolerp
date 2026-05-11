import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRoutes } from '../../lib/api/contracts'
import { request } from '../../lib/api/client'
import type { ModelProfile } from '../../lib/domain'

const queryKey = ['models']

export function useModelsQuery() {
  return useQuery({
    queryKey,
    queryFn: () => request<ModelProfile[]>(apiRoutes.models),
  })
}

export function useModelMutations() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (payload: Omit<ModelProfile, 'id' | 'updatedAt'>) =>
      request<ModelProfile>(apiRoutes.models, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Omit<ModelProfile, 'id' | 'updatedAt'>
    }) =>
      request<ModelProfile>(apiRoutes.model(id), {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      request<{ id: string }>(apiRoutes.model(id), {
        method: 'DELETE',
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const testConnectionMutation = useMutation({
    mutationFn: (id: string) =>
      request<{ status: string; checkedAt: string }>(apiRoutes.modelConnectionTest(id), {
        method: 'POST',
      }),
  })

  const testChatMutation = useMutation({
    mutationFn: ({ id, prompt }: { id: string; prompt: string }) =>
      request<{ reply: string; checkedAt: string }>(apiRoutes.modelChatTest(id), {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      }),
  })

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    testConnectionMutation,
    testChatMutation,
  }
}