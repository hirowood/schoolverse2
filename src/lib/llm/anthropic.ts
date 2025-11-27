// src/lib/llm/anthropic.ts
import Anthropic from "@anthropic-ai/sdk";
import type { LLMClient, LLMMessage, LLMOptions, LLMResponse } from "./types";

const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const DEFAULT_MAX_TOKENS = 1024;

let clientInstance: Anthropic | null = null;

function getClient(): Anthropic {
  if (!clientInstance) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set in environment variables");
    }
    clientInstance = new Anthropic({ apiKey });
  }
  return clientInstance;
}

export function createAnthropicClient(): LLMClient {
  return {
    async chat(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
      const client = getClient();
      const systemMessage = messages.find((m) => m.role === "system");
      const nonSystemMessages = messages.filter((m) => m.role !== "system");

      const response = await client.messages.create({
        model: options?.model ?? DEFAULT_MODEL,
        max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
        system: systemMessage?.content,
        messages: nonSystemMessages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        temperature: options?.temperature ?? 0.7,
      });

      const textContent = response.content.find((c) => c.type === "text");
      return {
        content: textContent?.text ?? "",
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      };
    },

    async chatJSON<T>(messages: LLMMessage[], options?: LLMOptions): Promise<T> {
      const response = await this.chat(messages, options);
      // Markdown code block 除去
      const cleaned = response.content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      try {
        return JSON.parse(cleaned) as T;
      } catch (e) {
        console.error("Failed to parse LLM JSON response:", response.content);
        throw new Error(`Invalid JSON response from LLM: ${(e as Error).message}`);
      }
    },
  };
}
