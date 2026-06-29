import { useState, useRef } from 'react'
import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'
import useWhiteboardSocket from './hooks/useWebSocket'
import './App.css'

function App() {
  const [tool, setTool] = useState('pencil')
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(5)
  const [roomCode, setRoomCode] = useState('')
  const [joined, setJoined] = useState(false)
  const [inputCode, setInputCode] = useState('')

  const canvasRef = useRef(null)

  // When we receive a draw event from another user, draw it on canvas
  const handleDrawReceived = (data) => {
    canvasRef.current?.drawFromRemote(data)
  }

  const { sendDrawEvent } = useWhiteboardSocket(
    joined ? roomCode : null,
    handleDrawReceived
  )

  const joinRoom = () => {
    if (inputCode.trim()) {
      setRoomCode(inputCode.trim().toUpperCase())
      setJoined(true)
    }
  }

  // Show join screen if not in a room yet
  if (!joined) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#1a1a2e', gap: '20px'
      }}>
        <h1 style={{ color: '#e94560', fontSize: '2rem' }}>
          Collaborative Whiteboard
        </h1>
        <p style={{ color: '#a8a8b3' }}>Enter a room code to start drawing together</p>
        <input
          value={inputCode}
          onChange={e => setInputCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && joinRoom()}
          placeholder="Enter room code e.g. ABC123"
          style={{
            padding: '12px 20px', fontSize: '16px', borderRadius: '8px',
            border: '2px solid #e94560', background: '#16213e',
            color: 'white', outline: 'none', width: '300px', textAlign: 'center'
          }}
        />
        <button
          onClick={joinRoom}
          style={{
            padding: '12px 40px', fontSize: '16px', borderRadius: '8px',
            background: '#e94560', color: 'white', border: 'none', cursor: 'pointer'
          }}
        >
          Join Room
        </button>
      </div>
    )
  }

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
        {/* Room code display */}
        <div style={{
          position: 'absolute', top: '10px', right: '10px',
          background: '#1a1a2e', color: '#e94560',
          padding: '8px 15px', borderRadius: '8px',
          fontSize: '14px', fontWeight: 'bold', zIndex: 10
        }}>
          Room: {roomCode}
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