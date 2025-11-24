// src/components/credo/CredoDailyForm.tsx
"use client";

import { useEffect, useState } from "react";
import type {
  CredoDailyPractice,
  CredoId,
  CredoItem,
  CredoPracticeFormValue,
} from "@/features/credo/types";

const getToday = () => new Date().toISOString().slice(0, 10);

export interface CredoDailyFormProps {
  date?: string;
  items: CredoItem[];
  initialValues?: Record<CredoId, CredoPracticeFormValue>;
  onSubmit?: (daily: CredoDailyPractice) => void;
}

const buildInitialValues = (
  date: string,
  items: CredoItem[],
  initialValues?: Record<CredoId, CredoPracticeFormValue>,
) =>
  Object.fromEntries(
    items.map((item) => {
      const base = initialValues?.[item.id];
      return [
        item.id,
        {
          credoId: item.id,
          date,
          done: base?.done ?? false,
          note: base?.note ?? "",
        },
      ];
    }),
  ) as Record<CredoId, CredoPracticeFormValue>;

export function CredoDailyForm({
  date: initialDate,
  items,
  initialValues,
  onSubmit,
}: CredoDailyFormProps) {
  const [date, setDate] = useState<string>(initialDate ?? getToday());
  const [values, setValues] = useState<Record<CredoId, CredoPracticeFormValue>>(
    () => buildInitialValues(initialDate ?? getToday(), items, initialValues),
  );

  useEffect(() => {
    if (!initialValues) return;
    // Propからの初期値変更時のみ同期（依存は限定的）
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues(buildInitialValues(date, items, initialValues));
  }, [initialValues, items, date]);

  const handleDateChange = (nextDate: string) => {
    setDate(nextDate);
    setValues((prev) =>
      Object.fromEntries(
        items.map((item) => {
          const prevValue = prev[item.id];
          return [
            item.id,
            {
              credoId: item.id,
              date: nextDate,
              done: prevValue?.done ?? false,
              note: prevValue?.note ?? "",
            },
          ];
        }),
      ) as Record<CredoId, CredoPracticeFormValue>,
    );
  };

  const handleToggle = (credoId: CredoId) => {
    setValues((prev) => ({
      ...prev,
      [credoId]: {
        ...prev[credoId],
        done: !prev[credoId]?.done,
      },
    }));
  };

  const handleNoteChange = (credoId: CredoId, note: string) => {
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
    const daily: CredoDailyPractice = {
      date,
      values,
    };

    if (onSubmit) {
      onSubmit(daily);
    } else {
      console.log("CredoDailyPractice:", daily);
    }
  };

  const handleReset = () => {
    setValues(buildInitialValues(date, items, initialValues));
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
          onChange={(e) => handleDateChange(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const value = values[item.id];

          return (
            <div
              key={item.id}
              className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3"
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
                placeholder="今日意識したポイントや一言メモを残してください"
                rows={2}
                maxLength={200}
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
          今日のクレド実践を保存
        </button>
      </div>
    </form>
  );
}
