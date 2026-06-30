const COLORS = [
  '#000000', '#ffffff', '#e94560',
  '#f5a623', '#f8e71c', '#7ed321',
  '#4a90e2', '#9013fe', '#8B4513'
]

function Toolbar({ tool, setTool, color, setColor, brushSize, setBrushSize, onUndo, onRedo, onClear }) {
  return (
    <div style={{
      width: '110px',
      height: '100vh',
      background: '#1a1a2e',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '15px 5px',
      gap: '10px',
      boxShadow: '2px 0 10px rgba(0,0,0,0.3)'
    }}>

      {/* Drawing Tools */}
      <p style={{ color: '#a8a8b3', fontSize: '11px', margin: 0 }}>TOOLS</p>

      {['pencil', 'eraser', 'rectangle', 'circle', 'line'].map(t => (
        <button
          key={t}
          onClick={() => setTool(t)}
          style={{
            width: '90px',
            padding: '8px 4px',
            background: tool === t ? '#e94560' : '#16213e',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            textTransform: 'capitalize'
          }}
        >
          {t === 'pencil' && '✏️ Pencil'}
          {t === 'eraser' && '◻️ Eraser'}
          {t === 'rectangle' && '⬜ Rect'}
          {t === 'circle' && '⭕ Circle'}
          {t === 'line' && '➖ Line'}
        </button>
      ))}

      {/* Color Palette */}
      <p style={{ color: '#a8a8b3', fontSize: '11px', margin: '10px 0 0 0' }}>COLOR</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center' }}>
        {COLORS.map(c => (
          <div
            key={c}
            onClick={() => setColor(c)}
            style={{
              width: '24px',
              height: '24px',
              background: c,
              borderRadius: '50%',
              cursor: 'pointer',
              border: color === c ? '3px solid #e94560' : '2px solid #444',
            }}
          />
        ))}
      </div>

      {/* Custom Color Picker */}
      <input
        type="color"
        value={color}
        onChange={e => setColor(e.target.value)}
        style={{ width: '90px', height: '35px', cursor: 'pointer', border: 'none', background: 'none' }}
      />

      {/* Brush Size */}
      <p style={{ color: '#a8a8b3', fontSize: '11px', margin: '10px 0 0 0' }}>SIZE: {brushSize}px</p>

      <input
        type="range"
        min="1"
        max="50"
        value={brushSize}
        onChange={e => setBrushSize(parseInt(e.target.value))}
        style={{ width: '90px' }}
      />

      {/* Undo / Redo */}
      <p style={{ color: '#a8a8b3', fontSize: '11px', margin: '10px 0 0 0' }}>HISTORY</p>

      <button onClick={onUndo} style={{
        width: '90px', padding: '8px', background: '#16213e',
        color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
      }}>↩️ Undo</button>

      <button onClick={onRedo} style={{
        width: '90px', padding: '8px', background: '#16213e',
        color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
      }}>↪️ Redo</button>

      <button onClick={onClear} style={{
      width: '90px', padding: '8px', background: '#7a1f2b',
      color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
      marginTop: '10px'
      }}>🗑️ Clear All</button>

    </div>
  )
}

export default Toolbar