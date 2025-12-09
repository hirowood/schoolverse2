"use client";

import { useDailyGoal } from "@/app/dashboard/_hooks/useDailyGoal";

export function DailyGoalCard() {
  const { goal, weeklyGoal, setGoal, save, isSaved } = useDailyGoal();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">🎯 今日の目標</h3>
      </div>

      {weeklyGoal && (
        <div className="mb-3 rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-900 dark:border-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-100">
          <p className="text-[11px] font-semibold uppercase tracking-wide">週間目標</p>
          <p>{weeklyGoal}</p>
        </div>
      )}

      <div className="space-y-2">
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          placeholder="今日のフォーカスや目標をメモ（例: 章末問題を2問解く）"
        />
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={save}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            目標を保存
          </button>
          {isSaved && <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">保存済み</span>}
        </div>
      </div>
    </section>
  );
}
