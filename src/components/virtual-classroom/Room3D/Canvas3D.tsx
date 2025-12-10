/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";

import "@/types/r3f";
import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, ContactShadows } from "@react-three/drei";
import { Suspense } from "react";

type DeskProps = { position: [number, number, number] };

function Desk({ position }: DeskProps) {
  return (
    // @ts-expect-error - r3f intrinsic elements are added via @react-three/fiber types
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
  const [mounted, setMounted] = useState(false);
  const webglSupported = useMemo(() => {
    if (typeof window === "undefined") return true;
    try {
      const canvas = document.createElement("canvas");
      return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) {
    return (
      <div className="relative h-[520px] w-full rounded-2xl border border-slate-200 bg-slate-50 shadow-inner">
        <div className="absolute inset-0 flex items-center justify-center text-slate-500">Loading 3D...</div>
      </div>
    );
  }

  if (!webglSupported) {
    return (
      <div className="relative h-[520px] w-full rounded-2xl border border-amber-200 bg-amber-50 shadow-inner">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-amber-700">
          <p className="font-semibold">WebGL がサポートされていないため 3D 教室を表示できません。</p>
          <p className="text-sm">別のブラウザをお試しください。</p>
        </div>
      </div>
    );
  }

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
