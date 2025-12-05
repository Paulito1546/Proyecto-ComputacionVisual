import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, Grid, Stats } from '@react-three/drei'
import { Suspense, useEffect } from 'react'
import InteractiveObjects from './InteractiveObjects'
import Lighting from './Lighting'
import AnimatedParticles from './AnimatedParticles'

function Scene3D({ config, onUpdate }) {
  useEffect(() => {
    onUpdate({
      objectCount: 5,
      activeCamera: 'perspective',
      lightingMode: 'dynamic',
      animationState: config.enableAnimations ? 'active' : 'paused'
    })
  }, [config.enableAnimations, onUpdate])

  return (
    <Canvas shadows>
      <Suspense fallback={null}>
        {/* Camera */}
        <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={75} />
        
        {/* Controls */}
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          minDistance={3}
          maxDistance={20}
        />

        {/* Lighting */}
        <Lighting intensity={config.lightIntensity} />

        {/* Environment */}
        <Environment preset="sunset" />

        {/* Grid */}
        {config.showGrid && (
          <Grid 
            args={[20, 20]} 
            cellSize={0.5}
            cellThickness={0.5}
            cellColor="#6e6e6e"
            sectionSize={2}
            sectionThickness={1}
            sectionColor="#00d4ff"
            fadeDistance={25}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid
          />
        )}

        {/* Interactive Objects */}
        <InteractiveObjects 
          activeObject={config.activeObject}
          rotationSpeed={config.rotationSpeed}
          enableAnimations={config.enableAnimations}
        />

        {/* Animated Particles */}
        {config.enableAnimations && <AnimatedParticles />}

        {/* Performance Stats */}
        <Stats />
      </Suspense>
    </Canvas>
  )
}

export default Scene3D
