// src/components/credo/CredoDailyForm.tsx
"use client";

import { useMemo, useState } from "react";
import { CREDO_ITEMS } from "@/features/credo/config";
import type {
  CredoDailyFormState,
  CredoDailyLog,
} from "@/features/credo/types";

// 今日の日付 "YYYY-MM-DD" を生成する関数
const getToday = () => new Date().toISOString().slice(0, 10);

interface CredoDailyFormProps {
  onSubmit?: (log: CredoDailyLog) => void;
}

export function CredoDailyForm({ onSubmit }: CredoDailyFormProps) {
  const [date, setDate] = useState<string>(getToday());

  const initialState: CredoDailyFormState = useMemo(
    () =>
      Object.fromEntries(
        CREDO_ITEMS.map((item) => [
          item.id,
          { done: false, note: "" },
        ]),
      ) as CredoDailyFormState,
    [],
  );

  const [values, setValues] = useState<CredoDailyFormState>(initialState);

  const handleToggle = (credoId: string) => {
    setValues((prev) => ({
      ...prev,
      [credoId]: {
        ...prev[credoId],
        done: !prev[credoId]?.done,
      },
    }));
  };

  const handleNoteChange = (credoId: string, note: string) => {
    setValues((prev) => ({
      ...prev,
      [credoId]: {
        ...prev[credoId],
        note,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const log: CredoDailyLog = {
      id: `${date}-${Date.now()}`,
      date,
      items: Object.entries(values).map(([credoId, v]) => ({
        credoId,
        done: v.done,
        note: v.note.trim(),
      })),
      createdAt: new Date().toISOString(),
    };

    if (onSubmit) {
      onSubmit(log);
    } else {
      console.log("CredoDailyLog:", log);
      alert("クレド実践ログをコンソールに出力しました。");
    }
  };

  const handleReset = () => {
    setValues(initialState);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2">
        <label htmlFor="credo-date" className="text-sm font-medium text-slate-700">
          日付
        </label>
        <input
          id="credo-date"
          type="date"
          className="border border-slate-300 rounded-md px-2 py-1 text-sm"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {CREDO_ITEMS.map((item) => {
          const value = values[item.id];

          return (
            <div
              key={item.id}
              className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-3"
            >
              <div className="flex items-center gap-2">
                <input
                  id={item.id}
                  type="checkbox"
                  className="h-4 w-4"
                  checked={value?.done ?? false}
                  onChange={() => handleToggle(item.id)}
                />
                <label
                  htmlFor={item.id}
                  className="text-sm font-medium text-slate-900"
                >
                  {item.order}. {item.title}
                </label>
              </div>
              <p className="text-xs text-slate-500">{item.description}</p>

              <textarea
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                placeholder="今日の一言メモ（例：朝に3分リセットできた／今日はできなかった など）"
                rows={2}
                value={value?.note ?? ""}
                onChange={(e) => handleNoteChange(item.id, e.target.value)}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={handleReset}
          className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
        >
          リセット
        </button>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          今日のクレド実践を記録する
        </button>
      </div>
    </form>
  );
}
