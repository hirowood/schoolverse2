import { prisma } from "@/lib/prisma";
import { createAnthropicClient } from "@/lib/llm/anthropic";
import type { MonsterDefinition, MonsterQuestion, MonsterQuestionOption } from "@/features/virtual-classroom/types";

export async function getQuestionForMonster(monsterId: string): Promise<MonsterQuestion | null> {
  const questions = await prisma.monsterQuestion.findMany({
    where: { monsterId, isActive: true },
  });
  if (questions.length === 0) {
    const monster = await prisma.monsterDefinition.findUnique({ where: { id: monsterId } });
    if (!monster) return null;
    const generated = await generateQuestionWithAI(monster);
    return generated;
  }
  const idx = Math.floor(Math.random() * questions.length);
  const q = questions[idx];
  const parsedOptions = Array.isArray(q.options) ? (q.options as MonsterQuestionOption[]) : null;
  return {
    ...q,
    options: parsedOptions,
  };
}

export function redactAnswer(question: MonsterQuestion | null) {
  if (!question) return null;
  const { correctAnswer: _omit, ...rest } = question;
  void _omit;
  return rest;
}

type GeneratedQuestion = {
  questionText: string;
  questionType: "multiple_choice" | "text" | "code" | "fill_blank" | string;
  options?: MonsterQuestionOption[] | null;
  correctAnswer: string;
  explanation?: string;
  hints?: string[];
  timeLimit?: number;
  bonusXp?: number;
};

const AI_PROMPT = (monster: MonsterDefinition) => `
あなたはIT学習用RPGの出題者です。モンスターを倒すための問題を1問生成してください。
- カテゴリ: ${monster.category}
- サブカテゴリ: ${monster.subcategory ?? "general"}
- 難易度: ${monster.difficulty} (1=易,5=難)
- レアリティ: ${monster.rarity}
- 形式はJSONのみで返してください。説明など余計な文章は不要。
- questionType は "multiple_choice" | "text" | "code" のいずれか。
- multiple_choice の場合 options を4択で返し、isCorrect を1つだけ true にする。
- timeLimit は30〜90の秒数で指定。
JSONスキーマ:
{
  "questionText": "string",
  "questionType": "multiple_choice" | "text" | "code",
  "options": [ { "label": "A", "value": "text", "isCorrect": true/false }, ... ] | null,
  "correctAnswer": "string",
  "explanation": "string",
  "hints": ["string", ...],
  "timeLimit": number,
  "bonusXp": number
}
`;

function sanitizeGenerated(result: GeneratedQuestion | null): GeneratedQuestion | null {
  if (!result?.questionText || !result.correctAnswer) return null;

  const validType: GeneratedQuestion["questionType"] =
    result.questionType === "multiple_choice" || result.questionType === "text" || result.questionType === "code"
      ? result.questionType
      : "multiple_choice";

  let options: MonsterQuestionOption[] | null = null;
  if (validType === "multiple_choice") {
    const labels = ["A", "B", "C", "D"];
    const raw = Array.isArray(result.options) ? result.options.slice(0, 4) : [];
    options = raw.map((opt, idx) => ({
      label: labels[idx] ?? opt.label ?? `O${idx + 1}`,
      value: opt.value?.toString().trim() ?? "",
      isCorrect: Boolean(opt.isCorrect),
    }));
    if (!options.some((o) => o.isCorrect) && options.length > 0) {
      options[0].isCorrect = true;
    }
  }

  return {
    questionText: result.questionText.trim(),
    questionType: validType,
    options,
    correctAnswer: result.correctAnswer.toString().trim(),
    explanation: result.explanation?.trim() ?? "",
    hints: result.hints?.slice(0, 3) ?? [],
    timeLimit: Math.min(90, Math.max(30, Math.round(result.timeLimit ?? 60))),
    bonusXp: Math.max(0, Math.round(result.bonusXp ?? 0)),
  };
}

export async function generateQuestionWithAI(monster: MonsterDefinition): Promise<MonsterQuestion | null> {
  try {
    const client = createAnthropicClient();
    const raw = await client.chatJSON<GeneratedQuestion>([
      { role: "system", content: "You are a question generator for an educational RPG. Respond in JSON." },
      { role: "user", content: AI_PROMPT(monster) },
    ], { maxTokens: 600, temperature: 0.4 });

    const result = sanitizeGenerated(raw);
    if (!result) return null;

    const created = await prisma.monsterQuestion.create({
      data: {
        monsterId: monster.id,
        questionText: result.questionText,
        questionType: result.questionType ?? "multiple_choice",
        options: result.options ?? undefined,
        correctAnswer: result.correctAnswer,
        explanation: result.explanation ?? null,
        hints: result.hints ?? [],
        difficulty: monster.difficulty ?? 1,
        timeLimit: result.timeLimit ?? 60,
        bonusXp: result.bonusXp ?? 0,
        tags: [monster.category, monster.subcategory ?? ""].filter(Boolean),
        isAiGenerated: true,
      },
    });

    return {
      ...created,
      options: Array.isArray(created.options) ? (created.options as MonsterQuestionOption[]) : null,
    };
  } catch (e) {
    console.error("AI question generation failed", e);
    return null;
  }
}
