// @ts-nocheck
"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, ContactShadows } from "@react-three/drei";
import { Suspense } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      boxGeometry: any;
      meshStandardMaterial: any;
      ambientLight: any;
      directionalLight: any;
      planeGeometry: any;
    }
  }
}

type DeskProps = { position: [number, number, number] };

function Desk({ position }: DeskProps) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.2, 1]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[1.4, 0.1, 1]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
    </group>
  );
}

function ClassroomScene() {
  const desks: DeskProps["position"][] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      desks.push([col * 1.8 - 3.6, 0.2, row * 1.8 - 2.5]);
    }
  }

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[6, 6, 4]} intensity={0.9} castShadow shadow-mapSize={[1024, 1024]} />

      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      <mesh position={[0, 2.5, -5]} receiveShadow>
        <boxGeometry args={[12, 5, 0.2]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {desks.map((pos, idx) => (
        <Desk key={idx} position={pos} />
      ))}

      <ContactShadows position={[0, -0.01, 0]} opacity={0.3} scale={14} blur={1.5} far={5} />
      <Environment preset="city" />
      <OrbitControls enablePan={false} enableZoom={true} minDistance={6} maxDistance={16} />
    </>
  );
}

export function Canvas3D() {
  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner">
      <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-slate-500">Loading 3D...</div>}>
        <Canvas shadows camera={{ position: [6, 6, 10], fov: 40 }}>
          <ClassroomScene />
        </Canvas>
      </Suspense>
      <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow">
        Virtual Classroom (R3F)
      </div>
    </div>
  );
}
