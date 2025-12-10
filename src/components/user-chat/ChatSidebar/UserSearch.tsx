import type { UserPreview } from "@/features/user-chat/types";

type Props = {
  value: string;
  results: UserPreview[];
  onChange: (value: string) => void;
  onSearch: () => void;
  onSelect: (user: UserPreview) => void;
};

export function UserSearch({ value, results, onChange, onSearch, onSelect }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ユーザー検索 (メール/名前)"
          className="w-full bg-transparent text-sm outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch();
          }}
        />
        <button
          type="button"
          onClick={onSearch}
          className="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
        >
          検索
        </button>
      </div>
      {results.length > 0 && (
        <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          {results.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => onSelect(u)}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
            >
              <span>{u.name ?? u.email ?? u.id}</span>
              <span className="text-[11px] text-slate-500">DM開始</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
