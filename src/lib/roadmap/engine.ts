import { CURRICULUM_LINES } from "@/lib/curriculum/lines-data";
import type { CurriculumLine } from "@/lib/curriculum/types";
import { GoalInput, GoalIntent, Roadmap, RoadmapPhase, TargetSkillSet } from "./types";

type Classified = {
  careers: string[];
  lines: string[];
  interests: string[];
  risks: string[];
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
};

function classifyGoal(input: GoalInput): Classified {
  const text = input.free_text.toLowerCase();
  const hits = new Set<string>();
  const interests: string[] = [];
  const risks: string[] = [];

  Object.entries(keywordToCareer).forEach(([kw, careers]) => {
    if (text.includes(kw)) {
      careers.forEach((c) => hits.add(c));
      interests.push(kw);
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
  });
  return Array.from(tags).map((tag) => ({ tag, level: 1, priority: "must" as const }));
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
    (l) => l.missionDetails?.map((m) => ({ ...m, lineId: l.id })) ?? l.missions?.map((title) => ({ id: title, title, lineId: l.id })),
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
  const targetSkills = buildTargetSkills(targetLines);
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
  };
}
