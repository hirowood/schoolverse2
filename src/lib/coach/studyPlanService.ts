// src/lib/coach/studyPlanService.ts
import { createAnthropicClient } from "@/lib/llm/anthropic";
import type { PlanContext } from "./contextBuilder";
import { buildPlanSystemPrompt, buildPlanUserPrompt } from "./prompts/planSystem";
import { StudyPlanSchema, type StudyPlan } from "@/lib/schemas/coachPlan";
import type { LLMMessage } from "@/lib/llm/types";

export interface GeneratedPlan extends StudyPlan {
  tasks: Array<{
    title: string;
    durationMinutes: number;
    timeSlot: string;
    taskId?: string;
    note?: string;
  }>;
}

export async function generateStudyPlan(
  context: PlanContext
): Promise<GeneratedPlan> {
  const llm = createAnthropicClient();
  const systemPrompt = buildPlanSystemPrompt();
  const userPrompt = buildPlanUserPrompt(context);

  const messages: LLMMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  try {
    // LLMからJSON取得
    const raw = await llm.chatJSON<StudyPlan>(messages, {
      maxTokens: 1000,
      temperature: 0.5,
    });

    // zodバリデーション
    const validated = StudyPlanSchema.parse(raw);

    // タスクIDマッチング（タイトル部分一致）
    const tasksWithIds = validated.tasks.map((task) => {
      // 登録済みタスクとのマッチングを試みる
      const match = context.tasks.find((t) => {
        const taskTitleLower = task.title.toLowerCase();
        const existingTitleLower = t.title.toLowerCase();
        return (
          existingTitleLower.includes(taskTitleLower) ||
          taskTitleLower.includes(existingTitleLower) ||
          // ID が含まれている場合
          task.title.includes(t.id)
        );
      });

      return {
        ...task,
        taskId: match?.id,
      };
    });

    return {
      ...validated,
      tasks: tasksWithIds,
    };
  } catch (error) {
    console.error("Study plan generation error:", error);
    
    // zodバリデーションエラーの場合
    if (error instanceof Error && error.name === "ZodError") {
      throw new Error("AIからの応答が正しい形式ではありませんでした。再度お試しください。");
    }
    
    throw new Error("学習プランの生成に失敗しました");
  }
}
