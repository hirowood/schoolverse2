// src/hooks/useCoachChat.ts
"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  message: string;
  createdAt: string;
}

interface UseCoachChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  retryAfter: number | null;
  sendMessage: (text: string) => Promise<void>;
  clearError: () => void;
}

export function useCoachChat(): UseCoachChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const fetchedRef = useRef(false);

  // 初回履歴取得
  const fetchHistory = useCallback(async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    try {
      setIsLoading(true);
      const res = await fetch("/api/coach/chat");
      
      if (res.status === 401) {
        setError("サインインしてください");
        return;
      }
      
      if (res.status === 429) {
        const data = await res.json();
        setRetryAfter(data.retryAfter ?? 60);
        setError("リクエスト制限中です。しばらくお待ちください。");
        return;
      }
      
      if (!res.ok) {
        throw new Error("履歴の取得に失敗しました");
      }
      
      const data = await res.json();
      setMessages(data.messages ?? []);
      setError(null);
    } catch (e) {
      console.error("Fetch history error:", e);
      setError("履歴の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // メッセージ送信
  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setIsSending(true);
    setError(null);
    setRetryAfter(null);

    // 楽観的UI更新
    const tempId = `temp-${Date.now()}`;
    const tempMessage: ChatMessage = {
      id: tempId,
      role: "user",
      message: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (res.status === 401) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setError("サインインしてください");
        return;
      }

      if (res.status === 429) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        const data = await res.json();
        setRetryAfter(data.retryAfter ?? 60);
        setError("リクエスト制限中です。しばらくお待ちください。");
        return;
      }

      if (!res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        const data = await res.json();
        throw new Error(data.error || "送信に失敗しました");
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        data.userMessage,
        data.assistantMessage,
      ]);
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setError((e as Error).message || "送信に失敗しました");
    } finally {
      setIsSending(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setRetryAfter(null);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // retryAfterカウントダウン
  useEffect(() => {
    if (retryAfter === null || retryAfter <= 0) return;

    const timer = setInterval(() => {
      setRetryAfter((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [retryAfter]);

  return {
    messages,
    isLoading,
    isSending,
    error,
    retryAfter,
    sendMessage,
    clearError,
  };
}
