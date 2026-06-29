import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'

const Canvas = forwardRef(({ tool, color, brushSize }, ref) => {
  const canvasRef = useRef(null)        // direct reference to the canvas element
  const isDrawing = useRef(false)       // is the mouse currently held down?
  const lastPos = useRef({ x: 0, y: 0 }) // where was the mouse last frame?
  const startPos = useRef({ x: 0, y: 0 }) // where did this stroke start? (for shapes)
  const snapshot = useRef(null)         // snapshot of canvas before drawing shape

  const [history, setHistory] = useState([])   // list of saved canvas states (for undo)
  const [historyIndex, setHistoryIndex] = useState(-1) // where in history we are

  // This exposes undo/redo to the parent component (App.jsx)
  useImperativeHandle(ref, () => ({
    undo() {
      if (historyIndex <= 0) return
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const newIndex = historyIndex - 1
      const img = new Image()
      img.src = history[newIndex]
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
      }
      setHistoryIndex(newIndex)
    },
    redo() {
      if (historyIndex >= history.length - 1) return
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const newIndex = historyIndex + 1
      const img = new Image()
      img.src = history[newIndex]
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
      }
      setHistoryIndex(newIndex)
    }
  }))

  // Save canvas state to history after each stroke
  const saveHistory = () => {
    const canvas = canvasRef.current
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(canvas.toDataURL())
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  // Get mouse position relative to canvas
  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const startDrawing = (e) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e)

    isDrawing.current = true
    lastPos.current = pos
    startPos.current = pos

    // For shapes, save a snapshot of canvas BEFORE drawing
    // so we can redraw cleanly as the mouse moves
    if (tool !== 'pencil' && tool !== 'eraser') {
      snapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    }
  }

  const draw = (e) => {
    if (!isDrawing.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e)

    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (tool === 'pencil') {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
      ctx.beginPath()
      ctx.moveTo(lastPos.current.x, lastPos.current.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
      lastPos.current = pos

    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.moveTo(lastPos.current.x, lastPos.current.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
      lastPos.current = pos

    } else {
      // For shapes: restore snapshot first, then draw fresh shape
      // This prevents the "ghost shapes" problem while dragging
      ctx.putImageData(snapshot.current, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color

      const startX = startPos.current.x
      const startY = startPos.current.y

      if (tool === 'rectangle') {
        ctx.beginPath()
        ctx.strokeRect(startX, startY, pos.x - startX, pos.y - startY)

      } else if (tool === 'circle') {
        ctx.beginPath()
        const radius = Math.sqrt(
          Math.pow(pos.x - startX, 2) + Math.pow(pos.y - startY, 2)
        )
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI)
        ctx.stroke()

      } else if (tool === 'line') {
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
      }
    }
  }

  const stopDrawing = () => {
    if (!isDrawing.current) return
    isDrawing.current = false
    saveHistory()
  }

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth - 120}
      height={window.innerHeight}
      style={{ background: 'white', cursor: 'crosshair', display: 'block' }}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
    />
  )
})

export default Canvas