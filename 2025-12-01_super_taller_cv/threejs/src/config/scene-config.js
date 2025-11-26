/**
 * 3D Scene Configuration
 * 
 * Centralized configuration for the 3D visualization
 */

export const SCENE_CONFIG = {
  // Camera settings
  camera: {
    fov: 75,
    near: 0.1,
    far: 1000,
    initialPosition: [5, 5, 5]
  },

  // Controls
  controls: {
    enableDamping: true,
    dampingFactor: 0.05,
    minDistance: 3,
    maxDistance: 20,
    enablePan: true,
    enableZoom: true,
    enableRotate: true
  },

  // Lighting
  lighting: {
    ambient: {
      intensity: 0.3,
      color: '#ffffff'
    },
    directional: {
      intensity: 1,
      position: [3, 5, 2],
      castShadow: true,
      shadowMapSize: 2048
    },
    spotlight: {
      intensity: 0.8,
      angle: 0.4,
      penumbra: 0.5,
      color: '#00d4ff'
    },
    pointLights: [
      { position: [-3, 2, -3], color: '#ff6b6b', intensity: 0.5 },
      { position: [3, 2, -3], color: '#4ecdc4', intensity: 0.5 }
    ]
  },

  // Grid
  grid: {
    size: 20,
    divisions: 20,
    cellSize: 0.5,
    cellColor: '#6e6e6e',
    sectionSize: 2,
    sectionColor: '#00d4ff',
    fadeDistance: 25,
    infiniteGrid: true
  },

  // Particles
  particles: {
    count: 200,
    size: 0.05,
    opacity: 0.8,
    sizeAttenuation: true
  },

  // Objects
  objects: {
    cube: {
      size: [1, 1, 1],
      position: [-2, 1, 0],
      material: {
        color: '#00d4ff',
        metalness: 0.6,
        roughness: 0.2
      }
    },
    sphere: {
      radius: 0.8,
      segments: 64,
      position: [0, 1, 0],
      material: {
        color: '#ff6b6b',
        wobbleSpeed: 2,
        wobbleFactor: 0.3
      }
    },
    torus: {
      radius: 0.7,
      tube: 0.3,
      radialSegments: 32,
      tubularSegments: 100,
      position: [2, 1, 0],
      material: {
        color: '#4ecdc4',
        distortSpeed: 3,
        distortAmount: 0.4
      }
    }
  },

  // Environment
  environment: {
    preset: 'sunset', // 'sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment', 'studio', 'city', 'park', 'lobby'
    background: false
  },

  // Performance
  performance: {
    targetFPS: 60,
    enableStats: true,
    shadowMapType: 'PCFSoft' // 'Basic', 'PCF', 'PCFSoft', 'VSM'
  },

  // AR
  ar: {
    markerSize: 150,
    cubeSize: 100
  }
}

export const OBJECT_TYPES = {
  CUBE: 'cube',
  SPHERE: 'sphere',
  TORUS: 'torus'
}

export const VIEW_MODES = {
  THREE_D: '3d',
  AR: 'ar'
}

export default SCENE_CONFIG
