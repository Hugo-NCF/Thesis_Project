import { useState } from 'react'


function AccountModal({
  mode,
  setMode,
  onClose,
  onLogin
}) {
  // stores signup form values
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')

  // stores login username/email
  const [identifier, setIdentifier] = useState('')

  // stores password for either form
  const [password, setPassword] = useState('')

  // stores success messages
  const [message, setMessage] = useState('')

  // stores error messages
  const [error, setError] = useState('')

  // stores whether a request is currently being sent
  const [loading, setLoading] = useState(false)


  // ----------------------------------------------------------
  // SIGN UP
  // ----------------------------------------------------------

  async function handleRegister(event) {
    // prevent the browser from refreshing the page
    event.preventDefault()

    // clear old messages
    setMessage('')
    setError('')
    setLoading(true)

    try {
      // send signup information to the Flask API
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

      // convert API response into JavaScript
      const data = await response.json()

      // show API error if signup failed
      if (!response.ok) {
        setError(data.error || 'Account creation failed')
        return
      }

      // show success message
      setMessage('Account created successfully. You can now log in.')

      // clear the signup form
      setUsername('')
      setEmail('')
      setPassword('')

      // switch to login after successful signup
      setMode('login')

    } catch {
      // happens if React cannot reach Flask
      setError(
        'Could not connect to the AniMatch backend.'
      )

    } finally {
      setLoading(false)
    }
  }


  // ----------------------------------------------------------
  // LOGIN
  // ----------------------------------------------------------

  async function handleLogin(event) {
    // prevent the browser from refreshing
    event.preventDefault()

    // clear old messages
    setMessage('')
    setError('')
    setLoading(true)

    try {
      // send login information to Flask
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

      // convert the API response into JavaScript
      const data = await response.json()

      // show error if login failed
      if (!response.ok) {
        setError(data.error || 'Login failed')
        return
      }

      // send logged-in user information back to App.jsx
      onLogin(data.user)

      // close the account window
      onClose()

    } catch {
      // happens if Flask is not running
      setError(
        'Could not connect to the AniMatch backend.'
      )

    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="modal-backdrop">

      <div className="account-modal">

        {/* CLOSE BUTTON */}

        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close account window"
        >
          ×
        </button>


        {/* ANI MATCH LOGO */}

        <div className="account-brand">
          Ani<span>Match</span>
        </div>


        {/* LOGIN / SIGNUP SWITCH */}

        <div className="account-tabs">

          <button
            className={
              mode === 'login'
                ? 'account-tab active-tab'
                : 'account-tab'
            }
            onClick={() => {
              setMode('login')
              setError('')
              setMessage('')
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
              setMode('register')
              setError('')
              setMessage('')
            }}
          >
            Sign Up
          </button>

        </div>


        {/* LOGIN FORM */}

        {mode === 'login' && (

          <form
            className="account-form"
            onSubmit={handleLogin}
          >

            <div className="account-heading">
              <h2>Welcome back</h2>

              <p>
                Log in to your AniMatch account.
              </p>
            </div>


            <label>
              Username or Email

              <input
                type="text"
                placeholder="Enter username or email"
                value={identifier}
                onChange={(event) =>
                  setIdentifier(event.target.value)
                }
              />
            </label>


            <label>
              Password

              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
              />
            </label>


            {error && (
              <p className="account-error">
                {error}
              </p>
            )}


            {message && (
              <p className="account-success">
                {message}
              </p>
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

        )}


        {/* SIGN UP FORM */}

        {mode === 'register' && (

          <form
            className="account-form"
            onSubmit={handleRegister}
          >

            <div className="account-heading">
              <h2>Create your account</h2>

              <p>
                Start building your AniMatch profile.
              </p>
            </div>


            <label>
              Username

              <input
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
              />
            </label>


            <label>
              Email

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />
            </label>


            <label>
              Password

              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
              />
            </label>


            {error && (
              <p className="account-error">
                {error}
              </p>
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

        )}

      </div>

    </div>
  )
}


export default AccountModal