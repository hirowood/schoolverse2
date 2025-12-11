"use client";

// three.jsの軽量実装（R3F非依存）。3D/2Dトグル、WASD移動、FPS視点。
// 他プレイヤー表示: Presenceから位置を受け取りキューブ＋ラベルで描画、lerpで補間。
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useVirtualRoomStore } from "@/stores/useVirtualRoomStore";
import {
  useClassroomPresence,
  type PlayerState,
  type UseClassroomPresenceResult,
} from "@/hooks/useClassroomPresence";

type Props = {
  roomId?: string | null;
  userId?: string | null;
  userName?: string | null;
  presence?: UseClassroomPresenceResult | null;
};

function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

function FlatPlaceholder({
  broadcastPosition,
  setPosition,
  otherPlayers,
}: {
  broadcastPosition: (pos: { x: number; y: number; z: number }) => void;
  setPosition: (pos: { x: number; y: number; z: number }) => void;
  otherPlayers: Map<string, PlayerState>;
}) {
  // 簡易なドット絵教室（移動可能）
  const size = 32;
  const worldRange = 5.5;
  const gridToWorld = useCallback((value: number) => (value / (size - 1)) * (worldRange * 2) - worldRange, [size, worldRange]);
  const worldToGrid = useCallback(
    (value: number) => Math.round(((value + worldRange) / (worldRange * 2)) * (size - 1)),
    [size, worldRange],
  );
  const [pos, setPos] = useState({ x: Math.floor(size / 2), y: Math.floor(size / 2) });

  // 初期位置を同期
  useEffect(() => {
    const worldPos = { x: gridToWorld(pos.x), y: 0.6, z: gridToWorld(pos.y) };
    setPosition(worldPos);
    broadcastPosition(worldPos);
  }, [broadcastPosition, gridToWorld, pos.x, pos.y, setPosition]);

  const movePlayer = useCallback((dx: number, dy: number) => {
    setPos((p) => {
      const next = {
        x: Math.min(size - 1, Math.max(0, p.x + dx)),
        y: Math.min(size - 1, Math.max(0, p.y + dy)),
      };
      const worldPos = { x: gridToWorld(next.x), y: 0.6, z: gridToWorld(next.y) };
      setPosition(worldPos);
      broadcastPosition(worldPos);
      return next;
    });
  }, [broadcastPosition, setPosition, size, gridToWorld]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      let dx = 0;
      let dy = 0;
      if (key === "arrowup" || key === "w") dy = -1;
      if (key === "arrowdown" || key === "s") dy = 1;
      if (key === "arrowleft" || key === "a") dx = -1;
      if (key === "arrowright" || key === "d") dx = 1;
      if (dx === 0 && dy === 0) return;
      e.preventDefault();
      movePlayer(dx, dy);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [movePlayer]);

  const pixels = Array.from({ length: size }, () => Array.from({ length: size }, () => "."));

  // 壁を全体に張る
  const margin = 3;
  for (let x = margin; x < size - margin; x++) {
    pixels[margin][x] = "G";
    pixels[size - margin - 1][x] = "G";
  }
  for (let y = margin; y < size - margin; y++) {
    pixels[y][margin] = "G";
    pixels[y][size - margin - 1] = "G";
  }

  // 窓
  const windowX = Math.floor(size * 0.35);
  const windowY = margin + 1;
  pixels[windowY][windowX] = "#";
  pixels[windowY][windowX + 1] = "#";

  // 先生位置
  const teacherX = Math.floor(size * 0.6);
  const teacherY = Math.floor(size * 0.55);
  pixels[teacherY][teacherX] = "T";
  if (pixels[teacherY + 1] && pixels[teacherY + 1][teacherX + 1] !== undefined) {
    pixels[teacherY + 1][teacherX + 1] = "T";
  }

  // 机（オレンジ）を複数配置
  const desks = [
    { x: Math.floor(size * 0.2), y: Math.floor(size * 0.25) },
    { x: Math.floor(size * 0.45), y: Math.floor(size * 0.25) },
    { x: Math.floor(size * 0.2), y: Math.floor(size * 0.7) },
    { x: Math.floor(size * 0.7), y: Math.floor(size * 0.7) },
  ];
  desks.forEach((d) => {
    if (pixels[d.y] && pixels[d.y][d.x] !== undefined) {
      pixels[d.y][d.x] = "D";
    }
  });

  // プレイヤー
  pixels[pos.y][pos.x] = "P";

  // 他プレイヤー位置のスムージング用
  const targetsRef = useRef<Map<string, { x: number; y: number; color: string }>>(new Map());
  const displayRef = useRef<Map<string, { x: number; y: number; color: string }>>(new Map());
  const animRef = useRef<number | null>(null);
  const [renderRemotes, setRenderRemotes] = useState<{ x: number; y: number; color: string }[]>([]);

  useEffect(() => {
    // 更新されたターゲットをセット
    const nextTargets = new Map<string, { x: number; y: number; color: string }>();
    otherPlayers.forEach((player) => {
      const gx = THREE.MathUtils.clamp(worldToGrid(player.position.x), 0, size - 1);
      const gy = THREE.MathUtils.clamp(worldToGrid(player.position.z), 0, size - 1);
      const color = player.status === "battling" ? "#ef4444" : player.avatarColor ?? "#22c55e";
      nextTargets.set(player.userId, { x: gx, y: gy, color });
      if (!displayRef.current.has(player.userId)) {
        // 初回は即座に表示位置を合わせる
        displayRef.current.set(player.userId, { x: gx, y: gy, color });
      }
    });
    // 消えたプレイヤーを除去
    displayRef.current.forEach((_, key) => {
      if (!nextTargets.has(key)) displayRef.current.delete(key);
    });
    targetsRef.current = nextTargets;

    // スムージングループ
    const tick = () => {
      const updated = new Map<string, { x: number; y: number; color: string }>();
      displayRef.current.forEach((cur, key) => {
        const target = targetsRef.current.get(key);
        if (!target) return;
        const lerp = 0.25;
        const nx = cur.x + (target.x - cur.x) * lerp;
        const ny = cur.y + (target.y - cur.y) * lerp;
        updated.set(key, { x: nx, y: ny, color: target.color });
      });
      displayRef.current = updated;
      setRenderRemotes(Array.from(displayRef.current.values()));
      animRef.current = requestAnimationFrame(tick);
    };

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      animRef.current = null;
    };
  }, [otherPlayers, size, worldToGrid]);

  const colorMap: Record<string, string> = {
    ".": "transparent",
    G: "#94a3b8", // desk/ground
    "#": "#0ea5e9", // window
    P: "#22c55e", // player
    T: "#f59e0b", // teacher/marker
    D: "#f59e0b", // desks
  };

  return (
    <div className="absolute inset-0 flex flex-col gap-3 text-slate-700">
      <div className="flex items-start justify-between px-3 pt-3">
        <div>
          <div className="text-lg font-bold">2D Classroom (Pixel)</div>
          <p className="text-xs text-slate-600">
        WebGL非対応時はこちらのドット絵ビューをご利用ください。WASD/矢印キーで移動できます。
          </p>
        </div>
        <p className="text-[11px] text-slate-500">ドット絵背景・机/キャラクターの追加予定</p>
      </div>
      <div className="relative flex-1 p-3">
        <div
          className="h-full w-full rounded-2xl border border-slate-300 bg-white/80 p-4 shadow-inner"
          style={{ imageRendering: "pixelated" }}
        >
          <div className="relative h-full w-full">
            {/* グリッド本体 */}
            <div
              className="grid h-full w-full"
              style={{
                gridTemplateColumns: `repeat(${size}, 1fr)`,
                gridTemplateRows: `repeat(${size}, 1fr)`,
              }}
            >
              {pixels.flatMap((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${x}-${y}`}
                    style={{
                      backgroundColor: colorMap[cell] ?? "transparent",
                    }}
                    className="h-full w-full"
                  />
                )),
              )}
            </div>
            {/* プレイヤーとリモートを目立たせるオーバーレイ（滑らかな移動） */}
            <div className="pointer-events-none absolute inset-0">
              <div
                className="absolute rounded-sm border border-white shadow-[0_0_0_2px_rgba(0,0,0,0.08)]"
                style={{
                  width: `${100 / size}%`,
                  height: `${100 / size}%`,
                  left: `${(pos.x / size) * 100}%`,
                  top: `${(pos.y / size) * 100}%`,
                  backgroundColor: "#22c55e",
                  transition: "left 140ms ease, top 140ms ease",
                }}
              />
              {renderRemotes.map((p, idx) => (
                <div
                  key={`${p.x}-${p.y}-${idx}`}
                  className="absolute rounded-sm border border-white shadow-[0_0_0_2px_rgba(0,0,0,0.08)]"
                  style={{
                    width: `${100 / size}%`,
                    height: `${100 / size}%`,
                    left: `${(p.x / size) * 100}%`,
                    top: `${(p.y / size) * 100}%`,
                    backgroundColor: p.color,
                    transition: "left 200ms ease, top 200ms ease",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* モバイル用バーチャルコントローラ */}
      <div className="pointer-events-none absolute inset-0">
        <div className="pointer-events-auto absolute bottom-4 left-4 flex gap-4">
          <div className="grid h-24 w-24 grid-cols-3 grid-rows-3 gap-1">
            <button
              type="button"
              aria-label="上に移動"
              className="col-start-2 row-start-1 rounded-full bg-white/80 text-slate-700 shadow ring-1 ring-slate-300"
              onClick={() => movePlayer(0, -1)}
            >
              ↑
            </button>
            <button
              type="button"
              aria-label="左に移動"
              className="col-start-1 row-start-2 rounded-full bg-white/80 text-slate-700 shadow ring-1 ring-slate-300"
              onClick={() => movePlayer(-1, 0)}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="右に移動"
              className="col-start-3 row-start-2 rounded-full bg-white/80 text-slate-700 shadow ring-1 ring-slate-300"
              onClick={() => movePlayer(1, 0)}
            >
              →
            </button>
            <button
              type="button"
              aria-label="下に移動"
              className="col-start-2 row-start-3 rounded-full bg-white/80 text-slate-700 shadow ring-1 ring-slate-300"
              onClick={() => movePlayer(0, 1)}
            >
              ↓
            </button>
          </div>
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              aria-label="Aボタン（決定）"
              className="h-12 w-12 rounded-full bg-emerald-500 text-white text-lg font-bold shadow ring-2 ring-emerald-200"
              onClick={() => {
                // 決定アクション（将来のインタラクション用）
              }}
            >
              A
            </button>
            <button
              type="button"
              aria-label="Bボタン（メニュー予定）"
              className="h-12 w-12 rounded-full bg-amber-500 text-white text-lg font-bold shadow ring-2 ring-amber-200"
              onClick={() => {
                // メニュー表示予定のプレースホルダ
              }}
            >
              B
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type OtherPlayerMesh = {
  mesh: THREE.Mesh;
  label: THREE.Sprite;
  target: THREE.Vector3;
};

function createLabelSprite(text: string, color = "#0f172a"): THREE.Sprite {
  const canvas = document.createElement("canvas");
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "#cbd5e1";
    ctx.strokeRect(0, 0, size, size);
    ctx.fillStyle = color;
    ctx.font = "bold 48px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, size / 2, size / 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.5, 0.6, 1);
  return sprite;
}

export function Canvas3D({
  roomId = "default",
  userId = null,
  userName = null,
  presence,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number | null>(null);
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const lastTimeRef = useRef<number | null>(null);
  const yawRef = useRef<number>(Math.PI * 1.25); // 初期カメラ角度
  const pitchRef = useRef<number>(0.35); // 上から見下ろす
  const distanceRef = useRef<number>(6);
  const draggingRef = useRef<boolean>(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const supported = useMemo(() => hasWebGL(), []);
  const [mode, setMode] = useState<"3d" | "2d">(() => (supported ? "3d" : "2d"));
  const { setPosition, triggerAutoEncounter } = useVirtualRoomStore();
  const lastZoneRef = useRef<string | null>(null);
  const presenceHook = useClassroomPresence(roomId, userId, userName, !presence);
  const effectivePresence = presence ?? presenceHook;
  const { broadcastPosition, otherPlayers } = effectivePresence;
  const otherPlayerRefs = useRef<Map<string, OtherPlayerMesh>>(new Map());
  const othersGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!supported || mode !== "3d") return;
    const container = containerRef.current;
    if (!container) return;
    const playerRefs = otherPlayerRefs.current;

    // Scene basics
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f8fafc");

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 200);
    camera.position.set(6, 4, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 1.5)); // 軽量化
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 0.9);
    directional.position.set(6, 8, 4);
    directional.castShadow = false;
    scene.add(directional);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({ color: "#e2e8f0" });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = false;
    scene.add(floor);

    // Desk grid (軽量版 2x3)
    const deskGeo = new THREE.BoxGeometry(1.2, 0.2, 0.8);
    const deskMat = new THREE.MeshStandardMaterial({ color: "#cbd5e1" });
    const desks: THREE.Mesh[] = [];
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const mesh = new THREE.Mesh(deskGeo, deskMat);
        mesh.position.set(col * 1.8 - 1.8, 0.1, row * 1.8 - 0.9);
        scene.add(mesh);
        desks.push(mesh);
      }
    }

    // Floating box as “player”
    const boxGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const boxMat = new THREE.MeshStandardMaterial({ color: "#10b981" });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, 0.6, 0);
    scene.add(box);

    // Other players group
    const othersGroup = new THREE.Group();
    scene.add(othersGroup);
    othersGroupRef.current = othersGroup;

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
      const speed = 2.0; // units per second (少し抑えて滑らかに)
      const moveX =
        (pressedKeysRef.current.has("d") || pressedKeysRef.current.has("arrowright") ? 1 : 0) -
        (pressedKeysRef.current.has("a") || pressedKeysRef.current.has("arrowleft") ? 1 : 0);
      const moveZ =
        (pressedKeysRef.current.has("s") || pressedKeysRef.current.has("arrowdown") ? 1 : 0) -
        (pressedKeysRef.current.has("w") || pressedKeysRef.current.has("arrowup") ? 1 : 0);

      if (moveX !== 0 || moveZ !== 0) {
        // カメラの向きに合わせた移動ベクトル
        const forward = new THREE.Vector3(Math.sin(yawRef.current), 0, Math.cos(yawRef.current));
        const right = new THREE.Vector3(forward.z, 0, -forward.x);
        const moveVec = new THREE.Vector3().addScaledVector(right, moveX).addScaledVector(forward, moveZ);
        const len = moveVec.length() || 1;
        moveVec.divideScalar(len).multiplyScalar(speed * delta);
        box.position.add(moveVec);
        box.position.x = THREE.MathUtils.clamp(box.position.x, -5.5, 5.5);
        box.position.z = THREE.MathUtils.clamp(box.position.z, -5.5, 5.5);
      }

      box.rotation.x = t * 0.6;
      box.rotation.y = t * 0.8;
      box.position.y = 0.6 + Math.sin(t) * 0.15;

      // push position to store + zone detection (store handles zone)
      setPosition({ x: box.position.x, y: box.position.y, z: box.position.z });
      broadcastPosition({ x: box.position.x, y: box.position.y, z: box.position.z });
      const currentZone = useVirtualRoomStore.getState().currentZone;
      if (currentZone?.id !== lastZoneRef.current) {
        lastZoneRef.current = currentZone?.id ?? null;
        void triggerAutoEncounter(currentZone);
      }

      // FPSライクな視点: プレイヤーを中心にカメラを回す
      const r = distanceRef.current;
      const yaw = yawRef.current;
      const pitch = THREE.MathUtils.clamp(pitchRef.current, -1.2, 1.2);
      const offset = new THREE.Vector3(
        Math.sin(yaw) * Math.cos(pitch),
        Math.sin(pitch),
        Math.cos(yaw) * Math.cos(pitch),
      ).multiplyScalar(r);
      const target = new THREE.Vector3(box.position.x, box.position.y + 0.35, box.position.z);
      camera.position.copy(target).add(offset);
      camera.lookAt(target);

      // Other players lerp updates
      otherPlayerRefs.current.forEach(({ mesh, label, target }) => {
        mesh.position.lerp(target, 0.18);
        mesh.position.y = 0.4;
        label.position.copy(mesh.position).add(new THREE.Vector3(0, 0.8, 0));
        label.lookAt(camera.position);
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", handleResize);
      desks.forEach((m) => scene.remove(m));
      scene.remove(box);
      scene.remove(othersGroup);
      othersGroupRef.current = null;
      playerRefs.forEach(({ mesh, label }) => {
        if (mesh.material instanceof THREE.Material) {
          mesh.material.dispose();
        }
        mesh.geometry.dispose();
        if (label.material instanceof THREE.SpriteMaterial) {
          label.material.map?.dispose();
          label.material.dispose();
        }
      });
      floorGeo.dispose();
      floorMat.dispose();
      deskGeo.dispose();
      deskMat.dispose();
      boxGeo.dispose();
      boxMat.dispose();
      othersGroup.children.forEach((child) => {
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      playerRefs.clear();
    };
  }, [supported, mode, setPosition, triggerAutoEncounter, broadcastPosition]);

  // Other players sync: create, update targets, clean up missing
  useEffect(() => {
    const group = othersGroupRef.current;
    if (!group) return;

    const seen = new Set<string>();
    otherPlayers.forEach((player, key) => {
      seen.add(key);
      let entry = otherPlayerRefs.current.get(key);
      if (!entry) {
        const geom = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const mat = new THREE.MeshStandardMaterial({
          color: player.avatarColor ?? "#64748b",
          emissive: new THREE.Color("#000000"),
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.castShadow = false;
        mesh.receiveShadow = false;

        const label = createLabelSprite(player.userName ?? "プレイヤー", "#0f172a");
        const target = new THREE.Vector3(player.position.x, 0.4, player.position.z);
        mesh.position.copy(target);
        label.position.copy(target).add(new THREE.Vector3(0, 0.8, 0));

        group.add(mesh);
        group.add(label);
        otherPlayerRefs.current.set(key, { mesh, label, target });
        entry = otherPlayerRefs.current.get(key)!;
      }

      entry.target.set(player.position.x, 0.4, player.position.z);
      const mat = entry.mesh.material as THREE.MeshStandardMaterial;
      mat.color = new THREE.Color(player.avatarColor ?? "#64748b");
      mat.emissive.set(player.status === "battling" ? "#ef4444" : "#000000");
      entry.label.position.copy(entry.mesh.position).add(new THREE.Vector3(0, 0.8, 0));
    });

    // Remove players that have left
    otherPlayerRefs.current.forEach((entry, key) => {
      if (seen.has(key)) return;
      group.remove(entry.mesh);
      group.remove(entry.label);
      if (entry.mesh.material instanceof THREE.Material) {
        entry.mesh.material.dispose();
      }
      entry.mesh.geometry.dispose();
      if (entry.label.material instanceof THREE.SpriteMaterial) {
        entry.label.material.map?.dispose();
        entry.label.material.dispose();
      }
      otherPlayerRefs.current.delete(key);
    });
  }, [otherPlayers]);

  // Mouse look & zoom: FPS-like camera pivoting around the player
  useEffect(() => {
    if (!supported || mode !== "3d") return;
    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      draggingRef.current = true;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      container.style.cursor = "grabbing";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current || !lastPointerRef.current) return;
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };

      const sensitivity = 0.005;
      yawRef.current += dx * sensitivity;
      pitchRef.current = THREE.MathUtils.clamp(pitchRef.current - dy * sensitivity, -1.2, 1.2);
    };

    const stopDrag = () => {
      draggingRef.current = false;
      lastPointerRef.current = null;
      container.style.cursor = "grab";
    };

    const handleWheel = (e: WheelEvent) => {
      const delta = e.deltaY > 0 ? 1 : -1;
      distanceRef.current = THREE.MathUtils.clamp(distanceRef.current + delta * 0.6, 3, 12);
    };

    container.style.cursor = "grab";
    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseup", stopDrag);
    container.addEventListener("mouseleave", stopDrag);
    container.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      container.style.cursor = "default";
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseup", stopDrag);
      container.removeEventListener("mouseleave", stopDrag);
      container.removeEventListener("wheel", handleWheel);
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

  const handleVirtualPress = useCallback((keys: string[], down: boolean) => {
    keys.forEach((k) => {
      if (down) {
        pressedKeysRef.current.add(k);
      } else {
        pressedKeysRef.current.delete(k);
      }
    });
  }, []);

  return (
    <div className="relative h-[calc(100vh-160px)] min-h-[560px] w-full overflow-hidden rounded-2xl border border-slate-300 bg-slate-100 shadow-inner">
      {mode === "3d" && supported && <div ref={containerRef} className="absolute inset-0 cursor-grab" />}
      {(mode === "2d" || !supported) && (
        <FlatPlaceholder
          broadcastPosition={broadcastPosition}
          setPosition={setPosition}
          otherPlayers={otherPlayers}
        />
      )}

      {mode === "3d" && (
        <div className="pointer-events-none absolute inset-0 lg:hidden">
          <div className="pointer-events-auto absolute bottom-4 left-4 flex gap-4">
            <div className="grid h-24 w-24 grid-cols-3 grid-rows-3 gap-1">
              <button
                type="button"
                aria-label="上に移動"
                className="col-start-2 row-start-1 rounded-full bg-white/90 text-slate-700 shadow ring-1 ring-slate-300 active:translate-y-0.5"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleVirtualPress(["w", "arrowup"], true);
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  handleVirtualPress(["w", "arrowup"], false);
                }}
                onPointerLeave={() => handleVirtualPress(["w", "arrowup"], false)}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label="左に移動"
                className="col-start-1 row-start-2 rounded-full bg-white/90 text-slate-700 shadow ring-1 ring-slate-300 active:translate-y-0.5"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleVirtualPress(["a", "arrowleft"], true);
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  handleVirtualPress(["a", "arrowleft"], false);
                }}
                onPointerLeave={() => handleVirtualPress(["a", "arrowleft"], false)}
              >
                ←
              </button>
              <button
                type="button"
                aria-label="右に移動"
                className="col-start-3 row-start-2 rounded-full bg-white/90 text-slate-700 shadow ring-1 ring-slate-300 active:translate-y-0.5"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleVirtualPress(["d", "arrowright"], true);
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  handleVirtualPress(["d", "arrowright"], false);
                }}
                onPointerLeave={() => handleVirtualPress(["d", "arrowright"], false)}
              >
                →
              </button>
              <button
                type="button"
                aria-label="下に移動"
                className="col-start-2 row-start-3 rounded-full bg-white/90 text-slate-700 shadow ring-1 ring-slate-300 active:translate-y-0.5"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleVirtualPress(["s", "arrowdown"], true);
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  handleVirtualPress(["s", "arrowdown"], false);
                }}
                onPointerLeave={() => handleVirtualPress(["s", "arrowdown"], false)}
              >
                ↓
              </button>
            </div>
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                aria-label="Aボタン（決定）"
                className="h-12 w-12 rounded-full bg-emerald-500 text-white text-lg font-bold shadow ring-2 ring-emerald-200 active:translate-y-0.5"
                onPointerDown={(e) => e.preventDefault()}
              >
                A
              </button>
              <button
                type="button"
                aria-label="Bボタン（メニュー）"
                className="h-12 w-12 rounded-full bg-amber-500 text-white text-lg font-bold shadow ring-2 ring-amber-200 active:translate-y-0.5"
                onPointerDown={(e) => e.preventDefault()}
              >
                B
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute left-3 top-3 flex items-center gap-2 z-10">
        <span className={`rounded-full px-3 py-1 text-[11px] font-bold text-white shadow ${mode === "3d" && supported ? "bg-emerald-500" : "bg-blue-500"}`}>
          {mode === "3d" && supported ? "3D Mode (three.js)" : "2D Mode"}
        </span>
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
