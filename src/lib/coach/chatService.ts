// src/lib/coach/chatService.ts
import { createAnthropicClient } from "@/lib/llm/anthropic";
import type { ChatContext } from "./contextBuilder";
import { buildChatSystemPrompt } from "./prompts/chatSystem";
import type { LLMMessage } from "@/lib/llm/types";

export async function generateChatReply(
  userMessage: string,
  context: ChatContext
): Promise<string> {
  const llm = createAnthropicClient();
  const systemPrompt = buildChatSystemPrompt(context);

  // 直近の会話履歴をLLMメッセージ形式に変換
  const historyMessages: LLMMessage[] = context.recentMessages
    .slice(-10)
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.message,
    }));

  const messages: LLMMessage[] = [
    { role: "system", content: systemPrompt },
    ...historyMessages,
    { role: "user", content: userMessage },
  ];

  try {
    const response = await llm.chat(messages, {
      maxTokens: 500,
      temperature: 0.7,
    });
    return response.content;
  } catch (error) {
    console.error("LLM chat error:", error);
    throw new Error("AIコーチからの応答を取得できませんでした");
  }
}
