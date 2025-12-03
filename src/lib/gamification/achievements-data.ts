export type AchievementDefinitionData = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary" | string;
  conditionType: string;
  conditionValue: number;
  conditionJson?: Record<string, unknown>;
  xpReward: number;
  coinReward?: number;
  titleReward?: string;
  category: string;
  order?: number;
  isHidden?: boolean;
  isActive?: boolean;
};

export const ACHIEVEMENTS: AchievementDefinitionData[] = [
  // ===== ストリーク系 =====
  {
    slug: "streak_3",
    name: "三日坊主卒業",
    description: "3日連続で学習する",
    icon: "🔥",
    rarity: "common",
    conditionType: "streak",
    conditionValue: 3,
    xpReward: 50,
    category: "streak",
  },
  {
    slug: "streak_7",
    name: "一週間の習慣",
    description: "7日連続で学習する",
    icon: "🔥",
    rarity: "uncommon",
    conditionType: "streak",
    conditionValue: 7,
    xpReward: 100,
    category: "streak",
  },
  {
    slug: "streak_30",
    name: "学習マスター",
    description: "30日連続で学習する",
    icon: "👑",
    rarity: "rare",
    conditionType: "streak",
    conditionValue: 30,
    xpReward: 500,
    titleReward: "継続の達人",
    category: "streak",
  },
  {
    slug: "streak_100",
    name: "伝説の学習者",
    description: "100日連続で学習する",
    icon: "🏆",
    rarity: "legendary",
    conditionType: "streak",
    conditionValue: 100,
    xpReward: 2000,
    titleReward: "伝説",
    category: "streak",
    isHidden: true,
  },

  // ===== 学習時間系 =====
  {
    slug: "time_1h",
    name: "最初の一歩",
    description: "累計1時間学習する",
    icon: "⏱️",
    rarity: "common",
    conditionType: "total_time",
    conditionValue: 3600,
    xpReward: 30,
    category: "learning",
  },
  {
    slug: "time_10h",
    name: "10時間の努力",
    description: "累計10時間学習する",
    icon: "⏱️",
    rarity: "uncommon",
    conditionType: "total_time",
    conditionValue: 36000,
    xpReward: 150,
    category: "learning",
  },
  {
    slug: "time_100h",
    name: "100時間の修行",
    description: "累計100時間学習する",
    icon: "🎓",
    rarity: "rare",
    conditionType: "total_time",
    conditionValue: 360000,
    xpReward: 1000,
    titleReward: "努力家",
    category: "learning",
  },

  // ===== スキル系 =====
  {
    slug: "first_skill",
    name: "スキル習得",
    description: "初めてのスキルを習得する",
    icon: "✨",
    rarity: "common",
    conditionType: "skill_complete",
    conditionValue: 1,
    xpReward: 50,
    category: "learning",
  },
  {
    slug: "skill_5",
    name: "成長中",
    description: "5つのスキルを習得する",
    icon: "🌱",
    rarity: "uncommon",
    conditionType: "skill_complete",
    conditionValue: 5,
    xpReward: 200,
    category: "learning",
  },
  {
    slug: "skill_tree_complete",
    name: "ツリー制覇",
    description: "1つのカテゴリのスキルツリーを完了する",
    icon: "🌳",
    rarity: "rare",
    conditionType: "skill_tree_complete",
    conditionValue: 1,
    xpReward: 500,
    category: "learning",
  },

  // ===== カテゴリ別 =====
  {
    slug: "python_starter",
    name: "Pythonデビュー",
    description: "Python基礎スキルを習得する",
    icon: "🐍",
    rarity: "common",
    conditionType: "skill_specific",
    conditionValue: 1,
    conditionJson: { skill: "python_basic" },
    xpReward: 100,
    category: "learning",
  },
  {
    slug: "ai_pioneer",
    name: "AIパイオニア",
    description: "AI関連スキルを3つ習得する",
    icon: "🤖",
    rarity: "uncommon",
    conditionType: "category_skills",
    conditionValue: 3,
    conditionJson: { category: "ai" },
    xpReward: 200,
    category: "learning",
  },

  // ===== クエスト系 =====
  {
    slug: "quest_first",
    name: "クエストクリア",
    description: "初めてのデイリークエストを完了する",
    icon: "📜",
    rarity: "common",
    conditionType: "quest_complete",
    conditionValue: 1,
    xpReward: 30,
    category: "quest",
  },
  {
    slug: "quest_10",
    name: "クエストハンター",
    description: "10個のデイリークエストを完了する",
    icon: "🗡️",
    rarity: "uncommon",
    conditionType: "quest_complete",
    conditionValue: 10,
    xpReward: 150,
    category: "quest",
  },

  // ===== レベル系 =====
  {
    slug: "level_5",
    name: "レベル5到達",
    description: "レベル5に到達する",
    icon: "⭐",
    rarity: "common",
    conditionType: "level",
    conditionValue: 5,
    xpReward: 50,
    category: "special",
  },
  {
    slug: "level_10",
    name: "レベル10到達",
    description: "レベル10に到達する",
    icon: "⭐",
    rarity: "uncommon",
    conditionType: "level",
    conditionValue: 10,
    xpReward: 100,
    titleReward: "成長株",
    category: "special",
  },
];
