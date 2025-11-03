import React, { useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { vertex as waterVertex, fragment as waterFragment } from '../shaders/WaterShader'

export default function Water({ size = 200, position = [0, 0, 0], rotation = [-Math.PI / 2, 0, 0] }) {
  const geom = useMemo(() => new THREE.PlaneGeometry(size, size, 64, 64), [size])
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: waterVertex,
    fragmentShader: waterFragment,
    transparent: true,
    uniforms: {
      time: { value: 0 },
      colorA: { value: new THREE.Color('#1a6fb3') },
      colorB: { value: new THREE.Color('#0b2b4a') }
    }
  }), [])

  useFrame((state) => {
    if (mat) mat.uniforms.time.value = state.clock.getElapsedTime()
  })

  useEffect(() => {
    return () => {
      geom.dispose && geom.dispose()
      mat.dispose && mat.dispose()
    }
  }, [geom, mat])

  return (
    <mesh geometry={geom} material={mat} position={position} rotation={rotation} receiveShadow>
    </mesh>
  )
}
