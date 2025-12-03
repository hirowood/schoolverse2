// src/lib/coach/mindmapService.ts
import { createAnthropicClient } from "@/lib/llm/anthropic";
import type { LLMMessage } from "@/lib/llm/types";
import {
  buildMindMapSystemPrompt,
  parseAISuggestions,
  type MindMapContext,
  type AIAction,
} from "./prompts/mindmapSystem";
import { prisma } from "@/lib/prisma";
import type { WBSData } from "@/lib/mindmap/types";
import { DEFAULT_WBS_DATA } from "@/lib/mindmap/types";

export interface MindMapAIRequest {
  action: AIAction;
  message?: string;
  selectedNodeId?: string;
}

export interface MindMapAIResponse {
  message: string;
  suggestions?: {
    type: "breakdown" | "wbs" | "actions" | "text";
    data: unknown;
  };
}

// データベースからマインドマップを取得してコンテキストを構築
export async function buildMindMapContext(
  mindMapId: string,
  userId: string
): Promise<MindMapContext | null> {
  const mindMap = await prisma.mindMap.findFirst({
    where: {
      id: mindMapId,
      userId,
    },
    include: {
      nodes: {
        orderBy: { sortOrder: "asc" },
      },
      edges: true,
    },
  });

  if (!mindMap) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  // ノードの子ノード数を計算
  const childCountMap = new Map<string, number>();
  mindMap.edges.forEach((edge) => {
    const count = childCountMap.get(edge.sourceId) || 0;
    childCountMap.set(edge.sourceId, count + 1);
  });

  // ノードのレベルを計算
  const levelMap = new Map<string, number>();
  const parentMap = new Map<string, string>();
  
  mindMap.edges.forEach((edge) => {
    parentMap.set(edge.targetId, edge.sourceId);
  });

  const calculateLevel = (nodeId: string): number => {
    if (levelMap.has(nodeId)) return levelMap.get(nodeId)!;
    const parentId = parentMap.get(nodeId);
    if (!parentId) {
      levelMap.set(nodeId, 0);
      return 0;
    }
    const level = calculateLevel(parentId) + 1;
    levelMap.set(nodeId, level);
    return level;
  };

  mindMap.nodes.forEach((node) => calculateLevel(node.id));

  // サマリーを計算
  let completedTasks = 0;
  let inProgressTasks = 0;
  let totalProgress = 0;
  let totalEstimatedHours = 0;
  let criticalTasks = 0;

  const nodes = mindMap.nodes.map((node) => {
    const wbs = (node.wbs as WBSData | null) || DEFAULT_WBS_DATA;
    
    if (wbs.status === "completed") completedTasks++;
    if (wbs.status === "in_progress") inProgressTasks++;
    if (wbs.priority === "critical") criticalTasks++;
    totalProgress += wbs.progress || 0;
    totalEstimatedHours += wbs.estimatedHours || 0;

    return {
      id: node.id,
      label: node.label,
      level: levelMap.get(node.id) || 0,
      status: wbs.status,
      progress: wbs.progress,
      priority: wbs.priority,
      estimatedHours: wbs.estimatedHours,
      startDate: wbs.startDate,
      endDate: wbs.endDate,
      childCount: childCountMap.get(node.id) || 0,
    };
  });

  const totalTasks = nodes.length;
  const overallProgress = totalTasks > 0 ? Math.round(totalProgress / totalTasks) : 0;

  return {
    title: mindMap.title,
    nodeCount: nodes.length,
    edgeCount: mindMap.edges.length,
    nodes,
    summary: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overallProgress,
      totalEstimatedHours,
      criticalTasks,
    },
    userName: user?.name ?? undefined,
  };
}

// AIコーチにリクエストを送信
export async function generateMindMapAIResponse(
  context: MindMapContext,
  request: MindMapAIRequest
): Promise<MindMapAIResponse> {
  const llm = createAnthropicClient();
  const systemPrompt = buildMindMapSystemPrompt(context, request.action);

  const messages: LLMMessage[] = [
    { role: "system", content: systemPrompt },
  ];

  // ユーザーメッセージを追加
  if (request.message) {
    messages.push({ role: "user", content: request.message });
  } else {
    // アクションに応じたデフォルトメッセージ
    const defaultMessages: Record<AIAction, string> = {
      analyze: "このマインドマップを分析してください。",
      suggest_breakdown: request.selectedNodeId
        ? `ノードID「${request.selectedNodeId}」のタスクを分解してください。`
        : "大きなタスクを分解する提案をしてください。",
      suggest_wbs: "WBS属性を最適化する提案をしてください。",
      next_action: "今すぐ取り組むべき次のアクションを教えてください。",
      progress_feedback: "現在の進捗についてフィードバックをください。",
      chat: "こんにちは",
    };
    messages.push({ role: "user", content: defaultMessages[request.action] });
  }

  try {
    const response = await llm.chat(messages, {
      maxTokens: 1500,
      temperature: 0.7,
    });

    const content = response.content;
    const suggestions = parseAISuggestions(content);

    return {
      message: content,
      suggestions: suggestions.type !== "text" ? suggestions : undefined,
    };
  } catch (error) {
    console.error("MindMap AI error:", error);
    throw new Error("AIコーチからの応答を取得できませんでした");
  }
}

// 提案からノードデータを生成
export function createNodesFromSuggestions(
  parentId: string,
  suggestions: Array<{
    label: string;
    description?: string;
    estimatedHours?: number;
    priority?: string;
  }>,
  parentLevel: number
): Array<{
  id: string;
  label: string;
  description?: string;
  level: number;
  wbs: Partial<WBSData>;
  positionOffset: { x: number; y: number };
}> {
  return suggestions.map((s, index) => ({
    id: `node-${Date.now()}-${index}`,
    label: s.label,
    description: s.description,
    level: parentLevel + 1,
    wbs: {
      ...DEFAULT_WBS_DATA,
      estimatedHours: s.estimatedHours,
      priority: (s.priority as WBSData["priority"]) || "medium",
    },
    positionOffset: {
      x: 200,
      y: (index - suggestions.length / 2) * 80,
    },
  }));
}
