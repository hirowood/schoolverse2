// src/app/coach/page.tsx
"use client";

import { useState } from "react";
import { ChatPanel, PlanPanel, UsageGuide } from "@/components/coach";

type Tab = "chat" | "plan";

export default function CoachPage() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");

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
        <button
          type="button"
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === "chat"
              ? "border-b-2 border-slate-900 text-slate-900"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          💬 チャット
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("plan")}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === "plan"
              ? "border-b-2 border-slate-900 text-slate-900"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          📋 学習プラン
        </button>
      </div>

      {/* タブコンテンツ */}
      <div className="flex-1 min-h-0">
        {activeTab === "chat" && (
          <div className="h-[500px]">
            <ChatPanel />
          </div>
        )}
        {activeTab === "plan" && <PlanPanel />}
      </div>
    </div>
  );
}
