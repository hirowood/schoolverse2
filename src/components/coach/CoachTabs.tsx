"use client";

import { cn } from "@/lib/cn";

/**
 * CoachTabs
 *
 * AIコーチページ専用のタブUI。
 * - スマホでも押しやすいように `min-h-11` を固定（44px相当）
 * - `role="tablist"` / `role="tab"` を付与して、アクセシビリティも最低限担保
 */

export type CoachTabDefinition<T extends string> = {
  id: T;
  label: string;
};

type Props<T extends string> = {
  tabs: CoachTabDefinition<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  className?: string;
};

export function CoachTabs<T extends string>({ tabs, activeTab, onChange, className }: Props<T>) {
  return (
    <div className={cn("flex gap-2 border-b border-slate-200", className)} role="tablist" aria-label="AIコーチのタブ">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex-1 min-h-11 px-4 py-3 text-sm font-semibold transition sm:flex-none sm:py-2",
            activeTab === tab.id
              ? "border-b-2 border-emerald-500 text-emerald-700"
              : "text-slate-600 hover:text-slate-900",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

