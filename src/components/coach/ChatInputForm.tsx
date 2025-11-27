"use client";

import type { FormEvent } from "react";

type Props = {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => Promise<void> | void;
  isSending: boolean;
  disabled: boolean;
};

export const ChatInputForm = ({ input, setInput, onSubmit, isSending, disabled }: Props) => (
  <form onSubmit={onSubmit} className="border-t border-slate-200 p-3">
    <div className="flex items-end gap-2">
      <textarea
        className="flex-1 resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-50 disabled:text-slate-400"
        rows={2}
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
      <button
        type="submit"
        disabled={disabled || isSending}
        className="h-10 rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSending ? (
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
            送信中
          </span>
        ) : (
          "送信"
        )}
      </button>
    </div>
    <p className="mt-1 text-xs text-slate-400">Shift + Enter で改行 / Enter で送信</p>
  </form>
);
