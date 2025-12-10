import { useEffect, useRef, useState } from "react";

type Props = {
  onChange?: (elapsedSec: number) => void;
  disabled?: boolean;
};

const formatTime = (totalSec: number) => {
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (hours > 0) {
    return `${hours}時間${minutes.toString().padStart(2, "0")}分${seconds.toString().padStart(2, "0")}秒`;
  }
  return `${minutes}分${seconds.toString().padStart(2, "0")}秒`;
};

export function LessonTimer({ onChange, disabled }: Props) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    onChange?.(elapsed);
  }, [elapsed, onChange]);

  const toggle = () => {
    if (disabled) return;
    setIsRunning((prev) => !prev);
  };

  const reset = () => {
    if (disabled) return;
    setElapsed(0);
    setIsRunning(false);
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="flex-1">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">学習タイマー</p>
        <p className="text-xl font-semibold text-slate-900">{formatTime(elapsed)}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          disabled={disabled}
          className={`rounded-full px-3 py-1 text-sm font-semibold text-white transition ${
            isRunning ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-600 hover:bg-emerald-700"
          } ${disabled ? "opacity-60" : ""}`}
        >
          {isRunning ? "一時停止" : "開始"}
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={disabled}
          className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-white disabled:opacity-60"
        >
          リセット
        </button>
      </div>
    </div>
  );
}
