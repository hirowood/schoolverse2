"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { CURRICULUM_MAP } from "@/lib/curriculum/map";

type ReactNode = { id: string; name: string; description?: string | null; children?: ReactNode[] };

function findNode(id: string): ReactNode | null {
  const root = CURRICULUM_MAP.contentLines.react?.[0];
  if (!root) return null;
  const stack: ReactNode[] = [root];
  while (stack.length) {
    const node = stack.pop()!;
    if (node.id === id) return node;
    node.children?.forEach((c) => stack.push(c));
  }
  return null;
}

export default function ReactCurriculumPage({ params }: { params: { id: string } }) {
  const node = findNode(params.id);
  if (!node) return notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center gap-3 text-sm text-emerald-700">
        <Link href="/curriculum-map" className="underline hover:text-emerald-900">
          ← カリキュラムマップ
        </Link>
        <Link href="/curriculum/react" className="underline hover:text-emerald-900">
          React カリキュラム一覧
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">React Curriculum</p>
        <h1 className="text-2xl font-semibold text-slate-900">{node.name}</h1>
        {node.description && <p className="text-sm text-slate-600">{node.description}</p>}
      </header>

      {node.children && node.children.length > 0 && (
        <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">ステップ</h2>
          <div className="flex flex-wrap gap-2">
            {node.children.map((c) => (
              <Link
                key={c.id}
                href={`/curriculum/react/${c.id}`}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm hover:border-emerald-300 hover:bg-white"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {!node.children?.length && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
          <p className="text-sm text-slate-700">
            まだ詳細教材はありません。マップに戻るか、上位のステップから進んでください。
          </p>
        </section>
      )}
    </div>
  );
}
