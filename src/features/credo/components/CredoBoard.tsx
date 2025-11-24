// src/components/credo/CredoBoard.tsx

import { CREDO_ITEMS } from "@/features/credo/config";

export function CredoBoard() {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium text-slate-900">クレド一覧</h2>
      <ul className="space-y-1">
        {CREDO_ITEMS.map((item) => (
          <li
            key={item.id}
            className="rounded-md border border-slate-200 bg-white px-3 py-2"
          >
            <div className="text-sm font-semibold">
              {item.order}. {item.title}
            </div>
            <div className="text-xs text-slate-500">{item.category}</div>
            <p className="mt-1 text-xs text-slate-600">{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
