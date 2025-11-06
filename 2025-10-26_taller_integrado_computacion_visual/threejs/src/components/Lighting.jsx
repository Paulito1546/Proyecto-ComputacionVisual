
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'

/**
 * Optimized Lighting System
 * - Frame-skip logic for better performance
 * - Dynamic shadow quality
 * - Lightweight color animation for night mode
 */
function Lighting({ timeOfDay }) {
  const keyLightRef = useRef()
  const rimLightRef = useRef()
  const frameSkip = useRef(0)

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

  // Animate lights but skip frames to reduce cost
  useFrame((state) => {
    if (!animateLights) return
    if (frameSkip.current++ % 3 !== 0) return // update every 3rd frame (~20 FPS)

    const time = state.clock.getElapsedTime()
    if (keyLightRef.current) {
      keyLightRef.current.position.x = Math.sin(time * 0.2) * 10
      keyLightRef.current.position.z = Math.cos(time * 0.2) * 10
    }

    if (rimLightRef.current && timeOfDay === 'night') {
      rimLightRef.current.intensity = rimIntensity + Math.sin(time * 2) * 0.3
    }
  })

  const isDayTime = timeOfDay === 'day'
  const ambientColor = isDayTime ? '#87ceeb' : '#4a4a6e'
  const keyColor = isDayTime ? '#fff5e6' : '#6a6aff'
  const fillColor = isDayTime ? '#e6f2ff' : '#4e4e7e'
  const rimColor = isDayTime ? '#ffd9b3' : '#ff6b9d'

  return (
    <>
      <ambientLight intensity={isDayTime ? 0.4 : 0.6} color={ambientColor} />

      <directionalLight
        name="MainLight"
        ref={keyLightRef}
        position={[10, 10, 5]}
        intensity={isDayTime ? keyIntensity : keyIntensity * 0.5}
        color={keyColor}
        castShadow
        shadow-mapSize-width={isDayTime ? 1024 : 512}
        shadow-mapSize-height={isDayTime ? 1024 : 512}
        shadow-camera-far={40}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />

      <directionalLight
        position={[-5, 3, -5]}
        intensity={isDayTime ? fillIntensity : fillIntensity * 1.5}
        color={fillColor}
      />

      <spotLight
        ref={rimLightRef}
        position={[0, 8, -10]}
        intensity={rimIntensity}
        color={rimColor}
        angle={0.6}
        penumbra={1}
        castShadow={false}
      />

      <hemisphereLight
        skyColor={isDayTime ? '#87ceeb' : '#3a3a5e'}
        groundColor={isDayTime ? '#8b7355' : '#4a4a4a'}
        intensity={isDayTime ? 0.6 : 0.8}
      />

      {!isDayTime && (
        <>
          <pointLight position={[5, 2, 5]} intensity={0.4} color="#ff9966" distance={8} />
          <pointLight position={[-5, 2, -5]} intensity={0.4} color="#66ccff" distance={8} />
        </>
      )}
    </>
  )
}

export default Lighting

