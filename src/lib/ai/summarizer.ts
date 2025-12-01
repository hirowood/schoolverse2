import { createAnthropicClient } from "@/lib/llm/anthropic";
import { buildSummarizePrompt } from "./prompts";

interface SummarizeOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  maxLength?: number;
}

export async function summarizeText(text: string, options: SummarizeOptions = {}): Promise<string> {
  const client = createAnthropicClient();
  const prompt = buildSummarizePrompt(text, options.maxLength ?? 200);
  const response = await client.chat(
    [
      { role: "system", content: "あなたは短く分かりやすい要約を作るアシスタントです。" },
      { role: "user", content: prompt },
    ],
    {
      model: options.model,
      maxTokens: options.maxTokens ?? 300,
      temperature: options.temperature ?? 0.4,
    }
  );
  return response.content.trim();
}
