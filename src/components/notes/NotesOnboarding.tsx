"use client";

import { useId } from "react";

const ONBOARDING_STEPS = [
  {
    title: "テンプレート活用",
    description: "5W2H / 5Why 形式で思考を整理すると、振り返りがスピードアップします。",
  },
  {
    title: "キャンバスで可視化",
    description: "図形・文字・描画・画像を組み合わせて学習プランや考察を見える化できます。",
  },
  {
    title: "カメラ + OCR",
    description: "スマホカメラで撮影→OCRでテキスト抽出。撮ってすぐキャンバスに配置。",
  },
  {
    title: "画像とタグで整理",
    description: "画像を添付し、タグや共有フラグを付けて支援者に届けましょう。",
  },
] as const;

interface NotesOnboardingProps {
  onClose: () => void;
}

export default function NotesOnboarding({ onClose }: NotesOnboardingProps) {
  const id = useId();
  return (
    <section
      aria-label="ノート機能オンボーディング"
      className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50/80 to-sky-50 p-4 shadow-lg sm:p-6"
    >
      <div className="flex items-start justify-between gap-3 sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">ノートガイド</p>
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
            Schoolverse2 ノートを使いこなす
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            テンプレート、キャンバス、OCR を組み合わせて、学習の気づきを残しましょう。
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-medium text-slate-500 underline-offset-4 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-400"
        >
          閉じる
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {ONBOARDING_STEPS.map((step, index) => (
          <article
            key={`${id}-${step.title}`}
            className="rounded-2xl border border-white/50 bg-white/80 p-3 text-sm text-slate-700 shadow-sm backdrop-blur"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Step {index + 1}
            </p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">{step.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{step.description}</p>
          </article>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600">
        <span className="text-[11px] italic text-slate-500">モバイルでも快適に操作できます</span>
        <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-emerald-700">
          📱Responsive
        </span>
      </div>
    </section>
  );
}
