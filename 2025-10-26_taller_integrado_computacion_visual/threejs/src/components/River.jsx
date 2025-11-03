import React, { useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { vertex as riverVertex, fragment as riverFragment } from '../shaders/RiverShader'

export default function River({ length = 100, width = 8, position = [0, 0, 0], rotation = [-Math.PI/2, 0, 0] }) {
  const geom = useMemo(() => new THREE.PlaneGeometry(length, width, 64, 16), [length, width])
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: riverVertex,
    fragmentShader: riverFragment,
    transparent: true,
    uniforms: {
      time: { value: 0 },
      waterColor: { value: new THREE.Color('#1f6fb3') },
      foamColor: { value: new THREE.Color('#dff3ff') }
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
