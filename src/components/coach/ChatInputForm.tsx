"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";

type Props = {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => Promise<void> | void;
  isSending: boolean;
  disabled: boolean;
};

export const ChatInputForm = ({ input, setInput, onSubmit, isSending, disabled }: Props) => (
  <form onSubmit={onSubmit} className="border-t border-slate-200 p-3 sm:p-4">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <textarea
        className="w-full flex-1 resize-none rounded-md border border-slate-300 px-3 py-2.5 text-base sm:text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-50 disabled:text-slate-400"
        rows={3}
        maxLength={500}
        placeholder="例: 最近の状況を教えて / 気になっていることを相談"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
      />
      <Button
        type="submit"
        variant="solid"
        color="slate"
        size="tap"
        className="min-h-11 w-full shadow-sm sm:w-auto"
        disabled={disabled || isSending}
      >
        {isSending ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            送信中
          </span>
        ) : (
          "送信"
        )}
      </Button>
    </div>
    <p className="mt-2 text-xs text-slate-400">Shift + Enter で改行 / Enter で送信</p>
  </form>
);
