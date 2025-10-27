import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Visualizes depth buffer using custom shader material
 * Demonstrates projective space and z-buffer concepts
 */
function DepthVisualization() {
  const { scene, camera } = useThree()

  useEffect(() => {
    // Store original materials
    const originalMaterials = new Map()

    // Create depth material (linearizes depth buffer)
    const depthMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying float vDepth;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vDepth = -mvPosition.z;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vDepth;
        uniform float cameraNear;
        uniform float cameraFar;
        
        void main() {
          // Calculate normalized depth
          float depth = (vDepth - cameraNear) / (cameraFar - cameraNear);
          depth = clamp(depth, 0.0, 1.0);
          
          // Invert: near = 1.0 (white), far = 0.0 (black)
          float visualDepth = 1.0 - depth;
          
          // Moderate contrast - not too much, not too little
          visualDepth = pow(visualDepth, 1.8);
          
          gl_FragColor = vec4(vec3(visualDepth), 1.0);
        }
      `,
      uniforms: {
        cameraNear: { value: camera.near },
        cameraFar: { value: camera.far }
      }
    })

    // Replace all materials with depth material
    scene.traverse((object) => {
      if (object.isMesh) {
        originalMaterials.set(object.uuid, object.material)
        object.material = depthMaterial.clone()
        object.material.uniforms.cameraNear.value = camera.near
        object.material.uniforms.cameraFar.value = camera.far
      }
    })

    // Cleanup: restore original materials when component unmounts
    return () => {
      scene.traverse((object) => {
        if (object.isMesh && originalMaterials.has(object.uuid)) {
          object.material = originalMaterials.get(object.uuid)
        }
      })
    }
  }, [scene, camera])

  return null
}

export default DepthVisualization
