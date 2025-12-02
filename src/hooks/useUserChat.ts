"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ChatRoom,
  ChatRoomMessage,
  ChatRoomType,
  UserPreview,
  WsServerMessage,
} from "@/features/user-chat/types";

type TypingState = Record<string, Set<string>>;

export function useUserChat() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatRoomMessage[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [searchResults, setSearchResults] = useState<UserPreview[]>([]);
  const [typing, setTyping] = useState<TypingState>({});
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRoomJoin = useRef<Set<string>>(new Set());

  const activeRoom = useMemo(
    () => rooms.find((r) => r.id === activeRoomId) ?? null,
    [activeRoomId, rooms],
  );

  const connectWebSocket = useCallback(() => {
    if (typeof window === "undefined") return;
    if (wsRef.current) return;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${protocol}://${window.location.host}/api/user-chat/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
      pendingRoomJoin.current.forEach((roomId) => {
        ws.send(JSON.stringify({ type: "join", roomId }));
      });
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as WsServerMessage;
        if (payload.type === "message") {
          setMessages((prev) =>
            activeRoomId === payload.roomId ? [...prev, payload.message] : prev,
          );
          setRooms((prev) =>
            prev.map((r) =>
              r.id === payload.roomId
                ? { ...r, lastMessage: payload.message, lastMessageAt: payload.message.createdAt }
                : r,
            ),
          );
        } else if (payload.type === "typing") {
          setTyping((prev) => {
            const set = new Set(prev[payload.roomId] ?? []);
            if (payload.isTyping) set.add(payload.userId);
            else set.delete(payload.userId);
            return { ...prev, [payload.roomId]: set };
          });
        } else if (payload.type === "read") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === payload.messageId
                ? {
                    ...m,
                    reads: [
                      ...(m.reads ?? []),
                      { id: `${payload.userId}-${payload.messageId}`, userId: payload.userId, messageId: payload.messageId, readAt: payload.readAt },
                    ],
                  }
                : m,
            ),
          );
        }
      } catch (e) {
        console.error("ws parse error", e);
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      reconnectRef.current = setTimeout(() => connectWebSocket(), 2000);
    };

    ws.onerror = () => {
      setError("WebSocket接続に失敗しました");
    };
  }, [activeRoomId]);

  const fetchRooms = useCallback(async (type?: ChatRoomType | "all") => {
    setLoadingRooms(true);
    try {
      const qs = new URLSearchParams();
      if (type && type !== "all") qs.set("type", type);
      const res = await fetch(`/api/user-chat/rooms?${qs.toString()}`);
      if (!res.ok) throw new Error("ルーム取得に失敗しました");
      const data = (await res.json()) as { rooms: ChatRoom[] };
      setRooms(data.rooms ?? []);
      if (!activeRoomId && data.rooms?.length) {
        setActiveRoomId(data.rooms[0].id);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingRooms(false);
    }
  }, [activeRoomId]);

  const fetchMessages = useCallback(
    async (roomId: string) => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/user-chat/rooms/${roomId}/messages?limit=30`);
        if (!res.ok) throw new Error("メッセージ取得に失敗しました");
        const data = (await res.json()) as { messages: ChatRoomMessage[]; nextCursor: string | null };
        setMessages(data.messages ?? []);
        setHasMoreMessages(Boolean(data.nextCursor));
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoadingMessages(false);
      }
    },
    [],
  );

  const selectRoom = useCallback(
    async (roomId: string) => {
      setActiveRoomId(roomId);
      pendingRoomJoin.current.add(roomId);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "join", roomId }));
      }
      await fetchMessages(roomId);
    },
    [fetchMessages],
  );

  const loadMore = useCallback(async () => {
    if (!activeRoomId || !hasMoreMessages || !messages.length) return;
    const cursor = messages[0].id;
    const res = await fetch(
      `/api/user-chat/rooms/${activeRoomId}/messages?limit=30&cursor=${cursor}`,
    );
    if (!res.ok) return;
    const data = (await res.json()) as { messages: ChatRoomMessage[]; nextCursor: string | null };
    setMessages((prev) => [...data.messages, ...prev]);
    setHasMoreMessages(Boolean(data.nextCursor));
  }, [activeRoomId, hasMoreMessages, messages]);

  const sendMessage = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text || !activeRoomId) return;
      const ws = wsRef.current;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "message", roomId: activeRoomId, content: text }));
      } else {
        // fallback via HTTP
        await fetch(`/api/user-chat/rooms/${activeRoomId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
        });
      }
    },
    [activeRoomId],
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!activeRoomId) return;
      const ws = wsRef.current;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "typing", roomId: activeRoomId, isTyping }));
      }
    },
    [activeRoomId],
  );

  const markRead = useCallback(
    async (messageId: string) => {
      if (!activeRoomId) return;
      const ws = wsRef.current;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "read", roomId: activeRoomId, messageId }));
      }
      await fetch(`/api/user-chat/rooms/${activeRoomId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });
    },
    [activeRoomId],
  );

  const searchUsers = useCallback(async (q: string) => {
    if (!q.trim()) return;
    const res = await fetch(`/api/user-chat/search-users?q=${encodeURIComponent(q)}`);
    if (!res.ok) return;
    const data = (await res.json()) as { users: UserPreview[] };
    setSearchResults(data.users ?? []);
  }, []);

  const createRoom = useCallback(
    async (participantId: string, type: ChatRoomType = "dm") => {
      const res = await fetch("/api/user-chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, participantIds: [participantId] }),
      });
      if (!res.ok) {
        setError("ルーム作成に失敗しました");
        return null;
      }
      const data = (await res.json()) as { room: ChatRoom };
      setRooms((prev) => [data.room, ...prev]);
      setActiveRoomId(data.room.id);
      await fetchMessages(data.room.id);
      return data.room;
    },
    [fetchMessages],
  );

  useEffect(() => {
    fetchRooms();
    connectWebSocket();
    return () => {
      wsRef.current?.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [connectWebSocket, fetchRooms]);

  return {
    rooms,
    activeRoom,
    activeRoomId,
    messages,
    typing,
    loadingRooms,
    loadingMessages,
    hasMoreMessages,
    searchResults,
    error,
    setError,
    setSearchResults,
    fetchRooms,
    selectRoom,
    sendMessage,
    sendTyping,
    markRead,
    loadMore,
    searchUsers,
    createRoom,
    setActiveRoomId,
  };
}
