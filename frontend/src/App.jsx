import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...')

  // This runs once when the app loads
  useEffect(() => {
    axios.get('http://localhost:8000/test')
      .then(response => {
        setBackendStatus(response.data.data)
      })
      .catch(error => {
        setBackendStatus('Backend not reachable!')
      })
  }, [])

  return (
    <div className="app">
      <h1>Collaborative Whiteboard</h1>
      <p>Backend status: {backendStatus}</p>
    </div>
  )
}

export default App