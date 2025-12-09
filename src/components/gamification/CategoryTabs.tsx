import type { AchievementCategory, AchievementStatusFilter } from "@/types/gamification";

type CategoryTabsProps = {
  category: AchievementCategory;
  status: AchievementStatusFilter;
  onCategoryChange: (value: AchievementCategory) => void;
  onStatusChange: (value: AchievementStatusFilter) => void;
};

const CATEGORY_ITEMS: Array<{ value: AchievementCategory; label: string }> = [
  { value: "all", label: "すべて" },
  { value: "learning", label: "学習" },
  { value: "streak", label: "継続" },
  { value: "social", label: "社交" },
  { value: "exploration", label: "探索" },
  { value: "special", label: "特別" },
];

const STATUS_ITEMS: Array<{ value: AchievementStatusFilter; label: string }> = [
  { value: "all", label: "全部" },
  { value: "in_progress", label: "進捗中" },
  { value: "completed", label: "達成済" },
  { value: "unclaimed", label: "未受取" },
];

export function CategoryTabs({ category, status, onCategoryChange, onStatusChange }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {CATEGORY_ITEMS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onCategoryChange(item.value)}
            className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
              category === item.value
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {STATUS_ITEMS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onStatusChange(item.value)}
            className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
              status === item.value
                ? "bg-indigo-600 text-white"
                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
