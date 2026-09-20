import { useState } from 'react'
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

type AdminLoginProps = {
  onLoginSuccess?: () => void
}

export default function AdminLogin({
  onLoginSuccess,
}: AdminLoginProps) {
  const [email, setEmail] = useState(
    'thepicksystore@gmail.com',
  )
  const [password, setPassword] = useState('')

  const [showPassword, setShowPassword] =
    useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleLogin(
    e: React.FormEvent,
  ) {
    e.preventDefault()

    setError('')
    setSuccess('')

    const cleanEmail = email.trim()

    if (!cleanEmail || !password) {
      setError(
        'Please enter your email and password.',
      )
      return
    }

    setLoading(true)

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

    if (loginError) {
      setError(
        loginError.message ===
          'Invalid login credentials'
          ? 'Invalid email or password.'
          : loginError.message,
      )

      setLoading(false)
      return
    }

    if (!data.session) {
      setError(
        'Login failed. Please try again.',
      )

      setLoading(false)
      return
    }

    setEmail(cleanEmail)
    setPassword('')
    setLoading(false)

    onLoginSuccess?.()
  }

  async function handleForgotPassword() {
    setError('')
    setSuccess('')

    const cleanEmail = email.trim()

    if (!cleanEmail) {
      setError(
        'Enter your admin email first.',
      )
      return
    }

    setLoading(true)

    const redirectTo =
      `${window.location.origin}` +
      `${import.meta.env.BASE_URL}`

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(
        cleanEmail,
        {
          redirectTo,
        },
      )

    if (resetError) {
      setError(resetError.message)
    } else {
      setSuccess(
        'Password reset email sent. Please check your inbox.',
      )
    }

    setLoading(false)
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <img
          className="admin-login-logo"
          src={import.meta.env.BASE_URL + 'picksy-logo.svg'}
          alt="Picksy Store"
        />

        <div className="admin-login-heading">
          <h1>Picksy Store Admin</h1>

          <p>
            Sign in to manage your Picksy Store.
          </p>
        </div>

        {error && (
          <div className="admin-login-message error">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-login-message success">
            {success}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="admin-login-field">
            <label>Email</label>

            <div className="admin-login-input-wrap">
              <Mail size={17} />

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your admin email"
                autoComplete="email"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="admin-login-field">
            <label>Password</label>

            <div className="admin-login-input-wrap">
              <LockKeyhole size={17} />

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value,
                  )
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                required
              />

              <button
                type="button"
                className="admin-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (current) => !current,
                  )
                }
                disabled={loading}
                title={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
          </div>

          <div className="admin-login-options">
            <span>
              Secure admin access
            </span>

            <button
              type="button"
              onClick={
                handleForgotPassword
              }
              disabled={loading}
            >
              Forgot password?
            </button>
          </div>

          <button
            className="admin-login-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2
                  size={17}
                  className="admin-spin"
                />
                Signing in...
              </>
            ) : (
              <>
                <LockKeyhole size={17} />
                Login to Dashboard
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          Picksy Store • Admin Panel
        </div>
      </div>
    </div>
  )
}