// src/hooks/useMindMapAI.ts
"use client";

import { useState, useCallback } from "react";
import type { AIAction } from "@/lib/coach/prompts/mindmapSystem";

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: AIAction;
  suggestions?: {
    type: "breakdown" | "wbs" | "actions" | "text";
    data: unknown;
  };
  createdAt: Date;
}

export interface BreakdownSuggestion {
  parentNode: string;
  suggestions: Array<{
    label: string;
    description?: string;
    estimatedHours?: number;
    priority?: "low" | "medium" | "high" | "critical";
  }>;
  reasoning: string;
}

export interface WBSSuggestion {
  updates: Array<{
    nodeId: string;
    label: string;
    changes: {
      estimatedHours?: number;
      priority?: "low" | "medium" | "high" | "critical";
      startDate?: string;
      endDate?: string;
    };
    reason: string;
  }>;
  overallAdvice: string;
}

export interface ActionSuggestion {
  actions: Array<{
    action: string;
    targetNode?: string;
    duration: string;
    reason: string;
  }>;
  motivation: string;
}

interface UseMindMapAIReturn {
  messages: AIMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (action: AIAction, message?: string, selectedNodeId?: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

export function useMindMapAI(mindMapId: string | null): UseMindMapAIReturn {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (action: AIAction, message?: string, selectedNodeId?: string) => {
      if (!mindMapId) {
        setError("マインドマップが選択されていません");
        return;
      }

      setIsLoading(true);
      setError(null);

      // ユーザーメッセージを追加
      const userMessage: AIMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message || getActionLabel(action),
        action,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const res = await fetch(`/api/mindmap/${mindMapId}/ai`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, message, selectedNodeId }),
        });

        if (res.status === 401) {
          setError("サインインしてください");
          setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
          return;
        }

        if (res.status === 429) {
          const data = await res.json();
          setError(`リクエスト制限中です。${data.retryAfter || 60}秒後にお試しください。`);
          setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
          return;
        }

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "AIからの応答を取得できませんでした");
        }

        const data = await res.json();

        // アシスタントメッセージを追加
        const assistantMessage: AIMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.message,
          suggestions: data.suggestions,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (e) {
        setError((e as Error).message || "エラーが発生しました");
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      } finally {
        setIsLoading(false);
      }
    },
    [mindMapId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    clearError,
  };
}

function getActionLabel(action: AIAction): string {
  const labels: Record<AIAction, string> = {
    analyze: "マインドマップを分析してください",
    suggest_breakdown: "タスクを分解する提案をしてください",
    suggest_wbs: "WBS属性を最適化してください",
    next_action: "次のアクションを教えてください",
    progress_feedback: "進捗についてフィードバックをください",
    chat: "相談があります",
  };
  return labels[action];
}
