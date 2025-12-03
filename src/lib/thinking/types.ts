export type OnboardingStep =
  | "welcome"
  | "research_intro"
  | "note_externalization"
  | "hypothesis_intro"
  | "no_answer_world"
  | "ai_chat_experience";

export type OnboardingFlow = {
  steps: OnboardingStep[];
};

export type OnboardingReport = {
  memoCount: number;
  questionsCount: number;
  ownWordsSummaries: number;
  anxietyLevel?: number;
};

export type AgentRole = "teacher" | "coach" | "client" | "critic";

export type AgentProfile = {
  role: AgentRole;
  evaluation_focus: string[];
  tone: "kind" | "neutral" | "strict";
};

export type ThinkingEvaluationKey =
  | "RESEARCH_ATTITUDE"
  | "STRUCTURING"
  | "HYPOTHESIS"
  | "LOGICAL"
  | "LATERAL"
  | "CRITICAL"
  | "ENG_COMM";

export type ThinkingSession = {
  id: string;
  context?: string;
  messages: { role: "user" | "assistant"; content: string }[];
  scores?: Record<ThinkingEvaluationKey, number>;
};

export type EngineerCommEvaluationKey =
  | "REQ_CLARIFICATION"
  | "CONSTRAINT_CHECK"
  | "SUMMARY"
  | "EMPATHY"
  | "PROPOSAL";
