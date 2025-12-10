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

export async function generateQuestionWithAI(monster: MonsterDefinition): Promise<MonsterQuestion | null> {
  try {
    const client = createAnthropicClient();
    const result = await client.chatJSON<GeneratedQuestion>([
      { role: "system", content: "You are a question generator for an educational RPG. Respond in JSON." },
      { role: "user", content: AI_PROMPT(monster) },
    ], { maxTokens: 600, temperature: 0.4 });

    if (!result?.questionText || !result.correctAnswer) return null;

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
