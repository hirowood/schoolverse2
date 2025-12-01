"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface MindMapListItem {
  id: string;
  title: string;
  updatedAt: string;
}

export default function MindMapListPage() {
  const [items, setItems] = useState<MindMapListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/mindmap");
        if (!res.ok) throw new Error("一覧を取得できませんでした");
        const data = await res.json();
        const maps: MindMapListItem[] = (data.mindmaps ?? []).map((m: any) => ({
          id: m.id,
          title: m.title,
          updatedAt: m.updatedAt,
        }));
        setItems(maps);
      } catch (e) {
        setError(e instanceof Error ? e.message : "エラーが発生しました");
      }
    };
    void load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">マインドマップ一覧</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">マインドマップ</h1>
        </div>
        <Link
          href="/mindmap/new"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          新規作成
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/mindmap/${item.id}`}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-500"
          >
            <p className="text-base font-semibold text-slate-900 dark:text-white">{item.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">更新: {new Date(item.updatedAt).toLocaleString()}</p>
          </Link>
        ))}
        {items.length === 0 && !error && (
          <p className="text-sm text-slate-600 dark:text-slate-400">まだマインドマップがありません。</p>
        )}
      </div>
    </div>
  );
}
