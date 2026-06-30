import { useEffect, useRef, useCallback } from 'react'
import { WS_URL } from '../config'

function useWhiteboardSocket(roomCode, onDrawReceived) {
  const ws = useRef(null)  // holds the WebSocket connection

  useEffect(() => {
    if (!roomCode) return

    // Connect to the backend WebSocket
    ws.current = new WebSocket(`${WS_URL}/ws/${roomCode}`)

    ws.current.onopen = () => {
      console.log(`Connected to room: ${roomCode}`)
    }

    // When we receive a drawing event from another user
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      onDrawReceived(data)  // tell the canvas to draw it
    }

    ws.current.onclose = () => {
      console.log('Disconnected from room')
    }

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    // Cleanup: close connection when component unmounts
    return () => {
      ws.current?.close()
    }
  }, [roomCode])

  // Function to send drawing data to the backend
  const sendDrawEvent = useCallback((drawData) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(drawData))
    }
  }, [])

  return { sendDrawEvent }
}

export default useWhiteboardSocket