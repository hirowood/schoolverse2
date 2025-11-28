import type { WeeklyReportContext, WeeklyReportRecord } from "./types";
import { formatDuration } from "./utils";

export function buildWeeklyReportMarkdown(
  report: WeeklyReportRecord,
  context: WeeklyReportContext
): string {
  const { summary, credoSummary, conditionHighlights } = context;
  const dailyLines = summary.daily
    .map((row) => `- ${row.date} (${row.label}): ${formatDuration(row.seconds)}`)
    .join("\n");
  const topTasks =
    summary.topTasks.length > 0
      ? summary.topTasks
          .map(
            (task) =>
              `- ${task.title} (${task.status.replace(/_/g, "")}) ${task.dueDate ? `／期限 ${task.dueDate}` : ""}：${formatDuration(
                task.seconds,
              )}`,
          )
          .join("\n")
      : "- なし";
  const focusLines =
    report.nextWeekFocus.length > 0
      ? report.nextWeekFocus.map((focus) => `- ${focus}`).join("\n")
      : "- なし";

  return `# 週次レポート（${context.weekLabel}）

## 体調・クレド
${report.conditionSummary}

- ハイライト: ${conditionHighlights.join(" / ")}
- クレド実践率: ${credoSummary.practicedRate}%（多い項目: ${
    credoSummary.ranking.length > 0 ? credoSummary.ranking[0].title : "記録なし"
  }）未実践: ${credoSummary.missing.slice(0, 3).map((item) => item.title).join(" / ") || "なし"}

## 活動サマリー
${report.activitySummary}

### 学習時間（累計: ${formatDuration(summary.totalSeconds)}）
${dailyLines}

### タスク状況
- 合計件数: ${summary.statusCounts.total}、完了: ${summary.statusCounts.done}、進行中: ${summary.statusCounts.inProgress}、一時停止: ${summary.statusCounts.paused}、未着手: ${summary.statusCounts.todo}
- 注目タスク:
${topTasks}

## AI分析
${report.aiAnalysis}

## 来週のフォーカス
${focusLines}

## 支援者向けメッセージ
${report.supporterExport}
`;
}
