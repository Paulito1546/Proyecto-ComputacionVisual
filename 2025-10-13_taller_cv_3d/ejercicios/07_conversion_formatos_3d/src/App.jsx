import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'
import Scene from './components/Scene'
import Controls from './components/Controls'
import HUD from './components/HUD'
import ComparisonTable from './components/ComparisonTable'
import './App.css'

function App() {
  const [currentFormat, setCurrentFormat] = useState('gltf')
  const [showWireframe, setShowWireframe] = useState(false)
  const [showTable, setShowTable] = useState(false)
  const [modelStats, setModelStats] = useState(null)

  return (
    <div className="app-container">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[3, 3, 3]} />
        <color attach="background" args={['#1a1a1a']} />
        
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Environment preset="sunset" />
        
        <Suspense fallback={null}>
          <Scene
            format={currentFormat}
            showWireframe={showWireframe}
            onStatsUpdate={setModelStats}
          />
        </Suspense>
        
        <gridHelper args={[20, 20, '#444444', '#222222']} />
        
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={20}
        />
      </Canvas>
      
      <Controls
        currentFormat={currentFormat}
        onFormatChange={setCurrentFormat}
        showWireframe={showWireframe}
        onWireframeToggle={setShowWireframe}
        onTableToggle={() => setShowTable(!showTable)}
      />
      
      <HUD stats={modelStats} currentFormat={currentFormat} />
      
      {showTable && (
        <ComparisonTable onClose={() => setShowTable(false)} />
      )}
    </div>
  )
}

export default App
