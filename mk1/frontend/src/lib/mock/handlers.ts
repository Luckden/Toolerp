import { delay, http, HttpResponse } from 'msw'
import { apiRoutes } from '../api/contracts'
import type { ApiFailure, TeamDiscussion, ValidationIssue } from '../domain'
import { db } from './data'

const withDelay = () => delay(250 + Math.floor(Math.random() * 250))

function success<T>(data: T, status = 200) {
  return HttpResponse.json({ data }, { status })
}

function failure(
  status: number,
  code: string,
  message: string,
  detail?: string,
  issues?: ValidationIssue[],
) {
  const payload: ApiFailure = {
    error: {
      code,
      message,
      detail,
      retryable: status >= 500,
      issues,
    },
  }

  return HttpResponse.json(payload, { status })
}

function parseId(url: string, marker: string) {
  const pathname = new URL(url).pathname
  const segments = pathname.split('/').filter(Boolean)
  return segments[segments.indexOf(marker) + 1] ?? ''
}

function validateAgent(payload: Record<string, unknown>) {
  const issues: ValidationIssue[] = []

  if (!payload.name || String(payload.name).trim().length < 2) {
    issues.push({ field: 'name', message: 'Agent name must be at least 2 characters.' })
  }

  if (!payload.modelId || !db.getModel(String(payload.modelId))) {
    issues.push({ field: 'modelId', message: 'Choose a valid model for this agent.' })
  }

  if (!payload.instructions || String(payload.instructions).trim().length < 20) {
    issues.push({ field: 'instructions', message: 'Add a clearer instruction for the agent.' })
  }

  if (!payload.systemPrompt || String(payload.systemPrompt).trim().length < 20) {
    issues.push({ field: 'systemPrompt', message: 'System prompt should be specific enough to guide behavior.' })
  }

  return issues
}

function validateModel(payload: Record<string, unknown>) {
  const issues: ValidationIssue[] = []
  const provider = String(payload.provider ?? '')
  const connectionMode = String(payload.connectionMode ?? '')
  const authType = String(payload.authType ?? '')

  if (!payload.name || String(payload.name).trim().length < 2) {
    issues.push({ field: 'name', message: 'Model name must be at least 2 characters.' })
  }

  if (!payload.endpoint || String(payload.endpoint).trim().length < 5) {
    issues.push({ field: 'endpoint', message: 'Provide a provider endpoint or local base URL.' })
  }

  if (!Array.isArray(payload.capabilities) || payload.capabilities.length === 0) {
    issues.push({ field: 'capabilities', message: 'Select at least one model capability.' })
  }

  if (connectionMode === 'backend-proxy' && !String(payload.credentialHint ?? '').trim()) {
    issues.push({ field: 'credentialHint', message: 'Add a credential or connector reference for backend-proxy models.' })
  }

  if (provider !== 'ollama' && connectionMode === 'browser-direct') {
    issues.push({ field: 'connectionMode', message: 'Browser-direct mode is currently intended for Ollama only.' })
  }

  if (provider === 'ollama' && authType !== 'none') {
    issues.push({ field: 'authType', message: 'Ollama browser-direct models should not require a browser-managed secret.' })
  }

  return issues
}

function validateTeam(payload: Record<string, unknown>) {
  const issues: ValidationIssue[] = []
  const members = Array.isArray(payload.memberAgentIds) ? payload.memberAgentIds : []

  if (!payload.name || String(payload.name).trim().length < 2) {
    issues.push({ field: 'name', message: 'Team name must be at least 2 characters.' })
  }

  if (!payload.leadAgentId || !db.getAgent(String(payload.leadAgentId))) {
    issues.push({ field: 'leadAgentId', message: 'Choose a valid lead agent.' })
  }

  if (members.length > 10) {
    issues.push({ field: 'memberAgentIds', message: 'Teams can have at most 10 members.' })
  }

  if (!payload.objective || String(payload.objective).trim().length < 20) {
    issues.push({ field: 'objective', message: 'Describe the team objective in enough detail.' })
  }

  return issues
}

