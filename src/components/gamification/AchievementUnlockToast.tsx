type Achievement = {
  slug: string;
  name: string;
  icon: string;
  xpReward: number;
  coinReward: number;
  titleReward?: string | null;
};

type Props = {
  achievements: Achievement[];
};

export function AchievementUnlockToast({ achievements }: Props) {
  if (achievements.length === 0) return null;
  return (
    <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border border-amber-100 bg-white shadow-lg ring-1 ring-amber-200">
      <div className="p-4">
        <p className="text-sm font-semibold text-amber-700">実績解除！</p>
        <div className="mt-2 space-y-2">
          {achievements.map((ach) => (
            <div key={ach.slug} className="flex items-start gap-3 rounded-lg bg-amber-50 px-3 py-2">
              <span className="text-lg">{ach.icon || "🏅"}</span>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-slate-900">{ach.name}</p>
                <p className="text-xs text-slate-600">+{ach.xpReward} XP / +{ach.coinReward} コイン</p>
                {ach.titleReward && <p className="text-[11px] text-amber-700">称号: {ach.titleReward}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
