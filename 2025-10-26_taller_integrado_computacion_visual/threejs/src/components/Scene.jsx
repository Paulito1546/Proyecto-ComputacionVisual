import React, { useEffect, useRef, useState } from 'react';
import {
  OrbitControls,
  PerspectiveCamera,
  OrthographicCamera
} from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Lighting from './Lighting';
import Ground from './Ground';
import Skybox360 from './Skybox360';
import PlantModels from './PlantModels';
import DepthVisualization from './DepthVisualization';
import ModelPreloader from './ModelPreloader';
import ProceduralForest from './ProceduralForest';
import Water from './Water';
import River from './River'
import { useControls } from 'leva'

/**
 * Main scene component
 * Reacts to:
 * - Voice commands ("luz", "flor", "noche")
 * - Gestures (open/fist → mapped in App.jsx)
 * - Simulated EEG value (color/intensity feedback)
 */
function Scene({ timeOfDay, cameraType, showDepth, command, eegValue }) {
  const { camera, size, scene } = useThree();
  const controlsRef = useRef();
  const mainLight = useRef();
  const plantsRef = useRef();

  // Adjust orthographic camera parameters
  useEffect(() => {
    if (cameraType === 'orthographic' && camera.isOrthographicCamera) {
      const aspect = size.width / size.height;
      const viewSize = 40;
      camera.left = -viewSize * aspect;
      camera.right = viewSize * aspect;
      camera.top = viewSize;
      camera.bottom = -viewSize;
      camera.near = 0.1;
      camera.far = 2000;
      camera.updateProjectionMatrix();
    }
  }, [cameraType, camera, size]);

  // Automatic day/night background adjustment
  useEffect(() => {
    const color = timeOfDay === 'night' ? 0x223344 : 0x88ccff;
    scene.background = new THREE.Color(color);
  }, [timeOfDay, scene]);

  // React to voice and gesture commands
  useEffect(() => {
    if (!command) return;

    // "luz" command → light flash
    if (command === 'luz' && mainLight.current) {
      mainLight.current.intensity = 2;
      setTimeout(() => (mainLight.current.intensity = 1), 800);
    }

    // "flor" command → make plants "grow"
    if (command === 'flor' && plantsRef.current) {
      plantsRef.current.scale.set(1.3, 1.3, 1.3);
      setTimeout(() => plantsRef.current.scale.set(1, 1, 1), 800);
    }

    // "noche" command → dim the light
    if (command === 'noche' && mainLight.current) {
      mainLight.current.intensity = 0.3;
      setTimeout(() => (mainLight.current.intensity = 1), 1000);
    }
  }, [command]);

  // Simulated EEG → global color change
  useEffect(() => {
    const cold = new THREE.Color(0x3355ff);
    const warm = new THREE.Color(0xff5533);
    const mix = cold.clone().lerp(warm, eegValue);
    scene.background = mix;

    if (plantsRef.current) {
      plantsRef.current.traverse((obj) => {
        if (obj.isMesh && obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) => mat.color.lerpColors(cold, warm, eegValue));
          } else {
            obj.material.color.lerpColors(cold, warm, eegValue);
          }
        }
      });
    }
  }, [eegValue, scene]);

  // Controls component to manage forest visibility, count and GLTF foliage override
  function ForestAndPlantControls({ timeOfDay }) {
  const [regenerateKey, _setRegenerateKey] = useState(0)

    const {
      forestVisible,
      forestCount,
      forestRadius,
      forestMinDistance,
      forestTreeScale,
      forestLeafCount,
      overrideFoliageShader
    } = useControls('Forest', {
      forestVisible: { value: true },
      forestCount: { value: 20, min: 0, max: 200, step: 1 },
      forestRadius: { value: 55, min: 5, max: 200, step: 1 },
      forestMinDistance: { value: 3.5, min: 0, max: 20, step: 0.1 },
      forestTreeScale: { value: 1.2, min: 0.3, max: 3, step: 0.1 },
      forestLeafCount: { value: 80, min: 8, max: 300, step: 1 },
      overrideFoliageShader: { value: false },
      regenerateForest: {
        label: 'Regenerate Forest (force)',
        // we attach a function later via the returned controls object
        value: false
      }
    })

    // Leva's button binding can't directly set local state here, so intercept via effect on controls if needed.
    // We'll create a simple DOM listener: useControls' regenerateForest is a boolean toggle; using it to bump regenerateKey is optional.

    return (
      <>
        {forestVisible && (
          <group>
            {/* define river exclusion zone so nothing spawns inside the river */}
            {/** River location must match the River component below in Scene */}
            <ProceduralForest count={forestCount} radius={forestRadius} minDistance={forestMinDistance} treeScale={forestTreeScale} leafCount={forestLeafCount} timeOfDay={timeOfDay} excludeZones={[{ x: 0, z: -10, halfLength: 90, halfWidth: 5 }]} regenerateKey={regenerateKey} />
          </group>
        )}

        {/* Pass override down to PlantModels so GLTF plants can use the foliage shader when toggled */}
        <group ref={plantsRef}>
          <PlantModels timeOfDay={timeOfDay} useFoliageShaderOverride={overrideFoliageShader} excludeZones={[{ x: 0, z: -10, halfLength: 90, halfWidth: 5 }]} />
        </group>
      </>
    )
  }

  return (
    <>
      {/* Model preloading */}
      <ModelPreloader />

      {/* Cameras */}
      {cameraType === 'perspective' ? (
        <PerspectiveCamera makeDefault position={[0, 5, 15]} fov={60} />
      ) : (
        <OrthographicCamera makeDefault position={[0, 50, 100]} near={0.1} far={2000} />
      )}

      {/* Camera controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        zoomToCursor
        maxPolarAngle={Math.PI / 2}
        minDistance={3}
        maxDistance={50}//150
      />

      {/* Visual environment */}
      <Skybox360 timeOfDay={timeOfDay} />

      {/* Main lighting */}
      <group ref={mainLight}>
        <Lighting timeOfDay={timeOfDay} />
      </group>

      {/* Ground */}
      <Ground timeOfDay={timeOfDay} />

      {/* Water plane (simple, optional) */}
      <Water size={160} position={[0, 0.01, 0]} />

  {/* River (shadered) - ensure plane is horizontal so it's visible (not edge-on) */}
  <River length={180} width={10} position={[0, 0.02, -10]} rotation={[-Math.PI / 2, 0, 0]} />

      {/* Procedural forest controlled by Leva (visibility/count/etc.) */}
      {/* Leia controls for procedural forest are declared below */}
      <ForestAndPlantControls timeOfDay={timeOfDay} />

      {/* Plant models are rendered inside ForestAndPlantControls (so we removed the duplicate render). */}

      {/* Optional depth visualization */}
      {showDepth && <DepthVisualization />}
    </>
  );
}

export default Scene;