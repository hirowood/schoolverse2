import type { WeeklyReportContext } from "./types";
import { formatDuration } from "./utils";

export function buildWeeklyReportSystemPrompt(): string {
  return `あなたは「Schoolverse2」の週次レポートAIアシスタントです。ユーザーの学習時間・タスク・クレド・体調をまとめて、保護者や先生にも渡せる振り返りをJSON形式で出力してください。
出力は以下のキーを必ず含むJSONオブジェクトだけとし、余計な説明文を付けないでください。
1. conditionSummary: 体調やクレドを踏まえた短めの振り返り（220文字以内）。
2. activitySummary: 所感と達成ポイント。学習時間・タスク進捗を軽く触れてください（220文字以内）。
3. aiAnalysis: AIコーチとして感じた伸びしろや行動に対する洞察を1文（220文字以内）。
4. nextWeekFocus: 2〜3個の簡潔な勧め（短い文）の配列。「～しよう」「～してみよう」等の命令形が望ましい。
5. supporterExport: 保護者・先生向けの丁寧なメッセージ。ユーザーの状態と次週の支援ポイントを含めてください（240文字以内）。
すべて日本語で、句読点・過度な記号を避け、箇条書きではなく自然な文章にしてください。`;
}

export function buildWeeklyReportUserPrompt(context: WeeklyReportContext): string {
  const { weekLabel, profile, summary, credoSummary, conditionHighlights } = context;
  const totalSecondsText = formatDuration(summary.totalSeconds);
  const dailyText = summary.daily.map((row) => `${row.label}:${formatDuration(row.seconds)}`).join(" / ");
  const topTaskText = summary.topTasks.length
    ? summary.topTasks
        .map(
          (task) =>
            `${task.title}(${task.status.replace(/_/g, "")}) ${formatDuration(task.seconds)}${task.dueDate ? ` / ${task.dueDate}` : ""}`,
        )
        .join(" / ")
    : "該当タスクなし";
  const missingText = credoSummary.missing.length
    ? credoSummary.missing.slice(0, 3).map((item) => item.title).join(" / ")
    : "なし";
  const rankingText = credoSummary.ranking.length
    ? credoSummary.ranking.slice(0, 3).map((item) => `${item.title}(${item.count}回)`).join(" / ")
    : "記録なし";
  const healthText = conditionHighlights.join(" / ");

  return `週: ${weekLabel}
プロフィール:
- 名前: ${profile.name ?? "未設定"}
- 週間目標: ${profile.weeklyGoal ?? "未設定"}
- 活動時間帯: ${profile.activeHours ?? "未設定"}
- コーチトーン: ${profile.coachTone ?? "gentle"}
学習時間:
- 合計: ${totalSecondsText}
- 日別: ${dailyText}
タスク:
- 件数(未着手:${summary.statusCounts.todo}、進行中:${summary.statusCounts.inProgress}、一時停止:${summary.statusCounts.paused}、完了:${summary.statusCounts.done})
- 注目: ${topTaskText}
クレド:
- 実践率: ${credoSummary.practicedRate}%
- よく実践した項目: ${rankingText}
- 未実践の項目: ${missingText}
体調ハイライト: ${healthText}
これらの情報を使って、体調・活動・AI分析・来週のフォーカス・支援者向けメッセージをJSONでまとめてください。次週フォーカスは具体的・行動的・最大3つにしてください。`;
}
