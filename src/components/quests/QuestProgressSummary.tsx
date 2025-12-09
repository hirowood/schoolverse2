import type { QuestProgressSummary as QuestProgressSummaryType } from "@/types/quest";
import { QuestProgressBar } from "@/components/quests/QuestProgressBar";

type Props = {
  summary: QuestProgressSummaryType;
  onRegenerate?: () => void;
};

export function QuestProgressSummary({ summary, onRegenerate }: Props) {
  const progress = summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">進捗サマリー</p>
          <div className="text-xl font-bold text-slate-900">
            完了: {summary.completed}/{summary.total} ・ 獲得XP: {summary.totalXpEarned}
          </div>
          <p className="text-xs text-slate-500">残り時間: 約{summary.remainingHours}時間</p>
        </div>
        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            再生成
          </button>
        )}
      </div>
      <div className="mt-4">
        <QuestProgressBar value={progress} max={100} showLabel={false} />
      </div>
      {summary.streak > 0 && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          🔥 {summary.streak}日連続クエスト達成中！
        </div>
      )}
    </div>
  );
}
