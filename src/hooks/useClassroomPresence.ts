"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const POSITION_BROADCAST_INTERVAL = 100; // ms

export type PlayerStatus = "exploring" | "battling" | "idle";

export type PlayerState = {
  userId: string;
  position: { x: number; y: number; z: number };
  status: PlayerStatus;
  avatarColor: string;
  userName: string;
  currentMonster: string | null;
  lastUpdate: number;
};

export type ClassroomPresenceState = {
  position: { x: number; y: number; z: number };
  status: PlayerStatus;
  avatarColor: string;
  userName: string;
  currentMonster: string | null;
};

export type UseClassroomPresenceResult = {
  otherPlayers: Map<string, PlayerState>;
  isConnected: boolean;
  avatarColor: string;
  broadcastPosition: (position: { x: number; y: number; z: number }, force?: boolean) => void;
  broadcastBattleState: (isBattling: boolean, monsterName?: string | null) => void;
  playerCount: number;
};

const AVATAR_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#14b8a6", "#eab308", "#ef4444", "#84cc16"];

function getAvatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function useClassroomPresence(
  roomId: string | null,
  userId: string | null,
  userName: string | null,
  enabled = true,
): UseClassroomPresenceResult {
  const [otherPlayers, setOtherPlayers] = useState<Map<string, PlayerState>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastBroadcastRef = useRef<number>(0);
  const currentStateRef = useRef<ClassroomPresenceState | null>(null);
  const lastKnownPositionRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });

  const supabase = useMemo<SupabaseClient | null>(() => {
    if (!enabled) return null;
    if (typeof window === "undefined" || !SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }, [enabled]);

  const avatarColor = useMemo(() => (userId ? getAvatarColor(userId) : "#94a3b8"), [userId]);

  const broadcastPosition = useCallback(
    (position: { x: number; y: number; z: number }, force = false) => {
      if (!enabled || !userId) return;
      lastKnownPositionRef.current = position;
      if (!channelRef.current) return;
      const now = Date.now();
      if (!force && now - lastBroadcastRef.current < POSITION_BROADCAST_INTERVAL) return;
      lastBroadcastRef.current = now;

      const newState: ClassroomPresenceState = {
        position,
        status: currentStateRef.current?.status ?? "exploring",
        avatarColor,
        userName: userName ?? "Guest",
        currentMonster: currentStateRef.current?.currentMonster ?? null,
      };
      currentStateRef.current = newState;
      channelRef.current.track(newState);
    },
    [enabled, userId, avatarColor, userName],
  );

  const broadcastBattleState = useCallback(
    (isBattling: boolean, monsterName: string | null = null) => {
      if (!enabled || !channelRef.current || !currentStateRef.current) return;
      const newState: ClassroomPresenceState = {
        ...currentStateRef.current,
        status: isBattling ? "battling" : "exploring",
        currentMonster: monsterName,
      };
      currentStateRef.current = newState;
      channelRef.current.track(newState);
    },
    [enabled],
  );

  useEffect(() => {
    if (!enabled || !supabase || !roomId || !userId) return;

    const channel = supabase.channel(`classroom-${roomId}`, { config: { presence: { key: userId } } });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<ClassroomPresenceState>();
        const players = new Map<string, PlayerState>();
        for (const [key, presences] of Object.entries(state)) {
          if (key === userId || presences.length === 0) continue;
          const p = presences[0] as unknown as ClassroomPresenceState;
          players.set(key, {
            userId: key,
            position: p.position ?? { x: 0, y: 0, z: 0 },
            status: p.status ?? "exploring",
            avatarColor: p.avatarColor ?? "#94a3b8",
            userName: p.userName ?? "Guest",
            currentMonster: p.currentMonster ?? null,
            lastUpdate: Date.now(),
          });
        }
        setOtherPlayers(players);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        if (key === userId || newPresences.length === 0) return;
        const p = newPresences[0] as unknown as ClassroomPresenceState;
        setOtherPlayers((prev) => {
          const next = new Map(prev);
          next.set(key, {
            userId: key,
            position: p.position ?? { x: 0, y: 0, z: 0 },
            status: p.status ?? "exploring",
            avatarColor: p.avatarColor ?? "#94a3b8",
            userName: p.userName ?? "Guest",
            currentMonster: p.currentMonster ?? null,
            lastUpdate: Date.now(),
          });
          return next;
        });
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        setOtherPlayers((prev) => {
          const next = new Map(prev);
          next.delete(key);
          return next;
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          const initialState: ClassroomPresenceState = {
            position: lastKnownPositionRef.current,
            status: "exploring",
            avatarColor,
            userName: userName ?? "Guest",
            currentMonster: null,
          };
          currentStateRef.current = initialState;
          await channel.track(initialState);
          // 追加で即座にブロードキャストして存在を確実に知らせる
          lastBroadcastRef.current = 0;
          broadcastPosition(lastKnownPositionRef.current, true);
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
      setIsConnected(false);
      setOtherPlayers(new Map());
    };
  }, [enabled, supabase, roomId, userId, avatarColor, userName, broadcastPosition]);

  // フォーカス復帰時にも位置を再送
  useEffect(() => {
    if (!enabled) return;
    const handler = () => {
      broadcastPosition(lastKnownPositionRef.current, true);
    };
    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, [broadcastPosition, enabled]);

  return {
    otherPlayers,
    isConnected,
    avatarColor,
    broadcastPosition,
    broadcastBattleState,
    playerCount: otherPlayers.size + (userId ? 1 : 0),
  };
}
