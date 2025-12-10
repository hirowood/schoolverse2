"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MinimalScene = dynamic(
  () => import("@/components/virtual-classroom/Room3D/Canvas3DContent").then((m) => m.Canvas3DContent),
  {
    ssr: false,
    loading: () => (
      <div className="relative h-[320px] w-full rounded-2xl border border-slate-200 bg-slate-50 shadow-inner">
        <div className="absolute inset-0 flex items-center justify-center text-slate-500">3D 読み込み中...</div>
      </div>
    ),
  },
);

const Fallback2D = () => (
  <div className="relative h-[320px] w-full overflow-hidden rounded-2xl border border-slate-300 bg-gradient-to-b from-slate-200 to-slate-300 shadow-inner">
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-700">
      <div className="text-xl font-bold">2D Classroom Preview</div>
      <p className="text-sm text-slate-600">ブラウザが3Dに対応していないため簡易表示に切り替えました。</p>
      <div className="mt-2 h-24 w-48 rounded-xl bg-white/70 shadow-inner border border-slate-300 flex items-center justify-center text-slate-500">
        Flat Mode
      </div>
    </div>
  </div>
);

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
  const [use3d, setUse3d] = useState(() => hasWebGL());

  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-2xl border border-slate-300 bg-slate-100 shadow-inner">
      {use3d ? <MinimalScene /> : <Fallback2D />}
      <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold text-white shadow">
        {use3d ? "3D Mode" : "2D Fallback"}
      </div>
    </div>
  );
}
