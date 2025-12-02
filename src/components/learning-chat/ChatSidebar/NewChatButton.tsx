"use client";

import { ChatMode, LearningCategory } from "@/features/learning-chat/types";

type Props = {
  onCreate: (mode?: ChatMode, category?: LearningCategory) => Promise<unknown>;
};

export function NewChatButton({ onCreate }: Props) {
  return (
    <button
      type="button"
      onClick={() => onCreate()}
      className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
    >
      ＋ 新規チャット
    </button>
  );
}
