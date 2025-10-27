import { Canvas } from '@react-three/fiber'
import { useControls } from 'leva'
import Scene from './components/Scene'
import './App.css'

/**
 * Synesthetic Garden - Main Application
 */
function App() {
  // Global controls for day/night cycle and camera type
  const { timeOfDay, cameraType, showDepth } = useControls('Global Controls', {
    timeOfDay: {
      value: 'day',
      options: ['day', 'night'],
      label: 'Time of Day'
    },
    cameraType: {
      value: 'perspective',
      options: ['perspective', 'orthographic'],
      label: 'Camera Type'
    },
    showDepth: {
      value: false,
      label: 'Show Depth Visualization'
    }
  })

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 5, 15], fov: 60 }}
        shadows
      >
        <Scene 
          timeOfDay={timeOfDay} 
          cameraType={cameraType}
          showDepth={showDepth}
        />
      </Canvas>
      
      {/* UI Overlay */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        fontFamily: 'monospace',
        textShadow: '1px 1px 2px black',
        pointerEvents: 'none'
      }}>
        <h2>🌿 Synesthetic Garden</h2>
        <p>Time: {timeOfDay === 'day' ? '☀️ Day' : '🌙 Night'}</p>
        <p>Camera: {cameraType === 'perspective' ? '📷 Perspective' : '📐 Orthographic'}</p>
        {showDepth && <p>🎨 Depth Mode Active</p>}
      </div>
    </div>
  )
}

export default App
