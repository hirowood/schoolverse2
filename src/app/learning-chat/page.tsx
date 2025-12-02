"use client";

import { LearningChat } from "@/components/learning-chat";

export default function LearningChatPage() {
  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <p className="text-xs font-semibold text-slate-500">Learning Dialogue</p>
        <h1 className="text-2xl font-semibold text-slate-900">学習チャット</h1>
        <p className="text-sm text-slate-600">
          学習相談・進路相談・一般相談をモード別に切り替えながら、AIコーチと対話できます。
        </p>
      </header>

      <LearningChat />
    </div>
  );
}
