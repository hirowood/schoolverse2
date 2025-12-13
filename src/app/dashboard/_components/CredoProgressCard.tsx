"use client";

import Link from "next/link";
import { useDashboardStore } from "@/hooks/useDashboardStore";
import { QuestProgressBar } from "@/components/quests/QuestProgressBar";
import { cardClassName } from "@/components/ui/Card";
import { buttonClassName } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function CredoProgressCard() {
  const summary = useDashboardStore((state) => state.summary);
  if (!summary?.credoProgress) return null;

  const { total, practiced, items } = summary.credoProgress;
  const percent = total > 0 ? Math.round((practiced / total) * 100) : 0;

  return (
    <section className={cardClassName({ radius: "2xl", className: "bg-white/90" })}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">📜 Credo 今日の実践</h3>
          <p className="text-sm text-slate-600">
            実践済み: {practiced}/{total} ({percent}%)
          </p>
        </div>
        <Link
          href="/credo"
          className={cn(buttonClassName({ variant: "outline", rounded: "full", size: "tapXs" }), "whitespace-nowrap")}
        >
          今日の記録 →
        </Link>
      </div>

      <div className="mt-4">
        <QuestProgressBar value={percent} max={100} />
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-700">
        {items.slice(0, 4).map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>
              {item.done ? "✅" : "⬜"}
            </span>
            <span className={item.done ? "font-semibold text-slate-900" : ""}>{item.title}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

