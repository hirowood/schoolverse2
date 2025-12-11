"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";
import type { RoomPresenceState, TypingUser } from "@/features/user-chat/types";

const TYPING_TIMEOUT_MS = 3000;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function useRoomPresence(roomId: string | null, userId: string | null, userName: string | null) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const supabase = useMemo<SupabaseClient | null>(() => {
    if (typeof window === "undefined") return null;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storageKey: "sb-schoolverse2-roompresence",
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }, []);

  useEffect(() => {
    if (!supabase || !roomId || !userId) return;

    const channel = supabase.channel(`room-presence-${roomId}`, {
      config: { presence: { key: userId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<RoomPresenceState>();
        const users: TypingUser[] = [];
        for (const [key, presences] of Object.entries(state)) {
          if (key === userId) continue;
          const entry = presences[0];
          if (entry?.typing) {
            users.push({ id: key, name: entry.userName ?? "ユーザー" });
          }
        }
        setTypingUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ typing: false, userName: userName ?? undefined });
        }
      });

    channelRef.current = channel;

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      channel.unsubscribe();
      channelRef.current = null;
      setTypingUsers([]);
      isTypingRef.current = false;
    };
  }, [roomId, supabase, userId, userName]);

  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!channelRef.current) return;
      if (isTypingRef.current === isTyping) return;
      isTypingRef.current = isTyping;

      channelRef.current.track({
        typing: isTyping,
        userName: userName ?? undefined,
      });

      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (isTyping) {
        typingTimerRef.current = setTimeout(() => {
          isTypingRef.current = false;
          channelRef.current?.track({
            typing: false,
            userName: userName ?? undefined,
          });
        }, TYPING_TIMEOUT_MS);
      }
    },
    [userName],
  );

  return { typingUsers, setTyping };
}
