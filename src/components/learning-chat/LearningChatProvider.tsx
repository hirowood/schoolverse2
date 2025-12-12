"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ChatMode,
  LearningCategory,
  LearningChatMessage,
  LearningChatSession,
  parseLearningChatStreamEvent,
} from "@/features/learning-chat/types";
import { consumeJsonSseStream } from "@/lib/sse";
import {
  createSession as createSessionApi,
  listMessages,
  listSessions,
  postMessageStream,
} from "@/features/learning-chat/api";

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
      const data = await listSessions({ mode: modeFilter });
      setSessions(data.sessions ?? []);

      // フィルタ変更などで「現在のセッション」が一覧に存在しない場合は、先頭へフォールバック
      const nextSessionId =
        data.sessions?.some((s) => s.id === currentSessionId) ? currentSessionId : data.sessions?.[0]?.id ?? null;
      if (nextSessionId !== currentSessionId) {
        setCurrentSessionId(nextSessionId);
        if (!nextSessionId) setMessages([]);
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
        const data = await listMessages(sessionId, { limit: 30 });
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
      const sessionCategory = sessions.find((s) => s.id === sessionId)?.category as
        | LearningCategory
        | null
        | undefined;
      setSelectedCategory(sessionCategory ?? selectedCategory ?? null);
    },
    [fetchMessages, selectedCategory, sessions],
  );

  const createSession = useCallback(
    async (mode?: ChatMode, category?: LearningCategory) => {
      try {
        const targetMode = mode ?? (modeFilter === "all" ? ChatMode.LEARNING : modeFilter);
        const data = await createSessionApi({ mode: targetMode, category });
        setSessions((prev) => [data.session, ...prev]);
        setCurrentSessionId(data.session.id);
        setMessages([]);
        setSelectedCategory(category ?? null);
        setError(null);
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
        const res = await postMessageStream(targetSessionId, { content: text, category });

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

        await consumeJsonSseStream(res, {
          parse: parseLearningChatStreamEvent,
          onMessage: (event) => {
            if (event.type === "delta") {
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: `${m.content}${event.content}` } : m)),
              );
              return;
            }
            if (event.type === "done") {
              if (event.messageId) assistantId = event.messageId;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantMessage.id ? { ...m, id: assistantId } : m)),
              );
              return;
            }
            if (event.type === "error") {
              setError(event.message || "ストリームでエラーが発生しました");
            }
          },
          onError: (message) => setError(message || "ストリームが開始できませんでした"),
        });
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
      const data = await listMessages(currentSessionId, { limit: 30, before: beforeParam });
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
