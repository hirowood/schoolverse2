"use client";

import { ChatMode } from "@/features/learning-chat/types";

const FILTERS: Array<{ id: ChatMode | "all"; label: string; emoji: string }> = [
  { id: "all", label: "すべて", emoji: "✨" },
  { id: ChatMode.LEARNING, label: "学習", emoji: "🎓" },
  { id: ChatMode.CAREER, label: "進路", emoji: "🎯" },
  { id: ChatMode.GENERAL, label: "一般", emoji: "💬" },
];

export function ModeFilter({
  mode,
  onChange,
}: {
  mode: ChatMode | "all";
  onChange: (mode: ChatMode | "all") => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 rounded-lg bg-slate-50 p-1 text-xs font-semibold text-slate-700">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          type="button"
          onClick={() => onChange(filter.id)}
          className={`flex items-center justify-center gap-1 rounded-md px-2 py-1 transition ${
            mode === filter.id ? "bg-white shadow-sm" : "hover:bg-white/70"
          }`}
        >
          <span>{filter.emoji}</span>
          <span>{filter.label}</span>
        </button>
      ))}
    </div>
  );
}
