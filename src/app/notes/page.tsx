"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NotesOnboarding from "@/components/notes/NotesOnboarding";

interface NoteRecord {
  id: string;
  title: string;
  templateType?: string | null;
  updatedAt?: string | null;
}

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // ノート一覧取得
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch("/api/notes");
        if (!res.ok) throw new Error("Failed to fetch notes");
        const data = await res.json();
        setNotes(data.notes as NoteRecord[]);
      } catch (e) {
        console.error("Failed to load notes:", e);
      } finally {
        setLoading(false);
      }
    };
    void fetchNotes();
  }, []);

  // テンプレートからノート作成開始
  const startWithTemplate = (template: string | null) => {
    const params = new URLSearchParams();
    if (template) params.set("template", template);
    router.push(`/notes/canvas${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4">
      {/* ヘッダー */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            ノート一覧
          </h1>
          <p className="text-sm text-slate-600">
            テンプレートを選んで新しいノートを作成するか、既存ノートを開きます。
          </p>
        </div>
      </header>

      {/* オンボーディング（ガイド） */}
      <NotesOnboarding onClose={() => { /* 今は閉じるだけ */ }} />

      {/* テンプレ選択エリア */}
      <section className="mt-2 grid gap-3 md:grid-cols-3">
        <button
          type="button"
          onClick={() => startWithTemplate(null)}
          className="rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm hover:border-slate-300 hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Template
          </p>
          <h2 className="mt-1 text-base font-semibold text-slate-900">
            フリーキャンバス
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            何もないキャンバスから自由に図解・メモできます。
          </p>
        </button>

        <button
          type="button"
          onClick={() => startWithTemplate("5w2h")}
          className="rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm hover:border-slate-300 hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Template
          </p>
          <h2 className="mt-1 text-base font-semibold text-slate-900">
            5W2H ノート
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            誰が / 何を / なぜ / いつ / どこで / どのように / いくらで を整理して、
            タスクや出来事を構造化します。
          </p>
        </button>

        <button
          type="button"
          onClick={() => startWithTemplate("5why")}
          className="rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm hover:border-slate-300 hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Template
          </p>
          <h2 className="mt-1 text-base font-semibold text-slate-900">
            5Why ノート
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            「なぜ？」を5回くり返して原因を深堀りし、気づきと対策をまとめます。
          </p>
        </button>
      </section>

      {/* ノート一覧 */}
      <section className="mt-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">
          最近のノート
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-slate-500">
            読み込み中...
          </div>
        ) : notes.length === 0 ? (
          <p className="py-4 text-sm text-slate-500">
            まだノートはありません。上のテンプレートから作成してみてください。
          </p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {notes.map((note) => (
              <li key={note.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <Link
                    href={`/notes/canvas?id=${note.id}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {note.title || "無題のノート"}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    {note.templateType && (
                      <span className="rounded-full border border-slate-200 px-2 py-[2px]">
                        {note.templateType}
                      </span>
                    )}
                    {note.updatedAt && (
                      <span>{new Date(note.updatedAt).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/notes/canvas?id=${note.id}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  開く →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}