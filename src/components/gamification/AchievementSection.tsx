import type { AchievementWithProgress } from "@/types/gamification";
import { AchievementCard } from "@/components/gamification/AchievementCard";

interface AchievementSectionProps {
  title: string;
  achievements: AchievementWithProgress[];
  onSelect: (achievement: AchievementWithProgress) => void;
  onClaim: (id: string) => void;
}

export function AchievementSection({ title, achievements, onSelect, onClaim }: AchievementSectionProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">{title}</h4>
      {achievements.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
          該当する実績はありません。
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {achievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            onSelect={onSelect}
            onClaim={onClaim}
          />
        ))}
      </div>
    </div>
  );
}
