import { useState } from 'react'
import { useNavigate ,Link} from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || 'Login failed')
        return
      }

      localStorage.setItem('token', data.access_token)

      navigate('/dashboard')
    } catch (error) {
      setError('Could not connect to server')
    }
  }

  return (
    <div className="container mt-5" style={{ maxWidth: '450px' }}>
      <h2 className="mb-4">Login to SpendWise</h2>

      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label className="form-label">Email</label>

          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>

          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="btn btn-primary w-100">
          Login
        </button>
      </form>
      <div className="text-center mt-4">

  <span className="text-muted">
    Don't have an account?{' '}
  </span>

  <Link
    to="/register"
    className="text-decoration-none"
  >
    Create Account
  </Link>

</div>

      {error && (
        <div className="alert alert-danger mt-3">
          {error}
        </div>
      )}
    </div>
  )
}


export default Login