import type { ReactNode } from 'react'

type WorkspaceSplitProps = {
  primary: ReactNode
  secondary: ReactNode
}

export function WorkspaceSplit({ primary, secondary }: WorkspaceSplitProps) {
  return (
    <div className="grid flex-1 gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.95fr)] lg:px-8 lg:py-8">
      <section className="min-h-0">{primary}</section>
      <aside className="min-h-0">{secondary}</aside>
    </div>
  )
}