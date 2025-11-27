// src/lib/coach/prompts/planSystem.ts
import type { PlanContext } from "../contextBuilder";

const activeHoursMap: Record<string, { label: string; slots: string[] }> = {
  morning: {
    label: "朝型",
    slots: ["6:00-7:00", "7:00-8:00", "8:00-9:00", "9:00-10:00"],
  },
  day: {
    label: "昼型",
    slots: ["12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00"],
  },
  evening: {
    label: "夜型",
    slots: ["18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00"],
  },
};

export function buildPlanSystemPrompt(): string {
  return `あなたは「学習プランナーAI」です。
ユーザーの状況に合わせた今日の学習計画を作成します。

## 出力形式
必ず以下のJSON形式で出力してください。JSONのみ、他の説明は不要です。
\`\`\`json
{
  "date": "YYYY-MM-DD",
  "focus": "今日の重点テーマ（20文字以内）",
  "tasks": [
    {
      "title": "タスク名（50文字以内）",
      "durationMinutes": 30,
      "timeSlot": "9:00-9:30",
      "note": "補足（任意、省略可）"
    }
  ],
  "coachMessage": "励ましのメッセージ（100文字以内）"
}
\`\`\`

## ルール
1. tasksは3〜5個にする（多すぎない）
2. 各タスクは15〜60分の長さにする
3. 合計時間は2時間以内にする
4. ユーザーの活動時間帯を優先する
5. 既存の登録済みタスクがあれば、それを活用する
6. 最初のタスクは5〜15分の短いものにして、始めやすくする
7. クレド実践状況を見て、実践率が低い項目を取り入れる`;
}

export function buildPlanUserPrompt(context: PlanContext): string {
  const { profile, credoSummary, tasks, targetDate } = context;

  const dateStr = targetDate.toISOString().slice(0, 10);
  const dayNames = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
  const dayName = dayNames[targetDate.getDay()];

  const activeHoursInfo = profile.activeHours
    ? activeHoursMap[profile.activeHours] ?? { label: profile.activeHours, slots: [] }
    : { label: "未設定", slots: [] };

  const taskList = tasks.length > 0
    ? tasks.map((t) => `- [ID: ${t.id}] ${t.title}（状態: ${t.status}）`).join("\n")
    : "登録済みタスクなし";

  const rankingText = credoSummary.ranking.length > 0
    ? credoSummary.ranking.slice(0, 3).map((r) => `${r.title}(${r.count}回)`).join("、")
    : "まだデータなし";

  const missingText = credoSummary.missing.length > 0
    ? credoSummary.missing.slice(0, 3).map((m) => m.title).join("、")
    : "すべて実践済み";

  return `## 今日の日付
${dateStr}（${dayName}）

## ユーザー情報
- 名前: ${profile.name ?? "ユーザー"}さん
- 週の目標: ${profile.weeklyGoal ?? "未設定"}
- 活動しやすい時間帯: ${activeHoursInfo.label}
${activeHoursInfo.slots.length > 0 ? `- 推奨時間枠: ${activeHoursInfo.slots.join(", ")}` : ""}

## クレド実践状況（今週）
- 実践率: ${credoSummary.practicedRate}%
- よく実践している項目: ${rankingText}
- まだ実践していない項目: ${missingText}

## 登録済みタスク
${taskList}

上記をふまえて、今日の学習計画をJSON形式で作成してください。
登録済みタスクがある場合は、そのタスク名をtitleに使ってください。`;
}
