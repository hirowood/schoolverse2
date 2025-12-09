import React from "react";

type ProgressBarProps = {
  value: number;
  max: number;
  heightClass?: string;
  showLabel?: boolean;
  colorFrom?: string;
  colorTo?: string;
};

export function ProgressBar({
  value,
  max,
  heightClass = "h-3",
  showLabel = false,
  colorFrom = "from-indigo-500",
  colorTo = "to-purple-500",
}: ProgressBarProps) {
  const percent = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));

  return (
    <div className="w-full space-y-1">
      <div className={`h-3 w-full overflow-hidden rounded-full bg-slate-200 ${heightClass}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorFrom} ${colorTo}`}
          style={{ width: `${percent}%` }}
          aria-valuenow={percent}
          aria-valuemax={100}
          aria-valuemin={0}
          role="progressbar"
        />
      </div>
      {showLabel && <div className="text-xs font-semibold text-slate-600">{percent}%</div>}
    </div>
  );
}
