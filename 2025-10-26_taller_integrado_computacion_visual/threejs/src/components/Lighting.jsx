import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'

/**
 * Implements multiple light types: key, fill, rim, ambient
 * Animates light intensity and color based on time of day
 */
function Lighting({ timeOfDay }) {
  const keyLightRef = useRef()
  const rimLightRef = useRef()
  
  // Advanced lighting controls
  const { 
    keyIntensity, 
    fillIntensity, 
    rimIntensity,
    animateLights
  } = useControls('Lighting', {
    keyIntensity: { value: 1.5, min: 0, max: 5, step: 0.1 },
    fillIntensity: { value: 0.5, min: 0, max: 2, step: 0.1 },
    rimIntensity: { value: 0.8, min: 0, max: 3, step: 0.1 },
    animateLights: true
  })

  // Animate lights based on time of day
  useFrame((state) => {
    if (!animateLights) return
    
    const time = state.clock.getElapsedTime()
    
    if (keyLightRef.current) {
      // Subtle rotation for dynamic shadows
      keyLightRef.current.position.x = Math.sin(time * 0.2) * 10
      keyLightRef.current.position.z = Math.cos(time * 0.2) * 10
    }
    
    if (rimLightRef.current && timeOfDay === 'night') {
      // Pulsating rim light at night
      rimLightRef.current.intensity = rimIntensity + Math.sin(time * 2) * 0.3
    }
  })

  // Day/Night color schemes
  const isDayTime = timeOfDay === 'day'
  const ambientColor = isDayTime ? '#87ceeb' : '#4a4a6e'
  const keyColor = isDayTime ? '#fff5e6' : '#6a6aff'
  const fillColor = isDayTime ? '#e6f2ff' : '#4e4e7e'
  const rimColor = isDayTime ? '#ffd9b3' : '#ff6b9d'

  return (
    <>
      {/* Ambient Light - base illumination */}
      <ambientLight 
        intensity={isDayTime ? 0.4 : 0.6} 
        color={ambientColor}
      />

      {/* Key Light - main directional light (sun/moon) */}
      <directionalLight
        ref={keyLightRef}
        position={[10, 10, 5]}
        intensity={isDayTime ? keyIntensity : keyIntensity * 0.5}
        color={keyColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Fill Light - softens shadows */}
      <directionalLight
        position={[-5, 3, -5]}
        intensity={isDayTime ? fillIntensity : fillIntensity * 1.5}
        color={fillColor}
      />

      {/* Rim Light - edge highlighting */}
      <spotLight
        ref={rimLightRef}
        position={[0, 8, -10]}
        intensity={rimIntensity}
        color={rimColor}
        angle={0.6}
        penumbra={1}
        castShadow={isDayTime}
      />

      {/* Hemisphere Light - simulates sky/ground bounce */}
      <hemisphereLight
        skyColor={isDayTime ? '#87ceeb' : '#3a3a5e'}
        groundColor={isDayTime ? '#8b7355' : '#4a4a4a'}
        intensity={isDayTime ? 0.6 : 0.8}
      />

      {/* Additional Point Lights for night atmosphere */}
      {!isDayTime && (
        <>
          <pointLight 
            position={[5, 2, 5]} 
            intensity={0.5} 
            color="#ff9966"
            distance={10}
          />
          <pointLight 
            position={[-5, 2, -5]} 
            intensity={0.5} 
            color="#66ccff"
            distance={10}
          />
        </>
      )}
    </>
  )
}

export default Lighting
