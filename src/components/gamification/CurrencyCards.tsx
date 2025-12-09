import { formatNumber } from "@/lib/gamification/formatters";

type CurrencyCardsProps = {
  coins: number;
  gems: number;
};

export function CurrencyCards({ coins, gems }: CurrencyCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50/60 p-4 shadow-sm">
        <div>
          <div className="text-xs font-semibold text-amber-700">💰 コイン</div>
          <div className="text-2xl font-bold text-amber-800">{formatNumber(coins)}</div>
        </div>
        <button className="rounded-lg border border-amber-200 bg-white/70 px-3 py-1.5 text-sm font-semibold text-amber-800 transition hover:bg-white">
          ショップへ →
        </button>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4 shadow-sm">
        <div>
          <div className="text-xs font-semibold text-cyan-700">💎 ジェム</div>
          <div className="text-2xl font-bold text-cyan-800">{formatNumber(gems)}</div>
        </div>
        <button className="rounded-lg border border-cyan-200 bg-white/70 px-3 py-1.5 text-sm font-semibold text-cyan-800 transition hover:bg-white">
          購入 →
        </button>
      </div>
    </div>
  );
}
