"use client";

// src/app/credo/page.tsx
import { useMemo, useState } from "react";
import { CredoBoard } from "@/components/credo/CredoBoard";
import { Modal } from "@/components/ui/Modal";
import { CREDO_ITEMS } from "@/features/credo/config";
import type {
  CredoDailyPractice,
  CredoId,
  CredoItem,
  CredoPracticeFormValue,
} from "@/features/credo/types";

const getToday = () => new Date().toISOString().slice(0, 10);
const STORAGE_KEY_PREFIX = "credo-practice-";

const buildEmptyValues = (
  date: string,
): Record<CredoId, CredoPracticeFormValue> =>
  Object.fromEntries(
    CREDO_ITEMS.map((item) => [
      item.id,
      {
        credoId: item.id,
        date,
        done: false,
        note: "",
      },
    ]),
  ) as Record<CredoId, CredoPracticeFormValue>;

const loadFromStorage = (date: string): CredoDailyPractice | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${date}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CredoDailyPractice;
  } catch {
    return null;
  }
};

const persistValues = (date: string, values: Record<CredoId, CredoPracticeFormValue>) => {
  const daily: CredoDailyPractice = { date, values };
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${date}`, JSON.stringify(daily));
};

const buildDoneMap = (values: Record<CredoId, CredoPracticeFormValue>) => {
  const map: Record<CredoId, boolean> = {} as Record<CredoId, boolean>;
  Object.entries(values).forEach(([id, value]) => {
    map[id as CredoId] = value.done;
  });
  return map;
};

export default function Page() {
  const today = useMemo(() => getToday(), []);
  const [date] = useState<string>(today);
  const [values, setValues] = useState<Record<CredoId, CredoPracticeFormValue>>(
    () => loadFromStorage(today)?.values ?? buildEmptyValues(today),
  );

  const [activeItem, setActiveItem] = useState<CredoItem | null>(null);
  const [modalDone, setModalDone] = useState<boolean>(false);
  const [modalNote, setModalNote] = useState<string>("");

  const handleSelectItem = (item: CredoItem) => {
    const current = values[item.id];
    setActiveItem(item);
    setModalDone(current?.done ?? false);
    setModalNote(current?.note ?? "");
  };

  const handleSaveItem = () => {
    if (!activeItem) return;
    const nextValues = {
      ...values,
      [activeItem.id]: {
        credoId: activeItem.id,
        date,
        done: modalDone,
        note: modalNote.trim(),
      },
    };
    setValues(nextValues);
    persistValues(date, nextValues);
    setActiveItem(null);
  };

  const doneMap = useMemo(() => buildDoneMap(values), [values]);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">クレド実践ボード</h1>
        <p className="text-sm text-slate-600">
          クレドをクリックするとモーダルが開き、その項目だけ入力できます。入力すると一覧で「入力済み」として斜線が入ります。
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <CredoBoard
            items={CREDO_ITEMS}
            doneMap={doneMap}
            onSelect={handleSelectItem}
          />
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-lg font-medium text-slate-900">今日のサマリー</h2>
          <p className="text-xs text-slate-600">日付: {date}</p>
          <ul className="mt-3 space-y-2">
            {CREDO_ITEMS.map((item) => {
              const value = values[item.id];
              if (!value?.done && !value?.note) {
                return null;
              }
              return (
                <li
                  key={item.id}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-900">
                      {item.order}. {item.title}
                    </span>
                    {value?.done && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                        入力済み
                      </span>
                    )}
                  </div>
                  {value?.note && (
                    <p className="mt-1 text-xs text-slate-600">{value.note}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <Modal
        open={Boolean(activeItem)}
        title={activeItem ? `${activeItem.order}. ${activeItem.title}` : ""}
        onClose={() => setActiveItem(null)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveItem(null)}
              className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSaveItem}
              className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              保存
            </button>
          </div>
        }
      >
        {activeItem && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                id={`${activeItem.id}-done`}
                type="checkbox"
                className="h-4 w-4"
                checked={modalDone}
                onChange={(e) => setModalDone(e.target.checked)}
              />
              <label
                htmlFor={`${activeItem.id}-done`}
                className="text-sm font-medium text-slate-900"
              >
                今日このクレドを意識できた
              </label>
            </div>
            <p className="text-xs text-slate-600">{activeItem.description}</p>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700" htmlFor={`${activeItem.id}-note`}>
                今日の一言メモ
              </label>
              <textarea
                id={`${activeItem.id}-note`}
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                rows={3}
                maxLength={200}
                value={modalNote}
                onChange={(e) => setModalNote(e.target.value)}
                placeholder="気づきや具体的な行動を書いてください（200文字まで）"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
