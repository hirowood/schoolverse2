"use client";

import { create } from "zustand";
import type { MonsterDefinition, MonsterQuestion } from "@/features/virtual-classroom/types";

type Position = { x: number; y: number; z: number };
type EncounterResult = { isCorrect: boolean; xpEarned: number; bonusXpEarned: number; coinsEarned: number };

export type SpawnZone = {
  id: string;
  category: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  color?: string;
};

export const DEFAULT_SPAWN_ZONES: SpawnZone[] = [
  { id: "frontend", category: "frontend", minX: 4, maxX: 8, minZ: -2, maxZ: 2, color: "#3b82f6" },
  { id: "react", category: "react", minX: -2, maxX: 2, minZ: -6, maxZ: -2, color: "#06b6d4" },
  { id: "backend", category: "backend", minX: -8, maxX: -4, minZ: -2, maxZ: 2, color: "#22c55e" },
  { id: "infra", category: "infra", minX: -8, maxX: -4, minZ: 2, maxZ: 6, color: "#f97316" },
  { id: "fullstack", category: "fullstack", minX: -2, maxX: 2, minZ: 2, maxZ: 6, color: "#a855f7" },
  { id: "thinking", category: "thinking", minX: 4, maxX: 8, minZ: 2, maxZ: 6, color: "#eab308" },
];

type State = {
  playerPosition: Position;
  currentZone: SpawnZone | null;
  encounterId: string | null;
  monster: MonsterDefinition | null;
  question: Omit<MonsterQuestion, "correctAnswer"> | null;
  result: EncounterResult | null;
  loading: boolean;
  error: string | null;
  isBattleActive: boolean;
  showConfetti: boolean;
  showShake: boolean;
  lastEncounterAt: number;
};

type Actions = {
  setPosition: (pos: Position) => void;
  setZone: (zone: SpawnZone | null) => void;
  startEncounter: (opts?: { category?: string | null; playerLevel?: number }) => Promise<void>;
  answerEncounter: (answer: string) => Promise<void>;
  resetBattle: () => void;
  triggerAutoEncounter: (zone: SpawnZone | null) => Promise<void>;
};

const AUTO_COOLDOWN_MS = 4500;
const AUTO_PROBABILITY = 0.3;

function detectZoneFromPosition(pos: Position, zones: SpawnZone[]): SpawnZone | null {
  return zones.find((z) => pos.x >= z.minX && pos.x <= z.maxX && pos.z >= z.minZ && pos.z <= z.maxZ) ?? null;
}

export const useVirtualRoomStore = create<State & Actions>((set, get) => ({
  playerPosition: { x: 0, y: 0, z: 0 },
  currentZone: null,
  encounterId: null,
  monster: null,
  question: null,
  result: null,
  loading: false,
  error: null,
  isBattleActive: false,
  showConfetti: false,
  showShake: false,
  lastEncounterAt: 0,

  setPosition: (pos) => set({ playerPosition: pos, currentZone: detectZoneFromPosition(pos, DEFAULT_SPAWN_ZONES) }),
  setZone: (zone) => set({ currentZone: zone }),

  startEncounter: async (opts) => {
    if (get().loading) return;
    set({ loading: true, error: null, showConfetti: false, showShake: false });
    const res = await fetch("/api/monster/encounter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: opts?.category ?? get().currentZone,
        position: get().playerPosition,
        playerLevel: opts?.playerLevel ?? 1,
      }),
    });
    if (!res.ok) {
      set({ loading: false, error: "遭遇に失敗しました" });
      return;
    }
    const data = (await res.json()) as {
      success: boolean;
      data?: { encounterId: string; monster: MonsterDefinition; question: Omit<MonsterQuestion, "correctAnswer"> };
    };
    if (!data.success || !data.data) {
      set({ loading: false, error: "遭遇に失敗しました" });
      return;
    }
    set({
      encounterId: data.data.encounterId,
      monster: data.data.monster,
      question: data.data.question,
      result: null,
      loading: false,
      error: null,
      isBattleActive: true,
      showConfetti: false,
      showShake: false,
      lastEncounterAt: Date.now(),
    });
  },

  answerEncounter: async (answer: string) => {
    const { encounterId } = get();
    if (!encounterId) return;
    set({ loading: true, error: null });
    const res = await fetch("/api/monster/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ encounterId, answer }),
    });
    if (!res.ok) {
      set({ loading: false, error: "回答送信に失敗しました" });
      return;
    }
    const data = (await res.json()) as { success: boolean; data?: EncounterResult };
    if (!data.success || !data.data) {
      set({ loading: false, error: "回答送信に失敗しました" });
      return;
    }
    set({
      loading: false,
      result: data.data,
      isBattleActive: false,
      showConfetti: data.data.isCorrect,
      showShake: !data.data.isCorrect,
    });
  },

  resetBattle: () =>
    set({
      encounterId: null,
      monster: null,
      question: null,
      result: null,
      loading: false,
      error: null,
      isBattleActive: false,
      showConfetti: false,
      showShake: false,
    }),

  triggerAutoEncounter: async (zone) => {
    if (!zone) return;
    if (get().isBattleActive || get().loading) return;
    const now = Date.now();
    if (now - get().lastEncounterAt < AUTO_COOLDOWN_MS) return;
    if (Math.random() > AUTO_PROBABILITY) return;
    await get().startEncounter({ category: zone.category });
  },
}));
