import { useState } from 'react'
import axios from 'axios'

//const API = 'http://localhost:8000'
import { API_URL } from '../config'
function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const getAuthErrorMessage = (err) => {
    if (!err.response) return 'Backend is unreachable. Start backend/ngrok and try again.'
    return err.response?.data?.detail || 'Something went wrong'
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const url = isLogin ? `${API_URL}/auth/login` : `${API_URL}/auth/register`
      const body = isLogin
        ? { email, password }
        : { email, password, display_name: displayName }

      const res = await axios.post(url, body)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      onLogin(res.data.user)
    } catch (err) {
      setError(getAuthErrorMessage(err))
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '300px', padding: '12px 16px', fontSize: '15px',
    borderRadius: '8px', border: '2px solid #2a2a4a',
    background: '#16213e', color: 'white', outline: 'none'
  }

  const buttonStyle = {
    width: '300px', padding: '12px', fontSize: '15px',
    borderRadius: '8px', background: '#e94560',
    color: 'white', border: 'none', cursor: 'pointer',
    opacity: loading ? 0.7 : 1
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', background: '#1a1a2e', gap: '15px'
    }}>
      <h1 style={{ color: '#e94560', marginBottom: '10px' }}>
        Collaborative Whiteboard
      </h1>

      <div style={{
        background: '#16213e', padding: '40px', borderRadius: '12px',
        display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center'
      }}>
        <h2 style={{ color: 'white', margin: 0 }}>
          {isLogin ? 'Login' : 'Register'}
        </h2>

        {!isLogin && (
          <input
            placeholder="Display Name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            style={inputStyle}
          />
        )}

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={inputStyle}
        />

        {error && (
          <p style={{ color: '#e94560', margin: 0, fontSize: '14px' }}>{error}</p>
        )}

        <button onClick={handleSubmit} style={buttonStyle} disabled={loading}>
          {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
        </button>

        <p
          onClick={() => { setIsLogin(!isLogin); setError('') }}
          style={{ color: '#a8a8b3', cursor: 'pointer', margin: 0, fontSize: '14px' }}
        >
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </p>
      </div>
    </div>
  )
}

export default Auth