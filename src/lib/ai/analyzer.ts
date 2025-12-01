// src/lib/ai/analyzer.ts

import { createAnthropicClient } from "@/lib/llm/anthropic";
import type { LLMMessage } from "@/lib/llm/types";
import { buildAnalyzePrompt, buildSummarizePrompt, buildTaggerPrompt } from "./prompts";
import type { AiAnalysisResult, AutoTag, AutoTagResult } from "./types";

/**
 * テキスト内容をAI分析
 */
export async function analyzeContent(text: string): Promise<AiAnalysisResult | null> {
  if (!text.trim() || text.length < 20) {
    return null;
  }

  try {
    const llm = createAnthropicClient();
    const prompt = buildAnalyzePrompt(text);

    const messages: LLMMessage[] = [
      { role: "user", content: prompt },
    ];

    const response = await llm.chat(messages, {
      maxTokens: 1000,
      temperature: 0.3,
    });

    // JSONをパース
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", response.content);
      return null;
    }

    const result = JSON.parse(jsonMatch[0]) as AiAnalysisResult;
    return result;
  } catch (error) {
    console.error("AI analysis error:", error);
    return null;
  }
}

/**
 * テキストを要約
 */
export async function summarizeContent(text: string, maxLength: number = 200): Promise<string | null> {
  if (!text.trim() || text.length < 50) {
    return null;
  }

  try {
    const llm = createAnthropicClient();
    const prompt = buildSummarizePrompt(text, maxLength);

    const messages: LLMMessage[] = [
      { role: "user", content: prompt },
    ];

    const response = await llm.chat(messages, {
      maxTokens: 300,
      temperature: 0.5,
    });

    return response.content.trim();
  } catch (error) {
    console.error("AI summarize error:", error);
    return null;
  }
}

/**
 * テキストから自動タグを生成
 */
export async function generateTags(text: string): Promise<string[]> {
  if (!text.trim() || text.length < 30) {
    return [];
  }

  try {
    const llm = createAnthropicClient();
    const prompt = buildTaggerPrompt(text);

    const messages: LLMMessage[] = [
      { role: "user", content: prompt },
    ];

    const response = await llm.chat(messages, {
      maxTokens: 500,
      temperature: 0.3,
    });

    // JSONをパース
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in tagger response:", response.content);
      return [];
    }

    const result = JSON.parse(jsonMatch[0]) as AutoTagResult;
    
    // confidence順でソートし、タグ名のみ返す
    return result.tags
      .filter((t: AutoTag) => t.confidence >= 0.7)
      .sort((a: AutoTag, b: AutoTag) => b.confidence - a.confidence)
      .slice(0, 10)
      .map((t: AutoTag) => t.name);
  } catch (error) {
    console.error("AI tagger error:", error);
    return [];
  }
}

/**
 * 一括分析（分析+要約+タグ）
 */
export async function analyzeAll(text: string): Promise<{
  analysis: AiAnalysisResult | null;
  summary: string | null;
  tags: string[];
}> {
  // 並列実行で高速化
  const [analysis, summary, tags] = await Promise.all([
    analyzeContent(text),
    summarizeContent(text),
    generateTags(text),
  ]);

  return { analysis, summary, tags };
}
