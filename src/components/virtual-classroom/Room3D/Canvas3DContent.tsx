"use client";
// @ts-nocheck

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function FloatingBox() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.x = t * 0.2;
      ref.current.rotation.y = t * 0.3;
      ref.current.position.y = 0.6 + Math.sin(t) * 0.2;
    }
  });
  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#10b981" />
    </mesh>
  );
}

export function Canvas3DContent() {
  return (
    <Canvas shadows camera={{ position: [4, 4, 6], fov: 45 }}>
      <color attach="background" args={["#f8fafc"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[6, 8, 4]} intensity={1} castShadow shadow-mapSize={[1024, 1024]} />
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <FloatingBox />
      <OrbitControls enablePan={false} minDistance={4} maxDistance={10} />
    </Canvas>
  );
}
