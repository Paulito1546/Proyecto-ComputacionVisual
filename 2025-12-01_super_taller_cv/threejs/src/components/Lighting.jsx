import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

function Lighting({ intensity }) {
  const directionalLightRef = useRef()
  const spotLightRef = useRef()

  useFrame((state) => {
    if (directionalLightRef.current) {
      // Animate directional light
      const time = state.clock.elapsedTime
      directionalLightRef.current.position.x = Math.sin(time * 0.5) * 3
      directionalLightRef.current.position.z = Math.cos(time * 0.5) * 3
    }

    if (spotLightRef.current) {
      // Rotate spotlight
      const time = state.clock.elapsedTime
      spotLightRef.current.position.x = Math.cos(time * 0.7) * 4
      spotLightRef.current.position.z = Math.sin(time * 0.7) * 4
    }
  })

  return (
    <>
      {/* Ambient Light */}
      <ambientLight intensity={0.3 * intensity} />

      {/* Directional Light (sun-like) */}
      <directionalLight
        ref={directionalLightRef}
        position={[3, 5, 2]}
        intensity={1 * intensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Spotlight */}
      <spotLight
        ref={spotLightRef}
        position={[4, 6, 2]}
        angle={0.4}
        penumbra={0.5}
        intensity={0.8 * intensity}
        castShadow
        color="#00d4ff"
      />

      {/* Point lights for accent */}
      <pointLight position={[-3, 2, -3]} intensity={0.5 * intensity} color="#ff6b6b" />
      <pointLight position={[3, 2, -3]} intensity={0.5 * intensity} color="#4ecdc4" />
    </>
  )
}

export default Lighting
