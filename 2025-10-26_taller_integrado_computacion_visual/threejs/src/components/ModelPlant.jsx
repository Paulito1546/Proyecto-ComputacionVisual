import { useGLTF } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Component to load and display a single 3D plant/crystal model
 * Supports GLB format with animations and emissive materials
 * Automatically normalizes model size based on bounding box
 * Now supports onClick for interactivity
 */
function ModelPlant({ 
  modelPath, 
  position, 
  scale = 1, 
  rotation = [0, 0, 0],
  timeOfDay,
  animatePlants,
  seedOffset = 0,
  targetSize = 2, // Desired height/size in units
  onClick // New prop for click handling
}) {
  const groupRef = useRef()
  
  console.log('ModelPlant loading:', modelPath)
  
  const { scene } = useGLTF(modelPath)
  
  console.log('Model loaded successfully:', modelPath)
  
  // Clone the scene and calculate normalized scale
  const { clonedScene, normalizedScale, pivotOffset } = useMemo(() => {
    const cloned = scene.clone()
    
    // If targetSize is not provided, use scale 1 (original size)
    if (!targetSize) {
      return { clonedScene: cloned, normalizedScale: 1, pivotOffset: 0 }
    }
    
    // Calculate bounding box to get actual model size
    const box = new THREE.Box3().setFromObject(cloned)
    const size = new THREE.Vector3()
    box.getSize(size)
    
    // Get the largest dimension
    const maxDimension = Math.max(size.x, size.y, size.z)
    
    // Calculate scale factor to normalize to target size
    const scaleFactor = maxDimension > 0 ? targetSize / maxDimension : 1
    
    // Calculate how far the bottom of the model is from the origin
    const bottomY = box.min.y * scaleFactor
    
    console.log('Model normalization:', {
      path: modelPath,
      boundingBox: size,
      boxMin: box.min,
      maxDimension,
      scaleFactor,
      targetSize,
      bottomY,
      pivotOffset: -bottomY
    })
    
    return { 
      clonedScene: cloned, 
      normalizedScale: scaleFactor,
      pivotOffset: -bottomY // Lift to place bottom at origin
    }
  }, [scene, targetSize, modelPath])
  
  // Apply emissive properties for night mode
  useFrame((state) => {
    if (!groupRef.current) return
    
    const time = state.clock.getElapsedTime()
    
    // Gentle swaying animation
    if (animatePlants) {
      groupRef.current.rotation.z = Math.sin(time + seedOffset) * 0.05
      groupRef.current.rotation.x = Math.cos(time * 0.5 + seedOffset) * 0.02
    }
    
    // Update emissive intensity for night mode
    if (timeOfDay === 'night') {
      groupRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((mat) => {
            if (mat.emissive) {
              // Pulsating glow effect
              const pulse = Math.sin(time * 2 + seedOffset) * 0.3 + 0.7
              mat.emissiveIntensity = pulse * 0.5
            }
          })
        }
      })
    }
  })
  
  // Set up materials for day/night
  clonedScene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
      
      if (child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((mat) => {
          // Enable emissive for night glow
          if (timeOfDay === 'night') {
            if (!mat.emissive) {
              mat.emissive = new THREE.Color(mat.color || '#ffffff')
            }
            mat.emissiveIntensity = 0.3
          } else {
            mat.emissiveIntensity = 0
          }
        })
      }
    }
  })
  
  // Calculate Y offset to keep plant base on ground when scaling
  const baseYPosition = pivotOffset // Base position at scale 1
  const scaleAdjustment = pivotOffset * (scale - 1) // Additional lift for scale > 1
  const finalYOffset = baseYPosition + scaleAdjustment
  
  return (
    <group 
      ref={groupRef} 
      position={[position[0], position[1] + finalYOffset, position[2]]} 
      rotation={rotation}
      scale={[
        normalizedScale * scale,
        normalizedScale * scale,
        normalizedScale * scale
      ]}
      onClick={onClick} // New: Handle clicks on the entire group
    >
      <primitive object={clonedScene} />
    </group>
  )
}

export default ModelPlant