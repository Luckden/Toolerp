import { AlertTriangle } from 'lucide-react'
import { ApiClientError } from '../lib/api/client'

type ErrorPaneProps = {
  title?: string
  error: ApiClientError | Error | null
  onRetry?: () => void
}

export function ErrorPane({
  title = 'Something interrupted this workflow',
  error,
  onRetry,
}: ErrorPaneProps) {
  if (!error) {
    return null
  }

  const details = error instanceof ApiClientError ? error.detail : undefined

  return (
    <div className="alert border border-error/20 bg-error/5 text-error-content shadow-sm">
      <AlertTriangle className="size-5 stroke-error" />
      <div className="min-w-0 text-error">
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-error/80">{error.message}</p>
        {details ? <p className="mt-1 text-xs text-error/70">{details}</p> : null}
      </div>
      {onRetry ? (
        <button type="button" className="btn btn-sm btn-error btn-outline" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  )
}