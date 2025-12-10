/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Grid } from "@react-three/drei";
import * as THREE from "three";

// ===== プレイヤーアバター（WASD移動対応） =====
function PlayerAvatar() {
  const meshRef = useRef<THREE.Group>(null);
  const [position, setPosition] = useState<[number, number, number]>([0, 0.6, 4]);
  const keysPressed = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const speed = 3 * delta;
    let [x, , z] = position;
    
    if (keysPressed.current.has("w") || keysPressed.current.has("arrowup")) z -= speed;
    if (keysPressed.current.has("s") || keysPressed.current.has("arrowdown")) z += speed;
    if (keysPressed.current.has("a") || keysPressed.current.has("arrowleft")) x -= speed;
    if (keysPressed.current.has("d") || keysPressed.current.has("arrowright")) x += speed;
    
    // 境界制限
    x = Math.max(-8, Math.min(8, x));
    z = Math.max(-4, Math.min(6, z));
    
    if (x !== position[0] || z !== position[2]) {
      setPosition([x, y, z]);
    }

    // 浮遊アニメーション
    if (meshRef.current) {
      meshRef.current.position.set(x, 0.6 + Math.sin(Date.now() * 0.003) * 0.05, z);
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* 体 */}
      <mesh castShadow>
        <capsuleGeometry args={[0.2, 0.4, 8, 16]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      {/* 頭 */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#fcd9b6" />
      </mesh>
      {/* 目 */}
      <mesh position={[-0.06, 0.48, 0.14]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.06, 0.48, 0.14]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>
      {/* 名前タグ */}
      <Text
        position={[0, 0.9, 0]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        You
      </Text>
    </group>
  );
}

// ===== 机 =====
function Desk({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.06, 0.8]} />
        <meshStandardMaterial color="#d4a373" />
      </mesh>
      {[[-0.5, 0.32, -0.3], [0.5, 0.32, -0.3], [-0.5, 0.32, 0.3], [0.5, 0.32, 0.3]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.64, 8]} />
          <meshStandardMaterial color="#8b7355" />
        </mesh>
      ))}
    </group>
  );
}

// ===== 椅子 =====
function Chair({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.4, 0.05, 0.4]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
      <mesh position={[0, 0.65, -0.18]} castShadow>
        <boxGeometry args={[0.4, 0.35, 0.05]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
    </group>
  );
}

// ===== 黒板 =====
function Blackboard() {
  return (
    <group position={[0, 1.8, -5.9]}>
      <mesh castShadow>
        <boxGeometry args={[7, 2.5, 0.15]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[6.6, 2.2, 0.02]} />
        <meshStandardMaterial color="#1b4332" />
      </mesh>
      <Text position={[0, 0.4, 0.1]} fontSize={0.35} color="#e8e8e8" anchorX="center">
        Schoolverse
      </Text>
      <Text position={[0, -0.2, 0.1]} fontSize={0.18} color="#a8d5a2" anchorX="center">
        バーチャル教室
      </Text>
    </group>
  );
}

// ===== スポーンゾーン =====
function SpawnZone({ position, label, color }: { position: [number, number, number]; label: string; color: string }) {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.01;
    }
  });

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.7, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.3} />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.6, 0.68, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      <Text position={[0, 0.5, 0]} fontSize={0.2} color={color} anchorX="center" outlineWidth={0.01} outlineColor="#000">
        {label}
      </Text>
    </group>
  );
}

// ===== メインシーン =====
function Scene() {
  // 机と椅子の配置
  const furniture: { desk: [number, number, number]; chair: [number, number, number] }[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      const x = col * 1.8 - 3.6;
      const z = row * 1.8 - 2.5;
      furniture.push({
        desk: [x, 0, z],
        chair: [x, 0, z + 0.55],
      });
    }
  }

  const spawnZones = [
    { position: [-7, 0.01, -3] as [number, number, number], label: "FE", color: "#3b82f6" },
    { position: [-7, 0.01, 0] as [number, number, number], label: "React", color: "#06b6d4" },
    { position: [-7, 0.01, 3] as [number, number, number], label: "BE", color: "#22c55e" },
    { position: [7, 0.01, -3] as [number, number, number], label: "Infra", color: "#f97316" },
    { position: [7, 0.01, 0] as [number, number, number], label: "Full", color: "#a855f7" },
    { position: [7, 0.01, 3] as [number, number, number], label: "Think", color: "#eab308" },
  ];

  return (
    <>
      {/* ライティング */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={25}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <hemisphereLight args={["#87ceeb", "#e8e8e8", 0.3]} />

      {/* 床 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 14]} />
        <meshStandardMaterial color="#f5f5f4" />
      </mesh>

      {/* 壁 */}
      <mesh position={[0, 2, -6]} receiveShadow>
        <boxGeometry args={[20, 4, 0.1]} />
        <meshStandardMaterial color="#e7e5e4" />
      </mesh>
      <mesh position={[-10, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[14, 4, 0.1]} />
        <meshStandardMaterial color="#d6d3d1" />
      </mesh>
      <mesh position={[10, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[14, 4, 0.1]} />
        <meshStandardMaterial color="#d6d3d1" />
      </mesh>

      {/* 黒板 */}
      <Blackboard />

      {/* 机と椅子 */}
      {furniture.map((f, i) => (
        <group key={i}>
          <Desk position={f.desk} />
          <Chair position={f.chair} />
        </group>
      ))}

      {/* プレイヤー */}
      <PlayerAvatar />

      {/* スポーンゾーン */}
      {spawnZones.map((zone, i) => (
        <SpawnZone key={i} {...zone} />
      ))}

      {/* グリッド */}
      <Grid
        args={[20, 14]}
        position={[0, 0.01, 0]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#d4d4d4"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#a3a3a3"
        fadeDistance={20}
      />

      {/* カメラコントロール */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        minDistance={5}
        maxDistance={18}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0.5, 0]}
      />
    </>
  );
}

// ===== エクスポート =====
export function Canvas3DContent() {
  return (
    <Canvas
      shadows
      camera={{ position: [8, 6, 10], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => {
        gl.setClearColor("#e8e8e8");
      }}
    >
      <Scene />
    </Canvas>
  );
}
