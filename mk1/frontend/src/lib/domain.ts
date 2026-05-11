export const agentRoleOptions = ['lead', 'architect', 'builder', 'reviewer', 'operations'] as const
export const agentStatusOptions = ['draft', 'active', 'paused', 'archived'] as const
export const modelProviderOptions = ['ollama', 'github-copilot', 'google-gemma', 'generic-cloud'] as const
export const modelDeploymentOptions = ['local', 'cloud'] as const
export const modelStatusOptions = ['ready', 'validating', 'degraded', 'offline'] as const
export const modelCapabilityOptions = ['chat', 'reasoning', 'code', 'vision'] as const
export const modelConnectionModeOptions = ['mock', 'browser-direct', 'backend-proxy'] as const
export const modelAuthTypeOptions = ['none', 'api-key', 'oauth', 'connector'] as const
export const teamStatusOptions = ['forming', 'aligned', 'running', 'blocked'] as const
export const discussionStageOptions = ['planning', 'debate', 'review', 'conclusion'] as const

export type AgentRole = (typeof agentRoleOptions)[number]
export type AgentStatus = (typeof agentStatusOptions)[number]
export type ModelProvider = (typeof modelProviderOptions)[number]
export type ModelDeployment = (typeof modelDeploymentOptions)[number]
export type ModelStatus = (typeof modelStatusOptions)[number]
export type ModelCapability = (typeof modelCapabilityOptions)[number]
export type ModelConnectionMode = (typeof modelConnectionModeOptions)[number]
export type ModelAuthType = (typeof modelAuthTypeOptions)[number]
export type TeamStatus = (typeof teamStatusOptions)[number]
export type DiscussionStage = (typeof discussionStageOptions)[number]

export type Agent = {
  id: string
  name: string
  role: AgentRole
  modelId: string
  status: AgentStatus
  instructions: string
  systemPrompt: string
  humanCheckpoint: boolean
  updatedAt: string
}

export type ModelProfile = {
  id: string
  name: string
  provider: ModelProvider
  deployment: ModelDeployment
  connectionMode: ModelConnectionMode
  authType: ModelAuthType
  modelSlug: string
  endpoint: string
  credentialHint: string
  organization: string
  projectId: string
  region: string
  status: ModelStatus
  capabilities: ModelCapability[]
  description: string
  updatedAt: string
}

export type Team = {
  id: string
  name: string
  leadAgentId: string
  memberAgentIds: string[]
  objective: string
  status: TeamStatus
  updatedAt: string
}

export type DiscussionMessage = {
  id: string
  speaker: string
  role: 'system' | 'agent' | 'human'
  body: string
}

export type TeamDiscussion = {
  id: string
  teamId: string
  target: 'team' | 'agent'
  targetAgentId?: string
  prompt: string
  stage: DiscussionStage
  status: 'running' | 'complete'
  messages: DiscussionMessage[]
  conclusion: string
  updatedAt: string
}

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export type ValidationIssue = {
  field: string
  message: string
}

export type ApiSuccess<T> = {
  data: T
}

export type ApiFailure = {
  error: {
    code: string
    message: string
    detail?: string
    retryable?: boolean
    issues?: ValidationIssue[]
  }
}