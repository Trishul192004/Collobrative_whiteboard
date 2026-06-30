import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'

const Canvas = forwardRef(({ tool, color, brushSize, sendDrawEvent, roomCode }, ref) => {
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const startPos = useRef({ x: 0, y: 0 })
  const snapshot = useRef(null)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  useImperativeHandle(ref, () => ({
    clear() {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    saveHistory()
      },
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
    },

    // This is called when we receive a draw event from another user
    drawFromRemote(data) {

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (data.type === 'clear') {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      return
        }

      ctx.lineWidth = data.brushSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = data.color

      if (data.type === 'draw' && data.tool === 'pencil') {
        ctx.globalCompositeOperation = 'source-over'
        ctx.beginPath()
        ctx.moveTo(data.from.x, data.from.y)
        ctx.lineTo(data.to.x, data.to.y)
        ctx.stroke()

      } else if (data.type === 'draw' && data.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.beginPath()
        ctx.moveTo(data.from.x, data.from.y)
        ctx.lineTo(data.to.x, data.to.y)
        ctx.stroke()

      } else if (data.type === 'shape_done') {
        ctx.globalCompositeOperation = 'source-over'
        if (data.tool === 'rectangle') {
          ctx.beginPath()
          ctx.strokeRect(data.startPos.x, data.startPos.y,
            data.endPos.x - data.startPos.x,
            data.endPos.y - data.startPos.y)
        } else if (data.tool === 'circle') {
          const radius = Math.sqrt(
            Math.pow(data.endPos.x - data.startPos.x, 2) +
            Math.pow(data.endPos.y - data.startPos.y, 2)
          )
          ctx.beginPath()
          ctx.arc(data.startPos.x, data.startPos.y, radius, 0, 2 * Math.PI)
          ctx.stroke()
        } else if (data.tool === 'line') {
          ctx.beginPath()
          ctx.moveTo(data.startPos.x, data.startPos.y)
          ctx.lineTo(data.endPos.x, data.endPos.y)
          ctx.stroke()
        }
      }
    }
  }))

  const saveHistory = () => {
    const canvas = canvasRef.current
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(canvas.toDataURL())
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

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

      // Send this stroke segment to backend
      sendDrawEvent({
        type: 'draw',
        tool: 'pencil',
        from: lastPos.current,
        to: pos,
        color,
        brushSize
      })
      lastPos.current = pos

    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.moveTo(lastPos.current.x, lastPos.current.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()

      sendDrawEvent({
        type: 'draw',
        tool: 'eraser',
        from: lastPos.current,
        to: pos,
        color,
        brushSize
      })
      lastPos.current = pos

    } else {
      ctx.putImageData(snapshot.current, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color

      const startX = startPos.current.x
      const startY = startPos.current.y

      if (tool === 'rectangle') {
        ctx.beginPath()
        ctx.strokeRect(startX, startY, pos.x - startX, pos.y - startY)
      } else if (tool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(pos.x - startX, 2) + Math.pow(pos.y - startY, 2)
        )
        ctx.beginPath()
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

  const stopDrawing = (e) => {
    if (!isDrawing.current) return
    isDrawing.current = false

    // Send final shape position when mouse is released
    if (tool !== 'pencil' && tool !== 'eraser') {
      const pos = getPos(e)
      sendDrawEvent({
        type: 'shape_done',
        tool,
        startPos: startPos.current,
        endPos: pos,
        color,
        brushSize
      })
    }
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