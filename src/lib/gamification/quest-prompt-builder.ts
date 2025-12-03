import { QuestCategory, QUEST_CATEGORIES } from "@/lib/constants/quest-categories";
import { QuestGenerationContext } from "./types";

function ratioToPercent(v: number): string {
  return `${Math.round((v || 0) * 100)}%`;
}

function listOrNA(list: string[]): string {
  return list.length ? list.join(", ") : "なし";
}

function formatTodayCondition(condition: QuestGenerationContext["todayCondition"]): string {
  if (!condition) return "未入力";
  return [
    `体調:${condition.physical}/5`,
    `メンタル:${condition.mental}/5`,
    `やる気:${condition.motivation}/5`,
    `エネルギー:${condition.energy}/5`,
    condition.sleepHours ? `睡眠:${condition.sleepHours}h` : null,
    condition.hasImportantEvent ? `重要予定:${condition.eventDescription ?? "あり"}` : "重要予定:なし",
  ]
    .filter(Boolean)
    .join(" / ");
}

function formatLifeHabits(ctx: QuestGenerationContext["lifeHabitsAnalysis"]): string {
  return [
    `平均睡眠: ${ctx.avgSleepHours.toFixed(1)}h (${ctx.sleepQualityTrend})`,
    `朝食:${ratioToPercent(ctx.breakfastRate)} 昼食:${ratioToPercent(ctx.lunchRate)} 夕食:${ratioToPercent(ctx.dinnerRate)}`,
    `運動: ${ctx.avgExerciseMinutes.toFixed(1)}分/日 (${ctx.exerciseFrequency}回/期間)`,
    `水分: ${ctx.avgWaterIntake.toFixed(0)}ml`,
    `スクリーン: ${ctx.avgScreenTime.toFixed(0)}分`,
    `外出: ${ratioToPercent(ctx.wentOutsideRate)} / 片付け: ${ratioToPercent(ctx.roomCleanRate)}`,
    `課題: ${listOrNA(ctx.issues)}`,
  ].join("\n");
}

function formatLearningAttitude(ctx: QuestGenerationContext["learningAttitudeAnalysis"]): string {
  return [
    `集中: 平均${ctx.avgFocusMinutes.toFixed(0)}分 / 最長${ctx.longestFocus}分 (${ctx.focusTrend})`,
    `ポモドーロ: 平均${ctx.avgPomodoroCount.toFixed(1)}回 / 中断${ctx.avgDistractions.toFixed(1)}回`,
    `予習:${ratioToPercent(ctx.previewRate)} 復習:${ratioToPercent(ctx.reviewRate)} 振り返り:${ratioToPercent(
      ctx.reflectionRate,
    )}`,
    `自己テスト:${ratioToPercent(ctx.selfTestRate)} 目標設定:${ratioToPercent(ctx.goalSettingRate)} 達成:${ratioToPercent(
      ctx.goalAchievementRate,
    )}`,
  ].join("\n");
}

function formatNoteQuality(ctx: QuestGenerationContext["noteQualityAnalysis"]): string {
  return [
    `作成:${ctx.notesCreated}件 / 平均文字数:${ctx.avgWordCount.toFixed(0)}`,
    `構造スコア:${ctx.avgStructureScore.toFixed(0)} / テンプレ活用:${ratioToPercent(ctx.templateUsageRate)}`,
    `タグ平均:${ctx.avgTagCount.toFixed(1)} / 復習率:${ratioToPercent(ctx.reviewRate)}`,
  ].join("\n");
}

function formatGameProgress(ctx: QuestGenerationContext["gameProgress"]): string {
  return [
    `Lv.${ctx.level} (${ctx.rank}) XP:${ctx.totalXp} Next+${ctx.xpToNextLevel}`,
    `達成率(30日):${ratioToPercent(ctx.questCompletionRate)}`,
    `好み:${listOrNA(ctx.favoriteCategories)} / 苦手:${listOrNA(ctx.avoidedCategories)}`,
  ].join("\n");
}

