"use client";

// src/app/credo/page.tsx
import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { signIn, useSession } from "next-auth/react";
import { CredoBoard } from "@/components/credo/CredoBoard";
import { Modal } from "@/components/ui/Modal";
import { CREDO_ITEMS } from "@/features/credo/config";
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

const getToday = () => new Date().toISOString().slice(0, 10);

const getWeekRange = (isoDate: string) => {
  const d = new Date(isoDate);
  const day = d.getDay(); // 0 Sun - 6 Sat
  const diffToMonday = (day + 6) % 7; // Monday start
  const start = new Date(d);
  start.setDate(d.getDate() - diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const toIso = (dt: Date) => dt.toISOString().slice(0, 10);
  return { from: toIso(start), to: toIso(end) };
};

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

const buildDoneMap = (values: Record<CredoId, CredoPracticeFormValue>) => {
  const map: Record<CredoId, boolean> = {} as Record<CredoId, boolean>;
  Object.entries(values).forEach(([id, value]) => {
    map[id as CredoId] = value.done;
  });
  return map;
};

export default function Page() {
  const { status } = useSession();
  const isAuthed = status === "authenticated";
  const today = useMemo(() => getToday(), []);
  const [date, setDate] = useState<string>(today);
  const [values, setValues] = useState<Record<CredoId, CredoPracticeFormValue>>(
    () => buildEmptyValues(today),
  );
  const [summaryOrder, setSummaryOrder] = useState<CredoId[]>(() =>
    CREDO_ITEMS.map((item) => item.id),
  );
  const [activeItem, setActiveItem] = useState<CredoItem | null>(null);
  const [modalDone, setModalDone] = useState<boolean>(false);
  const [modalNote, setModalNote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // APIから当日のデータを取得
  useEffect(() => {
    if (!isAuthed) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/credo/practices?date=${date}`);
        if (res.status === 401) {
          setError("サインインが必要です。");
          return;
        }
        if (!res.ok) throw new Error(`fetch failed (${res.status})`);
        const data = (await res.json()) as CredoDailyPractice;
        if (data?.values) {
          setValues(data.values);
        } else {
          setValues(buildEmptyValues(date));
        }
        setError(null);
      } catch (e) {
        console.error(e);
        setError("データ取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [date, isAuthed]);

  // 周次サマリー取得
  useEffect(() => {
    if (!isAuthed) return;
    const { from, to } = getWeekRange(date);
    const fetchSummary = async () => {
      try {
        setSummaryLoading(true);
        const res = await fetch(`/api/credo/summary?from=${from}&to=${to}`);
        if (res.status === 401) {
          setSummaryError("サインインしてください");
          return;
        }
        if (!res.ok) throw new Error(`fetch failed (${res.status})`);
        const data = (await res.json()) as SummaryResponse;
        setSummary(data);
        setSummaryError(null);
      } catch (e) {
        console.error(e);
        setSummaryError("サマリーの取得に失敗しました");
      } finally {
        setSummaryLoading(false);
      }
    };
    fetchSummary();
  }, [date, isAuthed]);

  const handleSelectItem = (item: CredoItem) => {
    const current = values[item.id];
    setActiveItem(item);
    setModalDone(current?.done ?? false);
    setModalNote(current?.note ?? "");
  };

  const handleDateChange = (nextDate: string) => {
    setDate(nextDate);
    setValues(buildEmptyValues(nextDate));
    setError(null);
  };

  const handleSaveItem = () => {
    if (!isAuthed) {
      setError("サインインしてください");
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

    // API保存
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
          setError("サインインしてください");
          return;
        }
        if (!res.ok) throw new Error(`save failed (${res.status})`);
        setError(null);
      } catch (e) {
        console.error(e);
        setError("保存に失敗しました");
      } finally {
        setSaving(false);
      }
    })();
  };

  const doneMap = useMemo(() => buildDoneMap(values), [values]);
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
      if (doneA !== doneB) return Number(doneA) - Number(doneB); // 未完→完了
      return orderIndex(a.id) - orderIndex(b.id);
    });
  }, [values, summaryOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

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

  const summaryIds = summaryItems.map((item) => item.id);

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
        className={`rounded-md border bg-white px-3 py-2 transition-transform transition-shadow duration-300 ease-out ${
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
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
              完了済み
            </span>
          )}
        </div>
        {value.note && <p className="mt-1 text-xs text-slate-600">{value.note}</p>}
      </li>
    );
  };

  if (status === "loading") {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">クレド実践ボード</h1>
        <p className="text-sm text-slate-600">セッションを確認しています...</p>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">クレド実践ボード</h1>
        <p className="text-sm text-slate-600">
          サインインするとクレドの記録と並べ替えが利用できます。
        </p>
        <button
          type="button"
          onClick={() => signIn(undefined, { callbackUrl: "/credo" })}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          サインイン
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">クレド実践ボード</h1>
        <p className="text-sm text-slate-600">
          クレドをクリックするとモーダルで入力できます。完了すると「完了済み」が表示され、サマリーに並びます。
        </p>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="credo-date">
            日付
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
                <h2 className="text-lg font-medium text-slate-900">週次サマリー</h2>
                <p className="text-xs text-slate-600">月曜はじまりの1週間を集計</p>
              </div>
              {summaryLoading && <span className="text-[11px] text-slate-500">更新中...</span>}
            </div>
            {summaryError && <p className="text-xs text-red-500">{summaryError}</p>}
            {summary && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">実践率</p>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-slate-200">
                      <span className="text-lg font-semibold text-slate-900">
                        {summary.practicedRate}%
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-700">実践回数: {summary.practicedCount}</p>
                      <p className="text-[11px] text-slate-500">11項目中 {summary.ranking.length} 件</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500 mb-1">ハイライト</p>
                  {summary.highlights.length === 0 ? (
                    <p className="text-sm text-slate-500">メモはまだありません</p>
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
                    <p className="text-xs font-medium text-slate-500">よく実践した項目</p>
                    <p className="text-[11px] text-slate-500">トップ3</p>
                  </div>
                  {summary.ranking.slice(0, 3).length === 0 ? (
                    <p className="text-sm text-slate-500">まだ実践がありません</p>
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
                      <p className="text-xs font-medium text-slate-500">未実践</p>
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
                            +{summary.missing.length - 4} もっと
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
          <h2 className="text-lg font-medium text-slate-900">今日のサマリー</h2>
          <p className="text-xs text-slate-600">日付: {date}</p>
          {loading && <p className="text-xs text-slate-500">読み込み中...</p>}
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
          <p className="text-[11px] text-slate-500">
            サマリー項目はドラッグ（マウス・タッチ対応）で並び替えできます。入力済みは自動的に下に配置されます。
          </p>
          {saving && <p className="text-[11px] text-slate-500">保存中...</p>}
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
                このクレドを実践した
              </label>
            </div>
            <p className="text-xs text-slate-600">{activeItem.description}</p>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700" htmlFor={`${activeItem.id}-note`}>
                気づきやメモ
              </label>
              <textarea
                id={`${activeItem.id}-note`}
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                rows={3}
                maxLength={200}
                value={modalNote}
                onChange={(e) => setModalNote(e.target.value)}
                placeholder="今日意識したことや改善点をメモ（200文字まで）"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
