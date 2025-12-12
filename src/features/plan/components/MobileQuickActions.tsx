"use client";

// モバイル下部に常設される「今日/明日追加」アクションバー
type Props = {
  onAddToday: () => void;
  onAddTomorrow: () => void;
};

export function MobileQuickActions({ onAddToday, onAddTomorrow }: Props) {
  return (
    <div className="lg:hidden fixed inset-x-0 bottom-24 z-30">
      <div className="mx-auto max-w-4xl px-4">
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl ring-1 ring-slate-100 backdrop-blur">
          <button
            type="button"
            onClick={onAddToday}
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            今日に追加
          </button>
          <button
            type="button"
            onClick={onAddTomorrow}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-100"
          >
            明日に追加
          </button>
        </div>
      </div>
    </div>
  );
}
