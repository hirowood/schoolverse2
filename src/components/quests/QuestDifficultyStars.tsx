import { DIFFICULTY_META } from "@/lib/quests/formatters";
import type { QuestDifficulty } from "@/types/quest";

type Props = {
  difficulty: QuestDifficulty;
};

export function QuestDifficultyStars({ difficulty }: Props) {
  const meta = DIFFICULTY_META[difficulty];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${meta.bg} ${meta.text}`}>
      {Array.from({ length: meta.stars }).map((_, i) => (
        <span key={i}>⭐</span>
      ))}
      <span>{meta.label}</span>
    </span>
  );
}
