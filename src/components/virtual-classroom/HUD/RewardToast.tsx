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
        className={`w-80 rounded-2xl border shadow-xl ${
          isCorrect ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Battle Result</p>
            <p className="text-base font-bold text-slate-900">
              {isCorrect ? "勝利！" : "チャレンジ失敗"}
            </p>
            {monsterName && <p className="text-sm text-slate-700">{monsterName}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/70 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-white"
          >
            ×
          </button>
        </div>
        <div className="grid grid-cols-3 border-t border-white/70 text-center text-sm font-semibold text-slate-800">
          <div className="px-2 py-2">
            <p className="text-[11px] uppercase text-slate-500">XP</p>
            <p>{xp}</p>
          </div>
          <div className="border-l border-white/70 px-2 py-2">
            <p className="text-[11px] uppercase text-slate-500">Bonus</p>
            <p>+{bonusXp}</p>
          </div>
          <div className="border-l border-white/70 px-2 py-2">
            <p className="text-[11px] uppercase text-slate-500">Coins</p>
            <p>{coins}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
