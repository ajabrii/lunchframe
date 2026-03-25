import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogoIcon } from '../components/common/Icons'
import { GoogleLogin } from '@react-oauth/google'

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, googleLogin } = useAuth()
  const googleEnabled = Boolean(((import.meta as any).env.VITE_GOOGLE_CLIENT_ID || '').trim())
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (response: any) => {
    try {
      await googleLogin(response.credential)
      navigate(from, { replace: true })
    } catch (err) {
      setError('Google Sign-In failed')
    }
  }

  const handleGoogleError = () => {
    setError('Google Sign-In failed')
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-scale-in">
        <Link to="/" className="auth-logo">
          <LogoIcon />
          <span>Launchframe</span>
        </Link>
        <div className="auth-header">
          <h2>Welcome back</h2>
          <p>Login to your account to continue</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        {googleEnabled ? (
          <>
            <div className="auth-divider">OR</div>
            <div className="auth-google-container">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                shape="pill"
                text="signin_with"
                width="100%"
              />
            </div>
          </>
        ) : null}

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  )
}
