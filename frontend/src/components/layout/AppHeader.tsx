import { useAuth } from '../../context/AuthContext'

interface AppHeaderProps {
  title: string
}

export const AppHeader = ({ title }: AppHeaderProps) => {
  const { user } = useAuth()

  if (!user) return null

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-900/80 bg-zinc-950/80 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <h1 className="text-lg font-semibold tracking-tight text-zinc-100">{title}</h1>
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-violet-200">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />
          {user.plan} plan
        </div>
      </div>
    </header>
  )
}
