import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'

/**
 * Demonstrates albedo, roughness, metalness, normal map concepts
 * Uses procedural textures for demonstration
 */
function Ground({ timeOfDay }) {
  const meshRef = useRef()
  
  const { 
    roughness, 
    metalness,
    animateMaterial 
  } = useControls('Ground Material (PBR)', {
    roughness: { value: 0.8, min: 0, max: 1, step: 0.01 },
    metalness: { value: 0.1, min: 0, max: 1, step: 0.01 },
    animateMaterial: false
  })

  // Animate material properties
  useFrame((state) => {
    if (animateMaterial && meshRef.current) {
      const time = state.clock.getElapsedTime()
      meshRef.current.material.roughness = roughness + Math.sin(time) * 0.2
    }
  })

  // Create procedural albedo texture for ground
  const createGroundTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    
    // Base color (grass-like)
    const baseColor = timeOfDay === 'day' ? '#4a7c59' : '#2d4a3a'
    ctx.fillStyle = baseColor
    ctx.fillRect(0, 0, 512, 512)
    
    // Add noise/variation
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      const brightness = Math.random() * 30 - 15
      ctx.fillStyle = `rgba(${70 + brightness}, ${124 + brightness}, ${89 + brightness}, 0.3)`
      ctx.fillRect(x, y, 2, 2)
    }
    
    return new THREE.CanvasTexture(canvas)
  }

  // Create procedural normal map
  const createNormalMap = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    
    // Base normal color (pointing up: RGB = 128, 128, 255)
    ctx.fillStyle = '#8080ff'
    ctx.fillRect(0, 0, 512, 512)
    
    // Add bumps/variations
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      const size = Math.random() * 8 + 2
      
      // Create circular gradient for bump
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size)
      gradient.addColorStop(0, '#a0a0ff')
      gradient.addColorStop(0.5, '#8080ff')
      gradient.addColorStop(1, '#6060e0')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
    
    return new THREE.CanvasTexture(canvas)
  }

  const groundTexture = createGroundTexture()
  groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping
  groundTexture.repeat.set(20, 20)

  const normalMap = createNormalMap()
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping
  normalMap.repeat.set(20, 20)

  return (
    <mesh 
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0, 0]}
      receiveShadow
    >
      <circleGeometry args={[100, 64]} />
      <meshStandardMaterial
        map={groundTexture}
        normalMap={normalMap}
        normalScale={[0.5, 0.5]}
        roughness={roughness}
        metalness={metalness}
        color={timeOfDay === 'day' ? '#ffffff' : '#cccccc'}
        // PBR properties: albedo (map), normal map, roughness, metalness
      />
    </mesh>
  )
}

export default Ground
