import { createAnthropicClient } from "@/lib/llm/anthropic";
import { buildTaggerPrompt } from "./prompts";
import type { AutoTagResult } from "./types";

interface TaggerOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function generateTags(text: string, options: TaggerOptions = {}): Promise<AutoTagResult> {
  const client = createAnthropicClient();
  const prompt = buildTaggerPrompt(text);
  return client.chatJSON<AutoTagResult>(
    [
      { role: "system", content: "あなたは学習ノートのタグ付けを行う専門家です。出力は必ずJSON形式。" },
      { role: "user", content: prompt },
    ],
    {
      model: options.model,
      maxTokens: options.maxTokens ?? 400,
      temperature: options.temperature ?? 0.3,
    }
  );
}
