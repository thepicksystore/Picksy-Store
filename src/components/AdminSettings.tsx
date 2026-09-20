import { useState } from 'react'
import {
  CheckCircle2,
  KeyRound,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

type AdminSettingsProps = {
  session: any
  onLogout: () => void
}

export default function AdminSettings({
  session,
  onLogout,
}: AdminSettingsProps) {
  const [currentPassword, setCurrentPassword] =
    useState('')

  const [newPassword, setNewPassword] =
    useState('')

  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [saving, setSaving] = useState(false)

  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const email =
    session?.user?.email || 'Admin account'

  async function handleChangePassword(
    e: React.FormEvent,
  ) {
    e.preventDefault()

    setMessage(null)

    if (!currentPassword) {
      setMessage({
        type: 'error',
        text: 'Please enter your current password.',
      })
      return
    }

    if (newPassword.length < 6) {
      setMessage({
        type: 'error',
        text: 'New password must be at least 6 characters.',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'New passwords do not match.',
      })
      return
    }

    setSaving(true)

    /*
     * Re-authenticate first.
     * This prevents changing the password
     * using only an old/stale session.
     */
    const { error: verifyError } =
      await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      })

    if (verifyError) {
      setMessage({
        type: 'error',
        text: 'Current password is incorrect.',
      })

      setSaving(false)
      return
    }

    const { error } =
      await supabase.auth.updateUser({
        password: newPassword,
      })

    if (error) {
      setMessage({
        type: 'error',
        text: error.message,
      })

      setSaving(false)
      return
    }

    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')

    setMessage({
      type: 'success',
      text: 'Password updated successfully.',
    })

    setSaving(false)
  }

  return (
    <section className="admin-settings-page">
      <header className="admin-topbar">
        <div>
          <h1>Settings</h1>

          <p>
            Manage your Picksy Store admin account
            and security
          </p>
        </div>
      </header>

      {message && (
        <div
          className={`admin-settings-message ${
            message.type === 'success'
              ? 'success'
              : 'error'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 size={18} />
          ) : (
            <ShieldCheck size={18} />
          )}

          <span>{message.text}</span>
        </div>
      )}

      <div className="admin-settings-grid">
        {/* ACCOUNT */}
        <div className="admin-settings-card">
          <div className="admin-settings-card-header">
            <div className="admin-settings-card-icon">
              <UserRound size={19} />
            </div>

            <div>
              <h2>Admin Account</h2>

              <p>
                Your current Picksy Store admin account
              </p>
            </div>
          </div>

          <div className="admin-settings-account">
            <div className="admin-settings-avatar">
              <UserRound size={22} />
            </div>

            <div>
              <strong>Administrator</strong>

              <span>{email}</span>
            </div>
          </div>

          <div className="admin-settings-info">
            <Mail size={16} />

            <div>
              <strong>Login Email</strong>

              <span>{email}</span>
            </div>
          </div>
        </div>

        {/* SECURITY */}
        <div className="admin-settings-card">
          <div className="admin-settings-card-header">
            <div className="admin-settings-card-icon">
              <KeyRound size={19} />
            </div>

            <div>
              <h2>Change Password</h2>

              <p>
                Update your admin login password
              </p>
            </div>
          </div>

          <form
            className="admin-settings-form"
            onSubmit={
              handleChangePassword
            }
          >
            <div className="admin-settings-field">
              <label>
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value,
                  )
                }
                placeholder="Enter current password"
                disabled={saving}
                autoComplete="current-password"
              />
            </div>

            <div className="admin-settings-field">
              <label>
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value,
                  )
                }
                placeholder="Minimum 6 characters"
                disabled={saving}
                autoComplete="new-password"
              />
            </div>

            <div className="admin-settings-field">
              <label>
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value,
                  )
                }
                placeholder="Repeat new password"
                disabled={saving}
                autoComplete="new-password"
              />
            </div>

            <button
              className="admin-primary-btn"
              type="submit"
              disabled={saving}
            >
              {saving
                ? 'Updating...'
                : 'Update Password'}
            </button>
          </form>
        </div>

        {/* SECURITY STATUS */}
        <div className="admin-settings-card">
          <div className="admin-settings-card-header">
            <div className="admin-settings-card-icon">
              <ShieldCheck size={19} />
            </div>

            <div>
              <h2>Security</h2>

              <p>
                Picksy Store admin security information
              </p>
            </div>
          </div>

          <div className="admin-security-row">
            <div>
              <strong>Authentication</strong>

              <span>
                Supabase secure authentication
              </span>
            </div>

            <span className="admin-security-status">
              Active
            </span>
          </div>

          <div className="admin-security-row">
            <div>
              <strong>Admin Access</strong>

              <span>
                Protected admin account
              </span>
            </div>

            <span className="admin-security-status">
              Active
            </span>
          </div>
        </div>

        {/* LOGOUT */}
        <div className="admin-settings-card admin-danger-card">
          <div className="admin-settings-card-header">
            <div className="admin-settings-card-icon danger">
              <LogOut size={19} />
            </div>

            <div>
              <h2>Sign Out</h2>

              <p>
                End your current admin session
              </p>
            </div>
          </div>

          <button
            type="button"
            className="admin-settings-logout"
            onClick={onLogout}
          >
            <LogOut size={17} />
            Logout from Picksy Store Admin
          </button>
        </div>
      </div>
    </section>
  )
}