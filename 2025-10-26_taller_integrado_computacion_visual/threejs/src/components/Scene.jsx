import { useEffect, useRef } from 'react';
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
        maxDistance={150}
      />

      {/* Visual environment */}
      <Skybox360 timeOfDay={timeOfDay} />

      {/* Main lighting */}
      <group ref={mainLight}>
        <Lighting timeOfDay={timeOfDay} />
      </group>

      {/* Ground */}
      <Ground timeOfDay={timeOfDay} />

      {/* Plant models (modifiable group) */}
      <group ref={plantsRef}>
        <PlantModels timeOfDay={timeOfDay} />
      </group>

      {/* Optional depth visualization */}
      {showDepth && <DepthVisualization />}
    </>
  );
}

export default Scene;