import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "@/lib/learning-chat/prompts";
import { LearningContextManager } from "@/lib/learning-chat/context-manager";
import type { LearningChatMessage, LearningChatSession } from "@prisma/client";

describe("learning chat prompt", () => {
  it("モードとカテゴリを含むプロンプトを生成する", () => {
    const prompt = buildSystemPrompt("learning", "python_basic");
    expect(prompt).toContain("学習モード");
    expect(prompt).toContain("Python");
  });

  it("キャリアモードでは学習モードの文言を含まない", () => {
    const prompt = buildSystemPrompt("career", "python_basic");
    expect(prompt).not.toContain("学習モード");
    expect(prompt).toContain("キャリアアドバイザー");
  });
});

describe("LearningContextManager", () => {
  const manager = new LearningContextManager({
    maxTokens: 1000,
    reservedTokens: 200,
    summaryThreshold: 500,
    windowSize: 3,
  });

  const session: LearningChatSession = {
    id: "sess1",
    userId: "user1",
    title: "test",
    mode: "learning",
    category: "python_basic",
    contextSummary: "これまでの会話の要約",
    totalTokens: 0,
    isActive: true,
    isPinned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const messages: LearningChatMessage[] = Array.from({ length: 6 }).map((_, idx) => ({
    id: `m${idx}`,
    sessionId: "sess1",
    role: idx % 2 === 0 ? "user" : "assistant",
    content: `message-${idx}`,
    tokenCount: 0,
    model: null,
    rating: null,
    feedback: null,
    category: null,
    codeBlocks: null,
    createdAt: new Date(Date.now() + idx),
  }));

  it("最新windowSize件を必ず含める", async () => {
    const ctx = await manager.buildContextWindow(session, messages);
    const lastThree = ctx.recentMessages.slice(-3).map((m) => m.id);
    expect(lastThree).toEqual(["m3", "m4", "m5"]);
    expect(ctx.recentMessages.length).toBeGreaterThanOrEqual(3);
  });

  it("サマリーを条件付きで含める", async () => {
    const ctx = await manager.buildContextWindow(session, messages);
    expect(ctx.conversationSummary).toBe(session.contextSummary);
  });
});
