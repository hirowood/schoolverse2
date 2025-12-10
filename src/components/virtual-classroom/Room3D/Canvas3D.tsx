"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Canvas3DErrorBoundary } from "./Canvas3DErrorBoundary";

/** WebGLサポートチェック */
function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    return !!gl;
  } catch {
    return false;
  }
}

/** ローディングUI */
function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-100 to-slate-200">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-slate-300 border-t-blue-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl">🏫</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-700">3D教室を読み込み中...</p>
        <p className="text-xs text-slate-500 mt-1">しばらくお待ちください</p>
      </div>
    </div>
  );
}

/** WebGL非対応時のフォールバック */
function WebGLNotSupported() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="rounded-full bg-amber-200 p-4">
        <svg className="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <p className="font-bold text-amber-800 text-lg">WebGLがサポートされていません</p>
        <p className="mt-2 text-sm text-amber-700 max-w-md">
          3D教室を表示するには、WebGL対応のブラウザが必要です。
        </p>
      </div>
    </div>
  );
}

/** 簡易2D教室（フォールバック用） */
function Simple2DClassroom() {
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 75 });
  const [activeZone, setActiveZone] = useState<string | null>(null);

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const speed = 3;
      setPlayerPos(prev => {
        let { x, y } = prev;
        switch (e.key.toLowerCase()) {
          case 'w': case 'arrowup': y = Math.max(20, y - speed); break;
          case 's': case 'arrowdown': y = Math.min(85, y + speed); break;
          case 'a': case 'arrowleft': x = Math.max(5, x - speed); break;
          case 'd': case 'arrowright': x = Math.min(95, x + speed); break;
        }
        return { x, y };
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ゾーン判定
  useEffect(() => {
    const zones = [
      { name: 'FE', x: 8, y: 30 },
      { name: 'React', x: 8, y: 50 },
      { name: 'BE', x: 8, y: 70 },
      { name: 'Infra', x: 92, y: 30 },
      { name: 'Full', x: 92, y: 50 },
      { name: 'Think', x: 92, y: 70 },
    ];
    const zone = zones.find(z => 
      Math.abs(z.x - playerPos.x) < 10 && Math.abs(z.y - playerPos.y) < 12
    );
    setActiveZone(zone?.name || null);
  }, [playerPos]);

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-slate-200 to-slate-300 overflow-hidden select-none">
      {/* 黒板 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg shadow-xl border-4 border-amber-700 flex items-center justify-center">
        <div className="text-center">
          <span className="text-white text-lg font-bold">📚 Schoolverse</span>
          <p className="text-green-400 text-xs">バーチャル教室 (2D Mode)</p>
        </div>
      </div>

      {/* スポーンゾーン（左） */}
      {[
        { name: 'FE', color: 'bg-blue-500', y: '25%' },
        { name: 'React', color: 'bg-cyan-500', y: '45%' },
        { name: 'BE', color: 'bg-green-500', y: '65%' },
      ].map(zone => (
        <div 
          key={zone.name}
          className={`absolute left-4 ${zone.color} ${activeZone === zone.name ? 'ring-4 ring-yellow-400 scale-110' : ''} w-12 h-12 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg transition-all`}
          style={{ top: zone.y }}
        >
          {zone.name}
        </div>
      ))}

      {/* スポーンゾーン（右） */}
      {[
        { name: 'Infra', color: 'bg-orange-500', y: '25%' },
        { name: 'Full', color: 'bg-purple-500', y: '45%' },
        { name: 'Think', color: 'bg-yellow-500', y: '65%' },
      ].map(zone => (
        <div 
          key={zone.name}
          className={`absolute right-4 ${zone.color} ${activeZone === zone.name ? 'ring-4 ring-yellow-400 scale-110' : ''} w-12 h-12 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg transition-all`}
          style={{ top: zone.y }}
        >
          {zone.name}
        </div>
      ))}

      {/* 机グリッド */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 grid grid-cols-5 gap-3">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="relative">
            <div className="h-8 w-12 rounded bg-amber-200 shadow-md border border-amber-300" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-3 w-5 rounded-t bg-green-600" />
          </div>
        ))}
      </div>

      {/* プレイヤー */}
      <div 
        className="absolute transition-all duration-100 flex flex-col items-center pointer-events-none"
        style={{ left: `${playerPos.x}%`, top: `${playerPos.y}%`, transform: 'translate(-50%, -50%)' }}
      >
        <div className="text-3xl animate-bounce">🧑‍🎓</div>
        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full shadow">You</span>
      </div>

      {/* アクティブゾーン表示 */}
      {activeZone && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm animate-pulse">
          🎯 {activeZone}ゾーンに入りました！
        </div>
      )}

      {/* 操作ガイド */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-lg text-xs flex gap-4">
        <span>⬆️ W</span>
        <span>⬇️ S</span>
        <span>⬅️ A</span>
        <span>➡️ D</span>
        <span className="text-yellow-300">ゾーンに近づくとモンスター出現！</span>
      </div>
    </div>
  );
}

/** 3Dコンテンツ（動的インポート） */
function Canvas3DInner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadComponent = async () => {
      try {
        const mod = await import("./Canvas3DContent");
        if (mounted) {
          setComponent(() => mod.Canvas3DContent);
        }
      } catch (err) {
        console.error("[Canvas3D] Failed to load 3D content:", err);
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      }
    };

    loadComponent();

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return <Simple2DClassroom />;
  }

  if (!Component) {
    return <LoadingFallback />;
  }

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Component />
    </div>
  );
}

export function Canvas3D() {
  const [mode, setMode] = useState<"loading" | "3d" | "2d">("loading");
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    // クライアントサイドでのみ実行
    const supported = checkWebGLSupport();
    setWebglSupported(supported);
    
    // 少し遅延させてハイドレーション問題を回避
    const timer = setTimeout(() => {
      setMode(supported ? "3d" : "2d");
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const switchTo2D = useCallback(() => {
    setMode("2d");
  }, []);

  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-2xl border border-slate-300 bg-slate-100 shadow-xl">
      {mode === "loading" && <LoadingFallback />}

      {mode === "2d" && (
        webglSupported ? <Simple2DClassroom /> : <WebGLNotSupported />
      )}

      {mode === "3d" && (
        <Canvas3DErrorBoundary 
          fallback={<Simple2DClassroom />}
          onError={switchTo2D}
        >
          <Canvas3DInner />
        </Canvas3DErrorBoundary>
      )}

      {/* ステータスバッジ */}
      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 z-10">
        <span className={`rounded-full px-3 py-1 text-xs font-bold text-white shadow-lg ${mode === "3d" ? "bg-emerald-500" : "bg-blue-500"}`}>
          {mode === "3d" ? "3D Mode" : "2D Mode"}
        </span>
      </div>

      {/* モード切替ボタン */}
      <button
        onClick={() => setMode(mode === "3d" ? "2d" : "3d")}
        className="absolute right-4 top-4 z-10 rounded-lg bg-slate-800/70 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 transition-colors"
        disabled={!webglSupported && mode === "2d"}
      >
        {mode === "3d" ? "2Dに切替" : "3Dに切替"}
      </button>

      {/* 操作ヒント（3Dモード） */}
      {mode === "3d" && (
        <div className="pointer-events-none absolute bottom-4 right-4 rounded-lg bg-black/50 px-3 py-2 text-xs text-white backdrop-blur z-10">
          <p>🖱️ ドラッグ: 回転</p>
          <p>🔍 スクロール: ズーム</p>
        </div>
      )}
    </div>
  );
}
