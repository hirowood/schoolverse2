"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";
import type { PresenceMap, PresenceState, UserStatus } from "@/features/user-chat/types";

const AWAY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const ACTIVITY_DEBOUNCE_MS = 30 * 1000; // 30 seconds

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function usePresence(userId: string | null) {
  const [presenceMap, setPresenceMap] = useState<PresenceMap>({});
  const [myStatus, setMyStatus] = useState<UserStatus>("offline");
  const channelRef = useRef<RealtimeChannel | null>(null);
  const awayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(0);

  const supabase = useMemo<SupabaseClient | null>(() => {
    if (typeof window === "undefined") return null;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }, []);

  const updateStatus = useCallback(
    (status: UserStatus, currentRoomId: string | null = null) => {
      setMyStatus(status);
      channelRef.current?.track({
        status,
        lastActiveAt: new Date().toISOString(),
        currentRoomId,
      });
    },
    [],
  );

  const recordActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityRef.current < ACTIVITY_DEBOUNCE_MS) return;
    lastActivityRef.current = now;

    if (myStatus === "away") {
      updateStatus("online");
    }

    if (awayTimerRef.current) clearTimeout(awayTimerRef.current);
    awayTimerRef.current = setTimeout(() => {
      updateStatus("away");
    }, AWAY_TIMEOUT_MS);
  }, [myStatus, updateStatus]);

  useEffect(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!supabase || !userId) return;

    const channel = supabase.channel("user-chat-presence", {
      config: { presence: { key: userId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceState>();
        const map: PresenceMap = {};
        for (const [key, presences] of Object.entries(state)) {
          if (presences.length > 0) map[key] = presences[0] as unknown as PresenceState;
        }
        setPresenceMap(map);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        if (newPresences.length > 0) {
          setPresenceMap((prev) => ({ ...prev, [key]: newPresences[0] as unknown as PresenceState }));
        }
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        setPresenceMap((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            status: "online",
            lastActiveAt: new Date().toISOString(),
            currentRoomId: null,
          });
          setMyStatus("online");
        }
      });

    channelRef.current = channel;

    const events = ["mousemove", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, recordActivity));
    awayTimerRef.current = setTimeout(() => updateStatus("away"), AWAY_TIMEOUT_MS);

    return () => {
      events.forEach((e) => window.removeEventListener(e, recordActivity));
      if (awayTimerRef.current) clearTimeout(awayTimerRef.current);
      channel.unsubscribe();
      channelRef.current = null;
      setMyStatus("offline");
    };
  }, [supabase, userId, recordActivity, updateStatus]);

  const setCurrentRoom = useCallback(
    (roomId: string | null) => {
      if (!userId) return;
      updateStatus(myStatus ?? "online", roomId);
    },
    [myStatus, updateStatus, userId],
  );

  const getUserStatus = useCallback(
    (targetUserId: string): UserStatus => {
      return presenceMap[targetUserId]?.status ?? "offline";
    },
    [presenceMap],
  );

  return {
    presenceMap,
    myStatus,
    setCurrentRoom,
    getUserStatus,
    recordActivity,
  };
}
