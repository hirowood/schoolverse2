"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  ChatRoom,
  ChatRoomMessage,
  ChatRoomType,
  UserPreview,
} from "@/features/user-chat/types";

type TypingState = Record<string, Set<string>>;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
  const subscriptionRef = useRef<ReturnType<SupabaseClient["channel"]> | null>(null);

  const activeRoom = useMemo(
    () => rooms.find((r) => r.id === activeRoomId) ?? null,
    [activeRoomId, rooms],
  );

  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }, []);

  const fetchRooms = useCallback(
    async (type?: ChatRoomType | "all") => {
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
    },
    [activeRoomId],
  );

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
      await fetch(`/api/user-chat/rooms/${activeRoomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
    },
    [activeRoomId],
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      setTyping((prev) => {
        const set = new Set(prev[activeRoomId ?? ""] ?? []);
        if (isTyping) set.add("me");
        else set.delete("me");
        return activeRoomId ? { ...prev, [activeRoomId]: set } : prev;
      });
    },
    [activeRoomId],
  );

  const markRead = useCallback(
    async (messageId: string) => {
      if (!activeRoomId) return;
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

  // Supabase Realtime: メッセージ挿入を監視
  useEffect(() => {
    if (!supabase) {
      setError("Supabaseの環境変数が未設定です");
      return;
    }
    if (!activeRoomId) return;

    // 既存チャネルを解除
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }

    const channel = supabase
      .channel(`room-${activeRoomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ChatRoomMessage", filter: `roomId=eq.${activeRoomId}` },
        (payload) => {
          const msg = payload.new as ChatRoomMessage;
          setMessages((prev) => [...prev, msg]);
          setRooms((prev) =>
            prev.map((r) =>
              r.id === activeRoomId
                ? { ...r, lastMessage: msg, lastMessageAt: msg.createdAt }
                : r,
            ),
          );
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setError(null);
        }
      });

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [supabase, activeRoomId]);

  useEffect(() => {
    fetchRooms();
    return () => {
      if (subscriptionRef.current && supabase) supabase.removeChannel(subscriptionRef.current);
    };
  }, [fetchRooms, supabase]);

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
