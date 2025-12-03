import { QuestCategory } from "@/lib/constants/quest-categories";

type QuestMap = {
  lineToCategories: Record<string, QuestCategory[]>;
  careerToCategories: Record<string, QuestCategory[]>;
};

const questMap: QuestMap = {
  lineToCategories: {
    "fe-line": ["learning", "note_quality"],
    "be-line": ["learning", "learning_attitude"],
    "infra-line": ["learning", "life_habit"],
    "fullstack-line": ["learning", "learning_attitude", "note_quality"],
  },
  careerToCategories: {
    fe: ["learning", "note_quality"],
    be: ["learning", "learning_attitude"],
    fs: ["learning", "learning_attitude", "note_quality"],
    infra: ["learning", "life_habit"],
    sre: ["learning", "life_habit"],
    qa: ["learning", "learning_attitude"],
    "data-eng": ["learning", "learning_attitude"],
    ml: ["learning", "learning_attitude"],
    "office-general": ["life_habit", "note_quality"],
    "internal-it": ["life_habit", "learning_attitude"],
    dx: ["life_habit", "learning_attitude"],
    ax: ["life_habit", "learning_attitude"],
    "data-analyst": ["learning", "learning_attitude"],
  },
};

export function resolveQuestCategoriesFromLinesAndCareers(
  lineIds?: string[],
  careerIds?: string[],
): QuestCategory[] {
  const result = new Set<QuestCategory>();
  for (const id of lineIds ?? []) {
    (questMap.lineToCategories[id] ?? []).forEach((c) => result.add(c));
  }
  for (const id of careerIds ?? []) {
    (questMap.careerToCategories[id] ?? []).forEach((c) => result.add(c));
  }
  return Array.from(result);
}
