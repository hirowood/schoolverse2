"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  CATEGORY_OPTIONS,
  ChatMode,
  LearningCategory,
  LearningChatMessage,
  LearningChatSession,
} from "@/features/learning-chat/types";

type LearningChatContextValue = {
  sessions: LearningChatSession[];
  currentSession: LearningChatSession | null;
  messages: LearningChatMessage[];
  isLoadingSessions: boolean;
  isLoadingMessages: boolean;
  isStreaming: boolean;
  hasMoreMessages: boolean;
  modeFilter: ChatMode | "all";
  selectedCategory: LearningCategory | null;
  setModeFilter: (mode: ChatMode | "all") => void;
  setSelectedCategory: (category: LearningCategory | null) => void;
  refreshSessions: () => Promise<void>;
  selectSession: (sessionId: string) => Promise<void>;
  createSession: (mode?: ChatMode, category?: LearningCategory) => Promise<LearningChatSession | null>;
  sendMessage: (content: string, category?: LearningCategory) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  error: string | null;
  clearError: () => void;
};

const LearningChatContext = createContext<LearningChatContextValue | null>(null);

async function parseSseStream(
  response: Response,
  onDelta: (text: string) => void,
  onDone: (payload?: { messageId?: string }) => void,
  onError: (message: string) => void,
) {
  if (!response.body) {
    onError("ストリームが開始できませんでした");
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const raw of parts) {
      const line = raw.trim();
      if (!line.startsWith("data:")) continue;
      const payloadText = line.replace(/^data:\s*/, "");
      try {
        const payload = JSON.parse(payloadText) as
          | { type: "delta"; content: string }
          | { type: "done"; messageId?: string }
          | { type: "error"; message: string };
        if (payload.type === "delta") {
          onDelta(payload.content);
        } else if (payload.type === "done") {
          onDone({ messageId: payload.messageId });
        } else if (payload.type === "error") {
          onError(payload.message);
        }
      } catch {
        // ignore malformed chunk
      }
    }
  }
}

