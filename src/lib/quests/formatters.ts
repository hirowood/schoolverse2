import type { QuestCategory, QuestDifficulty } from "@/types/quest";

export const CATEGORY_META: Record<
  QuestCategory,
  { label: string; icon: string; color: string; bg: string; border: string }
> = {
  learning: { label: "学習内容", icon: "📚", color: "#2563eb", bg: "bg-blue-50", border: "border-blue-200" },
  life_habit: { label: "生活習慣", icon: "🛏️", color: "#7c3aed", bg: "bg-purple-50", border: "border-purple-200" },
  health: { label: "健康管理", icon: "💪", color: "#16a34a", bg: "bg-green-50", border: "border-green-200" },
  learning_attitude: { label: "学習姿勢", icon: "🎯", color: "#f97316", bg: "bg-orange-50", border: "border-orange-200" },
  note_quality: { label: "ノート品質", icon: "📝", color: "#eab308", bg: "bg-yellow-50", border: "border-yellow-200" },
  credo: { label: "Credo", icon: "🙏", color: "#ec4899", bg: "bg-pink-50", border: "border-pink-200" },
  social: { label: "社交", icon: "👥", color: "#06b6d4", bg: "bg-cyan-50", border: "border-cyan-200" },
};

export const DIFFICULTY_META: Record<
  QuestDifficulty,
  { label: string; stars: number; bg: string; text: string }
> = {
  easy: { label: "かんたん", stars: 1, bg: "bg-green-50", text: "text-green-700" },
  medium: { label: "ふつう", stars: 2, bg: "bg-yellow-50", text: "text-yellow-700" },
  hard: { label: "チャレンジ", stars: 3, bg: "bg-red-50", text: "text-red-700" },
};

export const formatMinutes = (minutes: number | undefined) => {
  if (!minutes || minutes <= 0) return "約0分";
  if (minutes < 60) return `約${minutes}分`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `約${h}時間` : `約${h}時間${m}分`;
};

export const formatXp = (xp: number | undefined) => `+${xp ?? 0} XP`;
