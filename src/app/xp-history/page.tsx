"use client";

import { useEffect, useMemo } from "react";
import { useGameStore } from "@/hooks/useGameStore";
import { formatDateTime, formatNumber } from "@/lib/gamification/formatters";

export default function XpHistoryPage() {
  const { xpHistory, todayXp, refreshXpHistory, isLoading } = useGameStore();

  useEffect(() => {
    void refreshXpHistory();
  }, [refreshXpHistory]);

  const sourceTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    xpHistory.forEach((tx) => {
      totals[tx.sourceLabel] = (totals[tx.sourceLabel] ?? 0) + tx.amount;
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [xpHistory]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">XP履歴</h1>
          <p className="text-sm text-slate-600">獲得ログとソース別の集計を確認</p>
        </div>
        {isLoading && <span className="text-xs text-slate-500">更新中...</span>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 shadow-sm">
          <div className="text-xs font-semibold text-indigo-700">今日の獲得XP</div>
          <div className="text-2xl font-bold text-indigo-900">+{formatNumber(todayXp)} XP</div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-600">ログ件数</div>
          <div className="text-2xl font-bold text-slate-900">{xpHistory.length} 件</div>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 shadow-sm">
          <div className="text-xs font-semibold text-emerald-700">平均/エントリ</div>
          <div className="text-2xl font-bold text-emerald-900">
            {xpHistory.length ? Math.round(xpHistory.reduce((sum, tx) => sum + tx.amount, 0) / xpHistory.length) : 0} XP
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">ソース別集計</h3>
        <div className="mt-3 space-y-2">
          {sourceTotals.map(([label, total]) => (
            <div key={label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span className="font-semibold text-slate-700">{label}</span>
              <span className="text-slate-800">+{formatNumber(total)} XP</span>
            </div>
          ))}
          {sourceTotals.length === 0 && <p className="text-sm text-slate-500">まだデータがありません。</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">獲得履歴一覧</h3>
        </div>
        <div className="space-y-3">
          {xpHistory.length === 0 && <p className="text-sm text-slate-500">XP獲得履歴がまだありません。</p>}
          {xpHistory.map((tx) => (
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
    </div>
  );
}
