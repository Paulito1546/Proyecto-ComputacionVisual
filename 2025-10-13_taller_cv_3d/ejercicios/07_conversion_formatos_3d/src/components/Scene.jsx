import { useEffect, useState } from 'react'
import { useLoader } from '@react-three/fiber'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

function Scene({ format, showWireframe, onStatsUpdate }) {
  const [model, setModel] = useState(null)

  // Load models based on selected format
  const objModel = format === 'obj' ? useLoader(OBJLoader, '/models/model.obj') : null
  const stlGeometry = format === 'stl' ? useLoader(STLLoader, '/models/model.stl') : null
  const gltfModel = format === 'gltf' ? useGLTF('/models/model.glb') : null

  // Center model at origin
  const centerModel = (obj) => {
    const box = new THREE.Box3().setFromObject(obj)
    const center = box.getCenter(new THREE.Vector3())
    obj.position.sub(center)
  }

  // Apply wireframe to all meshes in the scene
  const applyWireframeToScene = (obj, wireframe) => {
    obj.traverse((child) => {
      if (child.isMesh) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            mat.wireframe = wireframe
            mat.needsUpdate = true
          })
        } else {
          child.material.wireframe = wireframe
          child.material.needsUpdate = true
        }
      }
    })
  }

  // Calculate and update model statistics
  const updateStats = (obj, formatName) => {
    let vertices = 0
    let faces = 0
    let hasNormals = false
    let hasUVs = false
    let hasMaterials = false

    obj.traverse((child) => {
      if (child.isMesh && child.geometry) {
        const geo = child.geometry
        vertices += geo.attributes.position?.count || 0
        if (geo.index) {
          faces += geo.index.count / 3
        } else {
          faces += (geo.attributes.position?.count || 0) / 3
        }
        hasNormals = hasNormals || !!geo.attributes.normal
        hasUVs = hasUVs || !!geo.attributes.uv
        hasMaterials = hasMaterials || !!child.material
      }
    })

    onStatsUpdate?.({
      format: formatName.toUpperCase(),
      vertices: Math.floor(vertices),
      faces: Math.floor(faces),
      normals: hasNormals,
      uvs: hasUVs,
      materials: hasMaterials
    })
  }

  // Process model when format changes
  useEffect(() => {
    let processedModel = null

    if (format === 'obj' && objModel) {
      processedModel = objModel.clone()
      centerModel(processedModel)
      applyWireframeToScene(processedModel, showWireframe)
      
    } else if (format === 'stl' && stlGeometry) {
      const mesh = new THREE.Mesh(
        stlGeometry,
        new THREE.MeshStandardMaterial({
          color: '#ff6b9d',
          metalness: 0.3,
          roughness: 0.4,
          wireframe: showWireframe
        })
      )
      stlGeometry.center()
      stlGeometry.computeVertexNormals()
      processedModel = mesh
      
    } else if (format === 'gltf' && gltfModel) {
      processedModel = gltfModel.scene.clone()
      centerModel(processedModel)
      applyWireframeToScene(processedModel, showWireframe)
    }

    if (processedModel) {
      setModel(processedModel)
      updateStats(processedModel, format)
    }
  }, [format, objModel, stlGeometry, gltfModel, showWireframe])

  if (!model) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4fc3f7" />
      </mesh>
    )
  }

  return <primitive object={model} castShadow receiveShadow />
}

// Preload GLTF model for better performance
useGLTF.preload('/models/model.glb')

export default Scene
