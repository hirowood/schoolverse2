import type { Rarity } from "@/types/gamification";

export const RARITY_STYLES: Record<
  Rarity,
  { label: string; color: string; bg: string; border: string }
> = {
  common: {
    label: "コモン",
    color: "#1f2937",
    bg: "bg-slate-100",
    border: "border-slate-200",
  },
  rare: {
    label: "レア",
    color: "#2563eb",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  epic: {
    label: "エピック",
    color: "#7c3aed",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  legendary: {
    label: "レジェンド",
    color: "#d97706",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
};

export const getRarityStyle = (rarity: Rarity | string) => {
  if (rarity in RARITY_STYLES) {
    return RARITY_STYLES[rarity as Rarity];
  }
  return RARITY_STYLES.common;
};
