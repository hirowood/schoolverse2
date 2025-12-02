"use client";

import { FormEvent } from "react";
import { CategorySelector } from "./CategorySelector";
import { LearningCategory } from "@/features/learning-chat/types";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  category: LearningCategory | null;
  setCategory: (category: LearningCategory | null) => void;
};

export function MessageInput({
  value,
  onChange,
  onSend,
  disabled = false,
  category,
  setCategory,
}: Props) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSend();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <CategorySelector value={category} onChange={setCategory} />
      </div>
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="質問や相談内容を入力..."
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
          rows={3}
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={disabled || value.trim().length === 0}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
        >
          送信
        </button>
      </div>
    </form>
  );
}
