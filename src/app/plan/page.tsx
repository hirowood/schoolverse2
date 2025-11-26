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
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Modal } from "@/components/ui/Modal";
import { CalendarGrid } from "@/features/plan/components/CalendarGrid";
import { HistoryPanel } from "@/features/plan/components/HistoryPanel";
import { TaskColumn } from "@/features/plan/components/TaskColumn";
import { TaskCard, TaskCardReadonly } from "@/features/plan/components/TaskCard";
import { PLAN_TEXT } from "@/features/plan/constants";
import { StudyTask } from "@/features/plan/types";
import { addDays, formatLocalIsoDate, getToday, parseLocalDate, buildTaskTree } from "@/features/plan/utils/date";

const createChildDraft = (date: string) => ({ title: "", description: "", date, time: "" });

type ChildCardProps = {
  child: StudyTask;
  onEdit: (task: StudyTask) => void;
};

const ChildSortableCard = ({ child, onEdit }: ChildCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: child.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 ${
        isDragging ? "shadow-lg shadow-slate-200" : ""
      }`}
      role="button"
      tabIndex={0}
      onDoubleClick={() => onEdit(child)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onEdit(child);
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
            aria-label="drag"
            {...attributes}
            {...listeners}
          >
            Drag
          </button>
          <div>
            <span className="font-medium text-slate-900">{child.title}</span>
            {child.description && <p className="text-[11px] text-slate-700">{child.description}</p>}
          </div>
        </div>
        <span className="text-[11px] text-slate-500">{child.status}</span>
      </div>
      <span className="text-[11px] text-slate-500">
        {PLAN_TEXT.labelSchedule}: {child.dueDate ? `${child.dueDate.slice(0, 10)} ${child.dueDate.slice(11, 16)}` : PLAN_TEXT.notSet}
      </span>
      {child.children?.length ? (
        <div className="mt-1 space-y-1 border-l border-dashed border-slate-300 pl-2">
          {child.children.map((gc) => (
            <div key={gc.id} className="flex items-center justify-between">
              <span className="truncate text-[11px]">{gc.title}</span>
              <span className="text-[11px] text-slate-500">{gc.status}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

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
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDate, setNewDate] = useState(today);
  const [newTime, setNewTime] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [editingChildren, setEditingChildren] = useState<StudyTask[]>([]);
  const [showChildForm, setShowChildForm] = useState(false);
  const [childDrafts, setChildDrafts] = useState<
    { title: string; description: string; date: string; time: string }[]
  >(() => [createChildDraft(getToday())]);
  const [childSaving, setChildSaving] = useState(false);

  const historyColumnId = `history-${historyDate}`;
  const historyPlaceholderId = "history-placeholder";
  const isHistoryToday = historyDate === today;
  const isHistoryTomorrow = historyDate === tomorrow;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const childSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );
  const [activeTask, setActiveTask] = useState<StudyTask | null>(null);
  const flattenIds = useCallback((list: StudyTask[]) => {
    const tree = buildTaskTree(list);
    const walk = (nodes: StudyTask[]): string[] =>
      nodes.flatMap((n) => [n.id, ...walk(n.children ?? [])]);
    return walk(tree);
  }, []);
  const itemsToday = useMemo(() => flattenIds(tasksToday), [flattenIds, tasksToday]);
  const itemsTomorrow = useMemo(() => flattenIds(tasksTomorrow), [flattenIds, tasksTomorrow]);
  const calculateLeafCompletion = useCallback((tasks: StudyTask[]) => {
    const tree = buildTaskTree(tasks);
    // Count only leaves: parents without children + child tasks
    const walk = (nodes: StudyTask[]): { done: number; total: number } =>
      nodes.reduce(
        (acc, node) => {
          if (node.children?.length) {
            const child = walk(node.children);
            return { done: acc.done + child.done, total: acc.total + child.total };
          }
          return {
            done: acc.done + (node.status === "done" ? 1 : 0),
            total: acc.total + 1,
          };
        },
        { done: 0, total: 0 },
      );

    const { done, total } = walk(tree);
    if (total === 0) return null;
    return { done, total, percent: Math.round((done / total) * 100) };
  }, []);
  const todayProgress = useMemo(() => calculateLeafCompletion(tasksToday), [calculateLeafCompletion, tasksToday]);

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

  const resetForm = () => {
    setEditingTaskId(null);
    setNewTitle("");
    setNewDescription("");
    setNewDate(today);
    setNewTime("");
    setParentId(null);
    setEditingChildren([]);
    setShowChildForm(false);
    setChildDrafts([createChildDraft(today)]);
    setChildSaving(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    const targetDate = newDate || historyDate || today;
    if (!title || !targetDate) return;
    setSaving(true);
    try {
      if (editingTaskId) {
        const res = await fetch("/api/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingTaskId,
            title,
            description: newDescription,
            date: targetDate,
            time: newTime || null,
            parentId,
          }),
        });
        if (!res.ok) throw new Error(`failed ${res.status}`);
      } else {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description: newDescription,
            date: targetDate,
            time: newTime || null,
            parentId,
          }),
        });
        if (!res.ok) throw new Error(`failed ${res.status}`);
      }
      resetForm();
      setModalOpen(false);
      refresh();
      loadHistory(targetDate);
    } catch (err) {
      console.error(err);
      setError(editingTaskId ? PLAN_TEXT.statusError : PLAN_TEXT.addError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingTaskId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingTaskId }),
      });
      if (!res.ok) throw new Error(`delete failed ${res.status}`);
      resetForm();
      setModalOpen(false);
      refresh();
      loadHistory(historyDate);
    } catch (err) {
      console.error(err);
      setError(PLAN_TEXT.statusError);
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
    } catch (e) {
      console.error(e);
      setError(PLAN_TEXT.dateError);
      refresh();
      if (targetDate === historyDate) loadHistory(targetDate);
    }
  };

  const openModalForDate = (date: string) => {
    resetForm();
    setNewDate(date);
    setModalOpen(true);
  };

  const openEditModal = (task: StudyTask) => {
    const dueDate = task.dueDate ?? "";
    setEditingTaskId(task.id);
    setNewTitle(task.title);
    setNewDescription(task.description ?? "");
    setNewDate(dueDate ? dueDate.slice(0, 10) : today);
    setNewTime(dueDate ? dueDate.slice(11, 16) : "");
    setParentId(task.parentId ?? null);
    setEditingChildren(task.children ?? []);
    setShowChildForm(false);
    setChildDrafts([createChildDraft(dueDate ? dueDate.slice(0, 10) : today)]);
    setModalOpen(true);
  };

  const openAddChild = (task: StudyTask) => {
    if (task.parentId) return;
    resetForm();
    // 子タスク追加は「兄弟」も想定し、親がいれば親IDを再利用する
    setParentId(task.parentId ?? task.id);
    const dueDate = task.dueDate ?? "";
    setNewDate(dueDate ? dueDate.slice(0, 10) : today);
    setNewTime(dueDate ? dueDate.slice(11, 16) : "");
    setChildDrafts([createChildDraft(dueDate ? dueDate.slice(0, 10) : today)]);
    setModalOpen(true);
  };

  const handleAddChildInline = async () => {
    if (!editingTaskId) return;
    const drafts = childDrafts
      .map((draft) => ({ ...draft, title: draft.title.trim() }))
      .filter((draft) => draft.title);
    if (drafts.length === 0) return;
    setChildSaving(true);
    try {
      const created: StudyTask[] = [];
      for (const draft of drafts) {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: draft.title,
            description: draft.description,
            date: draft.date || today,
            time: draft.time || null,
            parentId: editingTaskId,
          }),
        });
        if (!res.ok) throw new Error(`child failed ${res.status}`);
        const { task } = (await res.json()) as { task: StudyTask };
        created.push(task);
      }
      setEditingChildren((prev) => [...prev, ...created]);
      setChildDrafts([createChildDraft(newDate || today)]);
      refresh();
      loadHistory(newDate || today);
    } catch (err) {
      console.error(err);
      setError(PLAN_TEXT.addError);
    } finally {
      setChildSaving(false);
    }
  };

  const handleChildDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setEditingChildren((prev) => {
      const oldIndex = prev.findIndex((c) => c.id === active.id);
      const newIndex = prev.findIndex((c) => c.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
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
    void updateTaskDate(String(active.id), targetDate);
  };

  return (
    <main className="space-y-4">
      <header className="space-y-1">
        <p className="text-xs font-medium text-slate-500">{PLAN_TEXT.headerStudyPlan}</p>
        <h1 className="text-2xl font-semibold">{PLAN_TEXT.pageTitle}</h1>
        <p className="text-sm text-slate-600">{PLAN_TEXT.pageDescription}</p>
      </header>

      {!loading && (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-sm font-medium text-slate-900">{PLAN_TEXT.todayProgressLabel}</p>
          {todayProgress ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-emerald-600">{todayProgress.percent}%</span>
              <span className="text-xs text-slate-500">
                ({todayProgress.done}/{todayProgress.total})
              </span>
            </div>
          ) : (
            <p className="text-xs text-slate-500">{PLAN_TEXT.progressNoTasks}</p>
          )}
        </div>
      )}

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
            <SortableContext items={itemsToday} strategy={verticalListSortingStrategy}>
              <TaskColumn
                id="today"
                title={`${PLAN_TEXT.todayBoardTitle} (${today})`}
                tasks={tasksToday}
                progress={todayProgress ?? undefined}
                progressLabel={PLAN_TEXT.todayProgressLabel}
                showAddButton
                onAddClick={() => openModalForDate(today)}
                onStatusChange={handleStatus}
                onEdit={openEditModal}
                onAddChild={openAddChild}
              />
            </SortableContext>

            <SortableContext items={itemsTomorrow} strategy={verticalListSortingStrategy}>
              <TaskColumn
                id="tomorrow"
                title={`${PLAN_TEXT.tomorrowBoardTitle} (${tomorrow})`}
                tasks={tasksTomorrow}
                onStatusChange={handleStatus}
                onEdit={openEditModal}
                onAddChild={openAddChild}
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
              onEdit={openEditModal}
              onAddChild={openAddChild}
            />
          </section>

          <DragOverlay
            dropAnimation={{
              duration: 200,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {activeTask ? (
              <TaskCardReadonly task={activeTask} onStatusChange={handleStatus} onEdit={openEditModal} onAddChild={openAddChild} />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <Modal
        open={modalOpen}
        title={editingTaskId ? PLAN_TEXT.modalEditTitle : PLAN_TEXT.modalTitle}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        footer={
          <div className="flex justify-between gap-2">
            <div>
              {editingTaskId && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving}
                  className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
                >
                  {PLAN_TEXT.modalDelete}
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
              >
                {PLAN_TEXT.modalCancel}
              </button>
              <button
                type="submit"
                form="task-form"
                disabled={saving}
                className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? PLAN_TEXT.modalSubmitAdding : editingTaskId ? PLAN_TEXT.modalSubmitEdit : PLAN_TEXT.modalSubmit}
              </button>
            </div>
          </div>
        }
      >
        <form id="task-form" onSubmit={handleSubmit} className="space-y-3">
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
          {parentId && (
            <p className="text-xs text-slate-600">
              {PLAN_TEXT.modalParentLabel}: {parentId}
            </p>
          )}
        </form>
          {editingTaskId && !parentId && (
            <div className="mt-4 space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-800">{PLAN_TEXT.modalChildSection}</p>
                <button
                type="button"
                onClick={() => setShowChildForm((prev) => !prev)}
                className="text-xs text-slate-700 underline"
              >
                {showChildForm ? PLAN_TEXT.modalChildToggleHide : PLAN_TEXT.modalChildToggleShow}
              </button>
              </div>
            {editingChildren.length > 0 && (
              <DndContext sensors={childSensors} onDragEnd={handleChildDragEnd}>
                <SortableContext
                  items={editingChildren.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {editingChildren.map((c) => (
                      <ChildSortableCard key={c.id} child={c} onEdit={openEditModal} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
            {showChildForm && (
              <div className="space-y-2 rounded-md border border-dashed border-slate-300 bg-white p-2">
                {childDrafts.map((draft, index) => (
                  <div key={index} className="space-y-2 rounded-md border border-slate-200 p-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-800">
                        {PLAN_TEXT.titleLabel} #{index + 1}
                      </p>
                      {childDrafts.length > 1 && (
                        <button
                          type="button"
                          className="text-[11px] text-slate-600 underline"
                          onClick={() =>
                            setChildDrafts((prev) =>
                              prev.length === 1 ? prev : prev.filter((_, i) => i !== index),
                            )
                          }
                        >
                          {PLAN_TEXT.modalCancel}
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700" htmlFor={`child-title-${index}`}>
                        {PLAN_TEXT.titleLabel}
                      </label>
                      <input
                        id={`child-title-${index}`}
                        type="text"
                        className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                        value={draft.title}
                        onChange={(e) =>
                          setChildDrafts((prev) =>
                            prev.map((d, i) => (i === index ? { ...d, title: e.target.value } : d)),
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700" htmlFor={`child-desc-${index}`}>
                        {PLAN_TEXT.descLabel}
                      </label>
                      <input
                        id={`child-desc-${index}`}
                        type="text"
                        className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                        value={draft.description}
                        onChange={(e) =>
                          setChildDrafts((prev) =>
                            prev.map((d, i) => (i === index ? { ...d, description: e.target.value } : d)),
                          )
                        }
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700" htmlFor={`child-date-${index}`}>
                          {PLAN_TEXT.dateLabel}
                        </label>
                        <input
                          id={`child-date-${index}`}
                          type="date"
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                          value={draft.date}
                          onChange={(e) =>
                            setChildDrafts((prev) =>
                              prev.map((d, i) => (i === index ? { ...d, date: e.target.value } : d)),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700" htmlFor={`child-time-${index}`}>
                          {PLAN_TEXT.timeLabel}
                        </label>
                        <input
                          id={`child-time-${index}`}
                          type="time"
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                          value={draft.time}
                          onChange={(e) =>
                            setChildDrafts((prev) =>
                              prev.map((d, i) => (i === index ? { ...d, time: e.target.value } : d)),
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setChildDrafts((prev) => [...prev, createChildDraft(newDate || today)])
                    }
                    className="rounded-md border border-slate-300 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
                  >
                    {PLAN_TEXT.addChildButton}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddChildInline}
                    disabled={childSaving || !childDrafts.some((d) => d.title.trim())}
                    className="flex-1 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    {childSaving ? PLAN_TEXT.modalSubmitAdding : PLAN_TEXT.modalChildSubmit}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </main>
  );
}
