import { useState, useRef } from 'react'
import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'
import './App.css'

function App() {
  // These are the shared states — Toolbar controls them, Canvas uses them
  const [tool, setTool] = useState('pencil')
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(5)

  // This gives us direct access to Canvas's undo/redo functions
  const canvasRef = useRef(null)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Toolbar
        tool={tool} setTool={setTool}
        color={color} setColor={setColor}
        brushSize={brushSize} setBrushSize={setBrushSize}
        onUndo={() => canvasRef.current?.undo()}
        onRedo={() => canvasRef.current?.redo()}
      />
      <Canvas
        ref={canvasRef}
        tool={tool}
        color={color}
        brushSize={brushSize}
      />
    </div>
  )
}

export default App