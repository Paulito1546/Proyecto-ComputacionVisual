import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import dat from "dat.gui";

function Escena() {
  const padref = useRef();
  const hijoref = useRef();
  const nietoref = useRef();

  const [rotPadre, setRotPadre] = useState({ x: 0, y: 0, z: 0 });
  const [rotHijo, setRotHijo] = useState({ x: 0, y: 0, z: 0 });
  const [rotNieto, setRotNieto] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const guiPadre = new dat.GUI();
    const guiHijo = guiPadre.addFolder("Cubo naranja (hijo)");
    const guiNieto = guiHijo.addFolder("Cono azul (nieto)");

    guiPadre.add(rotPadre, "x", 0, Math.PI * 2).name("Padre X").onChange(val => setRotPadre(r => ({ ...r, x: val })));
    guiPadre.add(rotPadre, "y", 0, Math.PI * 2).name("Padre Y").onChange(val => setRotPadre(r => ({ ...r, y: val })));
    guiPadre.add(rotPadre, "z", 0, Math.PI * 2).name("Padre Z").onChange(val => setRotPadre(r => ({ ...r, z: val })));

    guiHijo.add(rotHijo, "x", 0, Math.PI * 2).name("Hijo X").onChange(val => setRotHijo(r => ({ ...r, x: val })));
    guiHijo.add(rotHijo, "y", 0, Math.PI * 2).name("Hijo Y").onChange(val => setRotHijo(r => ({ ...r, y: val })));
    guiHijo.add(rotHijo, "z", 0, Math.PI * 2).name("Hijo Z").onChange(val => setRotHijo(r => ({ ...r, z: val })));

    guiNieto.add(rotNieto, "x", 0, Math.PI * 2).name("Nieto X").onChange(val => setRotNieto(r => ({ ...r, x: val })));
    guiNieto.add(rotNieto, "y", 0, Math.PI * 2).name("Nieto Y").onChange(val => setRotNieto(r => ({ ...r, y: val })));
    guiNieto.add(rotNieto, "z", 0, Math.PI * 2).name("Nieto Z").onChange(val => setRotNieto(r => ({ ...r, z: val })));

    return () => guiPadre.destroy();
  }, []);

  useFrame(() => {
    if (padref.current) {
      padref.current.rotation.x = rotPadre.x;
      padref.current.rotation.y = rotPadre.y;
      padref.current.rotation.z = rotPadre.z;
    }
    if (hijoref.current) {
      hijoref.current.rotation.x = rotHijo.x;
      hijoref.current.rotation.y = rotHijo.y;
      hijoref.current.rotation.z = rotHijo.z;
    }
    if (nietoref.current) {
      nietoref.current.rotation.x = rotNieto.x;
      nietoref.current.rotation.y = rotNieto.y;
      nietoref.current.rotation.z = rotNieto.z;
    }
  });

  return (
    <group ref={padref}>
      {/* Cubo naranja (hijo) */}
      <group ref={hijoref} position={[2, 0, 0]}>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
        {/* Cono azul (nieto) */}
        <mesh ref={nietoref} position={[0, 2, 0]}>
          <coneGeometry args={[0.75, 1.5, 16]} />
          <meshStandardMaterial color="skyblue" />
        </mesh>
      </group>
      {/* Esfera amarilla (otro hijo independiente) */}
      <mesh position={[-2, 0, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
    </group>
  );
}

export default function App() {
  return (
    <Canvas style={{ height: "500px", width: "800px" }} camera={{ position: [0, 5, 10], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 7]} intensity={1} />
      <Escena />
    </Canvas>
  );
}
