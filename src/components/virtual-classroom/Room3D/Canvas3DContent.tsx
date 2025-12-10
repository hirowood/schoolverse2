/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";

import "@/types/r3f";
import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  Grid,
  Text,
  RoundedBox,
  useHelper,
  Float
} from "@react-three/drei";
import * as THREE from "three";

// ===== 机コンポーネント =====
function Desk({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 天板 */}
      <RoundedBox args={[1.2, 0.06, 0.8]} radius={0.02} position={[0, 0.65, 0]} castShadow>
        <meshStandardMaterial color="#d4a373" roughness={0.4} />
      </RoundedBox>
      {/* 脚（4本） */}
      {[[-0.5, 0.325, -0.3], [0.5, 0.325, -0.3], [-0.5, 0.325, 0.3], [0.5, 0.325, 0.3]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.65, 8]} />
          <meshStandardMaterial color="#8b7355" metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// ===== 椅子コンポーネント =====
function Chair({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 座面 */}
      <RoundedBox args={[0.45, 0.05, 0.45]} radius={0.02} position={[0, 0.45, 0]} castShadow>
        <meshStandardMaterial color="#6b8e23" roughness={0.5} />
      </RoundedBox>
      {/* 背もたれ */}
      <RoundedBox args={[0.45, 0.4, 0.05]} radius={0.02} position={[0, 0.7, -0.2]} castShadow>
        <meshStandardMaterial color="#6b8e23" roughness={0.5} />
      </RoundedBox>
      {/* 脚（4本） */}
      {[[-0.18, 0.225, -0.18], [0.18, 0.225, -0.18], [-0.18, 0.225, 0.18], [0.18, 0.225, 0.18]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.45, 8]} />
          <meshStandardMaterial color="#4a4a4a" metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ===== 黒板コンポーネント =====
function Blackboard({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 枠 */}
      <mesh castShadow>
        <boxGeometry args={[6, 2.5, 0.15]} />
        <meshStandardMaterial color="#5d4037" roughness={0.6} />
      </mesh>
      {/* 黒板面 */}
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[5.6, 2.2, 0.02]} />
        <meshStandardMaterial color="#1b4332" roughness={0.8} />
      </mesh>
      {/* チョーク置き */}
      <mesh position={[0, -1.35, 0.1]} castShadow>
        <boxGeometry args={[5.6, 0.1, 0.15]} />
        <meshStandardMaterial color="#5d4037" roughness={0.6} />
      </mesh>
      {/* テキスト */}
      <Text
        position={[0, 0.5, 0.1]}
        fontSize={0.3}
        color="#e8e8e8"
        anchorX="center"
        anchorY="middle"
      >
        Schoolverse
      </Text>
      <Text
        position={[0, -0.1, 0.1]}
        fontSize={0.15}
        color="#a8d5a2"
        anchorX="center"
        anchorY="middle"
      >
        バーチャル教室
      </Text>
    </group>
  );
}

// ===== プレイヤーアバター =====
function PlayerAvatar({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* 体 */}
      <mesh ref={meshRef} position={[0, position[1], 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.5, 8, 16]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* 顔 */}
      <mesh position={[0, position[1] + 0.45, 0]} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#fcd9b6" roughness={0.5} />
      </mesh>
      {/* 目（左） */}
      <mesh position={[-0.06, position[1] + 0.48, 0.14]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>
      {/* 目（右） */}
      <mesh position={[0.06, position[1] + 0.48, 0.14]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>
      {/* 名前タグ */}
      <Float speed={2} rotationIntensity={0} floatIntensity={0.3}>
        <Text
          position={[0, position[1] + 0.9, 0]}
          fontSize={0.12}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          You
        </Text>
      </Float>
    </group>
  );
}

// ===== モンスタースポーンポイント =====
function SpawnPoint({ position, category, color }: { position: [number, number, number]; category: string; color: string }) {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* 円形プラットフォーム */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.6, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.3} />
      </mesh>
      {/* 回転リング */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.5, 0.55, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* カテゴリラベル */}
      <Text
        position={[0, 0.3, 0]}
        fontSize={0.1}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {category}
      </Text>
    </group>
  );
}

