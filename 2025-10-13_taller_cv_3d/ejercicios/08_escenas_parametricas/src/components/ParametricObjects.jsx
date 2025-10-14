import React from 'react';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// Componente para renderizar un objeto 3D basado en datos
export function ParametricObject({ data, globalScale, animate }) {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (animate && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.2;
    }
  });

  const renderGeometry = () => {
    switch (data.type) {
      case 'box':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere':
        return <sphereGeometry args={[0.5, 32, 32]} />;
      case 'cone':
        return <coneGeometry args={[0.5, 1, 32]} />;
      case 'cylinder':
        return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      case 'torus':
        return <torusGeometry args={[0.5, 0.2, 16, 100]} />;
      case 'octahedron':
        return <octahedronGeometry args={[0.5]} />;
      case 'tetrahedron':
        return <tetrahedronGeometry args={[0.5]} />;
      case 'dodecahedron':
        return <dodecahedronGeometry args={[0.5]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  const finalScale = [
    data.scale[0] * globalScale,
    data.scale[1] * globalScale,
    data.scale[2] * globalScale
  ];

  return (
    <mesh 
      ref={meshRef}
      position={data.position} 
      scale={finalScale}
    >
      {renderGeometry()}
      <meshStandardMaterial color={data.color} />
    </mesh>
  );
}

// Componente para generar un patrón de cuadrícula
export function GridPattern({ data, globalScale, animate }) {
  const objects = [];
  const gridSize = data.gridSize || 5;
  const spacing = data.spacing || 2;
  const halfGrid = Math.floor(gridSize / 2);
  
  for (let x = -halfGrid; x <= halfGrid; x++) {
    for (let z = -halfGrid; z <= halfGrid; z++) {
      const objectData = data.objects[0];
      objects.push({
        id: `grid-${x}-${z}`,
        type: objectData.type,
        position: [x * spacing, 0, z * spacing],
        scale: [objectData.baseScale, objectData.baseScale, objectData.baseScale],
        color: objectData.color
      });
    }
  }

  return (
    <>
      {objects.map(obj => (
        <ParametricObject 
          key={obj.id} 
          data={obj} 
          globalScale={globalScale}
          animate={animate}
        />
      ))}
    </>
  );
}

// Componente para generar un patrón espiral
export function SpiralPattern({ data, globalScale, animate }) {
  const objects = [];
  const count = data.count || 20;
  const radius = data.radius || 5;
  const height = data.height || 8;
  const rotations = data.rotations || 2;
  const objectData = data.objects[0];
  
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const angle = t * Math.PI * 2 * rotations;
    const x = Math.cos(angle) * radius * t;
    const y = (t - 0.5) * height;
    const z = Math.sin(angle) * radius * t;
    
    // Interpolación de color
    const colorStart = objectData.colorStart || objectData.color || '#ffffff';
    const colorEnd = objectData.colorEnd || objectData.color || '#000000';
    
    objects.push({
      id: `spiral-${i}`,
      type: objectData.type,
      position: [x, y, z],
      scale: [objectData.baseScale, objectData.baseScale, objectData.baseScale],
      color: t < 0.5 ? colorStart : colorEnd
    });
  }

  return (
    <>
      {objects.map(obj => (
        <ParametricObject 
          key={obj.id} 
          data={obj} 
          globalScale={globalScale}
          animate={animate}
        />
      ))}
    </>
  );
}
