import type { CurriculumLine } from "@/lib/curriculum/types";

export type GoalInput = {
  free_text: string;
  time_horizon?: number; // months
  weekly_study_time?: number; // hours
  constraints?: string[];
  preferences?: string[];
  current_skill_snapshot?: string;
  preferred_career_type?: string[];
  mental_safety_level?: number; // 1-5
  diagnostic_result?: DiagnosticResult;
};

export type GoalIntent = {
  career_candidates: string[];
  line_candidates: string[];
  interest_keywords: string[];
  risk_flags: string[];
};

export type SkillLevelTarget = {
  tag: string;
  level: number;
  priority: "must" | "nice";
};

export type TargetSkillSet = SkillLevelTarget[];

export type DiagnosticResult = {
  strengths?: string[];
  weaknesses?: string[];
  skill_tags?: Record<string, number>;
};

export type RoadmapPhase = {
  id: string;
  title: string;
  duration_months?: number;
  weekly_time?: number;
  priority_tags?: string[];
  curriculum: Array<{
    label: string;
    type: "lesson" | "unit" | "mission" | "cert";
    refId?: string;
    lineId?: string;
  }>;
  notes?: string;
};

export type Roadmap = {
  phases: RoadmapPhase[];
  summary_text: string;
  risk_notes?: string[];
  next_review_date?: string;
  intent: GoalIntent;
  targetLines: CurriculumLine[];
  careers: string[];
  targetSkills: TargetSkillSet;
  gapSkills: TargetSkillSet;
};
