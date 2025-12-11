"use client";

type Props = {
  open: boolean;
  isCorrect: boolean;
  monsterName?: string | null;
  xp: number;
  bonusXp: number;
  coins: number;
  onClose: () => void;
};

export function RewardToast({ open, isCorrect, monsterName, xp, bonusXp, coins, onClose }: Props) {
  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`relative w-80 rounded-2xl border shadow-xl ${
          isCorrect ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
        }`}
      >
        <div className="pointer-events-none absolute -top-2 left-3 flex gap-1">
          <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
          <span className="h-2 w-2 animate-ping rounded-full bg-amber-400" style={{ animationDelay: "100ms" }} />
          <span className="h-2 w-2 animate-ping rounded-full bg-blue-400" style={{ animationDelay: "200ms" }} />
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Battle Result</p>
            <p className="text-base font-bold text-slate-900">
              {isCorrect ? "勝利！" : "失敗"}
            </p>
            {monsterName && <p className="text-sm text-slate-700">{monsterName}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/70 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-white"
          >
            閉じる
          </button>
        </div>
        <div className="grid grid-cols-3 border-t border-white/70 text-center text-sm font-semibold text-slate-800">
          <div className="px-2 py-2">
            <p className="text-[11px] uppercase text-slate-500">XP</p>
            <p className="animate-pulse text-emerald-700">{xp}</p>
          </div>
          <div className="border-l border-white/70 px-2 py-2">
            <p className="text-[11px] uppercase text-slate-500">Bonus</p>
            <p className="text-emerald-600">+{bonusXp}</p>
          </div>
          <div className="border-l border-white/70 px-2 py-2">
            <p className="text-[11px] uppercase text-slate-500">Coins</p>
            <p className="text-amber-600">{coins}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
