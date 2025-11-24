// src/features/credo/components/CredoBoard.tsx

import { CREDO_ITEMS } from "@/features/credo/config";
import type { CredoBoardProps, CredoId } from "@/features/credo/types";

const statusLabel = (done?: boolean) =>
  done ? "今日やった" : "未チェック";

export function CredoBoard({
  items = CREDO_ITEMS,
  doneMap,
  onSelect,
}: CredoBoardProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium text-slate-900">クレド一覧</h2>
      <ul className="space-y-2">
        {items.map((item) => {
          const done = doneMap?.[item.id as CredoId];
          return (
            <li
              key={item.id}
              className={`rounded-md border border-slate-200 bg-white px-3 py-2 transition hover:border-slate-300 hover:shadow-sm ${
                onSelect ? "cursor-pointer" : ""
              }`}
              onClick={() => onSelect?.(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect?.(item);
                }
              }}
              role={onSelect ? "button" : undefined}
              tabIndex={onSelect ? 0 : -1}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div
                    className={`text-sm font-semibold ${
                      done ? "line-through text-slate-400" : "text-slate-900"
                    }`}
                  >
                    {item.order}. {item.title}
                  </div>
                  <div className="text-xs text-slate-500">{item.category}</div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    done
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {statusLabel(done)}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600">{item.description}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
