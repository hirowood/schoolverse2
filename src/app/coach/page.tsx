// src/app/coach/page.tsx
"use client";

import { useState, type ReactNode } from "react";
import OnboardingPanel, { type OnboardingStep } from "@/components/OnboardingPanel";
import { ChatPanel, PlanPanel, UsageGuide } from "@/components/coach";

type Tab = "chat" | "plan";

type TabDefinition = {
  id: Tab;
  label: string;
  renderPanel: () => ReactNode;
  panelWrapperClassName?: string;
};

const COACH_ONBOARDING_KEY = "schoolverse2-onboarding-coach";
const COACH_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "チャットで整理",
    detail: "AIコーチとのチャットで今日の悩みや目標を入力し、Claude から具体的な助言を得ます。",
  },
  {
    title: "Plan タブで提案確認",
    detail: "Plan タブを開くと AI が学習プランを提案。必要に応じてタスク・時間を調整できます。",
  },
  {
    title: "Usage Guide を活用",
    detail: "Usage Guide から使い方・コーチトーンのヒントを確認し、操作に慣れましょう。",
  },
];

const TAB_DEFINITIONS: TabDefinition[] = [
  {
    id: "chat",
    label: "?? �`���b�g",
    panelWrapperClassName: "h-[500px]",
    renderPanel: () => <ChatPanel />,
  },
  {
    id: "plan",
    label: "?? �w�K�v����",
    renderPanel: () => <PlanPanel />,
  },
];

export default function CoachPage() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(COACH_ONBOARDING_KEY) !== "1";
  });
  const activeTabDefinition =
    TAB_DEFINITIONS.find((tab) => tab.id === activeTab) ?? TAB_DEFINITIONS[0];

  const handleDismissOnboarding = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(COACH_ONBOARDING_KEY, "1");
    setShowOnboarding(false);
  };

  const handleShowOnboarding = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(COACH_ONBOARDING_KEY);
    setShowOnboarding(true);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {showOnboarding && (
        <OnboardingPanel
          show
          title="AIコーチの活用法"
          description="チャット・プラン・Usage Guide を活用して、日々の学習を整えましょう。"
          steps={COACH_ONBOARDING_STEPS}
          onClose={handleDismissOnboarding}
        />
      )}
      {!showOnboarding && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleShowOnboarding}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Onboardingを再表示
          </button>
        </div>
      )}
      {/* ヘッダー */}
      <header className="space-y-1">
        <p className="text-xs font-medium text-slate-500">AI Coach</p>
        <h1 className="text-2xl font-semibold">AIコーチ</h1>
        <p className="text-sm text-slate-600">
          今日の課題や気分を送ると、クレドに沿った一歩を提案します。
        </p>
      </header>

      {/* 使い方ガイド */}
      <UsageGuide />

      {/* タブ切り替え */}
      <div className="flex border-b border-slate-200">
        {TAB_DEFINITIONS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? "border-b-2 border-slate-900 text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div
        className={`flex-1 min-h-0 ${activeTabDefinition.panelWrapperClassName ?? ""}`}
      >
        {activeTabDefinition.renderPanel()}
      </div>
    </div>
  );
}
