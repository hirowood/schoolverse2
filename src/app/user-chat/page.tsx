"use client";

import { UserChat } from "@/components/user-chat";

export default function UserChatPage() {
  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">User Dialogue</p>
        <h1 className="text-3xl font-semibold text-slate-900">ユーザーチャット</h1>
        <p className="text-base text-slate-600">
          他のユーザーとDM・グループでやり取りできます。WebSocketでリアルタイム更新、既読・入力中を表示。
        </p>
      </header>
      <UserChat />
    </div>
  );
}
