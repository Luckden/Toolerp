import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description: string
  icon: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-base-300 bg-base-200/40 px-6 py-10 text-center">
      <div className="rounded-2xl bg-primary/10 p-4 text-primary">{icon}</div>
      <h3 className="mt-5 text-xl font-semibold text-base-content">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-base-content/70">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}