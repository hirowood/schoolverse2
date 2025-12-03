import { CURRICULUM_LINES } from "@/lib/curriculum/lines-data";
import type { CurriculumLine } from "@/lib/curriculum/types";
import { GoalInput, GoalIntent, Roadmap, RoadmapPhase, TargetSkillSet, DiagnosticResult } from "./types";

type Classified = {
  careers: string[];
  lines: string[];
  interests: string[];
  risks: string[];
  tagHints: string[];
};

const keywordToCareer: Record<string, string[]> = {
  game: ["FRONTEND", "WEB_3D"],
  "3d": ["FRONTEND", "WEB_3D"],
  react: ["FRONTEND"],
  "web": ["FRONTEND", "FULLSTACK"],
  backend: ["BACKEND"],
  "api": ["BACKEND"],
  "excel": ["OFFICE_IT"],
  "vba": ["OFFICE_IT"],
  "事務": ["OFFICE_IT"],
  "在宅": ["OFFICE_IT"],
  "security": ["SECURITY_ENGINEER", "INFRA"],
  "セキュリティ": ["SECURITY_ENGINEER", "INFRA"],
  "infra": ["INFRA"],
  "cloud": ["INFRA"],
  "data": ["DATA"],
  "分析": ["DATA"],
  "ai": ["AI_DEV"],
  "調べる": ["THINKING"],
  "メモ": ["THINKING"],
  "仮説": ["THINKING"],
  "論理": ["THINKING"],
  "批判": ["THINKING"],
  "水平思考": ["THINKING"],
  "思考": ["THINKING"],
  "考え方": ["THINKING"],
};

const keywordToTags: Record<string, string[]> = {
  react: ["REACT_COMPONENT", "JS_BASIC"],
  next: ["NEXT_ROUTING", "REACT_COMPONENT"],
  "3d": ["THREEJS_BASIC", "WEBGL_INTRO"],
  vba: ["VBA_MACRO", "EXCEL_FUNCTION"],
  excel: ["EXCEL_BASIC"],
  gas: ["GAS_BASIC"],
  security: ["SEC_WEB_BASICS", "NETWORK_BASIC"],
  docker: ["DOCKER_BASIC"],
  api: ["HTTP_REST", "API_DESIGN"],
  sql: ["SQL_BASIC"],
  infra: ["LINUX_BASIC", "NETWORK_BASIC"],
  調べる: ["RESEARCH_KEYWORDING", "RESEARCH_AI_POSITIONING"],
  メモ: ["NOTE_5W2H", "NOTE_BRAIN_DUMP"],
  仮説: ["HYPOTHESIS_GENERATION", "HYPOTHESIS_TESTING"],
  論理: ["LOGIC_MECE", "LOGIC_PREP"],
  批判: ["CRITICAL_PREMISE_CHECK"],
  水平思考: ["LATERAL_IDEA_GENERATION"],
  思考: ["RESEARCH_KEYWORDING", "NOTE_5W2H", "HYPOTHESIS_GENERATION"],
};

const careerToLines: Record<string, string[]> = {
  FRONTEND: ["fe-line"],
  BACKEND: ["be-line"],
  FULLSTACK: ["fullstack-line"],
  WEB_3D: ["fe-line"],
  OFFICE_IT: [], // 未定義ラインは空で返す
  SECURITY_ENGINEER: ["infra-line"],
  INFRA: ["infra-line"],
  DATA: [],
  AI_DEV: ["fe-line", "be-line"],
  THINKING: ["thinking-line"],
};

const careerToSkillTags: Record<string, string[]> = {
  FRONTEND: ["HTML_BASIC", "CSS_LAYOUT", "JS_BASIC", "REACT_COMPONENT"],
  BACKEND: ["HTTP_REST", "API_DESIGN", "DB_SCHEMA", "PRISMA_BASIC"],
  FULLSTACK: ["HTML_BASIC", "CSS_LAYOUT", "JS_BASIC", "HTTP_REST", "DB_SCHEMA"],
  WEB_3D: ["THREEJS_BASIC", "WEBGL_INTRO", "JS_BASIC"],
  OFFICE_IT: ["EXCEL_BASIC", "EXCEL_FUNCTION", "VBA_MACRO", "BUSINESS_FLOW"],
  SECURITY_ENGINEER: ["SEC_WEB_BASICS", "NETWORK_BASIC", "LINUX_BASIC"],
  INFRA: ["LINUX_BASIC", "NETWORK_BASIC", "DEPLOY_BASIC"],
  DATA: ["SQL_BASIC", "DATA_VIZ"],
  AI_DEV: ["AI_PROMPTING", "RAG_BASIC"],
  THINKING: [
    "RESEARCH_KEYWORDING",
    "RESEARCH_SOURCE_JUDGEMENT",
    "NOTE_5W2H",
    "NOTE_HYPOTHESIS_FLAG",
    "HYPOTHESIS_GENERATION",
    "HYPOTHESIS_TESTING",
    "LOGIC_MECE",
    "CRITICAL_PREMISE_CHECK",
  ],
};

function classifyGoal(input: GoalInput): Classified {
  const text = input.free_text.toLowerCase();
  const hits = new Set<string>();
  const interests: string[] = [];
  const risks: string[] = [];
  const tagHints = new Set<string>();

  Object.entries(keywordToCareer).forEach(([kw, careers]) => {
    if (text.includes(kw)) {
      careers.forEach((c) => hits.add(c));
      interests.push(kw);
    }
  });

  Object.entries(keywordToTags).forEach(([kw, tags]) => {
    if (text.includes(kw)) {
      tags.forEach((t) => tagHints.add(t));
    }
  });

  if (input.preferred_career_type) {
    input.preferred_career_type.forEach((c) => hits.add(c));
  }

  const careers = Array.from(hits);
  const lines = new Set<string>();
  careers.forEach((c) => (careerToLines[c] ?? []).forEach((l) => lines.add(l)));

  if (input.weekly_study_time && input.weekly_study_time < 5) {
    risks.push("weekly_time_low");
  }
  if (input.mental_safety_level && input.mental_safety_level <= 2) {
    risks.push("mental_safety_low");
  }

  return {
    careers,
    lines: Array.from(lines),
    interests,
    risks,
    tagHints: Array.from(tagHints),
  };
}

