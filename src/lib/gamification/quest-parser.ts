import { QuestCategory } from "@/lib/constants/quest-categories";
import { ParsedQuest, QuestDifficulty } from "./types";

const VALID_CATEGORIES: QuestCategory[] = [
  "learning",
  "life_habit",
  "health",
  "learning_attitude",
  "note_quality",
  "credo",
  "social",
];

const VALID_DIFFICULTIES: QuestDifficulty[] = ["easy", "medium", "hard"];

export class QuestParseError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "QuestParseError";
  }
}

export function parseQuestResponse(responseText: string): ParsedQuest[] {
  let jsonString: string;
  const jsonBlockMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/);
  if (jsonBlockMatch) {
    jsonString = jsonBlockMatch[1];
  } else {
    const startIndex = responseText.indexOf("[");
    const endIndex = responseText.lastIndexOf("]") + 1;
    if (startIndex === -1 || endIndex <= startIndex) {
      throw new QuestParseError("JSON配列が見つかりません");
    }
    jsonString = responseText.slice(startIndex, endIndex);
  }

  let rawQuests: unknown;
  try {
    rawQuests = JSON.parse(jsonString);
  } catch (e) {
    throw new QuestParseError("JSONのパースに失敗しました", { cause: e });
  }

  if (!Array.isArray(rawQuests)) {
    throw new QuestParseError("レスポンスが配列ではありません");
  }

  const validated = rawQuests.map((quest, index) => validateQuest(quest, index));
  validateCategoryBalance(validated);
  return validated.sort((a, b) => b.priority - a.priority);
}

function validateQuest(quest: unknown, index: number): ParsedQuest {
  if (typeof quest !== "object" || quest === null) {
    throw new QuestParseError(`クエスト${index + 1}: オブジェクトではありません`);
  }
  const q = quest as Record<string, unknown>;

  const required = ["title", "description", "category", "difficulty", "xpReward", "reason"];
  for (const field of required) {
    if (!(field in q)) {
      throw new QuestParseError(`クエスト${index + 1}: ${field}が必要です`);
    }
  }

  const title = String(q.title);
  const normalizedTitle = title.length > 15 ? `${title.slice(0, 15)}...` : title;

  const category = q.category as QuestCategory;
  if (!VALID_CATEGORIES.includes(category)) {
    throw new QuestParseError(`クエスト${index + 1}: 無効なカテゴリ「${q.category}」`);
  }

  let difficulty = q.difficulty as QuestDifficulty;
  if (!VALID_DIFFICULTIES.includes(difficulty)) difficulty = "medium";

  let xpReward = Number(q.xpReward);
  if (Number.isNaN(xpReward) || xpReward < 20) xpReward = 20;
  if (xpReward > 100) xpReward = 100;

  let estimatedMinutes = Number(q.estimatedMinutes ?? 30);
  if (estimatedMinutes < 5) estimatedMinutes = 5;
  if (estimatedMinutes > 60) estimatedMinutes = 60;

  let priority = Number(q.priority ?? 5);
  if (priority < 1) priority = 1;
  if (priority > 10) priority = 10;

  return {
    title: normalizedTitle,
    description: String(q.description),
    category,
    difficulty,
    xpReward,
    estimatedMinutes,
    reason: String(q.reason),
    tips: q.tips ? String(q.tips) : undefined,
    relatedGoal: q.relatedGoal ? String(q.relatedGoal) : undefined,
    relatedCredo: q.relatedCredo ? String(q.relatedCredo) : undefined,
    relatedData: q.relatedData ? String(q.relatedData) : undefined,
    priority,
  };
}

function validateCategoryBalance(quests: ParsedQuest[]): void {
  const unique = new Set(quests.map((q) => q.category));
  if (unique.size < 3) {
    // 軽い警告のみ。致命エラーにはしない
    console.warn("カテゴリが3種類未満です。バランスに偏りがあります。");
  }
}
