import type { XpTransaction } from "@/types/gamification";
import { formatDateTime, formatNumber } from "@/lib/gamification/formatters";
import Link from "next/link";

type RecentXpListProps = {
  items: XpTransaction[];
  showViewAll?: boolean;
};

export function RecentXpList({ items, showViewAll = true }: RecentXpListProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">最近のXP獲得</h3>
        {showViewAll && (
          <Link href="/xp-history" className="text-sm font-semibold text-indigo-600 hover:underline">
            すべて見る →
          </Link>
        )}
      </div>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-slate-500">XP獲得履歴がまだありません。</p>}
        {items.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
          >
            <div>
              <div className="text-sm font-semibold text-slate-800">
                +{formatNumber(tx.amount)} XP <span className="text-slate-500">({tx.sourceLabel})</span>
              </div>
              <div className="text-xs text-slate-600">{tx.description}</div>
            </div>
            <div className="text-xs text-slate-500">{formatDateTime(tx.createdAt)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
