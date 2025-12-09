import { CATEGORY_META } from "@/lib/quests/formatters";
import type { QuestCategory } from "@/types/quest";

type Props = {
  category: QuestCategory;
  label?: string;
};

export function QuestCategoryBadge({ category, label }: Props) {
  const meta = CATEGORY_META[category];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${meta.bg} ${meta.border}`}
      style={{ color: meta.color }}
    >
      <span>{meta.icon}</span>
      <span>{label ?? meta.label}</span>
    </span>
  );
}
