"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChatRoom, ChatRoomMessage, ChatRoomType, UserPreview } from "@/features/user-chat/types";
import { usePresence } from "@/hooks/usePresence";
import { useRoomPresence } from "@/hooks/useRoomPresence";
import { getSharedUserChatClient } from "@/lib/user-chat/supabaseClient";
import {
  createRoom as createRoomApi,
  listRoomMessages,
  listRooms,
  listUnreadCounts,
  markRoomRead,
  searchUsers as searchUsersApi,
  sendRoomMessage,
} from "@/features/user-chat/api";

/**
 * useUserChat
 *
 * - APIアクセス（REST）と UI を分離するため、fetch は `src/features/user-chat/api.ts` に集約
 * - Realtime は Supabase client を `src/lib/user-chat/supabaseClient.ts` で共有
 * - この hook は「状態管理」と「ユースケース（ルーム選択・送信・既読）」の責務に集中
 */

type CurrentUser = { id: string; name?: string | null; email?: string | null };

export function useUserChat() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatRoomMessage[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [searchResults, setSearchResults] = useState<UserPreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const subscriptionRef = useRef<ReturnType<SupabaseClient["channel"]> | null>(null);

  // 既読スロットリング（無限ループ/過剰POSTの防止）
  const lastMarkReadRef = useRef<{ roomId: string; ts: number; messageId: string }>({
    roomId: "",
    ts: 0,
    messageId: "",
  });
  const markReadInFlight = useRef(false);
  const unreadCountsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    unreadCountsRef.current = unreadCounts;
  }, [unreadCounts]);

  const activeRoom = useMemo(
    () => rooms.find((r) => r.id === activeRoomId) ?? null,
    [activeRoomId, rooms],
  );

  const supabase = useMemo(() => getSharedUserChatClient(), []);

  const { presenceMap, myStatus, setCurrentRoom, getUserStatus, recordActivity } = usePresence(
    currentUser?.id ?? null,
  );

  const { typingUsers, setTyping } = useRoomPresence(
    activeRoomId,
    currentUser?.id ?? null,
    currentUser?.name ?? currentUser?.email ?? null,
  );

  const mergeUnreadIntoRooms = useCallback((counts: Record<string, number>) => {
    setRooms((prev) =>
      prev.map((room) => ({
        ...room,
        unreadCount: counts[room.id] ?? room.unreadCount ?? 0,
      })),
    );
  }, []);

  const fetchUnreadCounts = useCallback(async () => {
    try {
      const data = await listUnreadCounts();
      setUnreadCounts(data.counts);
      mergeUnreadIntoRooms(data.counts);
    } catch (e) {
      // unreadCounts は UI の補助情報なので、エラーは握りつぶしてログのみ
      console.error("[useUserChat] unread-counts failed", e);
    }
  }, [mergeUnreadIntoRooms]);

  const fetchRooms = useCallback(
    async (type?: ChatRoomType | "all") => {
      setLoadingRooms(true);
      try {
        const data = await listRooms({ type });
        const roomsData = data.rooms ?? [];

        // rooms が返す unreadCount を state に同期
        const mappedUnread = roomsData.reduce<Record<string, number>>((acc, room) => {
          acc[room.id] = room.unreadCount ?? 0;
          return acc;
        }, {});

        setUnreadCounts(mappedUnread);
        setRooms(roomsData);

        // 初回だけ先頭のルームへフォールバック
        if (!activeRoomId && roomsData.length) {
          setActiveRoomId(roomsData[0].id);
        }
        setError(null);

        // 補助的に unread-counts も更新（サーバー側での lastSeenAt 更新反映）
        void fetchUnreadCounts();
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoadingRooms(false);
      }
    },
    [activeRoomId, fetchUnreadCounts],
  );

  const fetchMessages = useCallback(async (roomId: string) => {
    setLoadingMessages(true);
    try {
      const data = await listRoomMessages(roomId, { limit: 30 });
      setMessages(data.messages ?? []);
      setHasMoreMessages(Boolean(data.nextCursor));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const selectRoom = useCallback(
    async (roomId: string) => {
      setActiveRoomId(roomId);
      await fetchMessages(roomId);
    },
    [fetchMessages],
  );

  const loadMore = useCallback(async () => {
    if (!activeRoomId || !hasMoreMessages || messages.length === 0) return;
    const cursor = messages[0].id;
    try {
      const data = await listRoomMessages(activeRoomId, { limit: 30, cursor });
      setMessages((prev) => [...data.messages, ...prev]);
      setHasMoreMessages(Boolean(data.nextCursor));
    } catch {
      // ページング失敗は致命ではないので握りつぶし
    }
  }, [activeRoomId, hasMoreMessages, messages]);

  const sendMessage = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text) return;
      if (!activeRoomId) {
        setError("ルームが選択されていません");
        return;
      }

      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticMessage: ChatRoomMessage = {
        id: optimisticId,
        roomId: activeRoomId,
        content: text,
        senderId: currentUser?.id ?? "me",
        messageType: "text",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reads: [],
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      recordActivity();

      try {
        const data = await sendRoomMessage(activeRoomId, { content: text });
        setMessages((prev) => prev.map((m) => (m.id === optimisticId ? data.message : m)));
        setRooms((prev) =>
          prev.map((r) =>
            r.id === activeRoomId
              ? { ...r, lastMessage: data.message, lastMessageAt: data.message.createdAt }
              : r,
          ),
        );
        setError(null);
      } catch (e) {
        setError((e as Error).message);
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      }
    },
    [activeRoomId, currentUser?.id, recordActivity],
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

      const now = Date.now();
      const last = lastMarkReadRef.current;

      // 同じメッセージに対しての二重POST防止
      if (last.messageId === messageId) return;
      // 同じルームで短時間に連続送信しない（スロットリング）
      if (last.roomId === activeRoomId && now - last.ts < 8000) return;
      // unread=0 のときは送らない
      if ((unreadCountsRef.current[activeRoomId] ?? 0) === 0) return;
      // 送信中の二重実行防止
      if (markReadInFlight.current) return;

      markReadInFlight.current = true;
      lastMarkReadRef.current = { roomId: activeRoomId, ts: now, messageId };

      recordActivity();

      try {
        const res = await markRoomRead(activeRoomId, { messageId });
        if (res.ok) {
          setUnreadCounts((prev) => {
            const next = { ...prev, [activeRoomId]: 0 };
            unreadCountsRef.current = next;
            return next;
          });
          setRooms((prev) =>
            prev.map((room) => (room.id === activeRoomId ? { ...room, unreadCount: 0 } : room)),
          );
        }
      } catch {
        // 既読更新は補助なので握りつぶし（無限ループ防止）
      } finally {
        markReadInFlight.current = false;
      }
    },
    [activeRoomId, recordActivity],
  );

  const searchUsers = useCallback(async (q: string) => {
    const keyword = q.trim();
    if (!keyword) {
      setSearchResults([]);
      setError(null);
      return;
    }

    try {
      setError(null);
      const data = await searchUsersApi({ q: keyword, limit: 20 });
      const users = data.users ?? [];
      setSearchResults(users);
      setError(users.length === 0 ? "ユーザーが見つかりませんでした" : null);
    } catch (e) {
      setError((e as Error).message);
      setSearchResults([]);
      console.error("[useUserChat] searchUsers failed", e);
    }
  }, []);

  const createRoom = useCallback(
    async (participantId: string, type: ChatRoomType = "dm") => {
      try {
        const data = await createRoomApi({ type, participantIds: [participantId] });
        setRooms((prev) => [data.room, ...prev]);
        setActiveRoomId(data.room.id);
        await fetchMessages(data.room.id);
        setError(null);
        return data.room;
      } catch (e) {
        setError((e as Error).message);
        return null;
      }
    },
    [fetchMessages],
  );

  // Realtime: アクティブルームのみ、新規メッセージ INSERT を監視
  useEffect(() => {
    if (!supabase) {
      setError("Supabaseが未設定です（NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY）");
      return;
    }
    if (!activeRoomId) return;

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
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          setRooms((prev) =>
            prev.map((r) => (r.id === activeRoomId ? { ...r, lastMessage: msg, lastMessageAt: msg.createdAt } : r)),
          );
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setError(null);
      });

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [supabase, activeRoomId]);

  // Session user + initial fetch
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) return;
        const data = (await res.json()) as { user?: { id?: string; name?: string | null; email?: string | null } };
        if (data?.user?.id) {
          setCurrentUser({ id: data.user.id, name: data.user.name, email: data.user.email });
        }
      } catch (e) {
        console.error("[useUserChat] session fetch failed", e);
      }
    };

    void fetchSession();
    void fetchRooms();

    return () => {
      if (subscriptionRef.current && supabase) supabase.removeChannel(subscriptionRef.current);
    };
  }, [fetchRooms, supabase]);

  // Poll unread-counts (low frequency)
  useEffect(() => {
    const timer = setInterval(() => {
      void fetchUnreadCounts();
    }, 30_000);
    return () => clearInterval(timer);
  }, [fetchUnreadCounts]);

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

