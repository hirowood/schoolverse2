type LevelUpInfo = {
  occurred: boolean;
  previousLevel: number;
  newLevel: number;
  bonusXp: number;
};

type Props = {
  xp: number;
  levelUp?: LevelUpInfo;
};

export function XpGainToast({ xp, levelUp }: Props) {
  const hasLevelUp = levelUp?.occurred;
  return (
    <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-lg ring-1 ring-emerald-200">
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-lg">⚡</div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-emerald-700">XP獲得!</p>
          <p className="text-sm text-slate-700">+{xp} XP</p>
          {hasLevelUp && (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
              レベルアップ! Lv.{levelUp?.previousLevel} → Lv.{levelUp?.newLevel} (+{levelUp?.bonusXp} XP)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
