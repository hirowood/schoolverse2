"use client";

// フィルターと検索をまとめた軽量コンポーネント（再利用しやすいように分離）
import type { ReactNode } from "react";
import type { NoteTemplateType } from "@/lib/notes/types";
import { NOTE_TEMPLATE_OPTIONS } from "@/lib/notes/templates";
import { Button } from "@/components/ui/Button";
import { cardClassName } from "@/components/ui/Card";

type FilterValue = NoteTemplateType | "all";

type Props = {
  filterType: FilterValue;
  pendingSearch: string;
  onFilterChange: (value: FilterValue) => void;
  onSearchChange: (value: string) => void;
  onSearchApply: () => void;
};

/**
 * Notesのフィルター用「チップボタン」。
 * - className の重複を避けるため、active 状態だけを切り替え可能にする。
 * - 見た目の統一を優先しつつ、必要なら className で局所上書きできる。
 */
function FilterChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      rounded="full"
      size="chip"
      variant="outline"
      color={active ? "emerald" : "slate"}
      onClick={onClick}
      className={
        active
          ? undefined
          : "border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-400"
      }
    >
      {children}
    </Button>
  );
}

export function NotesFilters({ filterType, pendingSearch, onFilterChange, onSearchChange, onSearchApply }: Props) {
  return (
    <section className={cardClassName({ className: "space-y-4" })}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">表示フィルター</p>
        <FilterChipButton active={filterType === "all"} onClick={() => onFilterChange("all")}>
          すべて
        </FilterChipButton>
        {NOTE_TEMPLATE_OPTIONS.map((template) => (
          <FilterChipButton
            key={template.id}
            active={filterType === template.id}
            onClick={() => onFilterChange(template.id)}
          >
            {template.label}
          </FilterChipButton>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <input
            type="search"
            placeholder="タイトル/本文を検索"
            value={pendingSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm dark:border-slate-600 dark:bg-slate-700"
          />
          <Button
            variant="solid"
            color="slate"
            size="tap"
            onClick={onSearchApply}
            className="dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            検索
          </Button>
        </div>
      </div>
    </section>
  );
}
