"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CurriculumLineCard } from "@/components/curriculum/CurriculumLineCard";
import { useCurriculum } from "@/hooks/useCurriculum";

export default function CurriculumIndexPage() {
  const { lines, linesLoading, linesError, fetchLines } = useCurriculum();
  const [query, setQuery] = useState("");

  useEffect(() => {
    void fetchLines();
  }, [fetchLines]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return lines;
    return lines.filter(
      (line) =>
        line.title.toLowerCase().includes(q) ||
        line.summary.toLowerCase().includes(q) ||
        line.units.some((u) => u.title.toLowerCase().includes(q) || (u.description ?? "").toLowerCase().includes(q)),
    );
  }, [lines, query]);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Curriculum</p>
          <h1 className="text-3xl font-semibold text-slate-900">カリキュラム一覧</h1>
          <p className="text-sm text-slate-600">学びたいラインを選んで進捗を確認しましょう。</p>
        </div>
        <Link
          href="/curriculum-map"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          カリキュラムマップ →
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <input
          type="search"
          placeholder="React / フロントエンド などで検索"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
        />
      </div>

      {linesError && (
        <div className="rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">{linesError}</div>
      )}

      {linesLoading && !lines.length && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-32 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      )}

      {!linesLoading && filtered.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
          条件に合うラインが見つかりませんでした。
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((line) => (
          <CurriculumLineCard key={line.id} line={line} />
        ))}
      </div>
    </main>
  );
}
