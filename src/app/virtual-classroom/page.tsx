"use client";

import dynamic from "next/dynamic";
import { BattleHUD } from "@/components/virtual-classroom/HUD/BattleHUD";

const Canvas3D = dynamic(
  () => import("@/components/virtual-classroom/Room3D/Canvas3D").then((m) => m.Canvas3D),
  { ssr: false, loading: () => <div className="h-[520px] w-full rounded-2xl border border-slate-200 bg-slate-100 shadow-inner" /> },
);

export default function VirtualClassroomPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      <div className="mx-auto max-w-6xl px-4 pt-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Virtual Classroom</p>
            <h1 className="text-2xl font-bold text-slate-900">バーチャル教室（ベータ）</h1>
            <p className="mt-1 text-sm text-slate-600">
              遭遇APIとバトルオーバーレイをHUDに統合したベータ版です。3D描画は簡易キャンバスで表現（R3F置換予定）。
            </p>
          </div>
        </div>

        <Canvas3D />
      </div>

      <BattleHUD />
    </main>
  );
}
