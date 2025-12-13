"use client";

import Link from "next/link";
import { useDashboardStore } from "@/hooks/useDashboardStore";
import { QuestProgressBar } from "@/components/quests/QuestProgressBar";
import { cardClassName } from "@/components/ui/Card";
import { buttonClassName } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const statusLabel: Record<string, string> = {
  todo: "未着手",
  in_progress: "進行中",
  paused: "一時停止",
  done: "完了",
};

const statusColor: Record<string, string> = {
  todo: "bg-slate-100 text-slate-700",
  in_progress: "bg-amber-100 text-amber-700",
  paused: "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",
};

export function TodayTasksCard() {
  const summary = useDashboardStore((state) => state.summary);
  const completeTask = useDashboardStore((state) => state.completeTask);

  if (!summary?.todayTasks) return null;

  const { total, completed, tasks } = summary.todayTasks;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className={cardClassName({ radius: "2xl", className: "bg-white/90 dark:border-slate-700 dark:bg-slate-800" })}>
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">🗒 今日のタスク</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            完了: {completed}/{total} ({progress}%)
          </p>
        </div>
        <Link
          href="/plan"
          className={cn(buttonClassName({ variant: "outline", rounded: "full", size: "tapXs" }), "whitespace-nowrap")}
        >
          詳細 →
        </Link>
      </div>

      <div className="mb-3">
        <QuestProgressBar value={progress} max={100} />
      </div>

      <div className="space-y-2">
        {tasks.slice(0, 5).map((task) => (
          <label
            key={task.id}
            className="flex items-start justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-base shadow-inner transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-700/50 dark:hover:bg-slate-700"
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={task.status === "done"}
                onChange={() => task.status !== "done" && completeTask(task.id)}
                className="mt-1 h-5 w-5 accent-emerald-600"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[task.status] ?? statusColor.todo}`}>
                    {statusLabel[task.status] ?? task.status}
                  </span>
                  {task.dueDate ? (
                    <span className="text-xs text-slate-500 dark:text-slate-300">
                      予定: {task.dueDate.slice(0, 10)} {task.dueDate.slice(11, 16)}
                    </span>
                  ) : null}
                </div>
                <p className={`${task.status === "done" ? "text-slate-500 line-through" : "text-slate-900 dark:text-slate-100"}`}>
                  {task.title}
                </p>
              </div>
            </div>
          </label>
        ))}
      </div>

      {tasks.length > 5 ? (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">残り {tasks.length - 5} タスク</p>
      ) : null}
      {tasks.length === 0 ? <p className="text-base text-slate-500 dark:text-slate-300">今日のタスクはありません。</p> : null}
    </section>
  );
}

