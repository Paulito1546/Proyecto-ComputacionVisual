import { useEffect, useRef } from 'react'
import { OrbitControls, PerspectiveCamera, OrthographicCamera } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import Lighting from './Lighting'
import Ground from './Ground'
import Skybox360 from './Skybox360'
import PlantModels from './PlantModels'
import DepthVisualization from './DepthVisualization'
import ModelPreloader from './ModelPreloader'

/**
 * Main scene component
 * Orchestrates all elements: lighting, models, skybox, and camera controls
 */
function Scene({ timeOfDay, cameraType, showDepth }) {
  const { camera, size } = useThree()
  const controlsRef = useRef()

  useEffect(() => {
    if (cameraType === 'orthographic' && camera.isOrthographicCamera) {
      const aspect = size.width / size.height
      const viewSize = 40 // Controls how much you can see (lower = more zoom, higher = less zoom)
      camera.left = -viewSize * aspect
      camera.right = viewSize * aspect
      camera.top = viewSize
      camera.bottom = -viewSize
      camera.near = 0.1
      camera.far = 2000 // Increased to see the entire skybox
      camera.updateProjectionMatrix()
    }
  }, [cameraType, camera, size])

  return (
    <>
      {/* Preload 3D models for better performance */}
      <ModelPreloader />
      
      {/* Camera Controls */}
      {cameraType === 'perspective' ? (
        <PerspectiveCamera makeDefault position={[0, 5, 15]} fov={60} />
      ) : (
        <OrthographicCamera 
          makeDefault 
          position={[0, 50, 100]} 
          near={0.1}
          far={2000}
        />
      )}
      
      <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        zoomToCursor={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={3}
        maxDistance={150}
      />

      {/* 360° Skybox/Panorama */}
      <Skybox360 timeOfDay={timeOfDay} />

      {/* Lighting System (Key, Fill, Rim, HDRI) */}
      <Lighting timeOfDay={timeOfDay} />

      {/* Ground with PBR materials */}
      <Ground timeOfDay={timeOfDay} />

      {/* 3D Plant and Crystal Models from GLB files */}
      <PlantModels timeOfDay={timeOfDay} />

      {/* Depth Visualization */}
      {showDepth && <DepthVisualization />}
    </>
  )
}

export default Scene
