import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshWobbleMaterial, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function InteractiveCube({ active, rotationSpeed, position }) {
  const meshRef = useRef()
  const materialRef = useRef()

  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    meshRef.current.rotation.x += delta * rotationSpeed
    meshRef.current.rotation.y += delta * rotationSpeed * 0.5
    
    // Hover effect
    const scale = active ? 1.2 : 1
    meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1)
    
    // Color animation
    if (materialRef.current) {
      const hue = (state.clock.elapsedTime * 0.1) % 1
      materialRef.current.color.setHSL(hue, 0.8, 0.5)
    }
  })

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        ref={materialRef}
        color="#00d4ff"
        metalness={0.6}
        roughness={0.2}
        emissive="#001f3f"
        emissiveIntensity={0.2}
      />
    </mesh>
  )
}

function InteractiveSphere({ active, rotationSpeed, position }) {
  const meshRef = useRef()

  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    meshRef.current.rotation.y += delta * rotationSpeed
    
    // Floating animation
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2
    
    const scale = active ? 1.2 : 1
    meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1)
  })

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <sphereGeometry args={[0.8, 64, 64]} />
      <MeshWobbleMaterial
        color="#ff6b6b"
        speed={2}
        factor={0.3}
        metalness={0.8}
        roughness={0.1}
      />
    </mesh>
  )
}

function InteractiveTorus({ active, rotationSpeed, position }) {
  const meshRef = useRef()

  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    meshRef.current.rotation.x += delta * rotationSpeed
    meshRef.current.rotation.z += delta * rotationSpeed * 0.7
    
    const scale = active ? 1.2 : 1
    meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1)
  })

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <torusGeometry args={[0.7, 0.3, 32, 100]} />
      <MeshDistortMaterial
        color="#4ecdc4"
        speed={3}
        distort={0.4}
        metalness={0.7}
        roughness={0.2}
      />
    </mesh>
  )
}

function InteractiveObjects({ activeObject, rotationSpeed, enableAnimations }) {
  const speed = enableAnimations ? rotationSpeed : 0

  return (
    <group>
      <InteractiveCube 
        active={activeObject === 'cube'}
        rotationSpeed={speed}
        position={[-2, 1, 0]}
      />
      
      <InteractiveSphere 
        active={activeObject === 'sphere'}
        rotationSpeed={speed}
        position={[0, 1, 0]}
      />
      
      <InteractiveTorus 
        active={activeObject === 'torus'}
        rotationSpeed={speed}
        position={[2, 1, 0]}
      />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color="#0a0a0a"
          metalness={0.3}
          roughness={0.8}
        />
      </mesh>
    </group>
  )
}

export default InteractiveObjects
