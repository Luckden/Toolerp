import clsx from 'clsx'

const toneMap: Record<string, string> = {
  active: 'badge-success',
  ready: 'badge-success',
  aligned: 'badge-success',
  running: 'badge-info',
  validating: 'badge-info',
  draft: 'badge-warning',
  forming: 'badge-warning',
  paused: 'badge-warning',
  review: 'badge-warning',
  degraded: 'badge-warning',
  blocked: 'badge-error',
  offline: 'badge-error',
  archived: 'badge-neutral',
}

type StatusBadgeProps = {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={clsx('badge badge-sm gap-2 border-0 font-medium capitalize', toneMap[status] ?? 'badge-neutral')}>
      {status.replace('-', ' ')}
    </span>
  )
}