import type { CredoItem } from "../types/credo";

type CredoCardProps = {
  item: CredoItem;
};

/**
 * クレド1件ぶんのカードコンポーネント
 * - タイトル
 * - コード（#01 など）
 * - 短い説明＆詳細
 */
export function CredoCard({ item }: CredoCardProps) {
 return (
    <article className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <header className="mb-1 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-400">#{item.order}</p>
        <p className="text-[11px] text-slate-400">{item.category}</p>
      </header>

      <h2 className="text-sm font-semibold text-slate-900">{item.title}</h2>

      <p className="mt-1 text-xs text-slate-600">{item.description}</p>
    </article>
  );
}
