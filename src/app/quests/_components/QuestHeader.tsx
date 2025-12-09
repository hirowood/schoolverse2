"use client";

type QuestHeaderProps = {
  dateLabel: string;
  canRegenerate: boolean;
  regenerateRemaining: number;
  onRegenerate: () => void;
  isRegenerating: boolean;
};

export function QuestHeader({
  dateLabel,
  canRegenerate,
  regenerateRemaining,
  onRegenerate,
  isRegenerating,
}: QuestHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">今日のクエスト</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">📋 今日のクエスト</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">{dateLabel}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-300">残り {regenerateRemaining} 回</span>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={!canRegenerate || isRegenerating}
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isRegenerating ? "再生成中..." : "再生成 🔄"}
        </button>
      </div>
    </div>
  );
}