function pickLines(lineIds: string[]): CurriculumLine[] {
  if (!lineIds.length) return [];
  return CURRICULUM_LINES.filter((l) => lineIds.includes(l.id));
}

function buildTargetSkills(lines: CurriculumLine[]): TargetSkillSet {
  const tags = new Set<string>();
  lines.forEach((line) => {
    line.units.forEach((u) => tags.add(u.title));
    line.missionDetails?.forEach((m) => m.tags?.forEach((t) => tags.add(t)));
  });
  lines.forEach((line) => {
    const careers = Object.keys(careerToLines).filter((c) => careerToLines[c]?.includes(line.id));
    careers.forEach((c) => careerToSkillTags[c]?.forEach((t) => tags.add(t)));
  });
  return Array.from(tags).map((tag) => ({ tag, level: 1, priority: "must" as const }));
}

function mergeSkillTags(base: TargetSkillSet, extra: string[]): TargetSkillSet {
  const existing = new Map(base.map((s) => [s.tag, s]));
  extra.forEach((tag) => {
    if (!existing.has(tag)) {
      existing.set(tag, { tag, level: 1, priority: "must" });
    }
  });
  return Array.from(existing.values());
}

function computeGap(target: TargetSkillSet, diagnostic?: DiagnosticResult): TargetSkillSet {
  if (!diagnostic?.skill_tags) return target;
  return target.filter((t) => {
    const current = diagnostic.skill_tags?.[t.tag] ?? 0;
    return current < t.level;
  });
}

function phase(title: string, opts: Partial<RoadmapPhase>): RoadmapPhase {
  return {
    id: title,
    title,
    curriculum: [],
    ...opts,
  };
}

function buildPhases(lines: CurriculumLine[], weekly: number | undefined): RoadmapPhase[] {
  const baseWeekly = weekly ?? 5;
  const units = lines.flatMap((l) => l.units.map((u) => ({ ...u, lineId: l.id })));
  const missions = lines.flatMap(
    (l) =>
      l.missionDetails?.map((m) => ({ ...m, lineId: l.id })) ??
      l.missions?.map((title) => ({ id: title, title, lineId: l.id })) ??
      [],
  );

  const phases: RoadmapPhase[] = [];
  phases.push(
    phase("Phase 0: 土台づくり", {
      duration_months: 1,
      weekly_time: Math.min(baseWeekly, 5),
      curriculum: [
        { label: "学習習慣・PC基礎・メモ", type: "lesson" },
        { label: "ITパスポートの地図を眺める", type: "lesson" },
      ],
      notes: "小さい成功体験を優先。無理はしない。",
    }),
  );

  if (units.length) {
    phases.push(
      phase("Phase 1: コアスキル", {
        duration_months: 2,
        weekly_time: baseWeekly,
        curriculum: units.slice(0, 5).map((u) => ({ label: `${u.title}`, type: "unit", lineId: u.lineId })),
      }),
    );
  }

  if (missions && missions.length) {
    phases.push(
      phase("Phase 2: 実践ミッション", {
        duration_months: 2,
        weekly_time: baseWeekly,
        curriculum: missions.slice(0, 3).map((m) => ({ label: `${m.title}`, type: "mission", lineId: m.lineId })),
      }),
    );
  }

  phases.push(
    phase("Phase 3: ポートフォリオ / 資格準備", {
      duration_months: 2,
      weekly_time: baseWeekly,
      curriculum: [{ label: "小さな成果物を仕上げる", type: "mission" }],
      notes: "資格が必要ならここで追加。支援者レビューを挟む。",
    }),
  );

  return phases;
}

export function generateRoadmap(input: GoalInput): Roadmap {
  const classified = classifyGoal(input);
  const targetLines = pickLines(classified.lines);
  let targetSkills = buildTargetSkills(targetLines);
  targetSkills = mergeSkillTags(targetSkills, classified.tagHints);
  const gapSkills = computeGap(targetSkills, input.diagnostic_result);
  const phases = buildPhases(targetLines, input.weekly_study_time);

  const summary = `目標: ${input.free_text}\n候補ライン: ${targetLines.map((l) => l.title).join(", ") || "未決定"}\n` +
    `週間時間: ${input.weekly_study_time ?? "未入力"}h / フェーズ数: ${phases.length}`;

  const riskNotes = classified.risks.map((r) => {
    if (r === "weekly_time_low") return "学習時間が少なめ。1ブロックを小さく設定。";
    if (r === "mental_safety_low") return "心理的負荷に配慮し、Phase0を厚めに。";
    return r;
  });

  const nextReview = new Date();
  nextReview.setMonth(nextReview.getMonth() + 3);

  const intent: GoalIntent = {
    career_candidates: classified.careers,
    line_candidates: classified.lines,
    interest_keywords: classified.interests,
    risk_flags: classified.risks,
  };

  return {
    phases,
    summary_text: summary,
    risk_notes: riskNotes,
    next_review_date: nextReview.toISOString(),
    intent,
    targetLines,
    careers: classified.careers,
    targetSkills,
    gapSkills,
  };
}
