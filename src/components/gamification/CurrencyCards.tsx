import { formatNumber } from "@/lib/gamification/formatters";

interface CurrencyCardsProps {
  coins: number;
  gems: number;
}

export function CurrencyCards({ coins, gems }: CurrencyCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50/70 p-4 shadow-sm ring-1 ring-amber-100/60">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-amber-700">🪙 コイン</div>
          <div className="text-2xl font-bold text-amber-800">{formatNumber(coins)}</div>
        </div>
        <button className="inline-flex h-11 items-center justify-center rounded-xl border border-amber-200 bg-white/80 px-4 text-sm font-semibold text-amber-800 shadow-sm transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 active:scale-[0.99]">
          ショップへ →
        </button>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 shadow-sm ring-1 ring-cyan-100/60">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-cyan-700">💎 ジェム</div>
          <div className="text-2xl font-bold text-cyan-800">{formatNumber(gems)}</div>
        </div>
        <button className="inline-flex h-11 items-center justify-center rounded-xl border border-cyan-200 bg-white/80 px-4 text-sm font-semibold text-cyan-800 shadow-sm transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 active:scale-[0.99]">
          購入 →
        </button>
      </div>
    </div>
  );
}
