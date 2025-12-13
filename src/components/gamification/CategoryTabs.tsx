import type { AchievementCategory, AchievementStatusFilter } from "@/types/gamification";

interface CategoryTabsProps {
  category: AchievementCategory;
  status: AchievementStatusFilter;
  onCategoryChange: (value: AchievementCategory) => void;
  onStatusChange: (value: AchievementStatusFilter) => void;
}

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
    <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm ring-1 ring-slate-100 dark:border-slate-700 dark:bg-slate-800/85 dark:ring-slate-700 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
          カテゴリ
        </span>
        {CATEGORY_ITEMS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onCategoryChange(item.value)}
            className={`rounded-full px-3 py-1 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${
              category === item.value
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
          ステータス
        </span>
        {STATUS_ITEMS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onStatusChange(item.value)}
            className={`rounded-full px-3 py-1 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${
              status === item.value
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}
