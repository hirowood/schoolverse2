import { createAnthropicClient } from "@/lib/llm/anthropic";
import type { WeeklyReportContext, WeeklyReportPayload } from "./types";
import { buildWeeklyReportSystemPrompt, buildWeeklyReportUserPrompt } from "./prompts";

export async function generateWeeklyReportFromContext(
  context: WeeklyReportContext
): Promise<WeeklyReportPayload> {
  const llm = createAnthropicClient();
  const messages = [
    { role: "system", content: buildWeeklyReportSystemPrompt() },
    { role: "user", content: buildWeeklyReportUserPrompt(context) },
  ];
  const response = await llm.chatJSON<WeeklyReportPayload>(messages, {
    maxTokens: 900,
    temperature: 0.45,
  });
  return response;
}
