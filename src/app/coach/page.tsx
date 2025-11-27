// src/app/coach/page.tsx
"use client";

import { useState, type ReactNode } from "react";
import { ChatPanel, PlanPanel, UsageGuide } from "@/components/coach";

type Tab = "chat" | "plan";

type TabDefinition = {
  id: Tab;
  label: string;
  renderPanel: () => ReactNode;
  panelWrapperClassName?: string;
};

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
  const activeTabDefinition =
    TAB_DEFINITIONS.find((tab) => tab.id === activeTab) ?? TAB_DEFINITIONS[0];

  return (
    <div className="flex h-full flex-col gap-4">
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
