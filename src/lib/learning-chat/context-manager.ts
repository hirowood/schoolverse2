import { LearningChatMessage, LearningChatSession } from "@prisma/client";
import { ChatMode } from "@/features/learning-chat/types";
import { buildSystemPrompt } from "./prompts";
import { createAnthropicClient } from "@/lib/llm/anthropic";

export interface ContextConfig {
  maxTokens: number;
  reservedTokens: number;
  summaryThreshold: number;
  windowSize: number;
}

export interface ContextWindow {
  systemPrompt: string;
  conversationSummary: string | null;
  recentMessages: LearningChatMessage[];
  totalTokens: number;
}

export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 3);
}

export class LearningContextManager {
  readonly config: ContextConfig;

  constructor(config: ContextConfig) {
    this.config = config;
  }

  countTokens(text: string): number {
    return estimateTokens(text);
  }

  countMessagesTokens(messages: Array<Pick<LearningChatMessage, "content">>): number {
    return messages.reduce((acc, cur) => acc + this.countTokens(cur.content), 0);
  }

  async buildContextWindow(
    session: LearningChatSession,
    messages: LearningChatMessage[],
  ): Promise<ContextWindow> {
    const systemPrompt = buildSystemPrompt(session.mode as ChatMode, session.category ?? undefined);
    const availableTokens = this.config.maxTokens - this.config.reservedTokens;
    let usedTokens = this.countTokens(systemPrompt);

    const recentMessages = messages.slice(-this.config.windowSize);
    usedTokens += this.countMessagesTokens(recentMessages);

    let conversationSummary: string | null = null;
    if (session.contextSummary && usedTokens < availableTokens * 0.8) {
      conversationSummary = session.contextSummary;
      usedTokens += this.countTokens(conversationSummary);
    }

    const olderMessages = messages.slice(0, -this.config.windowSize);
    const additionalMessages: LearningChatMessage[] = [];

    for (let i = olderMessages.length - 1; i >= 0; i -= 1) {
      const msg = olderMessages[i];
      const msgTokens = this.countTokens(msg.content);
      if (usedTokens + msgTokens > availableTokens) break;
      additionalMessages.unshift(msg);
      usedTokens += msgTokens;
    }

    return {
      systemPrompt,
      conversationSummary,
      recentMessages: [...additionalMessages, ...recentMessages],
      totalTokens: usedTokens,
    };
  }

  async generateSummary(session: LearningChatSession, messages: LearningChatMessage[]): Promise<string> {
    const prompt = `
以下の会話を要約してください。重要な学習ポイント、
ユーザーの理解度、次に取り組むべき課題を含めてください。

会話カテゴリ: ${session.category || "一般"}
モード: ${session.mode}

会話内容:
${messages.map((m) => `${m.role}: ${m.content}`).join("\n")}

要約（300文字以内）:
`.trim();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      const snippet = messages
        .slice(-4)
        .map((m) => `${m.role}: ${m.content.slice(0, 60)}`)
        .join(" / ");
      return `要約: ${snippet}`;
    }

    try {
      const llm = createAnthropicClient();
      const response = await llm.chat(
        [
          { role: "system", content: "以下の指示に従って簡潔に要約してください。" },
          { role: "user", content: prompt },
        ],
        { maxTokens: 500, temperature: 0.3 },
      );
      return response.content.trim();
    } catch (error) {
      console.error("generateSummary error", error);
      const fallback = messages
        .slice(-3)
        .map((m) => `${m.role}: ${m.content.slice(0, 80)}`)
        .join(" / ");
      return `要約失敗のため簡易要約: ${fallback}`;
    }
  }
}
