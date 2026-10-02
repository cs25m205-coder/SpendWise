import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            email,
            password
          })
        }
      )

      const data = await response.json()

     if (!response.ok) {
  console.log('Registration error:', data)
  setError(JSON.stringify(data.detail))
  setLoading(false)
  return
}

      // Registration successful
      navigate('/login', { replace: true })

    } catch (error) {
      setError('Could not connect to server')
      setLoading(false)
    }
  }

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center">

      <div className="container">

        <div className="row justify-content-center">

          <div className="col-md-6 col-lg-5">

            <div className="card shadow-sm">

              <div className="card-body p-4">

                <div className="text-center mb-4">

                  <h2 className="fw-bold">
                    SpendWise
                  </h2>

                  <p className="text-muted">
                    Create your account
                  </p>

                </div>

                {error && (
                  <div className="alert alert-danger">
                    {error}
                  </div>
                )}

                <form onSubmit={handleRegister}>

                  <div className="mb-3">

                    <label className="form-label">
                      Name
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />

                  </div>

                  <div className="mb-3">

                    <label className="form-label">
                      Email
                    </label>

                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />

                  </div>

                  <div className="mb-4">

                    <label className="form-label">
                      Password
                    </label>

                    <input
                      type="password"
                      className="form-control"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength="6"
                    />

                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>

                </form>

                <div className="text-center mt-4">

                  <span className="text-muted">
                    Already have an account?{' '}
                  </span>

                  <Link
                    to="/login"
                    className="text-decoration-none"
                  >
                    Login
                  </Link>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Register