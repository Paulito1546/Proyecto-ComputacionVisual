import { useEffect, useRef } from 'react'
import { OrbitControls, PerspectiveCamera, OrthographicCamera } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Lighting from './Lighting'
import Ground from './Ground'
import Skybox360 from './Skybox360'
import PlantModels from './PlantModels'
import DepthVisualization from './DepthVisualization'
import ModelPreloader from './ModelPreloader'

/**
 * Main scene component
 * Now includes reactivity to:
 * - Voice commands ("luz", "flor", "noche")
 * - Gestures (open/fist → mapped in App.jsx)
 * - EEG simulated value (color/intensity feedback)
 */
function Scene({ timeOfDay, cameraType, showDepth, command, eegValue }) {
  const { camera, size, scene } = useThree()
  const controlsRef = useRef()
  const mainLight = useRef()
  const plantsRef = useRef()

  // 🎥 Ajuste les paramètres de la caméra orthographique
  useEffect(() => {
    if (cameraType === 'orthographic' && camera.isOrthographicCamera) {
      const aspect = size.width / size.height
      const viewSize = 40
      camera.left = -viewSize * aspect
      camera.right = viewSize * aspect
      camera.top = viewSize
      camera.bottom = -viewSize
      camera.near = 0.1
      camera.far = 2000
      camera.updateProjectionMatrix()
    }
  }, [cameraType, camera, size])

  // 🌞 Ajustement automatique selon jour/nuit
  useEffect(() => {
    const color = timeOfDay === 'night' ? 0x223344 : 0x88ccff
    scene.background = new THREE.Color(color)
  }, [timeOfDay, scene])

  // 🎙️ Réagir aux commandes vocales et gestuelles
  useEffect(() => {
    if (!command) return

    // ⚡ commande "luz" → flash lumineux
    if (command === 'luz' && mainLight.current) {
      mainLight.current.intensity = 2
      setTimeout(() => (mainLight.current.intensity = 1), 800)
    }

    // 🌸 commande "flor" → faire "pousser" les plantes
    if (command === 'flor' && plantsRef.current) {
      plantsRef.current.scale.set(1.3, 1.3, 1.3)
      setTimeout(() => plantsRef.current.scale.set(1, 1, 1), 800)
    }

    // 🌙 commande "noche" → baisse la lumière
    if (command === 'noche' && mainLight.current) {
      mainLight.current.intensity = 0.3
      setTimeout(() => (mainLight.current.intensity = 1), 1000)
    }
  }, [command])

  // 🧠 EEG simulé → changement de couleur globale
  useEffect(() => {
    const cold = new THREE.Color(0x3355ff)
    const warm = new THREE.Color(0xff5533)
    const mix = cold.clone().lerp(warm, eegValue)
    scene.background = mix
    if (plantsRef.current) {
      plantsRef.current.traverse((obj) => {
        if (obj.isMesh) {
          obj.material.color.lerpColors(cold, warm, eegValue)
        }
      })
    }
  }, [eegValue, scene])

  return (
    <>
      {/* Préchargement de modèles */}
      <ModelPreloader />

      {/* Caméras */}
      {cameraType === 'perspective' ? (
        <PerspectiveCamera makeDefault position={[0, 5, 15]} fov={60} />
      ) : (
        <OrthographicCamera makeDefault position={[0, 50, 100]} near={0.1} far={2000} />
      )}

      {/* Contrôles de caméra */}
      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        zoomToCursor
        maxPolarAngle={Math.PI / 2}
        minDistance={3}
        maxDistance={150}
      />

      {/* Environnement visuel */}
      <Skybox360 timeOfDay={timeOfDay} />

      {/* Lumière principale */}
      <group ref={mainLight}>
        <Lighting timeOfDay={timeOfDay} />
      </group>

      {/* Sol */}
      <Ground timeOfDay={timeOfDay} />

      {/* Modèles de plantes (groupe modifiable) */}
      <group ref={plantsRef}>
        <PlantModels timeOfDay={timeOfDay} />
      </group>

      {/* Visualisation de profondeur optionnelle */}
      {showDepth && <DepthVisualization />}
    </>
  )
}

export default Scene
