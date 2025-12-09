"use client";

type Props = {
  canGenerate: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
};

export function EmptyState({ canGenerate, isGenerating, onGenerate }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
      <div className="text-4xl">🎯</div>
      <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-50">今日のクエストを生成しましょう</p>
      <p className="text-sm text-slate-600 dark:text-slate-300">体調や目標に合わせてAIが最適なクエストを提案します。</p>
      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate || isGenerating}
        className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isGenerating ? "生成中..." : "クエストを生成する"}
      </button>
    </div>
  );
}
