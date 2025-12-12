"use client";

import { ChatMode } from "@/features/learning-chat/types";
import { buttonClassName } from "@/components/ui/Button";

const FILTERS: Array<{ id: ChatMode | "all"; label: string; emoji: string }> = [
  { id: "all", label: "すべて", emoji: "🌐" },
  { id: ChatMode.LEARNING, label: "学習", emoji: "📘" },
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
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {FILTERS.map((filter) => {
        const isActive = mode === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            className={buttonClassName({
              variant: isActive ? "solid" : "soft",
              color: "slate",
              size: "chip",
              rounded: "full",
              className: "gap-1",
            })}
          >
            <span>{filter.emoji}</span>
            <span>{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
}
