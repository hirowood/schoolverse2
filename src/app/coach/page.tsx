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
    title: "AIコーチとおしゃべり",
    detail: "自由な質問を入力すると、Claudeベースのコーチがすぐに応答してくれます。",
  },
  {
    title: "学習プラン生成",
    detail: "Planタブでテーマや時間を入力し、AIにプランを作ってもらう流れを試してみましょう。",
  },
  {
    title: "Usage Guide活用",
    detail: "使い方ガイドには例文やトーン変更のヒントが載っており、参照するとより便利です。",
  },
];

const TAB_DEFINITIONS: TabDefinition[] = [
  {
    id: "chat",
    label: "AIチャット",
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
          title="AIコーチの使い方"
          description="チャット・プラン生成・使い方ガイドの使いどころを確認しましょう。"
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
            Onboardingを再表示
          </button>
        </div>
      )}

      <header className="space-y-1">
        <p className="text-xs font-medium text-slate-500">AI Coach</p>
        <h1 className="text-2xl font-semibold">AIコーチ</h1>
        <p className="text-sm text-slate-600">
          その日の気分や課題をチャットで共有すると、学習の伴走役としてアドバイスします。
        </p>
      </header>

      <UsageGuide />

      <div className="flex border-b border-slate-200">
        {TAB_DEFINITIONS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={px-4 py-2 text-sm font-medium transition }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={lex-1 min-h-0 }>
        {activeTabDefinition.renderPanel()}
      </div>
    </div>
  );
}