export function LearningChatProvider({
  children,
  initialMode = ChatMode.LEARNING,
}: {
  children: React.ReactNode;
  initialMode?: ChatMode;
}) {
  const [sessions, setSessions] = useState<LearningChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LearningChatMessage[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [modeFilter, setModeFilter] = useState<ChatMode | "all">(initialMode);
  const [selectedCategory, setSelectedCategory] = useState<LearningCategory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamingRef = useRef(false);

  const currentSession = useMemo(
    () => sessions.find((s) => s.id === currentSessionId) ?? null,
    [currentSessionId, sessions],
  );

  const refreshSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const qs = new URLSearchParams();
      if (modeFilter !== "all") qs.set("mode", modeFilter);
      const res = await fetch(`/api/learning-chat/sessions?${qs.toString()}`);
      if (!res.ok) throw new Error("セッションの取得に失敗しました");
      const data = (await res.json()) as { sessions: LearningChatSession[]; nextCursor?: string | null };
      setSessions(data.sessions ?? []);
      if (!currentSessionId && data.sessions?.length) {
        setCurrentSessionId(data.sessions[0].id);
      }
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [currentSessionId, modeFilter]);

  const fetchMessages = useCallback(
    async (sessionId: string) => {
      setIsLoadingMessages(true);
      try {
        const res = await fetch(`/api/learning-chat/sessions/${sessionId}/messages?limit=30`);
        if (!res.ok) throw new Error("メッセージの取得に失敗しました");
        const data = (await res.json()) as { messages: LearningChatMessage[]; hasMore: boolean };
        setMessages(data.messages ?? []);
        setHasMoreMessages(Boolean(data.hasMore));
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [],
  );

  const selectSession = useCallback(
    async (sessionId: string) => {
      setCurrentSessionId(sessionId);
      await fetchMessages(sessionId);
      const sessionCategory =
        sessions.find((s) => s.id === sessionId)?.category as LearningCategory | undefined;
      setSelectedCategory(sessionCategory ?? selectedCategory ?? CATEGORY_OPTIONS[0]?.value ?? null);
    },
    [fetchMessages, selectedCategory, sessions],
  );

  const createSession = useCallback(
    async (mode?: ChatMode, category?: LearningCategory) => {
      try {
        const res = await fetch("/api/learning-chat/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: mode ?? modeFilter, category }),
        });
        if (!res.ok) throw new Error("セッションの作成に失敗しました");
        const data = (await res.json()) as { session: LearningChatSession };
        setSessions((prev) => [data.session, ...prev]);
        setCurrentSessionId(data.session.id);
        setMessages([]);
        setSelectedCategory(category ?? null);
        return data.session;
      } catch (e) {
        setError((e as Error).message);
        return null;
      }
    },
    [modeFilter],
  );

  const sendMessage = useCallback(
    async (content: string, categoryOverride?: LearningCategory) => {
      const text = content.trim();
      if (!text || streamingRef.current) return;

      let targetSessionId = currentSessionId;
      if (!targetSessionId) {
        const created = await createSession(modeFilter === "all" ? ChatMode.LEARNING : modeFilter);
        if (!created) return;
        targetSessionId = created.id;
      }

      const category = categoryOverride ?? selectedCategory ?? undefined;
      const userMessage: LearningChatMessage = {
        id: `temp-user-${Date.now()}`,
        sessionId: targetSessionId!,
        role: "user",
        content: text,
        tokenCount: 0,
        model: null,
        rating: null,
        feedback: null,
        category,
        codeBlocks: null,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      streamingRef.current = true;

      try {
        const res = await fetch(`/api/learning-chat/sessions/${targetSessionId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text, category }),
        });
        if (!res.ok) {
          throw new Error("送信に失敗しました");
        }

        let assistantId = `temp-assistant-${Date.now()}`;
        const assistantMessage: LearningChatMessage = {
          id: assistantId,
          sessionId: targetSessionId!,
          role: "assistant",
          content: "",
          tokenCount: 0,
          model: null,
          rating: null,
          feedback: null,
          category,
          codeBlocks: null,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        await parseSseStream(
          res,
          (delta) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: `${m.content}${delta}` } : m,
              ),
            );
          },
          (payload) => {
            if (payload?.messageId) assistantId = payload.messageId;
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantMessage.id ? { ...m, id: assistantId } : m)),
            );
          },
          (message) => {
            setError(message || "ストリームでエラーが発生しました");
          },
        );
      } catch (e) {
        setError((e as Error).message);
        setMessages((prev) => prev.filter((m) => !m.id.startsWith("temp-")));
      } finally {
        streamingRef.current = false;
        setIsStreaming(false);
        refreshSessions();
        if (targetSessionId) {
          await fetchMessages(targetSessionId);
        }
      }
    },
    [createSession, currentSessionId, fetchMessages, modeFilter, refreshSessions, selectedCategory],
  );

  const loadMoreMessages = useCallback(async () => {
    if (!currentSessionId || !hasMoreMessages) return;
    const oldest = messages[0];
    const beforeParam = oldest?.id;
    if (!beforeParam) return;
    try {
      const res = await fetch(
        `/api/learning-chat/sessions/${currentSessionId}/messages?limit=30&before=${beforeParam}`,
      );
      if (!res.ok) throw new Error("履歴の取得に失敗しました");
      const data = (await res.json()) as { messages: LearningChatMessage[]; hasMore: boolean };
      setMessages((prev) => [...data.messages, ...prev]);
      setHasMoreMessages(Boolean(data.hasMore));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [currentSessionId, hasMoreMessages, messages]);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  useEffect(() => {
    if (currentSessionId) {
      fetchMessages(currentSessionId);
    }
  }, [currentSessionId, fetchMessages]);

  const value: LearningChatContextValue = {
    sessions,
    currentSession,
    messages,
    isLoadingSessions,
    isLoadingMessages,
    isStreaming,
    hasMoreMessages,
    modeFilter,
    selectedCategory,
    setModeFilter,
    setSelectedCategory,
    refreshSessions,
    selectSession,
    createSession,
    sendMessage,
    loadMoreMessages,
    error,
    clearError,
  };

  return <LearningChatContext.Provider value={value}>{children}</LearningChatContext.Provider>;
}

export function useLearningChatContext(): LearningChatContextValue {
  const ctx = useContext(LearningChatContext);
  if (!ctx) {
    throw new Error("useLearningChatContext must be used within LearningChatProvider");
  }
  return ctx;
}
