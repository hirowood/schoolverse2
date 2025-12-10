"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// BattleHUDも遅延読み込み（3D関連の依存がある場合に備えて）
const BattleHUD = dynamic(
  () => import("@/components/virtual-classroom/HUD/BattleHUD").then((m) => m.BattleHUD),
  { ssr: false }
);

// Canvas3Dを完全にクライアントサイドで読み込み
const Canvas3D = dynamic(
  () => import("@/components/virtual-classroom/Room3D/Canvas3D").then((m) => m.Canvas3D),
  {
    ssr: false,
    loading: () => (
      <div className="relative h-[520px] w-full rounded-2xl border border-slate-200 bg-slate-50 shadow-inner">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-500" />
          <p className="text-sm">3D教室を準備中...</p>
        </div>
      </div>
    ),
  }
);

export default function VirtualClassroomPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      <div className="mx-auto w-full max-w-7xl xl:max-w-[1400px] px-3 sm:px-6 lg:px-10 pt-8 space-y-6">
        {/* ヘッダー */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Virtual Classroom
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              バーチャル教室（ベータ）
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              3D教室を探索してモンスターと遭遇しよう。ITスキルの問題に正解してXPを獲得！
            </p>
          </div>
        </div>

        {/* 3Dキャンバス */}
        <Suspense
          fallback={
            <div className="h-[520px] w-full rounded-2xl border border-slate-200 bg-slate-100 shadow-inner flex items-center justify-center">
              <p className="text-slate-500">読み込み中...</p>
            </div>
          }
        >
          <Canvas3D />
        </Suspense>

        {/* 操作説明 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">🎮 操作方法</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-2 py-1 font-mono">ドラッグ</span>
              <span>視点回転</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-2 py-1 font-mono">スクロール</span>
              <span>ズーム</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-2 py-1 font-mono">タッチ</span>
              <span>モバイル対応</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500">⚠️</span>
              <span>ベータ版のため一部機能制限あり</span>
            </div>
          </div>
        </div>
      </div>

      {/* バトルHUD（オーバーレイ） */}
      <BattleHUD />
    </main>
  );
}
