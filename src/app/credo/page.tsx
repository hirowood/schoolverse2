"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSession } from "next-auth/react";
import { CredoBoard } from "@/components/credo/CredoBoard";
import { Modal } from "@/components/ui/Modal";
import { CREDO_ITEMS } from "@/features/credo/config";
import { CREDO_TEXT } from "@/features/credo/constants";
import type {
  CredoDailyPractice,
  CredoId,
  CredoItem,
  CredoPracticeFormValue,
} from "@/features/credo/types";

type SummaryResponse = {
  practicedCount: number;
  practicedRate: number; // %
  highlights: string[];
  ranking: { id: CredoId; title: string; count: number }[];
  missing: { id: CredoId; title: string }[];
};

// 今日の日付をYYYY-MM-DDで返す
const getToday = () => new Date().toISOString().slice(0, 10);

// 週次サマリー用の期間を計算（週の開始は月曜）
const getWeekRange = (isoDate: string) => {
  const d = new Date(isoDate);
  const day = d.getDay(); // 0 Sun - 6 Sat
  const diffToMonday = (day + 6) % 7;
  const start = new Date(d);
  start.setDate(d.getDate() - diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const toIso = (dt: Date) => dt.toISOString().slice(0, 10);
  return { from: toIso(start), to: toIso(end) };
};

// 実践率からコーチコメントを生成
const coachComment = (rate: number) => {
  if (rate >= 70) return CREDO_TEXT.coachHigh;
  if (rate >= 30) return CREDO_TEXT.coachMid;
  return CREDO_TEXT.coachLow;
};

// 指定日の空データを生成
const buildEmptyValues = (date: string): Record<CredoId, CredoPracticeFormValue> =>
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

// 完了フラグの辞書を組み立て
const buildDoneMap = (values: Record<CredoId, CredoPracticeFormValue>) => {
  const map: Record<CredoId, boolean> = {} as Record<CredoId, boolean>;
  Object.entries(values).forEach(([id, value]) => {
    map[id as CredoId] = value.done;
  });
  return map;
};

type FetchResult<T> = {
  unauthorized: boolean;
  data?: T;
};

const fetchJsonWithAuth = async <T,>(url: string): Promise<FetchResult<T>> => {
  const res = await fetch(url);
  if (res.status === 401) {
    return { unauthorized: true };
  }
  if (!res.ok) {
    throw new Error(`fetch failed (${res.status})`);
  }
  const data = (await res.json()) as T;
  return { unauthorized: false, data };
};

// 週次サマリーの並び替えに使用するアイテム
const SortableSummaryItem = ({
  item,
  value,
}: {
  item: CredoItem;
  value: CredoPracticeFormValue;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.95 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`rounded-md border bg-white px-3 py-2 transition duration-300 ease-out ${
        isDragging
          ? "border-slate-300 shadow-xl shadow-slate-200 scale-[1.01]"
          : "border-slate-200 hover:shadow-sm hover:-translate-y-0.5"
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-900">
          {item.order}. {item.title}
        </span>
        {value.done && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">{CREDO_TEXT.badgeDone}</span>
        )}
      </div>
      {value.note && <p className="mt-1 text-xs text-slate-600">{value.note}</p>}
    </li>
  );
};

export default function Page() {
  const { status } = useSession();
  const isAuthed = status === "authenticated";
  const today = useMemo(() => getToday(), []);

  // 状態管理
  const [date, setDate] = useState<string>(today);
  const [values, setValues] = useState<Record<CredoId, CredoPracticeFormValue>>(() => buildEmptyValues(today));
  const [summaryOrder, setSummaryOrder] = useState<CredoId[]>(() => CREDO_ITEMS.map((item) => item.id));
  const [activeItem, setActiveItem] = useState<CredoItem | null>(null);
  const [modalDone, setModalDone] = useState<boolean>(false);
  const [modalNote, setModalNote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  // 日付切り替え時に当日の入力を取得
  useEffect(() => {
    if (!isAuthed) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const { unauthorized, data } = await fetchJsonWithAuth<CredoDailyPractice>(
          `/api/credo/practices?date=${date}`,
        );
        if (unauthorized) {
          setError(CREDO_TEXT.errorAuth);
          return;
        }
        if (data?.values) {
          setValues(data.values);
        } else {
          setValues(buildEmptyValues(date));
        }
        setError(null);
      } catch (e) {
        console.error(e);
        setError(CREDO_TEXT.errorFetch);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [date, isAuthed]);

  // 週次サマリー取得
  useEffect(() => {
    if (!isAuthed) return;
    const { from, to } = getWeekRange(date);
    const fetchSummary = async () => {
      try {
        setSummaryLoading(true);
        const { unauthorized, data } = await fetchJsonWithAuth<SummaryResponse>(
          `/api/credo/summary?from=${from}&to=${to}`,
        );
        if (unauthorized) {
          setSummaryError(CREDO_TEXT.errorAuth);
          return;
        }
        setSummary(data || null);
        setSummaryError(null);
      } catch (e) {
        console.error(e);
        setSummaryError(CREDO_TEXT.errorSummary);
      } finally {
        setSummaryLoading(false);
      }
    };
    fetchSummary();
  }, [date, isAuthed]);

  // クレドカード選択時のモーダル初期化
  const handleSelectItem = (item: CredoItem) => {
    const current = values[item.id];
    setActiveItem(item);
    setModalDone(current?.done ?? false);
    setModalNote(current?.note ?? "");
  };

  // 日付変更
  const handleDateChange = (nextDate: string) => {
    setDate(nextDate);
    setValues(buildEmptyValues(nextDate));
    setError(null);
  };

  // モーダル保存（楽観的更新で先に状態を反映）
  const handleSaveItem = () => {
    if (!isAuthed) {
      setError(CREDO_TEXT.errorAuth);
      return;
    }
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
    setActiveItem(null);

    (async () => {
      try {
        setSaving(true);
        const payload: CredoDailyPractice = { date, values: nextValues };
        const res = await fetch("/api/credo/practices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.status === 401) {
          setError(CREDO_TEXT.errorAuth);
          return;
        }
        if (!res.ok) throw new Error(`save failed (${res.status})`);
        setError(null);
      } catch (e) {
        console.error(e);
        setError(CREDO_TEXT.errorFetch);
      } finally {
        setSaving(false);
      }
    })();
  };

  // サマリーカードに表示するアイテム（完了/メモありだけ表示）
  const summaryItems = useMemo(() => {
    const present = CREDO_ITEMS.filter((item) => {
      const value = values[item.id];
      return value?.done || value?.note;
    });
    const orderIndex = (id: CredoId) => summaryOrder.indexOf(id);
    return [...present].sort((a, b) => {
      const va = values[a.id];
      const vb = values[b.id];
      const doneA = va?.done ?? false;
      const doneB = vb?.done ?? false;
      if (doneA !== doneB) return Number(doneA) - Number(doneB);
      return orderIndex(a.id) - orderIndex(b.id);
    });
  }, [values, summaryOrder]);

  // DnD終了時に順序更新
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const presentIds = summaryItems.map((item) => item.id);
    const filteredOrder = summaryOrder.filter((id) => presentIds.includes(id));
    const oldIndex = filteredOrder.indexOf(active.id as CredoId);
    const newIndex = filteredOrder.indexOf(over.id as CredoId);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(filteredOrder, oldIndex, newIndex);
    const rest = summaryOrder.filter((id) => !presentIds.includes(id));
    setSummaryOrder([...reordered, ...rest]);
  };

  const doneMap = useMemo(() => buildDoneMap(values), [values]);
  const summaryIds = summaryItems.map((item) => item.id);

  if (status === "loading") {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">{CREDO_TEXT.loadingSessionTitle}</h1>
        <p className="text-sm text-slate-600">{CREDO_TEXT.loadingSessionDescription}</p>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">{CREDO_TEXT.unauthTitle}</h1>
        <p className="text-sm text-slate-600">{CREDO_TEXT.unauthDescription}</p>
        <p className="text-xs text-slate-500">{CREDO_TEXT.unauthHint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">{CREDO_TEXT.pageTitle}</h1>
        <p className="text-sm text-slate-600">{CREDO_TEXT.pageDescription}</p>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="credo-date">
            {CREDO_TEXT.dateLabel}
          </label>
          <input
            id="credo-date"
            type="date"
            className="rounded-md border border-slate-300 px-2 py-1 text-sm"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <CredoBoard items={CREDO_ITEMS} doneMap={doneMap} onSelect={handleSelectItem} />

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-slate-900">{CREDO_TEXT.summaryTitle}</h2>
                <p className="text-xs text-slate-600">{CREDO_TEXT.summarySubtitle}</p>
              </div>
              {summaryLoading && <span className="text-[11px] text-slate-500">{CREDO_TEXT.summaryLoading}</span>}
            </div>
            {summaryError && <p className="text-xs text-red-500">{summaryError}</p>}
            {summary && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">{CREDO_TEXT.summaryRate}</p>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-slate-200">
                      <span className="text-lg font-semibold text-slate-900">{summary.practicedRate}%</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-700">
                        {CREDO_TEXT.summaryCount}: {summary.practicedCount}
                      </p>
                      <p className="text-[11px] text-slate-500">{CREDO_TEXT.summaryRangeLabel(summary.ranking.length)}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs font-medium text-emerald-700">コーチコメント: {coachComment(summary.practicedRate)}</p>
              </div>

                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500 mb-1">{CREDO_TEXT.summaryHighlight}</p>
                  {summary.highlights.length === 0 ? (
                    <p className="text-sm text-slate-500">{CREDO_TEXT.summaryEmptyHighlight}</p>
                  ) : (
                    <ul className="space-y-1 text-sm text-slate-700">
                      {summary.highlights.map((h, idx) => (
                        <li key={`${h}-${idx}`} className="line-clamp-2">
                          ・{h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-lg border border-slate-200 p-3 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-500">{CREDO_TEXT.summaryRanking}</p>
                    <p className="text-[11px] text-slate-500">{CREDO_TEXT.summaryTopLabel}</p>
                  </div>
                  {summary.ranking.slice(0, 3).length === 0 ? (
                    <p className="text-sm text-slate-500">{CREDO_TEXT.summaryEmptyRanking}</p>
                  ) : (
                    <ul className="mt-2 space-y-1 text-sm text-slate-700">
                      {summary.ranking.slice(0, 3).map((r) => (
                        <li key={r.id} className="flex items-center justify-between">
                          <span className="truncate">{r.title}</span>
                          <span className="text-xs text-slate-500">x {r.count}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {summary.missing.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-slate-500">{CREDO_TEXT.summaryMissing}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {summary.missing.slice(0, 4).map((m) => (
                          <span
                            key={m.id}
                            className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600"
                          >
                            {m.title}
                          </span>
                        ))}
                        {summary.missing.length > 4 && (
                          <span className="text-[11px] text-slate-500">
                            {CREDO_TEXT.summaryMissingMore(summary.missing.length - 4)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-lg font-medium text-slate-900">{CREDO_TEXT.todaySummaryTitle}</h2>
          <p className="text-xs text-slate-600">{CREDO_TEXT.todayDateLabel(date)}</p>
          {loading && <p className="text-xs text-slate-500">{CREDO_TEXT.todayLoading}</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={summaryIds} strategy={verticalListSortingStrategy}>
              <ul className="mt-3 space-y-2">
                {summaryItems.map((item) => {
                  const value = values[item.id];
                  if (!value) return null;
                  return <SortableSummaryItem key={item.id} item={item} value={value} />;
                })}
              </ul>
            </SortableContext>
          </DndContext>
          <p className="text-[11px] text-slate-500">{CREDO_TEXT.todayHint}</p>
          {saving && <p className="text-[11px] text-slate-500">{CREDO_TEXT.todaySaving}</p>}
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
              {CREDO_TEXT.modalCancel}
            </button>
            <button
              type="button"
              onClick={handleSaveItem}
              className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              {CREDO_TEXT.modalSave}
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
              <label htmlFor={`${activeItem.id}-done`} className="text-sm font-medium text-slate-900">
                {CREDO_TEXT.modalDoneLabel}
              </label>
            </div>
            <p className="text-xs text-slate-600">{activeItem.description}</p>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700" htmlFor={`${activeItem.id}-note`}>
                {CREDO_TEXT.modalNoteLabel}
              </label>
              <textarea
                id={`${activeItem.id}-note`}
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                rows={3}
                maxLength={200}
                value={modalNote}
                onChange={(e) => setModalNote(e.target.value)}
                placeholder={CREDO_TEXT.modalNotePlaceholder}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
