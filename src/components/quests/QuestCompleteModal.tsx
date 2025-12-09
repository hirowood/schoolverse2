"use client";

import { useState } from "react";
import type { TodayQuest } from "@/types/quest";

type Props = {
  quest?: TodayQuest | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { note?: string; rating?: number; actualMinutes?: number }) => void;
};

export function QuestCompleteModal({ quest, open, onClose, onSubmit }: Props) {
  const [note, setNote] = useState("");
  const [rating, setRating] = useState<number | undefined>();
  const [actualMinutes, setActualMinutes] = useState<number | undefined>();

  if (!open || !quest) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">🎉 クエスト完了！</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-slate-500 hover:text-slate-700"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <div className="text-sm font-semibold text-slate-900">{quest.title}</div>
          <div className="text-xs text-slate-600">{quest.description}</div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">振り返りメモ（任意）</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              rows={3}
              placeholder="気づきや改善点をメモ"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">所要時間（分）</label>
              <input
                type="number"
                min={0}
                value={actualMinutes ?? ""}
                onChange={(e) => setActualMinutes(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="例: 25"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">評価（1-5）</label>
              <input
                type="number"
                min={1}
                max={5}
                value={rating ?? ""}
                onChange={(e) => setRating(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="例: 4"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={() => onSubmit({ note, rating, actualMinutes })}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            完了する
          </button>
        </div>
      </div>
    </div>
  );
}