function formatSpecialRules(context: QuestGenerationContext): string {
  const rules: string[] = [];
  const { lifeHabitsAnalysis: life, learningAttitudeAnalysis: learn, noteQualityAnalysis: notes, credoAnalysis: credo } =
    context;

  if (life.avgSleepHours < 6) rules.push("- 睡眠改善クエストを1つ含める（life_habit, easy）");
  if (life.breakfastRate < 0.5) rules.push("- 朝食クエストを含める（life_habit, easy）");
  if (life.avgExerciseMinutes < 15) rules.push("- 軽い運動クエストを含める（health, easy）");
  if (learn.reviewRate < 0.3) rules.push("- 復習クエストを含める（learning_attitude, easy/medium）");
  if (learn.reflectionRate < 0.3) rules.push("- 振り返りクエストを含める（learning_attitude, easy）");
  if (notes.avgStructureScore < 50) rules.push("- ノート改善クエストを含める（note_quality, easy/medium）");
  if (credo.weakCredos.length > 0)
    rules.push(`- Credo「${credo.weakCredos[0]}」を実践するクエストを含める（credo, easy）`);
  if (context.todayCondition?.hasImportantEvent)
    rules.push(`- 「${context.todayCondition.eventDescription ?? "重要な予定"}」があるので他は軽めに`);
  if (context.gameProgress.avoidedCategories.length > 0) {
    rules.push(`- 苦手カテゴリ「${context.gameProgress.avoidedCategories[0]}」は難易度を下げる`);
  }
  if (context.temporal.isWeekend) rules.push("- 週末のためリフレッシュ系も1つ含める");

  return rules.length ? rules.join("\n") : "特になし";
}

export function buildQuestPrompt(context: QuestGenerationContext, preferred?: QuestCategory[]): string {
  const categories = preferred?.length
    ? `優先カテゴリ: ${preferred.map((c) => QUEST_CATEGORIES[c].name).join(", ")}`
    : "優先カテゴリ: 指定なし";

  return `あなたは学生の成長を支援するAIライフコーチです。以下のデータを踏まえて、具体的で達成可能なデイリークエストを5〜7件生成してください。

${categories}

--- ユーザー情報 ---
名前: ${context.user.name}
学年: ${context.user.grade ?? "未設定"}
得意科目: ${listOrNA(context.user.strongSubjects)}
苦手科目: ${listOrNA(context.user.weakSubjects)}
夢: ${context.goals.dreamJob ?? "未設定"} / 志望校: ${context.goals.targetSchool ?? "未設定"}
年間/月間/週間目標: ${context.goals.yearlyGoal ?? "-"} / ${context.goals.monthlyGoal ?? "-"} / ${
    context.goals.weeklyGoal ?? "-"
  }

--- 今日の状態 ---
${formatTodayCondition(context.todayCondition)}

--- 生活習慣（過去7日） ---
${formatLifeHabits(context.lifeHabitsAnalysis)}

--- 学習姿勢（過去7日） ---
${formatLearningAttitude(context.learningAttitudeAnalysis)}

--- ノート品質（過去7日） ---
${formatNoteQuality(context.noteQualityAnalysis)}

--- Credo実践 / 習慣 ---
Credo弱点: ${listOrNA(context.credoAnalysis.weakCredos)}
習慣達成率: ${ratioToPercent(context.habitsAnalysis.overallCompletionRate)}

--- ゲーム進捗 ---
${formatGameProgress(context.gameProgress)}

--- 生成ルール ---
1) 7カテゴリから最低4カテゴリをカバーし5〜7件
2) 体調に応じて難易度を調整
3) 弱点・課題を優先し、改善傾向は維持タスクを出す
4) 1クエストは60分以内で完了できる具体的行動
5) 難易度別XP: easy(20-40) / medium(40-70) / hard(70-100)

--- 特別ルール ---
${formatSpecialRules(context)}

--- 出力フォーマット (JSON配列のみ) ---
[
  {
    "title": "15文字以内",
    "description": "具体的行動と達成条件（80文字程度）",
    "category": "learning|life_habit|health|learning_attitude|note_quality|credo|social",
    "difficulty": "easy|medium|hard",
    "xpReward": 20-100,
    "estimatedMinutes": 5-60,
    "reason": "データに基づく根拠",
    "tips": "任意のアドバイス",
    "relatedGoal": "任意",
    "relatedCredo": "任意",
    "relatedData": "根拠になったデータ",
    "priority": 1-10
  }
]
JSONだけを返してください。`;
}
