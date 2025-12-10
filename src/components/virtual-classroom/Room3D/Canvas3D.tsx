"use client";

// Lightweight three.js renderer without @react-three/fiber to avoid React hook conflicts.

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export function Canvas3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number | null>(null);
  const [supported] = useState(() => hasWebGL());

  useEffect(() => {
    if (!supported) return;
    const container = containerRef.current;
    if (!container) return;

    // Scene basics
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f8fafc");

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(6, 6, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 0.9);
    directional.position.set(6, 8, 4);
    directional.castShadow = true;
    scene.add(directional);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({ color: "#e2e8f0" });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Desk grid (few boxes to keep light)
    const deskGeo = new THREE.BoxGeometry(1.2, 0.2, 0.8);
    const deskMat = new THREE.MeshStandardMaterial({ color: "#cbd5e1" });
    const desks: THREE.Mesh[] = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const mesh = new THREE.Mesh(deskGeo, deskMat);
        mesh.position.set(col * 1.6 - 2.4, 0.1, row * 1.6 - 1.6);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        desks.push(mesh);
      }
    }

    // Floating box as “player”
    const boxGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const boxMat = new THREE.MeshStandardMaterial({ color: "#10b981" });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, 0.6, 0);
    box.castShadow = true;
    scene.add(box);

    // Resize handler
    const handleResize = () => {
      if (!rendererRef.current) return;
      const { clientWidth, clientHeight } = container;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(clientWidth, clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Animate
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const t = performance.now() * 0.001;
      box.rotation.x = t * 0.6;
      box.rotation.y = t * 0.8;
      box.position.y = 0.6 + Math.sin(t) * 0.15;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", handleResize);
      desks.forEach((m) => scene.remove(m));
      scene.remove(box);
      floorGeo.dispose();
      floorMat.dispose();
      deskGeo.dispose();
      deskMat.dispose();
      boxGeo.dispose();
      boxMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, [supported]);

  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-2xl border border-slate-300 bg-slate-100 shadow-inner">
      {!supported && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-600">
          WebGL未対応のため2Dプレビューに切替
        </div>
      )}
      <div ref={containerRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold text-white shadow">
        3D Mode (three.js)
      </div>
    </div>
  );
}
