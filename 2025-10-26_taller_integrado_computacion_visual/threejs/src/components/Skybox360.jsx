import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Implements inverted sphere for equirectangular textures
 * Supports day/night skybox switching with 3D models for sun, moon, and clouds
 */
function Skybox360({ timeOfDay }) {
  const meshRef = useRef()
  
  // Load 3D models for environment
  const { scene: moonScene } = useGLTF('/models/environment/moon.glb')
  const { scene: cloudScene } = useGLTF('/models/environment/stylize_clouds.glb')
  
  // Load skybox models
  const { scene: galaxyScene } = useGLTF('/models/skybox/inside_galaxy_skybox_hdri_360_panorama.glb')
  const { scene: skydaysScene } = useGLTF('/models/skybox/skybox_skydays_3.glb')
  
  const { 
    skyboxRotation,
    animateSkybox
  } = useControls('Skybox 360°', {
    skyboxRotation: { value: 0, min: 0, max: Math.PI * 2, step: 0.01 },
    animateSkybox: { value: true, label: 'Animate Skybox' }
  })

  // Animate skybox rotation
  useFrame(() => {
    if (animateSkybox && meshRef.current) {
      meshRef.current.rotation.y += 0.0005
    } else if (meshRef.current) {
      meshRef.current.rotation.y = skyboxRotation
    }
  })

  const isDay = timeOfDay === 'day'

  return (
    <group ref={meshRef}>
      {/* Day: Skydays skybox with sun and clouds */}
      {isDay ? (
        <>
          {/* Skydays skybox model - wrapped in group for better control */}
          <group scale={[1, 1, 1]}>
            <primitive object={skydaysScene.clone()} />
          </group>

          {/* 3D Sun - procedural sphere with emission */}
          <mesh position={[70, 30, -30]}>
            <sphereGeometry args={[8, 32, 32]} />
            <meshStandardMaterial
              color="#ffff00"
              emissive="#ffaa00"
              emissiveIntensity={2}
              roughness={1}
              metalness={0}
            />
          </mesh>

          {/* 3D Clouds */}
          <Cloud position={[40, 40, -30]} scale={3.2} rotation={[0, 0.3, 0]} cloudModel={cloudScene} />
          <Cloud position={[-45, 35, -25]} scale={2.8} rotation={[0, -1.2, 0]} cloudModel={cloudScene} />
          <Cloud position={[25, 38, 40]} scale={3.5} rotation={[0, 2.1, 0]} cloudModel={cloudScene} />
          <Cloud position={[-35, 36, 30]} scale={2.5} rotation={[0, -2.5, 0]} cloudModel={cloudScene} />
          <Cloud position={[50, 42, 0]} scale={3} rotation={[0, 1.8, 0]} cloudModel={cloudScene} />
          <Cloud position={[-50, 39, -5]} scale={3.3} rotation={[0, 0.7, 0]} cloudModel={cloudScene} />
          <Cloud position={[0, 44, -55]} scale={2.7} rotation={[0, 1.5, 0]} cloudModel={cloudScene} />
          <Cloud position={[10, 34, 45]} scale={2.9} rotation={[0, -0.9, 0]} cloudModel={cloudScene} />
        </>
      ) : (
        <>
          {/* Night: Galaxy skybox with moon */}
          <group scale={[1, 1, 1]}>
            <primitive object={galaxyScene.clone()} />
          </group>

          {/* 3D Moon model */}
          <group position={[-60, 35, -40]} scale={3.0}>
            <primitive object={moonScene.clone()} />
          </group>
        </>
      )}
    </group>
  )
}

/**
 * Cloud component with white material override
 */
function Cloud({ position, scale, rotation, cloudModel }) {
  const clonedCloud = cloudModel.clone()
  
  // Override materials to make clouds white
  clonedCloud.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.8,
        metalness: 0.1,
        transparent: true,
        opacity: 0.9
      })
    }
  })
  
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <primitive object={clonedCloud} />
    </group>
  )
}

export default Skybox360
