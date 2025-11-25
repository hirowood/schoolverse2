"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Modal } from "@/components/ui/Modal";
import { CalendarGrid } from "@/features/plan/components/CalendarGrid";
import { HistoryPanel } from "@/features/plan/components/HistoryPanel";
import { TaskColumn } from "@/features/plan/components/TaskColumn";
import { TaskCard } from "@/features/plan/components/TaskCard";
import { PLAN_TEXT } from "@/features/plan/constants";
import { StudyTask } from "@/features/plan/types";
import { addDays, formatLocalIsoDate, getToday, parseLocalDate } from "@/features/plan/utils/date";

/** Study plan page: manage today/tomorrow and calendar with drag & drop */
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
      setError(PLAN_TEXT.fetchError);
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
        setError(PLAN_TEXT.fetchError);
      } finally {
        setHistoryLoading(false);
      }
    },
    [fetchDay],
  );

  useEffect(() => {
    loadHistory(today);
  }, [loadHistory, today]);

  // Poll every minute; if the day changes, refresh today/tomorrow/history
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
      setError(PLAN_TEXT.addError);
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
      setError(PLAN_TEXT.statusError);
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
      setError(PLAN_TEXT.dateError);
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
        <p className="text-xs font-medium text-slate-500">{PLAN_TEXT.headerStudyPlan}</p>
        <h1 className="text-2xl font-semibold">{PLAN_TEXT.pageTitle}</h1>
        <p className="text-sm text-slate-600">{PLAN_TEXT.pageDescription}</p>
      </header>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {loading ? (
        <p className="text-sm text-slate-500">{PLAN_TEXT.loading}</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <SortableContext items={tasksToday.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <TaskColumn
                id="today"
                title={`${PLAN_TEXT.todayBoardTitle} (${today})`}
                tasks={tasksToday}
                showAddButton
                onAddClick={() => openModalForDate(today)}
                onStatusChange={handleStatus}
              />
            </SortableContext>

            <SortableContext items={tasksTomorrow.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <TaskColumn
                id="tomorrow"
                title={`${PLAN_TEXT.tomorrowBoardTitle} (${tomorrow})`}
                tasks={tasksTomorrow}
                onStatusChange={handleStatus}
              />
            </SortableContext>
          </div>

          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <CalendarGrid
              today={today}
              currentMonthIso={formatLocalIsoDate(currentMonth)}
              selectedDate={historyDate}
              onSelect={(date) => {
                setHistoryDate(date);
                loadHistory(date);
              }}
              onPrevMonth={() => goMonth(-1)}
              onNextMonth={() => goMonth(1)}
            />

            <HistoryPanel
              selectedDate={historyDate}
              isToday={isHistoryToday}
              isTomorrow={isHistoryTomorrow}
              tasks={isHistoryToday ? tasksToday : isHistoryTomorrow ? tasksTomorrow : historyTasks}
              loading={historyLoading}
              droppableId={historyColumnId}
              placeholderId={historyPlaceholderId}
              onAddClick={() => openModalForDate(historyDate)}
              onStatusChange={handleStatus}
            />
          </section>

          <DragOverlay
            dropAnimation={{
              duration: 200,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {activeTask ? <TaskCard task={activeTask} onStatusChange={handleStatus} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      <Modal
        open={modalOpen}
        title={PLAN_TEXT.modalTitle}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
            >
              {PLAN_TEXT.modalCancel}
            </button>
            <button
              type="submit"
              form="new-task-form"
              disabled={saving}
              className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? PLAN_TEXT.modalSubmitAdding : PLAN_TEXT.modalSubmit}
            </button>
          </div>
        }
      >
        <form id="new-task-form" onSubmit={handleAdd} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="new-task-title">
              {PLAN_TEXT.titleLabel}
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
              {PLAN_TEXT.descLabel}
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
              {PLAN_TEXT.dateLabel}
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
              {PLAN_TEXT.timeLabel}
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
