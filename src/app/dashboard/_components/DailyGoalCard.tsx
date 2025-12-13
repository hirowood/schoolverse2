"use client";

import { useDailyGoal } from "@/app/dashboard/_hooks/useDailyGoal";
import { cardClassName } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function DailyGoalCard() {
  const { goal, weeklyGoal, setGoal, save, isSaved } = useDailyGoal();

  return (
    <section className={cardClassName({ radius: "2xl", className: "bg-white/90 dark:border-slate-700 dark:bg-slate-800" })}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">📝 今日の目標</h3>
        {isSaved ? <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">保存済み</span> : null}
      </div>

      {weeklyGoal ? (
        <div className="mb-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-indigo-900 dark:border-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-100">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-200">週間目標</p>
          <p className="mt-1 text-base">{weeklyGoal}</p>
        </div>
      ) : null}

      <div className="space-y-3">
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          placeholder="今日のフォーカスや目標をメモ（例: 章末問題を2問解く）"
        />
        <Button variant="solid" color="slate" size="tap" className="w-full rounded-2xl py-3 text-base" onClick={save}>
          目標を保存
        </Button>
      </div>
    </section>
  );
}