// ===== 床 =====
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[20, 16]} />
      <meshStandardMaterial color="#f5f5f4" roughness={0.8} />
    </mesh>
  );
}

// ===== 壁 =====
function Walls() {
  return (
    <>
      {/* 後ろの壁（黒板側） */}
      <mesh position={[0, 2, -6]} receiveShadow>
        <boxGeometry args={[20, 4, 0.1]} />
        <meshStandardMaterial color="#e7e5e4" roughness={0.9} />
      </mesh>
      {/* 左の壁 */}
      <mesh position={[-10, 2, 2]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[16, 4, 0.1]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.9} />
      </mesh>
      {/* 右の壁 */}
      <mesh position={[10, 2, 2]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[16, 4, 0.1]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.9} />
      </mesh>
      {/* 窓（左壁） */}
      {[-2, 2, 6].map((z, i) => (
        <mesh key={i} position={[-9.9, 2.2, z]}>
          <boxGeometry args={[0.05, 1.8, 1.5]} />
          <meshStandardMaterial color="#87ceeb" transparent opacity={0.5} />
        </mesh>
      ))}
    </>
  );
}

// ===== 天井ライト =====
function CeilingLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.5, 0.1, 0.3]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
      <pointLight intensity={0.5} distance={8} decay={2} color="#fff5e6" />
    </group>
  );
}

// ===== メインシーン =====
function ClassroomScene() {
  // 机と椅子の配置（5列 x 4行）
  const furniture: { desk: [number, number, number]; chair: [number, number, number] }[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      const x = col * 2.0 - 4;
      const z = row * 2.0 - 2;
      furniture.push({
        desk: [x, 0, z],
        chair: [x, 0, z + 0.6],
      });
    }
  }

  // モンスタースポーンポイント
  const spawnPoints = [
    { position: [-7, 0.01, -3] as [number, number, number], category: "FE", color: "#3b82f6" },
    { position: [-7, 0.01, 0] as [number, number, number], category: "React", color: "#06b6d4" },
    { position: [-7, 0.01, 3] as [number, number, number], category: "BE", color: "#22c55e" },
    { position: [7, 0.01, -3] as [number, number, number], category: "Infra", color: "#f97316" },
    { position: [7, 0.01, 0] as [number, number, number], category: "Full", color: "#a855f7" },
    { position: [7, 0.01, 3] as [number, number, number], category: "Think", color: "#eab308" },
  ];

  return (
    <>
      {/* ライティング */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={30}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <hemisphereLight args={["#87ceeb", "#f5f5f4", 0.3]} />
      
      {/* 天井ライト */}
      <CeilingLight position={[-3, 3.8, 0]} />
      <CeilingLight position={[3, 3.8, 0]} />
      <CeilingLight position={[0, 3.8, 4]} />

      {/* 環境 */}
      <Floor />
      <Walls />
      <Blackboard position={[0, 1.8, -5.9]} />

      {/* 机と椅子 */}
      {furniture.map((f, idx) => (
        <group key={idx}>
          <Desk position={f.desk} />
          <Chair position={f.chair} />
        </group>
      ))}

      {/* プレイヤーアバター */}
      <PlayerAvatar position={[0, 0.5, 5]} />

      {/* モンスタースポーンポイント */}
      {spawnPoints.map((sp, i) => (
        <SpawnPoint key={i} {...sp} />
      ))}

      {/* グリッド（デバッグ用・控えめ） */}
      <Grid
        args={[20, 16]}
        position={[0, 0.01, 0]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#d4d4d4"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#a3a3a3"
        fadeDistance={25}
        fadeStrength={1}
        followCamera={false}
      />

      {/* カメラコントロール */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        minDistance={4}
        maxDistance={20}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0.5, 0]}
        panSpeed={0.5}
      />
    </>
  );
}

// ===== エクスポート =====
export function Canvas3DContent() {
  return (
    <Canvas
      shadows
      camera={{ position: [8, 6, 12], fov: 50 }}
      gl={{
        antialias: true,
        powerPreference: "default",
        alpha: false,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor("#e8e8e8");
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.2;
      }}
    >
      <fog attach="fog" args={["#e8e8e8", 15, 35]} />
      <ClassroomScene />
    </Canvas>
  );
}
