export type QuestCategory =
  | "learning"
  | "life_habit"
  | "health"
  | "learning_attitude"
  | "note_quality"
  | "credo"
  | "social";

export const QUEST_CATEGORIES: Record<
  QuestCategory,
  { id: QuestCategory; name: string; icon: string; color: string; description: string; examples: string[] }
> = {
  learning: {
    id: "learning",
    name: "学習内容",
    icon: "📚",
    color: "blue",
    description: "教科・スキルの習得に関するクエスト",
    examples: ["数学を30分学習", "英単語を20個覚える", "理科の実験レポートを書く"],
  },
  life_habit: {
    id: "life_habit",
    name: "生活習慣",
    icon: "🛏️",
    color: "purple",
    description: "規則正しい生活リズムに関するクエスト",
    examples: ["7時に起きる", "23時に就寝", "朝食を食べる", "部屋を片付ける"],
  },
  health: {
    id: "health",
    name: "健康管理",
    icon: "💪",
    color: "green",
    description: "心身の健康維持に関するクエスト",
    examples: ["水を1.5L飲む", "30分運動する", "ストレッチをする"],
  },
  learning_attitude: {
    id: "learning_attitude",
    name: "学習姿勢",
    icon: "🎯",
    color: "orange",
    description: "効果的な学習の仕方に関するクエスト",
    examples: ["25分集中する", "予習をする", "振り返りを書く"],
  },
  note_quality: {
    id: "note_quality",
    name: "ノート品質",
    icon: "📝",
    color: "yellow",
    description: "メモ・ノートの質向上に関するクエスト",
    examples: ["見出しをつける", "5W2Hで整理", "ノートを復習する"],
  },
  credo: {
    id: "credo",
    name: "Credo実践",
    icon: "🙏",
    color: "pink",
    description: "11原則の実践に関するクエスト",
    examples: ["感謝を3つ書く", "小さな成功を記録", "親切にする"],
  },
  social: {
    id: "social",
    name: "社会性",
    icon: "👥",
    color: "cyan",
    description: "人間関係・交流に関するクエスト",
    examples: ["家族と話す", "友達にメッセージ", "誰かを助ける"],
  },
};
