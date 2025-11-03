import React from 'react'
import ProceduralTree from './ProceduralTree'

/**
 * ProceduralForest
 * - Generates N tree positions using a simple rejection sampling (min distance) inside a radius
 * - Renders ProceduralTree instances
 * Props: count (default 20), radius (default 50), areaCenter
 */
function simplePoisson(count, radius, minDist, excludeZones = [], rng = Math.random) {
  // rng: function that returns [0,1)
  const pts = []
  let attempts = 0
  while (pts.length < count && attempts < count * 200) {
    attempts++
    const ang = rng() * Math.PI * 2
    const r = Math.sqrt(rng()) * radius
    const x = Math.cos(ang) * r
    const z = Math.sin(ang) * r

    // exclude rectangular zones (centered at ex.x, ex.z)
    let inExclude = false
    for (const ex of excludeZones) {
      const dx = x - (ex.x || 0)
      const dz = z - (ex.z || 0)
      if (Math.abs(dx) <= (ex.halfLength || 0) && Math.abs(dz) <= (ex.halfWidth || 0)) {
        inExclude = true
        break
      }
    }
    if (inExclude) continue

    let ok = true
    for (let p of pts) {
      const dx = p[0] - x
      const dz = p[2] - z
      if (Math.sqrt(dx * dx + dz * dz) < minDist) {
        ok = false
        break
      }
    }
    if (ok) pts.push([x, 0, z])
  }
  return pts
}

// Simple seeded RNG (mulberry32) for deterministic placements when a seed is provided
function mulberry32(seed) {
  let t = seed >>> 0
  return function () {
    t += 0x6D2B79F5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export default function ProceduralForest({ count = 20, radius = 50, minDistance = 3, treeScale = 3.0, leafCount = 120, timeOfDay = 'day', excludeZones = [], regenerateKey, seed = 12345 }) {
  const positionsRef = React.useRef(null)
  // If positions are empty or caller requests regeneration, compute them deterministically using seed
  if (!positionsRef.current || regenerateKey) {
    const rng = seed != null ? mulberry32(Number(seed)) : Math.random
    positionsRef.current = simplePoisson(count, radius, minDistance, excludeZones, rng)
  }

  const positions = positionsRef.current
  return (
    <group>
      {positions.map((pos, i) => {
        // derive a per-tree seed so leaf distribution is stable per tree
        const treeSeed = typeof seed === 'number' ? Number(seed) + i + 1 : Math.floor(Math.random() * 1e9)
        return (
          <ProceduralTree
            key={`pt-${i}`}
            position={[pos[0], pos[1], pos[2]]}
            scale={treeScale}
            timeOfDay={timeOfDay}
            leafCount={leafCount}
            seed={treeSeed}
          />
        )
      })}
    </group>
  )
}
