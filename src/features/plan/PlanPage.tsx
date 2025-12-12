"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Modal } from "@/components/ui/Modal";
import { Button, buttonClassName } from "@/components/ui/Button";
import { ChildSortableCard, ChildTaskCard } from "@/features/plan/components/ChildTaskCard";
import { SummaryCards } from "@/features/plan/components/SummaryCards";
import { MobileQuickActions } from "@/features/plan/components/MobileQuickActions";
import { TaskBoards } from "@/features/plan/components/TaskBoards";
import { PLAN_TEXT } from "@/features/plan/constants";
import { StudyTask } from "@/features/plan/types";
import { addDays, formatLocalIsoDate, getToday, parseLocalDate, buildTaskTree } from "@/features/plan/utils/date";
import { usePomodoroTimer } from "@/features/plan/hooks/usePomodoroTimer";
import { createChildDraft, useTaskModal } from "@/features/plan/hooks/useTaskModal";
import { createTask, deleteTask, fetchTasksByDate, patchTask } from "@/features/plan/services/taskService";
import OnboardingPanel, { OnboardingStep } from "@/components/OnboardingPanel";

const PLAN_ONBOARDING_KEY = "schoolverse2-onboarding-plan";
const PLAN_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "タスクを俯瞰",
    detail: "今日・明日のボードでタスクをドラッグして順番や日付を調整できます。",
  },
  {
    title: "ステータスと時間追跡",
    detail: "ステータス変更で計測も更新。Pomodoro + timer が背景で進行を記録。",
  },
  {
    title: "履歴とカレンダー",
    detail: "カレンダー/履歴パネルで過去のタスクや時間の流れを振り返りましょう。",
  },
];
type ProfileResponse = Partial<{
  name: string;
  weeklyGoal: string;
  activeHours: "morning" | "day" | "evening";
  coachTone: "gentle" | "logical";
  pomodoroEnabled: boolean;
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
}>;


