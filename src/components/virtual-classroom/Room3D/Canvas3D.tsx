"use client";

// 簡易的な擬似3Dキャンバス（R3F導入前のプレースホルダ）
export function Canvas3D() {
  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-100 to-white shadow-inner">
      <div className="absolute inset-0" style={{ perspective: "900px" }}>
        <div
          className="absolute left-1/2 top-12 h-80 w-[120%] -translate-x-1/2 rounded-[30px] bg-gradient-to-b from-slate-200 to-slate-50 shadow-xl"
          style={{ transform: "rotateX(65deg)" }}
        />

        {/* デスクの簡易表現 */}
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 5 }).map((_, col) => (
            <div
              key={`desk-${row}-${col}`}
              className="absolute h-10 w-14 rounded-lg bg-white shadow-md ring-1 ring-slate-200"
              style={{
                left: `${20 + col * 16}%`,
                top: `${35 + row * 10}%`,
                transform: "rotateX(65deg)",
              }}
            />
          )),
        )}

        {/* 黒板風の壁 */}
        <div className="absolute left-1/2 top-6 h-16 w-72 -translate-x-1/2 rounded-lg bg-slate-900 shadow-lg" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white" />

      <div className="absolute left-4 top-4 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow">
        Virtual Classroom (HUD統合)
      </div>
    </div>
  );
}
