"use client";

import type { ReactNode } from "react";

export type OnboardingStep = {
  title: string;
  detail: string;
};

interface OnboardingPanelProps {
  show: boolean;
  title: string;
  description: string;
  steps: OnboardingStep[];
  onClose: () => void;
  highlight?: ReactNode;
}

export default function OnboardingPanel({
  show,
  title,
  description,
  steps,
  onClose,
  highlight,
}: OnboardingPanelProps) {
  if (!show) return null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 shadow-lg sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Onboarding</p>
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{title}</h2>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-900"
        >
          閉じる
        </button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {steps.map((step, index) => (
          <article key={step.title} className="rounded-2xl border border-slate-200 bg-white/70 p-3 text-sm text-slate-700 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-slate-500">STEP {index + 1}</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">{step.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{step.detail}</p>
          </article>
        ))}
      </div>
      {highlight && <div className="mt-4 text-xs text-slate-500">{highlight}</div>}
    </section>
  );
}