export const handlers = [
  http.get(apiRoutes.agents, async () => {
    await withDelay()
    return success(db.listAgents())
  }),

  http.get(apiRoutes.agent(':id'), async ({ request }) => {
    await withDelay()
    const id = parseId(request.url, 'agents')
    const agent = db.getAgent(id)

    return agent
      ? success(agent)
      : failure(404, 'agent_not_found', 'The requested agent does not exist.')
  }),

  http.post(apiRoutes.agents, async ({ request }) => {
    await withDelay()
    const payload = (await request.json()) as Record<string, unknown>
    const issues = validateAgent(payload)

    if (issues.length > 0) {
      return failure(422, 'validation_error', 'Agent details need attention.', undefined, issues)
    }

    return success(db.createAgent(payload as never), 201)
  }),

  http.patch(apiRoutes.agent(':id'), async ({ request }) => {
    await withDelay()
    const id = parseId(request.url, 'agents')
    const payload = (await request.json()) as Record<string, unknown>
    const issues = validateAgent(payload)

    if (issues.length > 0) {
      return failure(422, 'validation_error', 'Agent details need attention.', undefined, issues)
    }

    const agent = db.updateAgent(id, payload as never)

    return agent
      ? success(agent)
      : failure(404, 'agent_not_found', 'The requested agent does not exist.')
  }),

  http.delete(apiRoutes.agent(':id'), async ({ request }) => {
    await withDelay()
    const id = parseId(request.url, 'agents')
    return db.deleteAgent(id)
      ? success({ id })
      : failure(404, 'agent_not_found', 'The requested agent does not exist.')
  }),

  http.get(apiRoutes.models, async () => {
    await withDelay()
    return success(db.listModels())
  }),

  http.get(apiRoutes.model(':id'), async ({ request }) => {
    await withDelay()
    const id = parseId(request.url, 'models')
    const model = db.getModel(id)

    return model
      ? success(model)
      : failure(404, 'model_not_found', 'The requested model does not exist.')
  }),

  http.post(apiRoutes.models, async ({ request }) => {
    await withDelay()
    const payload = (await request.json()) as Record<string, unknown>
    const issues = validateModel(payload)

    if (issues.length > 0) {
      return failure(422, 'validation_error', 'Model details need attention.', undefined, issues)
    }

    return success(db.createModel(payload as never), 201)
  }),

  http.patch(apiRoutes.model(':id'), async ({ request }) => {
    await withDelay()
    const id = parseId(request.url, 'models')
    const payload = (await request.json()) as Record<string, unknown>
    const issues = validateModel(payload)

    if (issues.length > 0) {
      return failure(422, 'validation_error', 'Model details need attention.', undefined, issues)
    }

    const model = db.updateModel(id, payload as never)

    return model
      ? success(model)
      : failure(404, 'model_not_found', 'The requested model does not exist.')
  }),

  http.delete(apiRoutes.model(':id'), async ({ request }) => {
    await withDelay()
    const id = parseId(request.url, 'models')
    return db.deleteModel(id)
      ? success({ id })
      : failure(404, 'model_not_found', 'The requested model does not exist.')
  }),

  http.post(apiRoutes.modelConnectionTest(':id'), async ({ request }) => {
    await withDelay()
    const id = parseId(request.url, 'models')
    const model = db.getModel(id)

    if (!model) {
      return failure(404, 'model_not_found', 'The requested model does not exist.')
    }

    if (model.endpoint.includes('offline')) {
      return failure(
        503,
        'provider_unreachable',
        'The provider failed the simulated connection check.',
        'Try a different endpoint or switch the provider status to ready.',
      )
    }

    return success({
      status: model.connectionMode === 'mock'
        ? 'Simulated provider handshake completed through the mock API.'
        : model.provider === 'ollama'
          ? 'Simulated local Ollama daemon reachability check passed.'
          : 'Simulated cloud provider handshake completed.',
      checkedAt: new Date().toISOString(),
    })
  }),

  http.post(apiRoutes.modelChatTest(':id'), async ({ request }) => {
    await withDelay()
    const id = parseId(request.url, 'models')
    const model = db.getModel(id)
    const payload = (await request.json()) as { prompt?: string }

    if (!model) {
      return failure(404, 'model_not_found', 'The requested model does not exist.')
    }

    if (!payload.prompt || payload.prompt.trim().length < 4) {
      return failure(422, 'validation_error', 'Test chat prompt is too short.', undefined, [
        { field: 'prompt', message: 'Enter a prompt with at least 4 characters.' },
      ])
    }

    const reply = `${model.name} simulated reply: clarify the success criteria, keep the next step reversible, and end with a human checkpoint.`

    return success({ reply, checkedAt: new Date().toISOString() })
  }),

  http.get(apiRoutes.teams, async () => {
    await withDelay()
    return success(db.listTeams())
  }),

  http.get(apiRoutes.team(':id'), async ({ request }) => {
    await withDelay()
    const id = parseId(request.url, 'teams')
    const team = db.getTeam(id)

    return team
      ? success(team)
      : failure(404, 'team_not_found', 'The requested team does not exist.')
  }),

  http.post(apiRoutes.teams, async ({ request }) => {
    await withDelay()
    const payload = (await request.json()) as Record<string, unknown>
    const issues = validateTeam(payload)

    if (issues.length > 0) {
      return failure(422, 'validation_error', 'Team details need attention.', undefined, issues)
    }

    return success(db.createTeam(payload as never), 201)
  }),

  http.patch(apiRoutes.team(':id'), async ({ request }) => {
    await withDelay()
    const id = parseId(request.url, 'teams')
    const payload = (await request.json()) as Record<string, unknown>
    const issues = validateTeam(payload)

    if (issues.length > 0) {
      return failure(422, 'validation_error', 'Team details need attention.', undefined, issues)
    }

    const team = db.updateTeam(id, payload as never)

    return team
      ? success(team)
      : failure(404, 'team_not_found', 'The requested team does not exist.')
  }),

  http.delete(apiRoutes.team(':id'), async ({ request }) => {
    await withDelay()
    const id = parseId(request.url, 'teams')
    return db.deleteTeam(id)
      ? success({ id })
      : failure(404, 'team_not_found', 'The requested team does not exist.')
  }),

  http.post(apiRoutes.teamDiscussions(':id'), async ({ request }) => {
    await withDelay()
    const teamId = parseId(request.url, 'teams')
    const team = db.getTeam(teamId)

    if (!team) {
      return failure(404, 'team_not_found', 'The requested team does not exist.')
    }

    const payload = (await request.json()) as {
      prompt?: string
      target?: 'team' | 'agent'
      targetAgentId?: string
    }

    if (!payload.prompt || payload.prompt.trim().length < 12) {
      return failure(422, 'validation_error', 'Discussion prompt needs more context.', undefined, [
        { field: 'prompt', message: 'Add a clearer instruction or hypothesis.' },
      ])
    }

    const lead = db.getAgent(team.leadAgentId)
    const memberNames = team.memberAgentIds
      .map((memberId) => db.getAgent(memberId)?.name)
      .filter(Boolean)
      .join(', ')

    const discussion: TeamDiscussion = {
      id: `discussion_${Math.random().toString(36).slice(2, 10)}`,
      teamId,
      target: payload.target ?? 'team',
      targetAgentId: payload.targetAgentId,
      prompt: payload.prompt,
      stage: 'conclusion',
      status: 'complete',
      messages: [
        {
          id: 'm1',
          speaker: lead?.name ?? 'Lead Agent',
          role: 'agent',
          body: `Planning frame: ${payload.prompt}`,
        },
        {
          id: 'm2',
          speaker: 'Human checkpoint',
          role: 'human',
          body: 'Review the cost of being wrong, reversibility class, and the smallest useful validation step.',
        },
        {
          id: 'm3',
          speaker: 'Team thread',
          role: 'system',
          body: `Participants contributing: ${memberNames || 'No supporting members assigned yet'}.`,
        },
      ],
      conclusion:
        'Proceed with a reversible implementation slice, validate on the narrowest possible check, and return the result to a human reviewer before expansion.',
      updatedAt: new Date().toISOString(),
    }

    return success(db.saveDiscussion(discussion), 201)
  }),

  http.get(apiRoutes.teamDiscussion(':teamId', ':discussionId'), async ({ request }) => {
    await withDelay()
    const pathname = new URL(request.url).pathname.split('/').filter(Boolean)
    const teamId = pathname[1] ?? ''
    const discussionId = pathname[3] ?? ''
    const discussion = db.getDiscussion(teamId, discussionId)

    return discussion
      ? success(discussion)
      : failure(404, 'discussion_not_found', 'The requested discussion does not exist.')
  }),
]