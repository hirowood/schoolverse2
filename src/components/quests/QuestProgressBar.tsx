type Props = {
  value: number;
  max: number;
  showLabel?: boolean;
};

export function QuestProgressBar({ value, max, showLabel = true }: Props) {
  const percent = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && <div className="text-[11px] font-semibold text-slate-600">{percent}%</div>}
    </div>
  );
}
