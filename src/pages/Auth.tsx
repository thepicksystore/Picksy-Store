import { useEffect, useState } from 'react'
import { Eye, EyeOff, LockKeyhole, LogIn, Mail, UserPlus } from 'lucide-react'
import { supabase } from '../lib/supabase'

type Mode = 'login' | 'signup'

export default function Auth() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  function switchMode(nextMode: Mode) {
    setMode(nextMode)
    setError('')
    setMessage('')
    setPassword('')
    setConfirmPassword('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')

    const cleanEmail = email.trim()

    if (!cleanEmail || !password) {
      setError('Please enter your email and password.')
      return
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    if (mode === 'login') {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (loginError) {
        setError(
          loginError.message === 'Invalid login credentials'
            ? 'Invalid email or password.'
            : loginError.message,
        )
      } else {
        setPassword('')
        setMessage('Login successful.')
      }
    } else {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo:
            window.location.origin + import.meta.env.BASE_URL,
        },
      })

      if (signupError) {
        setError(signupError.message)
      } else {
        setPassword('')
        setConfirmPassword('')

        if (data.session) {
          setMessage('Account created successfully.')
        } else {
          setMessage(
            'Account created. Please check your email to confirm your account.',
          )
        }
      }
    }

    setLoading(false)
  }

  async function handleLogout() {
    setLoading(true)
    await supabase.auth.signOut()
    setLoading(false)
    setMessage('You have been logged out.')
  }

  if (session) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <img
            className="auth-logo"
            src={import.meta.env.BASE_URL + 'picksy-logo.svg'}
            alt="Picksy Store"
          />

          <div className="auth-heading">
            <h1>Welcome to Picksy</h1>
            <p>You are signed in with your Picksy account.</p>
          </div>

          <div className="auth-account-box">
            <Mail size={18} />
            <span>{session.user?.email}</span>
          </div>

          {message && <div className="auth-message success">{message}</div>}

          <button
            type="button"
            className="auth-submit"
            onClick={handleLogout}
            disabled={loading}
          >
            <LogIn size={18} />
            {loading ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <img
          className="auth-logo"
          src={import.meta.env.BASE_URL + 'picksy-logo.svg'}
          alt="Picksy Store"
        />

        <div className="auth-heading">
          <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
          <p>
            {mode === 'login'
              ? 'Login to your Picksy account.'
              : 'Sign up to save your favorite finds.'}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => switchMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => switchMode('signup')}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="auth-message error">{error}</div>}
        {message && <div className="auth-message success">{message}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <span className="auth-input-wrap">
              <Mail size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                disabled={loading}
                required
              />
            </span>
          </label>

          <label>
            Password
            <span className="auth-input-wrap">
              <LockKeyhole size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete={
                  mode === 'login' ? 'current-password' : 'new-password'
                }
                disabled={loading}
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>

          {mode === 'signup' && (
            <label>
              Confirm Password
              <span className="auth-input-wrap">
                <LockKeyhole size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  disabled={loading}
                  required
                />
              </span>
            </label>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
            {loading
              ? mode === 'login'
                ? 'Logging in...'
                : 'Creating account...'
              : mode === 'login'
                ? 'Login'
                : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch-text">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </main>
  )
}
