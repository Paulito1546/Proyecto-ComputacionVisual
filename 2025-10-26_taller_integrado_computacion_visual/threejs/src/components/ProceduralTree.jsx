import React, { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { vertex as foliageVertex, fragment as foliageFragment } from '../shaders/FoliageShader'
import { vertex as trunkVertex, fragment as trunkFragment } from '../shaders/TrunkShader'

/**
 * ProceduralTree
 * - Trunk: simple cylinder
 * - Leaves: Instanced plane geometry with a small wind vertex shader
 * Props: position, rotation, scale, seed, timeOfDay
 */
export default function ProceduralTree({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  // seed is optional — when provided, leaf placement will be deterministic per-tree
  seed = null,
  timeOfDay = 'day',
  leafCount = 800,
  onClick
}) {
  const rootRef = useRef()
  const leavesRef = useRef()

  // Geometries
  // trunkHeight: cylinder of height 1.8 is centered at its mesh origin; the mesh is
  // positioned at y=0.9 so the trunk base sits at y=0 and top at y=1.8 (local space).
  const trunkHeight = 1.8
  const trunkGeometry = useMemo(() => new THREE.CylinderGeometry(0.12, 0.18, trunkHeight, 8), [trunkHeight])
  const leafGeometry = useMemo(() => new THREE.PlaneGeometry(0.5, 0.65, 1, 1), [])

  // Material with simple wind shader — but wind disabled for static foliage
  const foliageMaterial = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: foliageVertex,
      fragmentShader: foliageFragment,
      uniforms: {
        time: { value: 0 },
        windStrength: { value: 0.0 }, // set to 0 → static leaves
        leafColor: { value: new THREE.Color('#2aa55b') },
        nightTint: { value: new THREE.Color('#66ffcc') },
        isNight: { value: 0 }
      },
      side: THREE.DoubleSide,
      transparent: true
    })
    return mat
  }, [])


  useEffect(() => {
    if (foliageMaterial) {
      // keep night/day tint in place but do NOT animate time/wind
      foliageMaterial.uniforms.isNight.value = timeOfDay === 'night' ? 1 : 0
      foliageMaterial.uniforms.leafColor.value = new THREE.Color(timeOfDay === 'night' ? '#66ffcc' : '#2aa55b')
    }
    // keep crown colors in sync with timeOfDay via foliageMaterial uniforms (crown moved to forest)
  }, [timeOfDay, foliageMaterial])

  // Prepare instances once after mount - ensure leavesRef is available.
  // If `seed` is provided, use a small seeded RNG so the leaf layout is deterministic.
  useEffect(() => {
    const inst = leavesRef.current
    if (!inst) return

    // seeded RNG (mulberry32) if seed provided
    const rng = seed != null ? (function (s) {
      let t = s >>> 0
      return function () {
        t += 0x6D2B79F5
        let r = Math.imul(t ^ (t >>> 15), 1 | t)
        r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296
      }
    })(Number(seed)) : Math.random

    const dummy = new THREE.Object3D()
    // ensure instanceColor attribute exists (some r3f/three versions require explicit creation)
    if (!inst.instanceColor) {
      const colors = new Float32Array(leafCount * 3)
      inst.instanceColor = new THREE.InstancedBufferAttribute(colors, 3)
    }

    // compute canopy vertical placement relative to trunk top
    const trunkTopY = trunkHeight // because trunk base at 0 and top at trunkHeight
    console.log('[ProceduralTree] building', leafCount, 'leaves for seed', seed)
    for (let i = 0; i < leafCount; i++) {
      // place leaves above the trunk top so canopy sits on top of the trunk
      const canopyBase = trunkTopY + 0.12 // small gap so leaves don't intersect trunk
      const h = rng() * 0.6 + 0.1 // canopy vertical offset above canopyBase
      const radius = rng() * 0.9 * (0.6 + rng() * 1.2)
      const angle = rng() * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = canopyBase + h

      dummy.position.set(x, y, z)
      dummy.rotation.set(-Math.PI / 2 + (rng() - 0.5) * 0.6, rng() * Math.PI * 2, (rng() - 0.5) * 0.6)
      const s = 0.6 + rng() * 0.9
      dummy.scale.set(s, s, s)
      dummy.updateMatrix()
      inst.setMatrixAt(i, dummy.matrix)

      // store a per-instance attribute for randomness (via instanceColor)
      const color = new THREE.Color().setHSL(0.33 + (rng() - 0.5) * 0.05, 0.6, 0.5 + rng() * 0.1)
      if (inst.setColorAt) {
        inst.setColorAt(i, color)
      } else if (inst.instanceColor) {
        const arr = inst.instanceColor.array
        arr[i * 3 + 0] = color.r
        arr[i * 3 + 1] = color.g
        arr[i * 3 + 2] = color.b
      }
    }
    inst.instanceMatrix.needsUpdate = true
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true
    console.log('[ProceduralTree] finished building leaves; instanceMatrix and instanceColor updated')
  }, [leafCount, seed])

  // Small crown geometry placed on top of the tree (uses same foliage shader/material)
  // Use SphereGeometry because the foliage shader expects UVs; choose a slightly larger
  // sphere and more segments for nicer shading. Position is computed to sit just above
  // the trunk top (trunk height = 1.8 → top at ~1.8), so place crown a little above it.
  const crownGeometry = useMemo(() => new THREE.SphereGeometry(1.05, 16, 12), [])

  // Trees static: do not update animation/time nor rotate the root.
  // If later you want motion, re-enable the useFrame updates and update foliageMaterial.uniforms.time

  return (
    <group ref={rootRef} position={position} rotation={rotation} scale={[scale, scale, scale]} onClick={onClick}>
      {/* Trunk — use a simple trunk shader for stylized bark */}
      <mesh geometry={trunkGeometry} position={[0, 0.9, 0]} castShadow receiveShadow>
        <shaderMaterial
          vertexShader={trunkVertex}
          fragmentShader={trunkFragment}
          uniforms={{ baseColor: { value: new THREE.Color('#6b3e1a') } }}
        />
      </mesh>

      {/* Leaves - instanced */}
          {/* Leaves - instanced. We keep the instanced mesh at the group's origin and place
              leaves in local space above the trunk using the computed canopy offsets. */}
          <instancedMesh ref={leavesRef} args={[leafGeometry, foliageMaterial, leafCount]} position={[0, 0, 0]} castShadow>
        {/* colors can be set per-instance via setColorAt in useMemo above */}
      </instancedMesh>

          {/* Single stylized crown/leaf on top of each procedural tree */}
          {/* Place crown slightly above trunk top and above the instanced leaves */}
          <mesh geometry={crownGeometry} material={foliageMaterial} position={[0, trunkHeight + 0.35, 0]} castShadow receiveShadow />
    </group>
  )
}
