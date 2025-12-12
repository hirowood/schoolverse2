"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, type ReactNode } from "react";
import OnboardingPanel, { type OnboardingStep } from "@/components/OnboardingPanel";
import { ChatPanel, CoachTabs, PlanPanel, UsageGuide } from "@/components/coach";
import { Button } from "@/components/ui/Button";

type Tab = "chat" | "plan";

type TabDefinition = {
  id: Tab;
  label: string;
  renderPanel: () => ReactNode;
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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const activeTabDefinition =
    TAB_DEFINITIONS.find((tab) => tab.id === activeTab) ?? TAB_DEFINITIONS[0];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = window.localStorage.getItem(COACH_ONBOARDING_KEY) === "1";
    setShowOnboarding(!dismissed);
  }, []);

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
    <div className="flex h-full flex-col gap-3 sm:gap-4">
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
          <Button variant="outline" rounded="full" size="tap" className="min-h-11" onClick={handleShowOnboarding}>
            オンボーディングを再表示
          </Button>
        </div>
      )}

      <header className="space-y-1">
        <p className="text-xs font-medium text-slate-500">AI Coach</p>
        <h1 className="text-2xl font-semibold">AIコーチ</h1>
        <p className="text-sm text-slate-600">
          AIと対話しながら今日の課題や学習の進め方を整理して、次の一歩を決めましょう。
        </p>
      </header>

      {/* モバイルはコンパクト表示で、チャット領域を確保する */}
      <div className="sm:hidden">
        <UsageGuide compact />
      </div>
      <div className="hidden sm:block">
        <UsageGuide />
      </div>

      <CoachTabs tabs={TAB_DEFINITIONS} activeTab={activeTab} onChange={(tab) => setActiveTab(tab)} />

      <div className="flex-1 min-h-0">{activeTabDefinition.renderPanel()}</div>
    </div>
  );
}
