"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ChatRoom, ChatRoomMessage, ChatRoomType, UserPreview } from "@/features/user-chat/types";
import { usePresence } from "@/hooks/usePresence";
import { useRoomPresence } from "@/hooks/useRoomPresence";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSharedUserChatClient(): SupabaseClient | null {
  if (typeof window === "undefined" || !SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const g = globalThis as typeof globalThis & { __sbUserChatClient?: SupabaseClient };
  if (g.__sbUserChatClient) return g.__sbUserChatClient;
  g.__sbUserChatClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storageKey: "sb-schoolverse2-userchat",
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "X-Client-Context": "userchat",
      },
    },
  });
  return g.__sbUserChatClient;
}

export function useUserChat() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatRoomMessage[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [searchResults, setSearchResults] = useState<UserPreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; name?: string | null; email?: string | null } | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const subscriptionRef = useRef<ReturnType<SupabaseClient["channel"]> | null>(null);
  const lastMarkReadRef = useRef<{ roomId: string; ts: number; messageId?: string }>({ roomId: "", ts: 0 });
  const markReadInFlight = useRef<boolean>(false);

  const activeRoom = useMemo(
    () => rooms.find((r) => r.id === activeRoomId) ?? null,
    [activeRoomId, rooms],
  );

  const supabase = useMemo(() => getSharedUserChatClient(), []);

  const { presenceMap, myStatus, setCurrentRoom, getUserStatus, recordActivity } = usePresence(currentUser?.id ?? null);
  const { typingUsers, setTyping } = useRoomPresence(
    activeRoomId,
    currentUser?.id ?? null,
    currentUser?.name ?? currentUser?.email ?? null,
  );

  const fetchUnreadCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/user-chat/rooms/unread-counts");
      if (!res.ok) return;
      const data = (await res.json()) as { counts?: Record<string, number> };
      if (data?.counts) {
        setUnreadCounts(data.counts);
        setRooms((prev) =>
          prev.map((room) => ({
            ...room,
            unreadCount: data.counts?.[room.id] ?? room.unreadCount ?? 0,
          })),
        );
      }
    } catch (e) {
      console.error("Failed to fetch unread counts", e);
    }
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
        const roomsData = data.rooms ?? [];
        const mappedUnread = roomsData.reduce<Record<string, number>>((acc, room) => {
          acc[room.id] = room.unreadCount ?? 0;
          return acc;
        }, {});
        setUnreadCounts(mappedUnread);
        setRooms(roomsData);
        if (!activeRoomId && roomsData.length) {
          setActiveRoomId(roomsData[0].id);
        }
        void fetchUnreadCounts();
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoadingRooms(false);
      }
    },
    [activeRoomId, fetchUnreadCounts],
  );

  const fetchMessages = useCallback(
    async (roomId: string) => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/user-chat/rooms/${roomId}/messages?limit=30`);
        if (res.status === 401) {
          throw new Error("サインインが必要です");
        }
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
      if (!text) return;
      if (!activeRoomId) {
        setError("送信先ルームが選択されていません");
        return;
      }
      // 楽観的に末尾へ追加
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticMessage: ChatRoomMessage = {
        id: optimisticId,
        roomId: activeRoomId,
        content: text,
        senderId: currentUser?.id ?? "me",
        createdAt: new Date().toISOString(),
        reads: [],
      };
      setMessages((prev) => [...prev, optimisticMessage]);

      recordActivity();
      const res = await fetch(`/api/user-chat/rooms/${activeRoomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (res.status === 401) {
        setError("サインインが必要です");
      } else if (!res.ok) {
        setError("メッセージ送信に失敗しました");
      }
      // 最新を取得して整合性を保つ
      void fetchMessages(activeRoomId);
    },
    [activeRoomId, recordActivity, fetchMessages, currentUser?.id],
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      recordActivity();
      setTyping(isTyping);
    },
    [recordActivity, setTyping],
  );

  const markRead = useCallback(
    async (messageId: string) => {
      if (!activeRoomId) return;
      // クライアント側で連続リクエストを抑制（429回避）
      const now = Date.now();
      const last = lastMarkReadRef.current;
      if (last.roomId === activeRoomId && last.messageId === messageId) return;
      if (last.roomId === activeRoomId && now - last.ts < 5000) return;
      if (markReadInFlight.current) return;
      markReadInFlight.current = true;
      lastMarkReadRef.current = { roomId: activeRoomId, ts: now, messageId };
      recordActivity();
      await fetch(`/api/user-chat/rooms/${activeRoomId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });
      setUnreadCounts((prev) => ({ ...prev, [activeRoomId]: 0 }));
      setRooms((prev) => prev.map((room) => (room.id === activeRoomId ? { ...room, unreadCount: 0 } : room)));
      markReadInFlight.current = false;
    },
    [activeRoomId, recordActivity],
  );

  const searchUsers = useCallback(
    async (q: string) => {
      const keyword = q.trim();
      if (!keyword) {
        setSearchResults([]);
        return;
      }
      try {
        setError(null);
        const res = await fetch(`/api/user-chat/search-users?q=${encodeURIComponent(keyword)}&limit=20`);
        if (res.status === 401) {
          setError("検索するにはサインインが必要です");
          setSearchResults([]);
          return;
        }
        if (!res.ok) {
          setError("検索に失敗しました");
          setSearchResults([]);
          return;
        }
        const data = (await res.json()) as { users?: UserPreview[] };
        const users = data.users ?? [];
        setSearchResults(users);
        if (users.length === 0) {
          setError("該当するユーザーが見つかりませんでした");
        } else {
          setError(null);
        }
      } catch (e) {
        setError("検索に失敗しました");
        setSearchResults([]);
        console.error("searchUsers error", e);
      }
    },
    [setError],
  );

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
    // セッション取得
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) return;
        const data = (await res.json()) as { user?: { id?: string; name?: string | null; email?: string | null } };
        if (data?.user?.id) {
          setCurrentUser({ id: data.user.id, name: data.user.name, email: data.user.email });
        }
      } catch (e) {
        console.error("Failed to fetch session", e);
      }
    };
    void fetchSession();
    fetchRooms();
    return () => {
      if (subscriptionRef.current && supabase) supabase.removeChannel(subscriptionRef.current);
    };
  }, [fetchRooms, supabase]);

  useEffect(() => {
    const timer = setInterval(() => {
      void fetchUnreadCounts();
    }, 30_000);
    return () => clearInterval(timer);
  }, [fetchUnreadCounts]);

  // Presence: room tracking
  useEffect(() => {
    setCurrentRoom(activeRoomId ?? null);
  }, [activeRoomId, setCurrentRoom]);

  return {
    rooms,
    activeRoom,
    activeRoomId,
    messages,
    unreadCounts,
    typingUsers,
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
    currentUser,
    getUserStatus,
    presenceMap,
    myStatus,
  };
}
