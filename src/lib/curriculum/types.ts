export type LessonType = "lecture" | "practice" | "quiz" | "project" | "discussion";

export type LessonProgressStatus = "locked" | "available" | "in_progress" | "completed";

export type CurriculumNode = {
  id: string;
  name: string;
  description?: string;
  children?: CurriculumNode[];
  meta?: Record<string, unknown>;
};

export type CurriculumLine = {
  id: string;
  title: string;
  summary: string;
  units: Array<{
    id: string;
    title: string;
    description?: string;
    milestoneExample?: string;
  }>;
  missions?: string[];
  missionDetails?: LineMission[];
};

export type LineProgress = {
  completed: number;
  total: number;
  percentage: number;
};

export type CareerLine = {
  id: string;
  name: string;
  what: string;
  linkedCurriculumIds: string[];
  sampleMissions?: string[];
};

export type LineMission = {
  id: string;
  title: string;
  description: string;
  expectedOutputs?: string[];
  tools?: string[];
  tags?: string[];
  effortMinutes?: number;
};

export type CurriculumMap = {
  coreCurriculum: CurriculumNode[];
  learningPaths: {
    types: string[];
    nodeTypes: string[];
  };
  contentLines: {
    certifications: CurriculumNode[];
    languages: CurriculumNode[];
    webFrameworks: CurriculumNode[];
    react: CurriculumNode[];
    nextjs: CurriculumNode[];
    ai: CurriculumNode[];
    officeDxAx: CurriculumNode[];
    thinking: CurriculumNode[];
    handsOn?: CurriculumNode[];
    roleLines: CurriculumLine[];
  };
  careers: {
    engineer: CareerLine[];
    office: CareerLine[];
    axDxData: CareerLine[];
  };
  hypotheses: string[];
  pitfalls: string[];
};
