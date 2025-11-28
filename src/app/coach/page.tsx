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
    title: "AIコーチとは？",
    detail: "ClaudeベースのAIと相談しながら学習プランや振り返りを進めます。",
  },
  {
    title: "タスク管理",
    detail: "Planタブで学習タスクの進捗を整理し、AIのアドバイスを反映させましょう。",
  },
  {
    title: "使い方ガイド",
    detail: "Usage Guideから操作ヒントを確認して、安心して使いこなせます。",
  },
];

const TAB_DEFINITIONS: TabDefinition[] = [
  {
    id: "chat",
    label: "チャット",
    panelWrapperClassName: "h-[500px]",
    renderPanel: () => <ChatPanel />,
  },
  {
    id: "plan",
    label: "学習プラン",
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
      {showOnboarding ? (
        <OnboardingPanel
          show
          title="AIコーチのはじめかた"
          description="初回はこのガイドで基本操作を確認できます。あとで再表示することも可能です。"
          steps={COACH_ONBOARDING_STEPS}
          onClose={handleDismissOnboarding}
        />
      ) : (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleShowOnboarding}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            オンボーディングを再表示
          </button>
        </div>
      )}

      <header className="space-y-1">
        <p className="text-xs font-medium text-slate-500">AI Coach</p>
        <h1 className="text-2xl font-semibold">AIコーチ</h1>
        <p className="text-sm text-slate-600">
          AIと対話しながら今日の課題や学習の進め方を整理して、次の一歩を決めましょう。
        </p>
      </header>

      <UsageGuide />

      <div className="flex border-b border-slate-200">
        {TAB_DEFINITIONS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? "border-b-2 border-emerald-500 text-emerald-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0">{activeTabDefinition.renderPanel()}</div>
    </div>
  );
}
