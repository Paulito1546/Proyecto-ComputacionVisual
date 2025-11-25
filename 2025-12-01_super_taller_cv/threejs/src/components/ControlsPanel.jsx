import { useState } from 'react'

function ControlsPanel({ config, onChange, onViewChange, currentView }) {
  const [expanded, setExpanded] = useState(true)

  const handleToggleAnimations = () => {
    onChange({ enableAnimations: !config.enableAnimations })
  }

  const handleToggleGrid = () => {
    onChange({ showGrid: !config.showGrid })
  }

  const handleObjectChange = (object) => {
    onChange({ activeObject: object })
  }

  const handleSpeedChange = (e) => {
    onChange({ rotationSpeed: parseFloat(e.target.value) })
  }

  const handleLightChange = (e) => {
    onChange({ lightIntensity: parseFloat(e.target.value) })
  }

  return (
    <div className="controls-panel">
      <h3 onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
        ⚙️ Controls {expanded ? '▼' : '▶'}
      </h3>
      
      {expanded && (
        <>
          <div style={{ marginBottom: '10px' }}>
            <button onClick={() => onViewChange(currentView === '3d' ? 'ar' : '3d')}>
              {currentView === '3d' ? '📱 AR View' : '🎮 3D View'}
            </button>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong>Objects:</strong>
            <div>
              <button 
                onClick={() => handleObjectChange('cube')}
                style={{ background: config.activeObject === 'cube' ? 'rgba(0, 212, 255, 0.6)' : undefined }}
              >
                Cube
              </button>
              <button 
                onClick={() => handleObjectChange('sphere')}
                style={{ background: config.activeObject === 'sphere' ? 'rgba(0, 212, 255, 0.6)' : undefined }}
              >
                Sphere
              </button>
              <button 
                onClick={() => handleObjectChange('torus')}
                style={{ background: config.activeObject === 'torus' ? 'rgba(0, 212, 255, 0.6)' : undefined }}
              >
                Torus
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <button onClick={handleToggleAnimations}>
              {config.enableAnimations ? '⏸️ Pause' : '▶️ Play'} Animations
            </button>
            <button onClick={handleToggleGrid}>
              {config.showGrid ? '🚫' : '✅'} Grid
            </button>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
              Rotation Speed: {config.rotationSpeed.toFixed(1)}x
            </label>
            <input 
              type="range" 
              min="0" 
              max="3" 
              step="0.1" 
              value={config.rotationSpeed}
              onChange={handleSpeedChange}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
              Light Intensity: {config.lightIntensity.toFixed(1)}x
            </label>
            <input 
              type="range" 
              min="0.1" 
              max="3" 
              step="0.1" 
              value={config.lightIntensity}
              onChange={handleLightChange}
              style={{ width: '100%' }}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default ControlsPanel
