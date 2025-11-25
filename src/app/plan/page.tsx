"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Modal } from "@/components/ui/Modal";

type StudyTask = {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string | null;
  status: "todo" | "in_progress" | "done";
};

const formatLocalIsoDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const getToday = () => formatLocalIsoDate(new Date());
const parseLocalDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};
const addDays = (iso: string, days: number) => {
  const d = parseLocalDate(iso);
  d.setDate(d.getDate() + days);
  return formatLocalIsoDate(d);
};
const monthMeta = (dateIso: string) => {
  const d = parseLocalDate(dateIso);
  const year = d.getFullYear();
  const month = d.getMonth();
  const first = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  return { year, month, firstWeekday: first.getDay(), totalDays };
};

export default function Page() {
  const [today, setToday] = useState(getToday());
  const tomorrow = useMemo(() => addDays(today, 1), [today]);
  const [tasksToday, setTasksToday] = useState<StudyTask[]>([]);
  const [tasksTomorrow, setTasksTomorrow] = useState<StudyTask[]>([]);
  const [historyDate, setHistoryDate] = useState(today);
  const [historyTasks, setHistoryTasks] = useState<StudyTask[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDate, setNewDate] = useState(today);
  const [newTime, setNewTime] = useState("");

  const historyColumnId = `history-${historyDate}`;
  const historyPlaceholderId = "history-placeholder";
  const isHistoryToday = historyDate === today;
  const isHistoryTomorrow = historyDate === tomorrow;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const [activeTask, setActiveTask] = useState<StudyTask | null>(null);

  const fetchDay = useCallback(async (date: string) => {
    const res = await fetch(`/api/tasks?date=${date}`);
    if (!res.ok) {
      throw new Error(`fetch failed ${res.status}`);
    }
    const data = (await res.json()) as { tasks: StudyTask[] };
    return data.tasks;
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [t1, t2] = await Promise.all([fetchDay(today), fetchDay(tomorrow)]);
      setTasksToday(t1);
      setTasksTomorrow(t2);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("タスクの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [fetchDay, today, tomorrow]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loadHistory = useCallback(
    async (targetDate: string) => {
      try {
        setHistoryLoading(true);
        const tasks = await fetchDay(targetDate);
        setHistoryTasks(tasks);
        setHistoryDate(targetDate);
      } catch (e) {
        console.error(e);
        setError("履歴の取得に失敗しました");
      } finally {
        setHistoryLoading(false);
      }
    },
    [fetchDay],
  );

  useEffect(() => {
    loadHistory(today);
  }, [loadHistory, today]);

  // 日付が変わったら today/tomorrow を更新
  useEffect(() => {
    const id = setInterval(() => {
      const now = getToday();
      if (now !== today) {
        setToday(now);
        setHistoryDate(now);
        setNewDate(now);
        setCurrentMonth(parseLocalDate(now));
      }
    }, 60_000);
    return () => clearInterval(id);
  }, [today]);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    const targetDate = newDate || historyDate || today;
    if (!title || !targetDate) return;
    setSaving(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: newDescription,
          date: targetDate,
          time: newTime || null,
        }),
      });
      if (!res.ok) throw new Error(`failed ${res.status}`);
      setNewTitle("");
      setNewDescription("");
      setNewDate(today);
      setNewTime("");
      setModalOpen(false);
      if (targetDate === today || targetDate === tomorrow) {
        refresh();
      }
      loadHistory(targetDate);
    } catch (err) {
      console.error(err);
      setError("タスクの追加に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (id: string, status: StudyTask["status"]) => {
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      refresh();
    } catch (e) {
      console.error(e);
      setError("ステータス更新に失敗しました");
    }
  };

  const updateTaskDate = async (taskId: string, targetDate: string) => {
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, date: targetDate }),
      });
      refresh();
      if (targetDate === historyDate) loadHistory(targetDate);
    } catch (e) {
      console.error(e);
      setError("日付の更新に失敗しました");
    }
  };

  const openModalForDate = (date: string) => {
    setNewDate(date);
    setNewTime("");
    setNewTitle("");
    setNewDescription("");
    setModalOpen(true);
  };

  const goMonth = (delta: number) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };
  const historyDrop = useDroppable({ id: historyColumnId });

  const DroppableColumn = ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
      <div
        ref={setNodeRef}
        className={`space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition ${
          isOver ? "ring-2 ring-slate-300" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {id === "today" && (
            <button
              type="button"
              onClick={() => openModalForDate(today)}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              新規タスク
            </button>
          )}
        </div>
        {children}
      </div>
    );
  };

  const SortableItem = ({ task }: { task: StudyTask }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: task.id,
    });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`flex flex-col gap-1 rounded-lg border border-slate-200 bg-slate-50 p-3 ${
          isDragging ? "shadow-lg shadow-slate-300" : ""
        }`}
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-slate-900">{task.title}</p>
            {task.description && <p className="text-xs text-slate-700">{task.description}</p>}
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleStatus(task.id, "todo")}
              className={`rounded-md px-2 py-1 text-xs ${
                task.status === "todo"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 text-slate-700"
              }`}
            >
              未着手
            </button>
            <button
              type="button"
              onClick={() => handleStatus(task.id, "in_progress")}
              className={`rounded-md px-2 py-1 text-xs ${
                task.status === "in_progress"
                  ? "bg-amber-500 text-white"
                  : "border border-slate-300 text-slate-700"
              }`}
            >
              進行中
            </button>
            <button
              type="button"
              onClick={() => handleStatus(task.id, "done")}
              className={`rounded-md px-2 py-1 text-xs ${
                task.status === "done"
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-300 text-slate-700"
              }`}
            >
              完了
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>ステータス: {task.status}</span>
          <span>予定: {task.dueDate ? `${task.dueDate.slice(0, 10)} ${task.dueDate.slice(11, 16)}` : "未設定"}</span>
        </div>
      </div>
    );
  };

  const PlaceholderItem = ({ id, label }: { id: string; label: string }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id,
    });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`rounded-md border border-dashed border-slate-300 bg-white px-3 py-2 text-xs text-slate-500 ${
          isDragging ? "shadow" : ""
        }`}
        {...attributes}
        {...listeners}
      >
        {label}
      </div>
    );
  };

  const getContainerForId = (id: string): "today" | "tomorrow" | "history" | null => {
    if (id === "today") return "today";
    if (id === "tomorrow") return "tomorrow";
    if (id === historyColumnId || id === historyPlaceholderId) return "history";
    if (tasksToday.some((t) => t.id === id)) return "today";
    if (tasksTomorrow.some((t) => t.id === id)) return "tomorrow";
    if (historyTasks.some((t) => t.id === id)) return "history";
    return null;
  };

  const getListByContainer = (container: "today" | "tomorrow" | "history") => {
    if (container === "today") return tasksToday;
    if (container === "tomorrow") return tasksTomorrow;
    return historyTasks;
  };

  const setListByContainer = (container: "today" | "tomorrow" | "history", next: StudyTask[]) => {
    if (container === "today") setTasksToday(next);
    else if (container === "tomorrow") setTasksTomorrow(next);
    else setHistoryTasks(next);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task =
      tasksToday.find((t) => t.id === active.id) ||
      tasksTomorrow.find((t) => t.id === active.id) ||
      historyTasks.find((t) => t.id === active.id) ||
      null;
    setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const source = getContainerForId(String(active.id));
    const target = getContainerForId(String(over.id));
    if (!source || !target) return;

    if (source === target) {
      const list = getListByContainer(source);
      const oldIndex = list.findIndex((t) => t.id === active.id);
      const newIndex = list.findIndex((t) => t.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(list, oldIndex, newIndex);
      setListByContainer(source, reordered);
      return;
    }

    const sourceList = getListByContainer(source);
    const task = sourceList.find((t) => t.id === active.id);
    if (!task) return;

    setListByContainer(
      source,
      sourceList.filter((t) => t.id !== active.id),
    );
    setListByContainer(target, [...getListByContainer(target), task]);

    const targetDate = target === "today" ? today : target === "tomorrow" ? tomorrow : historyDate;
    await updateTaskDate(String(active.id), targetDate);
    if (target === "history" || source === "history") {
      loadHistory(historyDate);
    }
  };

  return (
    <main className="space-y-4">
      <header className="space-y-1">
        <p className="text-xs font-medium text-slate-500">Study Plan</p>
        <h1 className="text-2xl font-semibold">学習プラン</h1>
        <p className="text-sm text-slate-600">
          今日と明日のタスクを左右のボードで管理し、ドラッグ＆ドロップで整理できます。
        </p>
      </header>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {loading ? (
        <p className="text-sm text-slate-500">読み込み中...</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <SortableContext items={tasksToday.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <DroppableColumn id="today" title={`今日 (${today})`}>
                {tasksToday.length === 0 ? (
                  <p className="text-sm text-slate-500">今日のタスクはありません</p>
                ) : (
                  <div className="space-y-2">
                    {tasksToday.map((task) => (
                      <SortableItem key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </DroppableColumn>
            </SortableContext>

            <SortableContext items={tasksTomorrow.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <DroppableColumn id="tomorrow" title={`明日 (${tomorrow})`}>
                {tasksTomorrow.length === 0 ? (
                  <p className="text-sm text-slate-500">明日に移したタスクはありません</p>
                ) : (
                  <div className="space-y-2">
                    {tasksTomorrow.map((task) => (
                      <SortableItem key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </DroppableColumn>
            </SortableContext>
          </div>

          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">カレンダー（タスク履歴）</h2>
                <p className="text-xs text-slate-600">
                  月を移動し、日付をクリックするとその日のタスクを確認できます。
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goMonth(-1)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50"
                >
                  ◀︎ 前月
                </button>
                <div className="min-w-[130px] text-center text-sm font-medium text-slate-800">
                  {currentMonth.toLocaleDateString("ja-JP", { year: "numeric", month: "long" })}
                </div>
                <button
                  type="button"
                  onClick={() => goMonth(1)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50"
                >
                  翌月 ▶︎
                </button>
              </div>
            </div>

            <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-600">
                {["日", "月", "火", "水", "木", "金", "土"].map((w) => (
                  <div key={w}>{w}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-sm text-slate-800">
                {(() => {
                  const meta = monthMeta(formatLocalIsoDate(currentMonth));
                  const cells = [];
                  for (let i = 0; i < meta.firstWeekday; i += 1) cells.push(<div key={`empty-${i}`} />);
                  for (let d = 1; d <= meta.totalDays; d += 1) {
                    const dateStr = formatLocalIsoDate(new Date(meta.year, meta.month, d));
                    const isSelected = historyDate === dateStr;
                    const isToday = dateStr === today;
                    cells.push(
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => {
                          setHistoryDate(dateStr);
                          loadHistory(dateStr);
                        }}
                        className={`rounded-md border px-2 py-2 text-center transition ${
                          isSelected
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white hover:border-slate-400"
                        } ${isToday ? "ring-2 ring-slate-300" : ""}`}
                      >
                        {d}
                      </button>,
                    );
                  }
                  return cells;
                })()}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-900">選択した日: {historyDate}</p>
                <button
                  type="button"
                  onClick={() => openModalForDate(historyDate)}
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
                >
                  この日にタスクを追加
                </button>
              </div>
              {isHistoryToday ? (
                <div className="mt-2 space-y-2 rounded-md border border-slate-200 bg-white/60 p-3">
                  <p className="text-xs font-medium text-slate-700">今日のタスク（下では並べ替えできません）</p>
                  {tasksToday.length === 0 ? (
                    <p className="text-xs text-slate-500">今日のタスクはありません</p>
                  ) : (
                    tasksToday.map((t) => (
                      <div key={t.id} className="rounded-md border border-slate-200 bg-white px-3 py-2">
                        <p className="text-sm font-medium text-slate-900">{t.title}</p>
                        {t.description && <p className="text-xs text-slate-600">{t.description}</p>}
                        <p className="text-[11px] text-slate-500">ステータス: {t.status}</p>
                      </div>
                    ))
                  )}
                </div>
              ) : isHistoryTomorrow ? (
                <div className="mt-2 space-y-2 rounded-md border border-slate-200 bg-white/60 p-3">
                  <p className="text-xs font-medium text-slate-700">明日のタスク（下では並べ替えできません）</p>
                  {tasksTomorrow.length === 0 ? (
                    <p className="text-xs text-slate-500">明日のタスクはありません</p>
                  ) : (
                    tasksTomorrow.map((t) => (
                      <div key={t.id} className="rounded-md border border-slate-200 bg-white px-3 py-2">
                        <p className="text-sm font-medium text-slate-900">{t.title}</p>
                        {t.description && <p className="text-xs text-slate-600">{t.description}</p>}
                        <p className="text-[11px] text-slate-500">ステータス: {t.status}</p>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <SortableContext
                  items={historyTasks.length ? historyTasks.map((t) => t.id) : [historyPlaceholderId]}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    ref={historyDrop.setNodeRef}
                    className={`mt-2 space-y-2 rounded-md border border-dashed border-slate-300 bg-white/70 p-3 ${
                      historyDrop.isOver ? "ring-2 ring-slate-300" : ""
                    }`}
                  >
                    {historyLoading ? (
                      <p className="text-xs text-slate-500">読み込み中...</p>
                    ) : historyTasks.length === 0 ? (
                      <PlaceholderItem id={historyPlaceholderId} label="この日のタスクをドロップして追加" />
                    ) : (
                      historyTasks.map((t) => <SortableItem key={t.id} task={t} />)
                    )}
                  </div>
                </SortableContext>
              )}
            </div>
          </section>

          <DragOverlay
            dropAnimation={{
              duration: 200,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {activeTask ? (
              <div className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
                <p className="text-sm font-medium text-slate-900">{activeTask.title}</p>
                {activeTask.description && <p className="text-xs text-slate-700">{activeTask.description}</p>}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <Modal
        open={modalOpen}
        title="新規タスク"
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              form="new-task-form"
              disabled={saving}
              className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? "追加中..." : "追加する"}
            </button>
          </div>
        }
      >
        <form id="new-task-form" onSubmit={handleAdd} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="new-task-title">
              タイトル
            </label>
            <input
              id="new-task-title"
              type="text"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="new-task-desc">
              説明（任意）
            </label>
            <input
              id="new-task-desc"
              type="text"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="new-task-date">
              日付
            </label>
            <input
              id="new-task-date"
              type="date"
              className="w-48 rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="new-task-time">
              時間（任意）
            </label>
            <input
              id="new-task-time"
              type="time"
              className="w-32 rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </main>
  );
}
