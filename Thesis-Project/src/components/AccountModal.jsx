import { useState } from 'react'


function AccountModal({
  mode,
  setMode,
  onClose,
  onLogin
}) {
  // login / signup fields
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')

  // password reset fields
  const [resetMode, setResetMode] = useState(false)
  const [resetStep, setResetStep] = useState('request')
  const [resetIdentifier, setResetIdentifier] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // form messages
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)


  function clearMessages() {
    setError('')
    setSuccess('')
  }


  function openPasswordReset() {
    clearMessages()

    // reuse anything already typed into login
    setResetIdentifier(identifier)

    setResetMode(true)
    setResetStep('request')
  }


  function returnToLogin() {
    clearMessages()
    setResetMode(false)
    setResetStep('request')
    setMode('login')
  }


  async function handleRegister(event) {
    event.preventDefault()

    clearMessages()
    setLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:5000/api/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: username,
            email: email,
            password: password
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not create account'
        )
      }

      setSuccess(
        'Account created. You can now log in.'
      )

      setIdentifier(username)
      setPassword('')
      setMode('login')

    } catch (err) {
      setError(
        err.message ||
        'Could not connect to the AniMatch backend'
      )
    } finally {
      setLoading(false)
    }
  }


  async function handleLogin(event) {
    event.preventDefault()

    clearMessages()
    setLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:5000/api/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            identifier: identifier,
            password: password
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Login failed'
        )
      }

      onLogin(data.user)
      onClose()

    } catch (err) {
      setError(
        err.message ||
        'Could not connect to the AniMatch backend'
      )
    } finally {
      setLoading(false)
    }
  }


  async function handleResetRequest(event) {
    event.preventDefault()

    clearMessages()
    setLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:5000/api/password-reset/request',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            identifier: resetIdentifier
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
          'Could not create reset code'
        )
      }

      setSuccess(
        'Reset code created. Check the Flask terminal.'
      )

      setResetStep('confirm')

    } catch (err) {
      setError(
        err.message ||
        'Could not connect to the AniMatch backend'
      )
    } finally {
      setLoading(false)
    }
  }


  async function handleResetConfirm(event) {
    event.preventDefault()

    clearMessages()

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError(
        'Password must be at least 6 characters'
      )
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:5000/api/password-reset/confirm',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            identifier: resetIdentifier,
            code: resetCode,
            new_password: newPassword
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
          'Could not reset password'
        )
      }

      setSuccess(
        'Password reset successfully. You can now log in.'
      )

      setIdentifier(resetIdentifier)
      setPassword('')
      setResetCode('')
      setNewPassword('')
      setConfirmPassword('')
      setResetMode(false)
      setResetStep('request')
      setMode('login')

    } catch (err) {
      setError(
        err.message ||
        'Could not connect to the AniMatch backend'
      )
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="modal-backdrop">

      <div className="account-modal">

        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close account window"
        >
          ×
        </button>


        <div className="account-brand">
          Ani<span>Match</span>
        </div>


        {!resetMode && (

          <>
            <div className="account-tabs">

              <button
                className={
                  mode === 'login'
                    ? 'account-tab active-tab'
                    : 'account-tab'
                }
                onClick={() => {
                  clearMessages()
                  setMode('login')
                }}
              >
                Login
              </button>

              <button
                className={
                  mode === 'register'
                    ? 'account-tab active-tab'
                    : 'account-tab'
                }
                onClick={() => {
                  clearMessages()
                  setMode('register')
                }}
              >
                Sign Up
              </button>

            </div>


            {mode === 'login' ? (

              <>
                <div className="account-heading">

                  <h2>
                    Welcome back
                  </h2>

                  <p>
                    Log in to your AniMatch account.
                  </p>

                </div>


                <form
                  className="account-form"
                  onSubmit={handleLogin}
                >

                  <label>
                    Username or Email

                    <input
                      type="text"
                      value={identifier}
                      onChange={(event) =>
                        setIdentifier(
                          event.target.value
                        )
                      }
                      placeholder="Enter username or email"
                      required
                    />
                  </label>


                  <label>
                    Password

                    <input
                      type="password"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter password"
                      required
                    />
                  </label>


                  <button
                    type="button"
                    className="forgot-password-button"
                    onClick={openPasswordReset}
                  >
                    Forgot Password?
                  </button>


                  {error && (
                    <div className="account-error">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="account-success">
                      {success}
                    </div>
                  )}


                  <button
                    className="account-submit"
                    type="submit"
                    disabled={loading}
                  >
                    {loading
                      ? 'Logging in...'
                      : 'Login'}
                  </button>

                </form>
              </>

            ) : (

              <>
                <div className="account-heading">

                  <h2>
                    Create your account
                  </h2>

                  <p>
                    Start building your AniMatch profile.
                  </p>

                </div>


                <form
                  className="account-form"
                  onSubmit={handleRegister}
                >

                  <label>
                    Username

                    <input
                      type="text"
                      value={username}
                      onChange={(event) =>
                        setUsername(
                          event.target.value
                        )
                      }
                      placeholder="Choose a username"
                      required
                    />
                  </label>


                  <label>
                    Email

                    <input
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder="Enter your email"
                      required
                    />
                  </label>


                  <label>
                    Password

                    <input
                      type="password"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="At least 6 characters"
                      required
                    />
                  </label>


                  {error && (
                    <div className="account-error">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="account-success">
                      {success}
                    </div>
                  )}


                  <button
                    className="account-submit"
                    type="submit"
                    disabled={loading}
                  >
                    {loading
                      ? 'Creating account...'
                      : 'Create Account'}
                  </button>

                </form>
              </>

            )}
          </>

        )}


        {resetMode && (

          <>
            <div className="account-heading">

              <h2>
                Reset Password
              </h2>

              <p>
                {resetStep === 'request'
                  ? 'Enter your username or email to create a temporary reset code.'
                  : 'Enter the code shown in your Flask terminal and choose a new password.'}
              </p>

            </div>


            {resetStep === 'request' ? (

              <form
                className="account-form"
                onSubmit={handleResetRequest}
              >

                <label>
                  Username or Email

                  <input
                    type="text"
                    value={resetIdentifier}
                    onChange={(event) =>
                      setResetIdentifier(
                        event.target.value
                      )
                    }
                    placeholder="Enter username or email"
                    required
                  />
                </label>


                {error && (
                  <div className="account-error">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="account-success">
                    {success}
                  </div>
                )}


                <button
                  className="account-submit"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? 'Creating code...'
                    : 'Send Reset Code'}
                </button>

              </form>

            ) : (

              <form
                className="account-form"
                onSubmit={handleResetConfirm}
              >

                <label>
                  Reset Code

                  <input
                    type="text"
                    inputMode="numeric"
                    value={resetCode}
                    onChange={(event) =>
                      setResetCode(
                        event.target.value
                      )
                    }
                    placeholder="6-digit code"
                    required
                  />
                </label>


                <label>
                  New Password

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    placeholder="At least 6 characters"
                    required
                  />
                </label>


                <label>
                  Confirm New Password

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Type password again"
                    required
                  />
                </label>


                {error && (
                  <div className="account-error">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="account-success">
                    {success}
                  </div>
                )}


                <button
                  className="account-submit"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? 'Resetting password...'
                    : 'Reset Password'}
                </button>

              </form>

            )}


            <button
              type="button"
              className="back-to-login-button"
              onClick={returnToLogin}
            >
              Back to Login
            </button>

          </>

        )}

      </div>

    </div>
  )
}


export default AccountModal
