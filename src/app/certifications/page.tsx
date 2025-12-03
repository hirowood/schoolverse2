"use client";

import Link from "next/link";
import { CURRICULUM_MAP } from "@/lib/curriculum/map";

export default function CertificationsPage() {
  const certifications = CURRICULUM_MAP.contentLines.certifications[0]?.children ?? [];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">資格学習</p>
        <h1 className="text-2xl font-semibold text-slate-900">資格カリキュラム一覧</h1>
        <p className="text-sm text-slate-600">
          ITパスポート・基本情報・応用情報・情報I の学習ルートをまとめました。各資格を選ぶと詳細ページへ移動します。
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {certifications.map((cert) => (
          <Link
            key={cert.id}
            href={`/certifications/${cert.id}`}
            className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-900">{cert.name}</h2>
              <span className="text-xs font-semibold text-emerald-600">学習する →</span>
            </div>
            {cert.description && <p className="mt-2 text-sm text-slate-600">{cert.description}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
