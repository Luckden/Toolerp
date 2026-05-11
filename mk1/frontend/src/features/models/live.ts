import { ApiClientError } from '../../lib/api/client'
import type { ModelProfile } from '../../lib/domain'

function ensureOllamaBrowserDirect(model: ModelProfile) {
  if (model.provider !== 'ollama' || model.connectionMode !== 'browser-direct') {
    throw new ApiClientError({
      code: 'unsupported_live_transport',
      message: 'Live browser-direct testing is currently implemented only for Ollama.',
      detail: 'Use mock mode for demos or add a backend connector for cloud providers.',
      status: 400,
    })
  }
}

function normalizeBaseUrl(endpoint: string) {
  return endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint
}

function connectionError(detail: string) {
  return new ApiClientError({
    code: 'browser_direct_unreachable',
    message: 'The browser could not reach the configured Ollama endpoint.',
    detail,
    retryable: true,
    status: 503,
  })
}

async function parseJsonOrText(response: Response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function testBrowserDirectConnection(model: ModelProfile) {
  ensureOllamaBrowserDirect(model)

  try {
    const response = await fetch(`${normalizeBaseUrl(model.endpoint)}/api/tags`)

    if (!response.ok) {
      const payload = await parseJsonOrText(response)
      throw new ApiClientError({
        code: 'ollama_connection_failed',
        message: 'Ollama responded, but the connection check failed.',
        detail: typeof payload === 'string' ? payload : 'Verify the base URL and local daemon state.',
        status: response.status,
      })
    }

    const payload = (await response.json()) as { models?: Array<{ name?: string; model?: string }> }
    const available = payload.models?.some(
      (item) => item.name === model.modelSlug || item.model === model.modelSlug,
    )

    return {
      status: available
        ? `Live Ollama connection succeeded and model "${model.modelSlug}" is available.`
        : 'Live Ollama connection succeeded, but the configured model slug was not listed by the daemon.',
      checkedAt: new Date().toISOString(),
    }
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error
    }

    throw connectionError(
      'Check that Ollama is running, the host/port is reachable from the browser, and local CORS/network settings allow access.',
    )
  }
}

export async function testBrowserDirectChat(model: ModelProfile, prompt: string) {
  ensureOllamaBrowserDirect(model)

  try {
    const response = await fetch(`${normalizeBaseUrl(model.endpoint)}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.modelSlug,
        stream: false,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const payload = await parseJsonOrText(response)
      throw new ApiClientError({
        code: 'ollama_chat_failed',
        message: 'Ollama responded, but the chat request failed.',
        detail: typeof payload === 'string' ? payload : 'Verify that the selected model has been pulled locally.',
        status: response.status,
      })
    }

    const payload = (await response.json()) as { message?: { content?: string } }
    const reply = payload.message?.content?.trim()

    if (!reply) {
      throw new ApiClientError({
        code: 'ollama_empty_reply',
        message: 'Ollama returned an empty response.',
        detail: 'The model request completed but no assistant content was returned.',
        status: 502,
      })
    }

    return {
      reply,
      checkedAt: new Date().toISOString(),
    }
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error
    }

    throw connectionError(
      'Check that Ollama is running locally and that the browser is allowed to post to the configured endpoint.',
    )
  }
}