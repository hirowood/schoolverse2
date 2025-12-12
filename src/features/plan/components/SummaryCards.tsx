"use client";

// 進捗・ポモドーロ・集中モードの3カードをまとめて表示する軽量コンポーネント
import { PomodoroPhase } from "../hooks/usePomodoroTimer";
import { Card } from "@/components/ui/Card";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

type Progress = { percent: number; done: number; total: number } | null;

type Props = {
  todayParentProgress: Progress;
  pomodoroEnabled: boolean;
  pomodoroLoading: boolean;
  pomodoroPhase: PomodoroPhase;
  pomodoroSecondsLeft: number;
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
  singleTaskMode: boolean;
  onTogglePomodoro: () => void;
  onToggleSingleTaskMode: () => void;
  formatPomodoroTime: (seconds: number) => string;
  todayLabel: string;
  singleTaskLabel: string;
  singleTaskDescription: string;
};

export function SummaryCards({
  todayParentProgress,
  pomodoroEnabled,
  pomodoroLoading,
  pomodoroPhase,
  pomodoroSecondsLeft,
  pomodoroWorkMinutes,
  pomodoroBreakMinutes,
  singleTaskMode,
  onTogglePomodoro,
  onToggleSingleTaskMode,
  formatPomodoroTime,
  todayLabel,
  singleTaskLabel,
  singleTaskDescription,
}: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">今日の進捗</p>
          <p className="text-sm font-medium text-slate-900">{todayLabel}</p>
        </div>
        {todayParentProgress ? (
          <div className="flex flex-col items-end">
            <span className="text-2xl font-semibold text-emerald-600 leading-none">{todayParentProgress.percent}%</span>
            <span className="text-xs text-slate-500">
              ({todayParentProgress.done}/{todayParentProgress.total})
            </span>
          </div>
        ) : (
          <p className="text-xs text-slate-500">タスクがありません</p>
        )}
      </Card>

      <Card className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Focus</p>
          <p className="text-sm font-medium text-slate-900">ポモドーロタイマー</p>
          <p className="text-xs text-slate-500">
            状態: {pomodoroEnabled ? (pomodoroPhase === "break" ? "休憩中" : "作業中") : "OFF"}
          </p>
          <p className="text-xs text-slate-500">
            残り {formatPomodoroTime(pomodoroSecondsLeft)}（作業 {pomodoroWorkMinutes}分 / 休憩 {pomodoroBreakMinutes}分）
          </p>
          {pomodoroLoading && <p className="text-[11px] text-slate-500">設定を読み込み中...</p>}
        </div>
        <ToggleSwitch
          checked={pomodoroEnabled}
          disabled={pomodoroLoading}
          onToggle={onTogglePomodoro}
          ariaLabel="ポモドーロタイマーを切り替え"
        />
      </Card>

      <Card className="flex items-center justify-between">
        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">集中</p>
          <p className="text-sm font-medium text-slate-900">{singleTaskLabel}</p>
          <p className="text-xs text-slate-500">{singleTaskDescription}</p>
        </div>
        <ToggleSwitch
          checked={singleTaskMode}
          onToggle={onToggleSingleTaskMode}
          ariaLabel="シングルタスクモードを切り替え"
        />
      </Card>
    </div>
  );
}
