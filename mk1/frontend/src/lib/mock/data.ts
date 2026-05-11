import type {
  Agent,
  ModelProfile,
  Team,
  TeamDiscussion,
} from '../domain'

const now = () => new Date().toISOString()

const nextId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}`

let agents: Agent[] = [
  {
    id: 'agent_lead_orion',
    name: 'Orion Lead',
    role: 'lead',
    modelId: 'model_gpt_copilot',
    status: 'active',
    instructions: 'Drive architectural convergence and stop drift before implementation expands.',
    systemPrompt: 'Operate as a lead agent. Clarify tradeoffs and require reversible decisions.',
    humanCheckpoint: true,
    updatedAt: now(),
  },
  {
    id: 'agent_builder_lyra',
    name: 'Lyra Builder',
    role: 'builder',
    modelId: 'model_ollama_qwen',
    status: 'active',
    instructions: 'Translate decisions into implementation slices with explicit validation steps.',
    systemPrompt: 'Operate as an implementation-focused coding agent.',
    humanCheckpoint: false,
    updatedAt: now(),
  },
  {
    id: 'agent_review_sable',
    name: 'Sable Review',
    role: 'reviewer',
    modelId: 'model_gemma_cloud',
    status: 'paused',
    instructions: 'Review interaction design, risk surfaces, and test coverage before release.',
    systemPrompt: 'Operate as a review agent with strong quality gates.',
    humanCheckpoint: true,
    updatedAt: now(),
  },
]

let models: ModelProfile[] = [
  {
    id: 'model_gpt_copilot',
    name: 'GitHub Copilot GPT-5.4',
    provider: 'github-copilot',
    deployment: 'cloud',
    connectionMode: 'backend-proxy',
    authType: 'connector',
    modelSlug: 'gpt-5.4',
    endpoint: 'https://api.githubcopilot.test/models/gpt-5.4',
    credentialHint: 'github-models-prod',
    organization: 'toolerp',
    projectId: '',
    region: '',
    status: 'ready',
    capabilities: ['chat', 'reasoning', 'code'],
    description: 'Primary cloud reasoning model for architecture and implementation support.',
    updatedAt: now(),
  },
  {
    id: 'model_ollama_qwen',
    name: 'Ollama Qwen 3 Coder',
    provider: 'ollama',
    deployment: 'local',
    connectionMode: 'browser-direct',
    authType: 'none',
    modelSlug: 'qwen3-coder:14b',
    endpoint: 'http://localhost:11434',
    credentialHint: '',
    organization: '',
    projectId: '',
    region: '',
    status: 'ready',
    capabilities: ['chat', 'code'],
    description: 'Local coding model for fast desktop iteration.',
    updatedAt: now(),
  },
  {
    id: 'model_gemma_cloud',
    name: 'Gemma 3 Team Analyst',
    provider: 'google-gemma',
    deployment: 'cloud',
    connectionMode: 'backend-proxy',
    authType: 'api-key',
    modelSlug: 'gemma-3-27b-it',
    endpoint: 'https://api.google.test/gemma/v1',
    credentialHint: 'GOOGLE_API_KEY',
    organization: '',
    projectId: 'toolerp-sandbox',
    region: 'us-central1',
    status: 'validating',
    capabilities: ['chat', 'reasoning'],
    description: 'Cloud analysis model for review, reasoning, and synthesis.',
    updatedAt: now(),
  },
]

let teams: Team[] = [
  {
    id: 'team_delivery_foundation',
    name: 'Delivery Foundation',
    leadAgentId: 'agent_lead_orion',
    memberAgentIds: ['agent_builder_lyra', 'agent_review_sable'],
    objective: 'Converge on a coherent frontend platform and keep human review explicit.',
    status: 'aligned',
    updatedAt: now(),
  },
]

let discussions: TeamDiscussion[] = []

export type AgentInput = Omit<Agent, 'id' | 'updatedAt'>
export type ModelInput = Omit<ModelProfile, 'id' | 'updatedAt'>
export type TeamInput = Omit<Team, 'id' | 'updatedAt'>

export const db = {
  listAgents: () => [...agents].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  getAgent: (id: string) => agents.find((agent) => agent.id === id) ?? null,
  createAgent(input: AgentInput) {
    const agent: Agent = { ...input, id: nextId('agent'), updatedAt: now() }
    agents = [agent, ...agents]
    return agent
  },
  updateAgent(id: string, input: Partial<AgentInput>) {
    const current = db.getAgent(id)
    if (!current) return null

    const updated: Agent = { ...current, ...input, updatedAt: now() }
    agents = agents.map((agent) => (agent.id === id ? updated : agent))
    return updated
  },
  deleteAgent(id: string) {
    const exists = agents.some((agent) => agent.id === id)
    agents = agents.filter((agent) => agent.id !== id)
    teams = teams.map((team) => ({
      ...team,
      memberAgentIds: team.memberAgentIds.filter((memberId) => memberId !== id),
      leadAgentId: team.leadAgentId === id ? '' : team.leadAgentId,
    }))
    return exists
  },
  listModels: () => [...models].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  getModel: (id: string) => models.find((model) => model.id === id) ?? null,
  createModel(input: ModelInput) {
    const model: ModelProfile = { ...input, id: nextId('model'), updatedAt: now() }
    models = [model, ...models]
    return model
  },
  updateModel(id: string, input: Partial<ModelInput>) {
    const current = db.getModel(id)
    if (!current) return null

    const updated: ModelProfile = { ...current, ...input, updatedAt: now() }
    models = models.map((model) => (model.id === id ? updated : model))
    return updated
  },
  deleteModel(id: string) {
    const exists = models.some((model) => model.id === id)
    models = models.filter((model) => model.id !== id)
    agents = agents.map((agent) => ({
      ...agent,
      modelId: agent.modelId === id ? '' : agent.modelId,
    }))
    return exists
  },
  listTeams: () => [...teams].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  getTeam: (id: string) => teams.find((team) => team.id === id) ?? null,
  createTeam(input: TeamInput) {
    const team: Team = { ...input, id: nextId('team'), updatedAt: now() }
    teams = [team, ...teams]
    return team
  },
  updateTeam(id: string, input: Partial<TeamInput>) {
    const current = db.getTeam(id)
    if (!current) return null

    const updated: Team = { ...current, ...input, updatedAt: now() }
    teams = teams.map((team) => (team.id === id ? updated : team))
    return updated
  },
  deleteTeam(id: string) {
    const exists = teams.some((team) => team.id === id)
    teams = teams.filter((team) => team.id !== id)
    discussions = discussions.filter((discussion) => discussion.teamId !== id)
    return exists
  },
  saveDiscussion(discussion: TeamDiscussion) {
    discussions = [discussion, ...discussions.filter((item) => item.id !== discussion.id)]
    return discussion
  },
  getDiscussion(teamId: string, discussionId: string) {
    return (
      discussions.find(
        (discussion) =>
          discussion.teamId === teamId && discussion.id === discussionId,
      ) ?? null
    )
  },
}