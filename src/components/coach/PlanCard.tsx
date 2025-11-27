// src/components/coach/PlanCard.tsx
"use client";

import type { StudyPlan } from "@/hooks/useCoachPlan";

interface PlanCardProps {
  plan: StudyPlan;
}

export function PlanCard({ plan }: PlanCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
    return `${date.getMonth() + 1}/${date.getDate()}（${dayNames[date.getDay()]}）`;
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">今日のプラン</p>
        <p className="text-xs text-slate-400">{formatDate(plan.date)}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <div>
            <p className="text-xs text-slate-500">今日の重点</p>
            <p className="text-sm font-semibold text-slate-900">{plan.focus}</p>
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-900 flex items-center gap-1">
          <span>📘</span> 学習タスク
        </p>
        <ol className="mt-2 space-y-2">
          {plan.tasks.map((task, i) => (
            <li
              key={`${task.title}-${i}`}
              className="rounded-md border border-slate-200 bg-white p-2"
            >
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs text-white">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 wrap-break-word">
                    {task.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <span>⏱️</span>
                      {task.durationMinutes}分
                    </span>
                    <span className="flex items-center gap-1">
                      <span>🕐</span>
                      {task.timeSlot}
                    </span>
                  </div>
                  {task.note && (
                    <p className="mt-1 text-xs text-slate-500 italic">
                      💡 {task.note}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-md bg-blue-50 border border-blue-100 p-3">
        <p className="text-sm text-blue-800 flex items-start gap-2">
          <span className="shrink-0">💬</span>
          <span>{plan.coachMessage}</span>
        </p>
      </div>
    </div>
  );
}
