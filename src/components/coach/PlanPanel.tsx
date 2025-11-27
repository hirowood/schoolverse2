// src/components/coach/PlanPanel.tsx
"use client";

import { useCoachPlan } from "@/hooks/useCoachPlan";
import { PlanCard } from "./PlanCard";

export function PlanPanel() {
  const {
    plan,
    isLoading,
    error,
    retryAfter,
    generatePlan,
    clearError,
    clearPlan,
  } = useCoachPlan();

  const handleGenerate = async () => {
    clearError();
    await generatePlan();
  };

  return (
    <div className="space-y-4">
      {/* 生成ボタン */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || (retryAfter !== null && retryAfter > 0)}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                生成中...
              </span>
            ) : (
              "🤖 AIに今日の学習計画を作らせる"
            )}
          </button>

          {plan && (
            <button
              type="button"
              onClick={clearPlan}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
            >
              クリア
            </button>
          )}
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mt-3 rounded-md bg-red-50 border border-red-100 p-3">
            <p className="text-sm text-red-600">
              {error}
              {retryAfter !== null && retryAfter > 0 && (
                <span className="ml-1">（{retryAfter}秒後に再試行可能）</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* プラン表示 */}
      {plan && <PlanCard plan={plan} />}

      {/* ガイド */}
      {!plan && !isLoading && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-700 mb-2">
            💡 学習プランについて
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>あなたの設定（週目標・活動時間帯）をもとに計画を作ります</li>
            <li>クレドの実践状況も考慮して、バランスの良い提案をします</li>
            <li>登録済みのタスクがあれば、それも組み込みます</li>
            <li>1日に何度でも再生成できます（制限あり）</li>
          </ul>
        </div>
      )}
    </div>
  );
}
