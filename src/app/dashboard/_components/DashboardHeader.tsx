"use client";

type Props = {
  userName?: string;
  level?: number;
  onShowOnboarding?: () => void;
};

export function DashboardHeader({ userName, level, onShowOnboarding }: Props) {
  return (
    <header className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500">Dashboard</p>
          <h1 className="text-3xl font-semibold text-slate-900">ダッシュボード</h1>
          <p className="text-sm text-slate-600">
            今日は何をすべきかをひと目で把握できます。クエスト・タスク・実績をここから確認しましょう。
          </p>
        </div>
        {onShowOnboarding && (
          <button
            type="button"
            onClick={onShowOnboarding}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Onboarding再表示
          </button>
        )}
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-700">
        {userName && <span className="font-semibold">{userName}</span>}
        {level !== undefined && (
          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white">Lv.{level}</span>
        )}
      </div>
    </header>
  );
}
