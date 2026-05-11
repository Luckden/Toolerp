import type { ApiFailure, ValidationIssue } from '../domain'

export class ApiClientError extends Error {
  code: string
  detail?: string
  retryable: boolean
  issues: ValidationIssue[]
  status: number

  constructor({
    code,
    message,
    detail,
    retryable = false,
    issues = [],
    status,
  }: {
    code: string
    message: string
    detail?: string
    retryable?: boolean
    issues?: ValidationIssue[]
    status: number
  }) {
    super(message)
    this.name = 'ApiClientError'
    this.code = code
    this.detail = detail
    this.retryable = retryable
    this.issues = issues
    this.status = status
  }
}

async function parseError(response: Response) {
  const payload = (await response.json()) as ApiFailure

  throw new ApiClientError({
    code: payload.error.code,
    message: payload.error.message,
    detail: payload.error.detail,
    retryable: payload.error.retryable,
    issues: payload.error.issues,
    status: response.status,
  })
}

export async function request<T>(input: string, init?: RequestInit) {
  const response = await fetch(input, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    await parseError(response)
  }

  const payload = (await response.json()) as { data: T }
  return payload.data
}