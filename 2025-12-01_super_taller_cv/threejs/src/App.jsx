import { useState, useEffect, useCallback } from 'react'
import Scene3D from './components/Scene3D'
import HUD from './components/HUD'
import ControlsPanel from './components/ControlsPanel'
import ARView from './components/ARView'
import './App.css'

function App() {
  const [view, setView] = useState('3d') // '3d' or 'ar'
  const [sceneData, setSceneData] = useState({
    objectCount: 0,
    fps: 0,
    activeCamera: 'perspective',
    lightingMode: 'dynamic',
    animationState: 'idle'
  })

  const [sceneConfig, setSceneConfig] = useState({
    enableAnimations: true,
    showGrid: true,
    rotationSpeed: 1,
    lightIntensity: 1,
    activeObject: 'cube'
  })

  useEffect(() => {
    // Simulate FPS monitoring
    const interval = setInterval(() => {
      setSceneData(prev => ({
        ...prev,
        fps: Math.floor(55 + Math.random() * 10)
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleSceneUpdate = useCallback((data) => {
    setSceneData(prev => ({ ...prev, ...data }))
  }, [])

  const handleConfigChange = (config) => {
    setSceneConfig(prev => ({ ...prev, ...config }))
  }

  return (
    <div className="app">
      {view === '3d' ? (
        <Scene3D 
          config={sceneConfig}
          onUpdate={handleSceneUpdate}
        />
      ) : (
        <ARView />
      )}
      
      <HUD data={sceneData} />
      
      <ControlsPanel 
        config={sceneConfig}
        onChange={handleConfigChange}
        onViewChange={setView}
        currentView={view}
      />

      <div className="info-badge">
        <strong>Module C: 3D Visualization</strong><br/>
        Three.js + React Three Fiber
      </div>
    </div>
  )
}

export default App
