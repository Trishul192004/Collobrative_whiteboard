import { useState, useRef, useEffect } from 'react'
import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'
import Auth from './components/Auth'
import Lobby from './components/Lobby'
import useWhiteboardSocket from './hooks/useWebSocket'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [roomCode, setRoomCode] = useState(null)
  const [tool, setTool] = useState('pencil')
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(5)

  const canvasRef = useRef(null)

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')

    if (!savedToken) {
      localStorage.removeItem('user')
      return
    }

    if (savedUser) setUser(JSON.parse(savedUser))
  }, [])

  const handleDrawReceived = (data) => {
    canvasRef.current?.drawFromRemote(data)
  }

  const { sendDrawEvent } = useWhiteboardSocket(
    roomCode,
    handleDrawReceived
  )

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setRoomCode(null)
  }

  // Page 1: Not logged in
  if (!user) {
    return <Auth onLogin={setUser} />
  }

  // Page 2: Logged in but not in a room
  if (!roomCode) {
    return (
      <Lobby
        user={user}
        onJoinRoom={setRoomCode}
        onLogout={handleLogout}
      />
    )
  }

  // Page 3: In the whiteboard room
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Toolbar
        tool={tool} setTool={setTool}
        color={color} setColor={setColor}
        brushSize={brushSize} setBrushSize={setBrushSize}
        onUndo={() => canvasRef.current?.undo()}
        onRedo={() => canvasRef.current?.redo()}
      />
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '10px', right: '10px',
          background: '#1a1a2e', color: '#e94560',
          padding: '8px 15px', borderRadius: '8px',
          fontSize: '14px', fontWeight: 'bold', zIndex: 10,
          display: 'flex', gap: '15px', alignItems: 'center'
        }}>
          <span>Room: {roomCode}</span>
          <span style={{ color: '#a8a8b3' }}>|</span>
          <span>{user.display_name}</span>
          <span
            onClick={() => setRoomCode(null)}
            style={{ color: '#a8a8b3', cursor: 'pointer', fontSize: '12px' }}
          >
            Leave
          </span>
        </div>
        <Canvas
          ref={canvasRef}
          tool={tool}
          color={color}
          brushSize={brushSize}
          sendDrawEvent={sendDrawEvent}
          roomCode={roomCode}
        />
      </div>
    </div>
  )
}

export default App