export function PlanPage() {
  const [today, setToday] = useState(getToday());
  const tomorrow = useMemo(() => addDays(today, 1), [today]);
  const [tasksToday, setTasksToday] = useState<StudyTask[]>([]);
  const [tasksTomorrow, setTasksTomorrow] = useState<StudyTask[]>([]);
  const [dashboardTasks, setDashboardTasks] = useState<StudyTask[]>([]);
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

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<StudyTask | null>(null);
  const [detailStack, setDetailStack] = useState<StudyTask[]>([]);
  const [pomodoroEnabled, setPomodoroEnabled] = useState(false);
  const [pomodoroWorkMinutes, setPomodoroWorkMinutes] = useState(25);
  const [pomodoroBreakMinutes, setPomodoroBreakMinutes] = useState(5);
  const [restModalOpen, setRestModalOpen] = useState(false);
  const [pomodoroLoading, setPomodoroLoading] = useState(false);
  const [showPlanOnboarding, setShowPlanOnboarding] = useState(false);

  const {
    modalOpen,
    editingTaskId,
    newTitle,
    setNewTitle,
    newDescription,
    setNewDescription,
    newDate,
    setNewDate,
    newTime,
    setNewTime,
    parentId,
    editingChildren,
    setEditingChildren,
    showChildForm,
    setShowChildForm,
    childDrafts,
    setChildDrafts,
    childSaving,
    setChildSaving,
    openModalForDate,
    openEditModal,
    openAddChild,
    closeTaskModal,
  } = useTaskModal(today);

  const toggleSingleTaskMode = useCallback(() => {
    setSingleTaskMode((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("singleTaskMode", String(next));
      }
      return next;
    });
  }, []);

  // シングルタスクモード（実行中は1つだけ）
  const [singleTaskMode, setSingleTaskMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("singleTaskMode") === "true";
    }
    return false;
  });
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ id: string; status: StudyTask["status"] } | null>(null);

  const handleDismissPlanOnboarding = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PLAN_ONBOARDING_KEY, "1");
    setShowPlanOnboarding(false);
  }, []);

  const handleShowPlanOnboarding = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(PLAN_ONBOARDING_KEY);
    setShowPlanOnboarding(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = window.localStorage.getItem(PLAN_ONBOARDING_KEY) === "1";
    setShowPlanOnboarding(!dismissed);
  }, []);

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

  const calculateParentCompletion = useCallback((tasks: StudyTask[]) => {
    const tree = buildTaskTree(tasks);
    // Count only parent tasks (top-level tasks without parentId)
    const parents = tree.filter((t) => !t.parentId);
    if (parents.length === 0) return null;
    const done = parents.filter((t) => t.status === "done").length;
    return { done, total: parents.length, percent: Math.round((done / parents.length) * 100) };
  }, []);

  const todayLeafProgress = useMemo(() => calculateLeafCompletion(tasksToday), [calculateLeafCompletion, tasksToday]);
  const todayParentProgress = useMemo(() => calculateParentCompletion(tasksToday), [calculateParentCompletion, tasksToday]);


  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [t1, t2] = await Promise.all([
        fetchTasksByDate(today),
        fetchTasksByDate(tomorrow),
      ]);
      // �w�K�v�����^�X�N�isource !== "dashboard"�j
      setTasksToday(t1.filter((t) => t.source !== "dashboard"));
      setTasksTomorrow(t2.filter((t) => t.source !== "dashboard"));
      // �_�b�V���{�[�h�Œǉ������^�X�N�i�������j
      setDashboardTasks(t1.filter((t) => t.source === "dashboard"));
      setError(null);
    } catch (e) {
      console.error(e);
      setError(PLAN_TEXT.fetchError);
    } finally {
      setLoading(false);
    }
  }, [today, tomorrow]);

  const collectAllTasks = useCallback(() => {
    const walk = (nodes: StudyTask[]): StudyTask[] =>
      nodes.flatMap((n) => [n, ...(n.children?.length ? walk(n.children) : [])]);
    return [...walk(tasksToday), ...walk(tasksTomorrow), ...walk(dashboardTasks)];
  }, [dashboardTasks, tasksToday, tasksTomorrow]);

  const pauseAllInProgress = useCallback(async () => {
    const running = collectAllTasks().filter((t) => t.status === "in_progress");
    if (!running.length) return;
    try {
      await Promise.all(running.map((task) => patchTask({ id: task.id, status: "paused" })));
      await refresh();
    } catch (err) {
      console.error(err);
      setError(PLAN_TEXT.statusError);
    }
  }, [collectAllTasks, refresh]);

  const handleWorkComplete = useCallback(async () => {
    await pauseAllInProgress();
    setRestModalOpen(true);
  }, [pauseAllInProgress]);

  const handleBreakComplete = useCallback(() => {
    setRestModalOpen(false);
  }, []);

  const { phase: pomodoroPhase, secondsLeft: pomodoroSecondsLeft } = usePomodoroTimer({
    enabled: pomodoroEnabled,
    workMinutes: pomodoroWorkMinutes,
    breakMinutes: pomodoroBreakMinutes,
    onWorkComplete: handleWorkComplete,
    onBreakComplete: handleBreakComplete,
  });

  useEffect(() => {
    if (!pomodoroEnabled) {
      setRestModalOpen(false);
    }
  }, [pomodoroEnabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const formatPomodoroTime = useCallback((seconds: number) => {
    const clamped = Math.max(0, Math.floor(seconds));
    const mm = String(Math.floor(clamped / 60)).padStart(2, "0");
    const ss = String(clamped % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setPomodoroLoading(true);
        const res = await fetch("/api/settings/profile");
        if (!res.ok) throw new Error(`profile ${res.status}`);
        const data = (await res.json()) as ProfileResponse;
        const enabled = Boolean(data.pomodoroEnabled);
        const work = Number(data.pomodoroWorkMinutes ?? 25);
        const rest = Number(data.pomodoroBreakMinutes ?? 5);
        const safeWork = Number.isFinite(work) && work > 0 ? work : 25;
        const safeRest = Number.isFinite(rest) && rest > 0 ? rest : 5;
        setPomodoroEnabled(enabled);
        setPomodoroWorkMinutes(safeWork);
        setPomodoroBreakMinutes(safeRest);
        setRestModalOpen(false);
      } catch (err) {
        console.error(err);
      } finally {
        setPomodoroLoading(false);
      }
    };
    fetchProfile();
  }, []);

    const loadHistory = useCallback(
      async (targetDate: string) => {
        try {
          setHistoryLoading(true);
          const tasks = await fetchTasksByDate(targetDate);
          setHistoryTasks(tasks.filter((t) => t.source !== "dashboard"));
          setHistoryDate(targetDate);
        } catch (e) {
          console.error(e);
          setError(PLAN_TEXT.fetchError);
        } finally {
          setHistoryLoading(false);
        }
      },
      [],
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
  }, [today, setHistoryDate, setNewDate, setCurrentMonth]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    const targetDate = newDate || historyDate || today;
    if (!title || !targetDate) return;
    setSaving(true);
    try {
      const payload = {
        title,
        description: newDescription,
        date: targetDate,
        time: newTime || null,
        parentId,
      };
      const res = editingTaskId
        ? await patchTask({ ...payload, id: editingTaskId })
        : await createTask(payload);
      if (!res.ok) throw new Error(`failed ${res.status}`);
      closeTaskModal();
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
      const res = await deleteTask(editingTaskId);
      if (!res.ok) throw new Error(`delete failed ${res.status}`);
      closeTaskModal();
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
    if (pomodoroEnabled && pomodoroPhase === "break" && status === "in_progress") {
      setError("休憩中は開始できません");
      return;
    }
    // シングルタスクモードがONで、実行中にしようとしている場合
    if (singleTaskMode && status === "in_progress") {
      // 自分自身を除外して実行中のタスクがあるかチェック
      const allTasks = [...tasksToday, ...tasksTomorrow];
      const checkInProgressExcludingSelf = (tasks: StudyTask[], targetId: string): boolean => {
        for (const task of tasks) {
          // 自分自身以外で実行中のタスクがあるか
          if (task.id !== targetId && task.status === "in_progress") return true;
          // 子タスクもチェック
          if (task.children?.length) {
            for (const child of task.children) {
              if (child.id !== targetId && child.status === "in_progress") return true;
            }
          }
        }
        return false;
      };
      const hasOtherInProgress = checkInProgressExcludingSelf(allTasks, id);
      
      if (hasOtherInProgress) {
        // 既に実行中のタスクがあるので警告モーダルを表示
        setPendingStatusChange({ id, status });
        setWarningModalOpen(true);
        return;
      }
    }

    try {
      const res = await patchTask({ id, status });
      if (!res.ok) {
        const data = await res.json();
        console.error("Status update failed:", data);
        // 特定のエラーコードに応じたメッセージを表示
        if (data.error === "child_not_done") {
          setError(PLAN_TEXT.childNotDoneError);
          return;
        }
        throw new Error(data.error || `failed ${res.status}`);
      }
      await refresh();
    } catch (e) {
      console.error(e);
      setError(PLAN_TEXT.statusError);
    }
  };

  const handleTogglePomodoro = useCallback(() => {
    setPomodoroEnabled((prev) => {
      const next = !prev;
      if (!next) {
        setRestModalOpen(false);
      }
      return next;
    });
  }, []);

  // 警告モーダルで「続行」を押した場合（強制的に実行中にする）
  const handleForceStatusChange = async () => {
    if (!pendingStatusChange) return;
    setWarningModalOpen(false);
    try {
      const res = await patchTask(pendingStatusChange);
      if (!res.ok) {
        const data = await res.json();
        console.error("Status update failed:", data);
        throw new Error(data.error || `failed ${res.status}`);
      }
      await refresh();
    } catch (e) {
      console.error(e);
      setError(PLAN_TEXT.statusError);
    } finally {
      setPendingStatusChange(null);
    }
  };

  const updateTaskDate = async (taskId: string, targetDate: string) => {
    try {
      await patchTask({ id: taskId, date: targetDate });
    } catch (e) {
      console.error(e);
      setError(PLAN_TEXT.dateError);
      refresh();
      if (targetDate === historyDate) loadHistory(targetDate);
    }
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
        const res = await createTask({
          title: draft.title,
          description: draft.description,
          date: draft.date || today,
          time: draft.time || null,
          parentId: editingTaskId,
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

  const openDetailModal = (task: StudyTask) => {
    setDetailTask(task);
    setDetailStack([]);
    setDetailModalOpen(true);
  };

  const handleDetailDrillDown = (task: StudyTask) => {
    if (detailTask) {
      setDetailStack((prev) => [...prev, detailTask]);
    }
    setDetailTask(task);
  };

  const handleDetailBack = () => {
    if (detailStack.length > 0) {
      const prev = detailStack[detailStack.length - 1];
      setDetailStack((s) => s.slice(0, -1));
      setDetailTask(prev);
    }
  };

  // 詳細モーダル内で表示するタスクリスト（子タスク + ダッシュボードタスク）
  const detailChildren = useMemo(() => {
    if (!detailTask) return [];
    const children = detailTask.children ?? [];
    // ダッシュボードで追加したタスクも表示（親タスクと同じ日付の場合のみ）
    const dashboardForThisTask = dashboardTasks.filter((t) => {
      // 親タスクとダッシュボードタスクの日付が一致する場合に表示
      if (!detailTask.dueDate || !t.dueDate) return false;
      return detailTask.dueDate.slice(0, 10) === t.dueDate.slice(0, 10);
    });
    return [...children, ...dashboardForThisTask];
  }, [detailTask, dashboardTasks]);

  return (
    <main className="space-y-4 pb-24">
      {showPlanOnboarding && (
        <OnboardingPanel
          show
          title="タスクと時間を整える"
          description="一覧/履歴/時間の流れを順に使って、今週の学習を整理しましょう。"
          steps={PLAN_ONBOARDING_STEPS}
          onClose={handleDismissPlanOnboarding}
        />
      )}
      {!showPlanOnboarding && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleShowPlanOnboarding}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Onboardingを再表示
          </button>
        </div>
      )}
      <header className="space-y-1">
        <p className="text-xs font-medium text-slate-500">{PLAN_TEXT.headerStudyPlan}</p>
        <h1 className="text-2xl font-semibold">{PLAN_TEXT.pageTitle}</h1>
        <p className="text-sm text-slate-600">{PLAN_TEXT.pageDescription}</p>
      </header>

      {!loading && (
        <SummaryCards
          todayParentProgress={todayParentProgress}
          pomodoroEnabled={pomodoroEnabled}
          pomodoroLoading={pomodoroLoading}
          pomodoroPhase={pomodoroPhase}
          pomodoroSecondsLeft={pomodoroSecondsLeft}
          pomodoroWorkMinutes={pomodoroWorkMinutes}
          pomodoroBreakMinutes={pomodoroBreakMinutes}
          singleTaskMode={singleTaskMode}
          onTogglePomodoro={handleTogglePomodoro}
          onToggleSingleTaskMode={toggleSingleTaskMode}
          formatPomodoroTime={formatPomodoroTime}
          todayLabel={PLAN_TEXT.todayProgressLabel}
          singleTaskLabel={PLAN_TEXT.singleTaskModeLabel}
          singleTaskDescription={PLAN_TEXT.singleTaskModeDescription}
        />
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
      {loading ? (
        <p className="text-sm text-slate-500">{PLAN_TEXT.loading}</p>
      ) : (
        <TaskBoards
          today={today}
          tomorrow={tomorrow}
          currentMonthIso={formatLocalIsoDate(currentMonth)}
          historyDate={historyDate}
          isHistoryToday={isHistoryToday}
          isHistoryTomorrow={isHistoryTomorrow}
          historyTasks={historyTasks}
          historyLoading={historyLoading}
          historyColumnId={historyColumnId}
          historyPlaceholderId={historyPlaceholderId}
          itemsToday={itemsToday}
          itemsTomorrow={itemsTomorrow}
          tasksToday={tasksToday}
          tasksTomorrow={tasksTomorrow}
          todayLeafProgress={todayLeafProgress ?? undefined}
          onSelectHistoryDate={setHistoryDate}
          onPrevMonth={() => goMonth(-1)}
          onNextMonth={() => goMonth(1)}
          onOpenModalForDate={openModalForDate}
          onStatusChange={handleStatus}
          onEdit={openEditModal}
          onAddChild={openAddChild}
          onDetail={openDetailModal}
          onLoadHistory={loadHistory}
          activeTask={activeTask}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          collisionDetection={closestCenter}
          historyTodayTasks={tasksToday}
          historyTomorrowTasks={tasksTomorrow}
        />
      )}

      <MobileQuickActions
        onAddToday={() => openModalForDate(today)}
        onAddTomorrow={() => openModalForDate(tomorrow)}
      />

      <Modal
        open={modalOpen}
        title={editingTaskId ? PLAN_TEXT.modalEditTitle : PLAN_TEXT.modalTitle}
        onClose={closeTaskModal}
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
                onClick={closeTaskModal}
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
                          className="px-1 py-1 text-xs text-slate-600 underline sm:text-[11px]"
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
                  <Button
                    variant="outline"
                    size="tapXs"
                    onClick={() =>
                      setChildDrafts((prev) => [...prev, createChildDraft(newDate || today)])
                    }
                  >
                    {PLAN_TEXT.addChildButton}
                  </Button>
                  <Button
                    variant="solid"
                    color="slate"
                    size="tap"
                    className="flex-1"
                    onClick={handleAddChildInline}
                    disabled={childSaving || !childDrafts.some((d) => d.title.trim())}
                  >
                    {childSaving ? PLAN_TEXT.modalSubmitAdding : PLAN_TEXT.modalChildSubmit}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* シングルタスクモード警告モーダル */}
      <Modal
        open={warningModalOpen}
        title={PLAN_TEXT.singleTaskWarningTitle}
        onClose={() => {
          setWarningModalOpen(false);
          setPendingStatusChange(null);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setWarningModalOpen(false);
                setPendingStatusChange(null);
              }}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              {PLAN_TEXT.singleTaskWarningCancel}
            </button>
            <button
              type="button"
              onClick={handleForceStatusChange}
              className="rounded-md bg-amber-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
            >
              {PLAN_TEXT.singleTaskWarningContinue}
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-700">{PLAN_TEXT.singleTaskWarningMessage}</p>
      </Modal>

      {/* 休憩モーダル */}
      <Modal
        open={restModalOpen}
        title="休憩です"
        onClose={() => setRestModalOpen(false)}
        footer={null}
      >
        <p className="text-sm text-slate-700">休憩中は実行できません。タイマー終了までお待ちください。</p>
      </Modal>
      {/* 詳細モーダル - 子タスク + ダッシュボードTodo表示 */}
      <Modal
        open={detailModalOpen}
        title={detailTask ? `📋 ${detailTask.title} の詳細` : "詳細"}
        onClose={() => {
          setDetailModalOpen(false);
          setDetailTask(null);
          setDetailStack([]);
        }}
      >
        {detailTask ? (
          <div className="space-y-4">
            {/* パンくずナビゲーション */}
            {detailStack.length > 0 && (
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Button variant="outline" size="tap" onClick={handleDetailBack}>
                  ← 戻る
                </Button>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  {detailStack.map((t, i) => (
                    <span key={t.id}>
                      {i > 0 && " / "}
                      <button
                        type="button"
                        onClick={() => {
                          setDetailTask(t);
                          setDetailStack((s) => s.slice(0, i));
                        }}
                        className="text-slate-700 underline hover:text-slate-900"
                      >
                        {t.title}
                      </button>
                    </span>
                  ))}
                  <span> / {detailTask.title}</span>
                </div>
              </div>
            )}

            {/* 親タスク情報 */}
            <div className="rounded-lg border border-slate-300 bg-white p-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-slate-900">{detailTask.title}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  detailTask.status === "done"
                    ? "bg-emerald-100 text-emerald-700"
                    : detailTask.status === "in_progress"
                      ? "bg-amber-100 text-amber-700"
                      : detailTask.status === "paused"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-700"
                }`}
              >
                {detailTask.status === "done"
                  ? "完了"
                  : detailTask.status === "in_progress"
                    ? "進行中"
                    : detailTask.status === "paused"
                      ? "一時停止"
                      : "未着手"}
              </span>
              <Link
                href={`/notes?taskId=${detailTask.id}&taskTitle=${encodeURIComponent(detailTask.title ?? "")}`}
                className={buttonClassName({
                  variant: "outline",
                  color: "slate",
                  size: "chipXs",
                  rounded: "full",
                  className: "hover:bg-slate-50",
                })}
              >
                📝 このタスクのノート
              </Link>
            </div>
              {detailTask.dueDate && (
                <p className="mt-1 text-sm text-slate-600">
                  予定: {detailTask.dueDate.slice(0, 10)} {detailTask.dueDate.slice(11, 16)}
                </p>
              )}
              {detailTask.description && <p className="mt-2 text-sm text-slate-700">{detailTask.description}</p>}
            </div>

            {/* 子タスク一覧 */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">
                  子タスク・Todo {detailChildren.length > 0 ? `(${detailChildren.length}件)` : ""}
                </p>
              </div>
              {detailChildren.length === 0 ? (
                <p className="text-sm text-slate-500">子タスクはありません</p>
              ) : (
                <div className="space-y-2">
                  {detailChildren.map((child) => (
                    <ChildTaskCard
                      key={child.id}
                      task={child}
                      onOpenDetail={handleDetailDrillDown}
                      onStatusChange={handleStatus}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ダッシュボードで追加したTodo（別セクション） */}
            {dashboardTasks.length > 0 && detailStack.length === 0 && (
              <div className="border-t border-slate-200 pt-4">
                <p className="mb-2 text-sm font-semibold text-slate-800">
                  📋 ダッシュボードで追加したTodo（今日）
                </p>
                <div className="space-y-2">
                  {dashboardTasks.map((task) => (
                    <ChildTaskCard
                      key={task.id}
                      task={task}
                      onOpenDetail={handleDetailDrillDown}
                      onStatusChange={handleStatus}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-600">タスクが選択されていません</p>
        )}
      </Modal>
    </main>
  );
}

export default PlanPage;
