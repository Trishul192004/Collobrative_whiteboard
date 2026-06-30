import { useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000'

function Lobby({ user, onJoinRoom, onLogout }) {
  const [roomCode, setRoomCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const createRoom = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await axios.post(`${API}/rooms/create`, {}, { headers })
      onJoinRoom(res.data.room_code)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not create room')
    }
    setLoading(false)
  }

  const joinRoom = async () => {
    if (!roomCode.trim()) return
    setError('')
    setLoading(true)
    try {
      const res = await axios.post(`${API}/rooms/join/${roomCode.trim()}`, {}, { headers })
      onJoinRoom(res.data.room_code)
    } catch (err) {
      setError(err.response?.data?.detail || 'Room not found')
    }
    setLoading(false)
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', background: '#1a1a2e', gap: '20px'
    }}>
      <h1 style={{ color: '#e94560' }}>Collaborative Whiteboard</h1>
      <p style={{ color: '#a8a8b3', margin: 0 }}>Welcome, {user.display_name}!</p>

      <div style={{
        background: '#16213e', padding: '40px', borderRadius: '12px',
        display: 'flex', flexDirection: 'column', gap: '15px',
        alignItems: 'center', minWidth: '350px'
      }}>
        <button
          onClick={createRoom}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', fontSize: '15px',
            borderRadius: '8px', background: '#e94560',
            color: 'white', border: 'none', cursor: 'pointer'
          }}
        >
          🎨 Create New Room
        </button>

        <p style={{ color: '#a8a8b3', margin: '5px 0' }}>— or join existing —</p>

        <input
          placeholder="Enter room code e.g. ABC123"
          value={roomCode}
          onChange={e => setRoomCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && joinRoom()}
          style={{
            width: '100%', padding: '12px 16px', fontSize: '15px',
            borderRadius: '8px', border: '2px solid #2a2a4a',
            background: '#0f3460', color: 'white', outline: 'none',
            textAlign: 'center', letterSpacing: '3px', fontWeight: 'bold',
            boxSizing: 'border-box'
          }}
        />

        <button
          onClick={joinRoom}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', fontSize: '15px',
            borderRadius: '8px', background: '#16213e',
            color: 'white', border: '2px solid #e94560', cursor: 'pointer'
          }}
        >
          Join Room
        </button>

        {error && (
          <p style={{ color: '#e94560', margin: 0, fontSize: '14px' }}>{error}</p>
        )}
      </div>

      <p
        onClick={onLogout}
        style={{ color: '#a8a8b3', cursor: 'pointer', fontSize: '14px' }}
      >
        Logout
      </p>
    </div>
  )
}

export default Lobby