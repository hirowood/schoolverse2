import type { CurriculumNode, LessonType } from "./types";
import { CURRICULUM_MAP } from "./map";

export type StaticLessonDefinition = {
  lineId: string;
  slug: string;
  title: string;
  description?: string;
  unitId?: string;
  lessonType?: LessonType;
  order: number;
  estimatedMinutes: number;
  xpReward: number;
  bonusXp?: number;
  prerequisites?: string[];
  tags?: string[];
};

const DEFAULT_MINUTES = 60;
const DEFAULT_XP = 50;
const DEFAULT_BONUS = 10;

const flattenLessons = (root: CurriculumNode | undefined, lineId: string): StaticLessonDefinition[] => {
  if (!root) return [];
  const lessons: StaticLessonDefinition[] = [];
  let order = 1;
  let previousSlug: string | null = null;

  const walk = (node: CurriculumNode, parentId?: string) => {
    if (node.children?.length) {
      node.children.forEach((child) => walk(child, node.id));
      return;
    }
    const slug = node.id;
    const prerequisites = previousSlug ? [previousSlug] : [];
    lessons.push({
      lineId,
      unitId: parentId,
      slug,
      title: node.name,
      description: node.description,
      lessonType: "lecture",
      order,
      estimatedMinutes: DEFAULT_MINUTES,
      xpReward: DEFAULT_XP,
      bonusXp: DEFAULT_BONUS,
      prerequisites,
      tags: [],
    });
    previousSlug = slug;
    order += 1;
  };

  root.children?.forEach((child) => walk(child, root.id));
  return lessons;
};

const reactRoot = CURRICULUM_MAP.contentLines.react?.[0];

export const STATIC_CURRICULUM_LESSONS: StaticLessonDefinition[] = flattenLessons(reactRoot, "react-line");
