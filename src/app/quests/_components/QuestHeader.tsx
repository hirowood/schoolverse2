"use client";

interface QuestHeaderProps {
  dateLabel: string;
  canRegenerate: boolean;
  regenerateRemaining: number;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export function QuestHeader({
  dateLabel,
  canRegenerate,
  regenerateRemaining,
  onRegenerate,
  isRegenerating,
}: QuestHeaderProps) {
  const buttonLabel = isRegenerating ? "再生成中..." : "クエストを再生成";

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 shadow-sm dark:border-slate-700 dark:from-slate-800 dark:via-slate-900 dark:to-slate-900 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">今日のクエスト</p>
          <div className="flex flex-wrap items-baseline gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">今日のクエスト</h1>
            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-100">
              毎日更新
            </span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-200 sm:text-base">{dateLabel}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            モバイルでも確認しやすいカードと大きめのボタンで、やることをすぐ始められます。
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[240px]">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-200">
            <span>再生成</span>
            <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-slate-900 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white">
              残り {regenerateRemaining} 回
            </span>
          </div>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={!canRegenerate || isRegenerating}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-base font-semibold text-white shadow-md transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
