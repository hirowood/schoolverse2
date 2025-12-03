export type QuestDefinition = {
  name: string;
  description: string;
  objectiveType: string;
  targetValue: number;
  xpReward: number;
  difficulty: "easy" | "normal" | "hard" | string;
  category?: string;
  questType?: "daily" | "weekly" | "special" | string;
  coinReward?: number;
  minLevel?: number;
  maxLevel?: number;
  weight?: number;
};

export const DAILY_QUESTS: QuestDefinition[] = [
  // ===== 学習時間系 =====
  {
    name: "今日の学習",
    description: "今日30分以上学習する",
    objectiveType: "study_time",
    targetValue: 1800,
    xpReward: 30,
    difficulty: "easy",
    questType: "daily",
  },
  {
    name: "集中学習",
    description: "今日1時間以上学習する",
    objectiveType: "study_time",
    targetValue: 3600,
    xpReward: 50,
    difficulty: "normal",
    questType: "daily",
  },
  {
    name: "マラソン学習",
    description: "今日2時間以上学習する",
    objectiveType: "study_time",
    targetValue: 7200,
    xpReward: 100,
    difficulty: "hard",
    questType: "daily",
  },

  // ===== チャット系 =====
  {
    name: "AIと対話",
    description: "学習チャットでメッセージを3回送信する",
    objectiveType: "chat_messages",
    targetValue: 3,
    xpReward: 20,
    difficulty: "easy",
    questType: "daily",
  },
  {
    name: "深い学び",
    description: "学習チャットで10分以上会話する",
    objectiveType: "chat_duration",
    targetValue: 600,
    xpReward: 40,
    difficulty: "normal",
    questType: "daily",
  },

  // ===== カテゴリ特化 =====
  {
    name: "Python練習",
    description: "PythonカテゴリでAIと対話する",
    objectiveType: "category_chat",
    targetValue: 1,
    category: "python_basic",
    xpReward: 25,
    difficulty: "easy",
    questType: "daily",
  },
  {
    name: "Web開発チャレンジ",
    description: "Web開発カテゴリで15分以上学習する",
    objectiveType: "category_time",
    targetValue: 900,
    category: "programming_web",
    xpReward: 35,
    difficulty: "normal",
    questType: "daily",
  },

  // ===== スキル系 =====
  {
    name: "スキル成長",
    description: "いずれかのスキルでXPを獲得する",
    objectiveType: "skill_xp",
    targetValue: 50,
    xpReward: 30,
    difficulty: "normal",
    questType: "daily",
  },

  // ===== タスク系 =====
  {
    name: "タスク完了",
    description: "タスクを1つ完了する",
    objectiveType: "complete_task",
    targetValue: 1,
    xpReward: 20,
    difficulty: "easy",
    questType: "daily",
  },
  {
    name: "タスクマスター",
    description: "タスクを3つ完了する",
    objectiveType: "complete_task",
    targetValue: 3,
    xpReward: 50,
    difficulty: "normal",
    questType: "daily",
  },

  // ===== ノート系 =====
  {
    name: "ノート作成",
    description: "ノートを1つ作成する",
    objectiveType: "create_note",
    targetValue: 1,
    xpReward: 25,
    difficulty: "easy",
    questType: "daily",
  },
];

function pickRandom<T>(list: T[]): T | undefined {
  if (list.length === 0) return undefined;
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

function removeAt<T>(list: T[], index: number): T {
  return list.splice(index, 1)[0] as T;
}

// クエスト生成アルゴリズム
export function generateDailyQuests(
  userLevel: number,
  recentCategories: string[] = [],
  count: number = 3,
): QuestDefinition[] {
  const eligible = DAILY_QUESTS.filter(
    (quest) =>
      userLevel >= (quest.minLevel ?? 1) &&
      (quest.maxLevel === undefined || userLevel <= quest.maxLevel),
  );

  const easy = eligible.filter((q) => q.difficulty === "easy");
  const normal = eligible.filter((q) => q.difficulty === "normal");
  const hard = eligible.filter((q) => q.difficulty === "hard");

  const selected: QuestDefinition[] = [];

  const easyPick = pickRandom(easy);
  if (easyPick) {
    selected.push(easyPick);
  }

  const normalCount = Math.min(
    2,
    count - selected.length - (hard.length > 0 && userLevel >= 5 ? 1 : 0),
  );
  for (let i = 0; i < normalCount && normal.length > 0; i++) {
    const idx = Math.floor(Math.random() * normal.length);
    selected.push(removeAt(normal, idx));
  }

  if (hard.length > 0 && userLevel >= 5 && selected.length < count) {
    const hardPick = pickRandom(hard);
    if (hardPick) {
      selected.push(hardPick);
    }
  }

  // 最近カテゴリを考慮して不足分を補充（簡易実装）
  const remainingSlots = count - selected.length;
  if (remainingSlots > 0) {
    const remaining = eligible.filter((quest) => !selected.includes(quest));
    const prioritized = recentCategories.length
      ? remaining.sort((a, b) => {
          const aHit = a.category && recentCategories.includes(a.category) ? 1 : 0;
          const bHit = b.category && recentCategories.includes(b.category) ? 1 : 0;
          return bHit - aHit;
        })
      : remaining;

    for (let i = 0; i < remainingSlots && prioritized[i]; i++) {
      selected.push(prioritized[i]);
    }
  }

  return selected.slice(0, count);
}
