"use client";

interface Props {
  canGenerate: boolean;
  regenerateRemaining?: number;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function EmptyState({ canGenerate, regenerateRemaining, isGenerating, onGenerate }: Props) {
  const disabled = !canGenerate || isGenerating;
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/80 p-8 text-center shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/70">
      <div className="text-3xl text-slate-900 dark:text-white">クエストがまだありません</div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        AIが今日の目標を提案します。モバイルでも押しやすい大きなボタンを用意しました。
      </p>
      <button
        type="button"
        onClick={onGenerate}
        disabled={disabled}
        className="mt-4 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-base font-semibold text-white shadow-md transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 disabled:cursor-not-allowed disabled:bg-slate-500"
      >
        {isGenerating ? "生成中..." : "クエストを生成する"}
      </button>
      {regenerateRemaining !== undefined && (
        <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-300">残り {regenerateRemaining} 回</p>
      )}
    </div>
  );
}
