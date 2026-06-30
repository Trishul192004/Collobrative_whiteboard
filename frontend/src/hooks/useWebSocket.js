import { useEffect, useRef, useCallback } from 'react'
import { WS_URL } from '../config'

function useWhiteboardSocket(roomCode, username, onDrawReceived, onUserListReceived) {
  const ws = useRef(null)

  useEffect(() => {
    if (!roomCode) return

    ws.current = new WebSocket(`${WS_URL}/ws/${roomCode}?username=${encodeURIComponent(username)}`)

    ws.current.onopen = () => {
      console.log(`Connected to room: ${roomCode}`)
    }

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'user_list') {
        onUserListReceived(data.users)
      } else {
        onDrawReceived(data)
      }
    }

    ws.current.onclose = () => {
      console.log('Disconnected from room')
    }

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => {
      ws.current?.close()
    }
  }, [roomCode])

  const sendDrawEvent = useCallback((drawData) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(drawData))
    }
  }, [])

  return { sendDrawEvent }
}

export default useWhiteboardSocket