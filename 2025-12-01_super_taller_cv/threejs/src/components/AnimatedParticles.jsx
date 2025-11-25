import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function AnimatedParticles() {
  const particlesRef = useRef()
  const particleCount = 200

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = Math.random() * 5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    
    return positions
  }, [particleCount])

  const particlesColor = useMemo(() => {
    const colors = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      const color = new THREE.Color()
      color.setHSL(Math.random(), 0.8, 0.6)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    
    return colors
  }, [particleCount])

  useFrame((state) => {
    if (!particlesRef.current) return

    const positions = particlesRef.current.attributes.position.array
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Wave motion
      positions[i3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.002
      
      // Circular motion
      positions[i3] += Math.cos(state.clock.elapsedTime * 0.5 + i) * 0.003
      positions[i3 + 2] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.003
      
      // Reset particles that go too low
      if (positions[i3 + 1] < -1) {
        positions[i3 + 1] = 5
      }
    }
    
    particlesRef.current.attributes.position.needsUpdate = true
  })

  return (
    <points>
      <bufferGeometry ref={particlesRef}>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particlesPosition}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={particlesColor}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default AnimatedParticles
