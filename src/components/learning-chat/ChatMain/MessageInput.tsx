"use client";

import { FormEvent } from "react";
import { CategorySelector } from "./CategorySelector";
import { LearningCategory } from "@/features/learning-chat/types";
import { Button } from "@/components/ui/Button";

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

  const canSend = !disabled && value.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <CategorySelector value={category} onChange={setCategory} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="質問や相談内容を入力..."
          className="min-h-[120px] flex-1 rounded-2xl border border-slate-200/80 px-4 py-3 text-base shadow-inner focus:border-slate-400 focus:outline-none"
          rows={4}
          disabled={disabled}
        />
        <Button
          type="submit"
          disabled={!canSend}
          variant="solid"
          color="slate"
          size="tap"
          className="w-full rounded-2xl sm:w-40"
        >
          送信
        </Button>
      </div>
    </form>
  );
}
