"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { Canvas3DErrorBoundary } from "./Canvas3DErrorBoundary";

// R3Fコンポーネントを遅延読み込み
const Canvas3DContent = lazy(() => 
  import("./Canvas3DContent").then(m => ({ default: m.Canvas3DContent }))
);

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
          3D教室を表示するには、WebGL対応のブラウザ（Chrome、Firefox、Edge等）が必要です。
          ブラウザを更新するか、別のブラウザをお試しください。
        </p>
      </div>
    </div>
  );
}

/** 簡易2D教室（フォールバック用） */
function Simple2DClassroom() {
  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-b from-slate-100 to-slate-200 p-6 overflow-hidden">
      {/* 天井 */}
      <div className="h-2 bg-slate-300 rounded-b-lg mb-4" />
      
      {/* 黒板 */}
      <div className="mx-auto mb-6 h-20 w-4/5 rounded-lg bg-gradient-to-b from-slate-800 to-slate-900 shadow-lg flex items-center justify-center border-4 border-amber-800">
        <div className="text-center">
          <span className="text-white text-lg font-bold">📚 Schoolverse</span>
          <p className="text-green-300 text-xs mt-1">バーチャル教室</p>
        </div>
      </div>
      
      {/* 机グリッド */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-5 gap-4 perspective-500">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="relative group">
              {/* 机 */}
              <div className="h-10 w-14 rounded bg-amber-200 shadow-md border border-amber-300 transform -skew-x-2" />
              {/* 椅子 */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-4 w-6 rounded-t bg-green-600 shadow" />
            </div>
          ))}
        </div>
      </div>

      {/* プレイヤー */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="text-3xl animate-bounce">🧑‍🎓</div>
        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full mt-1">You</span>
      </div>

      {/* ステータスバー */}
      <div className="mt-auto pt-4 border-t border-slate-300">
        <p className="text-center text-xs text-slate-500">
          ⚠️ 3D描画が利用できないため、簡易表示モードです
        </p>
      </div>
    </div>
  );
}

/** WebGLサポートチェック */
function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

/** R3F/Threeの利用可否チェック */
async function checkR3FSupport(): Promise<boolean> {
  try {
    await import("@react-three/fiber");
    await import("three");
    return true;
  } catch (e) {
    console.warn("[Canvas3D] R3F/Three.js not available:", e);
    return false;
  }
}

export function Canvas3D() {
  const [status, setStatus] = useState<"loading" | "ready" | "no-webgl" | "no-r3f" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // 1. WebGLチェック
      if (!checkWebGLSupport()) {
        if (!cancelled) setStatus("no-webgl");
        return;
      }

      // 2. R3F/Threeチェック
      const r3fOk = await checkR3FSupport();
      if (!cancelled) {
        setStatus(r3fOk ? "ready" : "no-r3f");
      }
    };

    // ハイドレーション完了を待つ
    const timer = setTimeout(init, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-2xl border border-slate-300 bg-slate-100 shadow-xl">
      {status === "loading" && <LoadingFallback />}

      {status === "no-webgl" && <WebGLNotSupported />}

      {status === "no-r3f" && <Simple2DClassroom />}

      {status === "ready" && (
        <Canvas3DErrorBoundary fallback={<Simple2DClassroom />}>
          <Suspense fallback={<LoadingFallback />}>
            <Canvas3DContent />
          </Suspense>
        </Canvas3DErrorBoundary>
      )}

      {/* ステータスバッジ */}
      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2">
        <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
          {status === "ready" ? "3D Mode" : "2D Mode"}
        </span>
        {status === "ready" && (
          <span className="rounded-full bg-slate-800/70 px-2 py-1 text-xs text-white backdrop-blur">
            Three.js
          </span>
        )}
      </div>

      {/* 操作ヒント */}
      {status === "ready" && (
        <div className="pointer-events-none absolute bottom-4 right-4 rounded-lg bg-black/50 px-3 py-2 text-xs text-white backdrop-blur">
          <p>🖱️ ドラッグ: 回転</p>
          <p>🔍 スクロール: ズーム</p>
        </div>
      )}
    </div>
  );
}
