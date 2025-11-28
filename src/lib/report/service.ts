import { createAnthropicClient } from "@/lib/llm/anthropic";
import type { WeeklyReportContext, WeeklyReportPayload } from "./types";
import { buildWeeklyReportSystemPrompt, buildWeeklyReportUserPrompt } from "./prompts";
import type { LLMMessage } from "@/lib/llm";

export async function generateWeeklyReportFromContext(
  context: WeeklyReportContext
): Promise<WeeklyReportPayload> {
  const llm = createAnthropicClient();
  const messages: LLMMessage[] = [
    { role: "system" as const, content: buildWeeklyReportSystemPrompt() },
    { role: "user" as const, content: buildWeeklyReportUserPrompt(context) },
  ];
  const response = await llm.chatJSON<WeeklyReportPayload>(messages, {
    maxTokens: 900,
    temperature: 0.45,
  });
  return response;
}
