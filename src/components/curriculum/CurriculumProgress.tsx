type Props = {
  completed: number;
  total: number;
  label?: string;
  size?: "sm" | "md";
};

export function CurriculumProgress({ completed, total, label, size = "md" }: Props) {
  const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const heightClass = size === "sm" ? "h-2" : "h-3";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>{label ?? "進捗"}</span>
        <span className="font-semibold text-slate-800">
          {percentage}% ({completed}/{total})
        </span>
      </div>
      <div className={`overflow-hidden rounded-full bg-slate-100 ${heightClass}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300`}
          style={{ width: `${percentage}%` }}
          aria-label="progress"
        />
      </div>
    </div>
  );
}
