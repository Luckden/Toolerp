import clsx from 'clsx'
import { Bot, BrainCircuit, Network } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useUiStore } from '../stores/ui-store'

const navigation = [
  {
    to: '/agents',
    label: 'Agents',
    description: 'Specialists, prompts, checkpoints',
    icon: Bot,
  },
  {
    to: '/models',
    label: 'Models',
    description: 'Providers, connectivity, test chat',
    icon: BrainCircuit,
  },
  {
    to: '/teams',
    label: 'Teams',
    description: 'Lead-agent orchestration with review',
    icon: Network,
  },
]

export function AppShell() {
  const compactMode = useUiStore((state) => state.compactMode)
  const toggleCompactMode = useUiStore((state) => state.toggleCompactMode)

  return (
    <div className="min-h-screen bg-transparent text-base-content">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-4 lg:flex-row lg:gap-4 lg:px-6">
        <aside className="mb-4 flex w-full flex-col rounded-[1.75rem] border border-base-300/80 bg-neutral text-neutral-content shadow-xl shadow-neutral/10 lg:mb-0 lg:min-h-[calc(100vh-2rem)] lg:w-80">
          <div className="border-b border-white/10 px-6 py-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-neutral-content/70">
              Toolerp mk1
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">AI Delivery Console</h1>
            <p className="mt-3 text-sm leading-6 text-neutral-content/70">
              Frontend-first operating surface for agents, models, and teams with
              explicit human review.
            </p>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-4">
            {navigation.map(({ to, label, description, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-start gap-3 rounded-2xl px-4 py-4 transition-colors',
                    isActive
                      ? 'bg-white text-neutral shadow-lg shadow-black/10'
                      : 'text-neutral-content/80 hover:bg-white/8 hover:text-neutral-content',
                  )
                }
              >
                <span className="mt-0.5 rounded-xl bg-primary/15 p-2 text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold tracking-wide">{label}</span>
                  <span className="mt-1 block text-xs leading-5 opacity-75">{description}</span>
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-white/10 px-6 py-5">
            <div className="rounded-2xl bg-white/6 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Dense workspace</p>
                  <p className="text-xs text-neutral-content/70">
                    Toggle tighter spacing for list-heavy views.
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={compactMode}
                  onChange={toggleCompactMode}
                />
              </div>
            </div>
          </div>
        </aside>

        <main className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col rounded-[1.75rem] border border-base-300/80 bg-base-100/85 shadow-2xl shadow-primary/5 backdrop-blur">
          <Outlet />
        </main>
      </div>
    </div>
  )
}