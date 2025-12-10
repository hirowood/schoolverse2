"use client";

import dynamic from "next/dynamic";
import { BattleHUD } from "@/components/virtual-classroom/HUD/BattleHUD";

// 3Dキャンバスは未実装のためプレースホルダ（将来R3Fに置き換え）
const PlaceholderCanvas = dynamic(async () => () => (
  <div className="h-[480px] w-full rounded-2xl border border-dashed border-slate-300 bg-slate-100 flex items-center justify-center text-slate-500">
    3D教室キャンバス（将来R3Fで置き換え）
  </div>
), { ssr: false });

export default function VirtualClassroomPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      <div className="mx-auto max-w-6xl px-4 pt-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Virtual Classroom</p>
            <h1 className="text-2xl font-bold text-slate-900">バーチャル教室（ベータ）</h1>
            <p className="mt-1 text-sm text-slate-600">
              遭遇APIとバトルオーバーレイをHUDに統合したベータ版です。3D描画は今後R3Fで置き換え予定。
            </p>
          </div>
        </div>

        <PlaceholderCanvas />
      </div>

      <BattleHUD />
    </main>
  );
}
