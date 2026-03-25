import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LogoIcon,
  LayoutIcon,
  VideoIcon,
  CreditCardIcon,
  SparklesIcon
} from '../common/Icons'

export const Sidebar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  if (!user) return null

  const usagePercent = user.videos_limit > 0
    ? Math.min(100, Math.max(0, (user.videos_used / user.videos_limit) * 100))
    : 100

  const usageLabel = user.videos_limit > 0
    ? `${user.videos_used}/${user.videos_limit} videos`
    : `${user.videos_used} videos`

  return (
    <aside className="hidden w-72 border-r border-zinc-900/80 bg-zinc-950/90 p-4 md:flex md:flex-col">
      <div className="mb-8">
        <Link to="/dashboard" className="flex items-center gap-3 text-sm font-semibold text-zinc-100">
          <LogoIcon />
          <span>Launchframe</span>
        </Link>
      </div>

      <nav className="space-y-1">
        <Link
          to="/dashboard"
          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${isActive('/dashboard') ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:bg-zinc-900/70 hover:text-zinc-100'}`}
        >
          <LayoutIcon />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/generator"
          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${isActive('/generator') ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:bg-zinc-900/70 hover:text-zinc-100'}`}
        >
          <VideoIcon />
          <span>Create New</span>
        </Link>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-zinc-500"
          disabled
        >
          <CreditCardIcon />
          <span>Billing (soon)</span>
        </button>
      </nav>

      <div className="mt-auto space-y-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
            <span>Usage</span>
            <span>{usageLabel}</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-800">
            <div className="h-2 rounded-full bg-violet-400" style={{ width: `${usagePercent}%` }} />
          </div>
          <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm text-violet-200 transition hover:bg-violet-500/20">
            <SparklesIcon /> Upgrade Plan
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-zinc-900 bg-zinc-900/50 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold uppercase text-zinc-200">
            {user.name?.[0] || user.email[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-200">{user.name || 'User'}</p>
            <p className="text-xs uppercase tracking-wide text-zinc-500">{user.plan}</p>
          </div>
          <button onClick={logout} className="rounded-md p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200" title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
