"use client";

import type { UserPreview } from "@/features/user-chat/types";
import { Button } from "@/components/ui/Button";
import { cardClassName } from "@/components/ui/Card";

type Props = {
  value: string;
  results: UserPreview[];
  onChange: (value: string) => void;
  onSearch: () => void;
  onSelect: (user: UserPreview) => void;
};

export function UserSearch({ value, results, onChange, onSearch, onSelect }: Props) {
  return (
    <div className="space-y-3">
      <div className={cardClassName({ variant: "subtle", radius: "xl", padding: "sm", className: "flex items-center gap-2" })}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ユーザー検索 (メール/名前)"
          className="w-full bg-transparent px-2 py-2 text-base outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch();
          }}
        />
        <Button variant="solid" color="slate" size="tap" className="rounded-xl px-4" onClick={onSearch}>
          検索
        </Button>
      </div>

      {results.length > 0 && (
        <div className={cardClassName({ radius: "xl", padding: "none", className: "max-h-56 overflow-y-auto" })}>
          {results.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => onSelect(u)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-base transition hover:bg-slate-50"
            >
              <span className="font-medium text-slate-900">{u.name ?? u.email ?? u.id}</span>
              <span className="text-sm font-semibold text-slate-500">DM開始</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

