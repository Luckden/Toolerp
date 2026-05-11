export const apiRoutes = {
  agents: '/api/agents',
  agent: (id: string) => `/api/agents/${id}`,
  models: '/api/models',
  model: (id: string) => `/api/models/${id}`,
  modelConnectionTest: (id: string) => `/api/models/${id}/test-connection`,
  modelChatTest: (id: string) => `/api/models/${id}/test-chat`,
  teams: '/api/teams',
  team: (id: string) => `/api/teams/${id}`,
  teamDiscussions: (id: string) => `/api/teams/${id}/discussions`,
  teamDiscussion: (teamId: string, discussionId: string) =>
    `/api/teams/${teamId}/discussions/${discussionId}`,
}