import { createAnthropicClient } from "@/lib/llm/anthropic";
import { prisma } from "@/lib/prisma";
import { QuestCategory } from "@/lib/constants/quest-categories";
import { QuestGenerationOptions, ParsedQuest } from "./types";
import { gatherQuestGenerationContext } from "./context-gatherer";
import { buildQuestPrompt } from "./quest-prompt-builder";
import { parseQuestResponse } from "./quest-parser";
import { resolveQuestCategoriesFromLinesAndCareers } from "@/lib/curriculum/quest-map";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fallbackQuests(): ParsedQuest[] {
  return [
    {
      title: "朝のリセット",
      description: "起床後にストレッチ5分と水200mlを飲む",
      category: "health",
      difficulty: "easy",
      xpReward: 30,
      estimatedMinutes: 10,
      reason: "体調を整える基礎アクション",
      tips: "無理せずゆっくり",
      priority: 7,
    },
    {
      title: "25分集中学習",
      description: "主要科目でポモドーロ1セット（25分）",
      category: "learning_attitude",
      difficulty: "medium",
      xpReward: 50,
      estimatedMinutes: 30,
      reason: "短時間の集中で勢いをつける",
      tips: "通知を切って取り組む",
      priority: 8,
    },
    {
      title: "ノート整える",
      description: "今日のノートに見出しを3つ以上追加し整理する",
      category: "note_quality",
      difficulty: "easy",
      xpReward: 40,
      estimatedMinutes: 10,
      reason: "復習しやすい形にする",
      tips: "5W2Hを意識する",
      priority: 6,
    },
  ];
}

export async function generateQuestsForUser(
  userId: string,
  options?: QuestGenerationOptions,
): Promise<{ quests: ParsedQuest[]; prompt: string; rawResponse: string; reused: boolean }> {
  const now = new Date();
  const today = startOfDay(now);
  const forceRegenerate = options?.forceRegenerate ?? false;
  const inferredCategories = resolveQuestCategoriesFromLinesAndCareers(options?.lineIds, options?.careerIds);
  const mergedPreferred = Array.from(new Set([...(options?.preferredCategories ?? []), ...inferredCategories]));

  if (!forceRegenerate) {
    const existing = await prisma.aIGeneratedQuest.findMany({ where: { userId, date: today } });
    if (existing.length > 0) {
      return {
        quests: existing.map((q) => ({
          title: q.title,
          description: q.description,
          category: q.category as QuestCategory,
          difficulty: q.difficulty as ParsedQuest["difficulty"],
          xpReward: q.xpReward,
          estimatedMinutes: q.estimatedMinutes ?? 30,
          reason: q.reason,
          tips: q.tips ?? undefined,
          relatedGoal: q.relatedGoal ?? undefined,
          relatedCredo: q.relatedCredo ?? undefined,
          relatedData: q.relatedData ?? undefined,
          priority: q.priority ?? 0,
        })),
        prompt: "",
        rawResponse: "",
        reused: true,
      };
    }
  }

  const context = await gatherQuestGenerationContext(userId);
  const prompt = buildQuestPrompt(context, mergedPreferred);

  let parsed: ParsedQuest[] = [];
  let rawResponse = "";
  let modelUsed = "fallback-rule";
  let tokensUsed: number | undefined;

  try {
    const client = createAnthropicClient();
    const res = await client.chat(
      [
        { role: "system", content: "You are an expert quest designer for students." },
        { role: "user", content: prompt },
      ],
      { maxTokens: 1400, temperature: 0.6 },
    );
    rawResponse = res.content;
    parsed = parseQuestResponse(res.content);
    modelUsed = "anthropic";
    tokensUsed = (res.usage?.inputTokens ?? 0) + (res.usage?.outputTokens ?? 0);
  } catch (err) {
    console.warn("AI生成に失敗したためフォールバックを使用します", err);
    parsed = fallbackQuests();
    rawResponse = "fallback-rule-based";
  }

  // 保存処理
  const createdQuests = await prisma.$transaction(async (tx) => {
    // 再生成時は同日の既存を削除
    if (forceRegenerate) {
      await tx.aIGeneratedQuest.deleteMany({ where: { userId, date: today } });
    }

    const saved = [];
    for (const [index, quest] of parsed.entries()) {
      const created = await tx.aIGeneratedQuest.create({
        data: {
          userId,
          date: today,
          title: quest.title,
          description: quest.description,
          category: quest.category,
          difficulty: quest.difficulty,
          estimatedMinutes: quest.estimatedMinutes,
          xpReward: quest.xpReward,
          reason: quest.reason,
          tips: quest.tips,
          relatedGoal: quest.relatedGoal,
          relatedCredo: quest.relatedCredo,
          relatedData: quest.relatedData,
          priority: quest.priority,
          order: index,
          status: "pending",
        },
      });
      saved.push(created);
    }

    await tx.questGenerationLog.create({
      data: {
        userId,
        date: today,
        contextSnapshot: context,
        promptUsed: prompt,
        rawResponse,
        parsedQuests: parsed,
        questCount: parsed.length,
        modelUsed,
        tokensUsed,
        hadError: false,
      },
    });

    return saved;
  });

  return {
    quests: createdQuests.map((q) => ({
      title: q.title,
      description: q.description,
      category: q.category as QuestCategory,
      difficulty: q.difficulty as ParsedQuest["difficulty"],
      xpReward: q.xpReward,
      estimatedMinutes: q.estimatedMinutes ?? 30,
      reason: q.reason,
      tips: q.tips ?? undefined,
      relatedGoal: q.relatedGoal ?? undefined,
      relatedCredo: q.relatedCredo ?? undefined,
      relatedData: q.relatedData ?? undefined,
      priority: q.priority ?? 0,
    })),
    prompt,
    rawResponse,
    reused: false,
  };
}
