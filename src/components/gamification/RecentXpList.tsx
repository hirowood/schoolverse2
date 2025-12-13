import type { XpTransaction } from "@/types/gamification";
import { formatDateTime, formatNumber } from "@/lib/gamification/formatters";
import Link from "next/link";

interface RecentXpListProps {
  items: XpTransaction[];
  showViewAll?: boolean;
}

export function RecentXpList({ items, showViewAll = true }: RecentXpListProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm ring-1 ring-slate-100 dark:border-slate-700 dark:bg-slate-800/85 dark:ring-slate-700">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">最近のXP獲得</h3>
        {showViewAll && (
          <Link href="/xp-history" className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-300">
            すべて見る →
          </Link>
        )}
      </div>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-300">XP獲得履歴がまだありません。</p>}
        {items.map((tx) => (
          <div
            key={tx.id}
            className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 shadow-inner transition hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900/40 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <div className="text-sm font-semibold text-slate-800 dark:text-white">
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100">
                  +{formatNumber(tx.amount)} XP
                </span>
                <span className="ml-2 text-slate-500 dark:text-slate-300">({tx.sourceLabel})</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">{tx.description}</div>
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-300">{formatDateTime(tx.createdAt)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
