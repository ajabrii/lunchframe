import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { DashboardPage } from './pages/DashboardPage'
import { GeneratorPage } from './pages/GeneratorPage'
import { ProcessingPage } from './pages/ProcessingPage'

// Components
import { ProtectedRoute } from './components/layout/AppShell'

const GOOGLE_CLIENT_ID = ((import.meta as any).env.VITE_GOOGLE_CLIENT_ID || '').trim()

function AppRoutes() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="pipeline-spinner" />
        <p>Loading Launchframe...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />

      <Route path="/generator" element={
        <ProtectedRoute>
          <GeneratorPage />
        </ProtectedRoute>
      } />

      <Route path="/processing/:videoId" element={
        <ProtectedRoute>
          <ProcessingPage />
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  const app = (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )

  if (!GOOGLE_CLIENT_ID) {
    return app
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {app}
    </GoogleOAuthProvider>
  )
}
