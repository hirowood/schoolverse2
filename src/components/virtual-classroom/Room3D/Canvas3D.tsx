"use client";

// 3D/2D 切り替え可能な軽量 three.js 実装（R3F不使用）。3Dが重い/落ちる環境でも 2D に即切替できます。

import { useEffect, useMemo, useRef, useState } from "react";
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

function FlatPlaceholder() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-700">
      <div className="text-xl font-bold">2D Classroom Preview</div>
      <p className="text-sm text-slate-600">3Dが利用できない場合はこのモードで閲覧できます。</p>
      <div className="mt-2 h-24 w-48 rounded-xl bg-white/70 shadow-inner border border-slate-300 flex items-center justify-center text-slate-500">
        Flat Mode
      </div>
    </div>
  );
}

export function Canvas3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number | null>(null);
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const lastTimeRef = useRef<number | null>(null);
  const supported = useMemo(() => hasWebGL(), []);
  const [mode, setMode] = useState<"3d" | "2d">(() => (supported ? "3d" : "2d"));

  useEffect(() => {
    if (!supported || mode !== "3d") return;
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
      const now = performance.now();
      const t = now * 0.001;

      const last = lastTimeRef.current ?? now;
      const delta = Math.min((now - last) / 1000, 0.05); // clamp delta for stability
      lastTimeRef.current = now;

      // WASD move the box on the floor plane
      const speed = 2.5; // units per second
      const moveX =
        (pressedKeysRef.current.has("d") || pressedKeysRef.current.has("arrowright") ? 1 : 0) -
        (pressedKeysRef.current.has("a") || pressedKeysRef.current.has("arrowleft") ? 1 : 0);
      const moveZ =
        (pressedKeysRef.current.has("s") || pressedKeysRef.current.has("arrowdown") ? 1 : 0) -
        (pressedKeysRef.current.has("w") || pressedKeysRef.current.has("arrowup") ? 1 : 0);

      if (moveX !== 0 || moveZ !== 0) {
        const len = Math.hypot(moveX, moveZ) || 1;
        box.position.x += (moveX / len) * speed * delta;
        box.position.z += (moveZ / len) * speed * delta;
        // keep inside floor bounds
        box.position.x = THREE.MathUtils.clamp(box.position.x, -5.5, 5.5);
        box.position.z = THREE.MathUtils.clamp(box.position.z, -5.5, 5.5);
      }

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
  }, [supported, mode]);

  // Keyboard controls for WASD / arrow keys
  useEffect(() => {
    if (!supported || mode !== "3d") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
        pressedKeysRef.current.add(key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      pressedKeysRef.current.delete(key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [supported, mode]);

  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-2xl border border-slate-300 bg-slate-100 shadow-inner">
      {mode === "3d" && supported && <div ref={containerRef} className="absolute inset-0" />}
      {(mode === "2d" || !supported) && <FlatPlaceholder />}

      <div className="absolute left-3 top-3 flex items-center gap-2 z-10">
        <span className={`rounded-full px-3 py-1 text-[11px] font-bold text-white shadow ${mode === "3d" && supported ? "bg-emerald-500" : "bg-blue-500"}`}>
          {mode === "3d" && supported ? "3D Mode (three.js)" : "2D Mode"}
        </span>
        {mode === "3d" && supported && (
          <span className="rounded-md bg-white/80 px-2 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200 shadow-sm">
            WASD / ↑↓←→ で移動
          </span>
        )}
      </div>

      <div className="absolute right-3 top-3 z-10 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("3d")}
          disabled={!supported}
          className={`rounded-md px-3 py-1 text-xs font-semibold shadow ${mode === "3d" ? "bg-emerald-600 text-white" : "bg-white text-slate-700 border border-slate-200"} ${!supported ? "opacity-50 cursor-not-allowed" : ""}`}
          title={!supported ? "WebGL非対応のため使用不可" : "3D表示に切り替え"}
        >
          3Dに切替
        </button>
        <button
          type="button"
          onClick={() => setMode("2d")}
          className={`rounded-md px-3 py-1 text-xs font-semibold shadow ${mode === "2d" || !supported ? "bg-blue-600 text-white" : "bg-white text-slate-700 border border-slate-200"}`}
        >
          2Dに切替
        </button>
      </div>
    </div>
  );
}
