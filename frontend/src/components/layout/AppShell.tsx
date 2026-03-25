import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Sidebar } from './Sidebar'
import { AppHeader } from './AppHeader'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="loading-screen">Loading...</div>
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  return <>{children}</>
}

export const AppShell = ({ children, title }: { children: React.ReactNode, title: string }) => {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />
      <main className="flex-1">
        <AppHeader title={title} />
        <div className="px-4 pb-8 pt-6 md:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
