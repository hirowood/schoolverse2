"use client";

import Link from "next/link";
import { CURRICULUM_MAP } from "@/lib/curriculum/map";

type ReactNode = { id: string; name: string; description?: string | null; children?: ReactNode[] };

const ROOT = CURRICULUM_MAP.contentLines.react?.[0] as ReactNode | undefined;

export default function ReactCurriculumRootPage() {
  if (!ROOT) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="text-sm text-red-600">Reactカリキュラムが見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-3 text-sm text-emerald-700">
        <Link href="/curriculum-map" className="underline hover:text-emerald-900">
          ← カリキュラムマップ
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">React Curriculum</p>
        <h1 className="text-3xl font-semibold text-slate-900">{ROOT.name}</h1>
        {ROOT.description && <p className="text-sm text-slate-600">{ROOT.description}</p>}
      </header>

      <section className="space-y-4">
        {ROOT.children?.map((part) => (
          <div key={part.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-slate-900">{part.name}</h2>
                {part.description && <p className="text-sm text-slate-600">{part.description}</p>}
              </div>
              <Link
                href={`/curriculum/react/${part.id}`}
                className="text-sm text-emerald-700 underline hover:text-emerald-900"
              >
                ステップ一覧へ
              </Link>
            </div>

            {part.children && part.children.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {part.children.map((step) => (
                  <Link
                    key={step.id}
                    href={`/curriculum/react/${step.id}`}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm hover:border-emerald-300 hover:bg-white"
                  >
                    {step.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
