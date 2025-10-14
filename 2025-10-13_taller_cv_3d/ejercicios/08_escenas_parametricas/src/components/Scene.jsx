import React, { useState, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Grid as DreiGrid } from '@react-three/drei';
import { useControls, button } from 'leva';
import { ParametricObject, GridPattern, SpiralPattern } from './ParametricObjects';
import sceneData from '../data/sceneData.json';
import gridPattern from '../data/gridPattern.json';
import spiralPattern from '../data/spiralPattern.json';

// Componente para manejar la cámara dinámicamente
function CameraController({ distance }) {
  const { camera } = useThree();
  
  React.useEffect(() => {
    camera.position.set(distance, distance, distance);
    camera.updateProjectionMatrix();
  }, [distance, camera]);
  
  return null;
}

export default function Scene() {
  const [currentData, setCurrentData] = useState(sceneData);
  const [sceneType, setSceneType] = useState('custom');
  const controlsRef = useRef();

  // Controles de Leva
  const controls = useControls({
    // Selector de escena
    'Scene Type': {
      value: 'custom',
      options: ['custom', 'grid', 'spiral'],
      onChange: (value) => {
        setSceneType(value);
        switch(value) {
          case 'grid':
            setCurrentData(gridPattern);
            break;
          case 'spiral':
            setCurrentData(spiralPattern);
            break;
          default:
            setCurrentData(sceneData);
        }
      }
    },
    
    // Controles globales
    'Global Scale': {
      value: 1,
      min: 0.1,
      max: 3,
      step: 0.1
    },
    
    'Animate': true,
    
    'Camera Distance': {
      value: 15,
      min: 5,
      max: 30,
      step: 1
    },
    
    // Iluminación
    'Light Intensity': {
      value: 1,
      min: 0,
      max: 3,
      step: 0.1
    },
    
    'Ambient Light': {
      value: 0.5,
      min: 0,
      max: 2,
      step: 0.1
    },
    
    // Grid
    'Show Grid': true,
    
    'Grid Size': {
      value: 20,
      min: 5,
      max: 50,
      step: 5
    },
    
    // Background
    'Background Color': '#1a1a1a',
    
    // Botones de acción
    'Reset View': button(() => {
      if (controlsRef.current) {
        controlsRef.current.reset();
      }
    }),
    
    'Export Scene': button(() => {
      console.log('Exporting scene data:', currentData);
      const dataStr = JSON.stringify(currentData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'scene-export.json';
      link.click();
    })
  });

  const renderScene = () => {
    if (sceneType === 'grid') {
      return (
        <GridPattern 
          data={currentData} 
          globalScale={controls['Global Scale']}
          animate={controls['Animate']}
        />
      );
    } else if (sceneType === 'spiral') {
      return (
        <SpiralPattern 
          data={currentData} 
          globalScale={controls['Global Scale']}
          animate={controls['Animate']}
        />
      );
    } else {
      return currentData.objects?.map(obj => (
        <ParametricObject 
          key={obj.id} 
          data={obj} 
          globalScale={controls['Global Scale']}
          animate={controls['Animate']}
        />
      ));
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [15, 15, 15], fov: 50 }}
        style={{ background: controls['Background Color'] }}
      >
        {/* Controlador de cámara dinámico */}
        <CameraController distance={controls['Camera Distance']} />
        
        {/* Iluminación */}
        <ambientLight intensity={controls['Ambient Light']} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={controls['Light Intensity']}
          castShadow
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        {/* Objetos de la escena */}
        {renderScene()}
        
        {/* Grid del suelo */}
        {controls['Show Grid'] && (
          <DreiGrid 
            args={[controls['Grid Size'], controls['Grid Size']]} 
            cellColor="#6b6b6b"
            sectionColor="#9d4b4b"
            fadeDistance={30}
            fadeStrength={1}
          />
        )}
        
        {/* Environment para reflejos */}
        <Environment preset="city" />
        
        {/* Controles de cámara */}
        <OrbitControls 
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
        />
      </Canvas>
      
      {/* Información de la escena */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        color: 'white',
        fontFamily: 'monospace',
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        <div><strong>Escenas Paramétricas</strong></div>
        <div>Modo: {sceneType}</div>
        <div>Objetos: {sceneType === 'custom' ? currentData.objects?.length : 
                      sceneType === 'grid' ? (currentData.gridSize ** 2) : 
                      currentData.count}</div>
      </div>
    </div>
  );
}
