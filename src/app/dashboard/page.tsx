
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CREDO_ITEMS } from "@/features/credo/config";
import type { CredoPracticeFormValue } from "@/features/credo/types";
import type { StudyTask } from "@/features/plan/types";
import { addDays, formatLocalIsoDate, getToday, parseLocalDate } from "@/features/plan/utils/date";
import { Modal } from "@/components/ui/Modal";

type Profile = {
  name?: string;
  weeklyGoal?: string;
  activeHours?: string;
};

type CoachMessage = {
  id: string;
  role: "user" | "assistant";
  message: string;
  createdAt: string;
};

const statusLabel: Record<StudyTask["status"], string> = {
  todo: "未着手",
  in_progress: "進行中",
  paused: "一時停止",
  done: "完了",
};

const formatDuration = (seconds: number) => {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}時間${minutes.toString().padStart(2, "0")}分`;
  }
  return `${minutes}分`;
};

const nextChildTask = (task?: StudyTask): StudyTask | null => {
  if (!task?.children?.length) return null;
  for (const child of task.children) {
    if (child.status !== "done") return child;
    const deeper = nextChildTask(child);
    if (deeper) return deeper;
  }
  return null;
};

const dedupeTasks = (list: StudyTask[]) => {
  const map = new Map<string, StudyTask>();
  const walk = (task?: StudyTask) => {
    if (!task || map.has(task.id)) return;
    map.set(task.id, task);
    task.children?.forEach(walk);
  };
  list.forEach(walk);
  return Array.from(map.values());
};

const effectiveSeconds = (task: StudyTask, now: number) => {
  let base = task.totalWorkTime ?? 0;
  if (task.status === "in_progress" && task.lastStartedAt) {
    const started = new Date(task.lastStartedAt).getTime();
    if (!Number.isNaN(started)) {
      base += Math.floor((now - started) / 1000);
    }
  }
  return base;
};

const startOfWeekIso = (iso: string) => {
  const d = parseLocalDate(iso);
  const diffToMonday = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diffToMonday);
  return formatLocalIsoDate(d);
};

const TASK_FETCH_ERROR_MESSAGE = "�w�K�v�����̎擾�Ɏ��s���܂���";

const fetchTasksList = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`task fetch failed ${url} ${res.status}`);
  }
  const data = (await res.json()) as { tasks: StudyTask[] };
  return data.tasks;
};

const Bar = ({
  label,
  value,
  max,
  className,
}: {
  label: string;
  value: number;
  max: number;
  className: string;
}) => {
  const ratio = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const width = value > 0 ? Math.max(ratio, 6) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span className="font-medium text-slate-900">{(value / 3600).toFixed(1)}h</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${className}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
};

const TaskActions = ({
  task,
  onChange,
  disabled,
}: {
  task: StudyTask;
  onChange: (id: string, status: StudyTask["status"]) => void;
  disabled?: boolean;
}) => (
  <div className="flex flex-wrap gap-2">
    <button
      type="button"
      onClick={() => onChange(task.id, "in_progress")}
      disabled={disabled}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
        task.status === "in_progress"
          ? "bg-amber-500 text-white"
          : "border border-slate-300 text-slate-700 hover:bg-slate-100"
      } ${disabled ? "opacity-60" : ""}`}
    >
      実行
    </button>
    <button
      type="button"
      onClick={() => onChange(task.id, "paused")}
      disabled={disabled}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
        task.status === "paused"
          ? "bg-blue-500 text-white"
          : "border border-slate-300 text-slate-700 hover:bg-slate-100"
      } ${disabled ? "opacity-60" : ""}`}
    >
      一時停止
    </button>
    <button
      type="button"
      onClick={() => onChange(task.id, "done")}
      disabled={disabled}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
        task.status === "done"
          ? "bg-emerald-600 text-white"
          : "border border-slate-300 text-slate-700 hover:bg-slate-100"
      } ${disabled ? "opacity-60" : ""}`}
    >
      完了
    </button>
  </div>
);

export default function DashboardPage() {
  const [today, setToday] = useState(getToday());
  const [tasksToday, setTasksToday] = useState<StudyTask[]>([]);
  const [allTaskRows, setAllTaskRows] = useState<StudyTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [detailTitle, setDetailTitle] = useState("");
  const [detailDesc, setDetailDesc] = useState("");
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editTarget, setEditTarget] = useState<StudyTask | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [goalInput, setGoalInput] = useState("");
  const [savedGoal, setSavedGoal] = useState("");

  const [condition, setCondition] = useState<{ done: number; total: number; note?: string } | null>(null);
  const [conditionError, setConditionError] = useState<string | null>(null);
  const [conditionLoading, setConditionLoading] = useState(false);

  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [messageError, setMessageError] = useState<string | null>(null);

  const [nowTick, setNowTick] = useState(() => Date.now());
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const healthCredoIds = useMemo(() => {
    const keywords = ["睡眠", "体調", "休息", "疲労", "食事"];
    const matches = CREDO_ITEMS.filter((item) => {
      const haystack = `${item.category}${item.title}${item.description}`;
      return keywords.some((kw) => haystack.includes(kw)) || item.category === "睡眠と体調";
    }).map((item) => item.id);
    return matches.length ? matches : CREDO_ITEMS.map((item) => item.id);
  }, []);

  const healthCredoTitles = useMemo(
    () => healthCredoIds.map((id) => CREDO_ITEMS.find((c) => c.id === id)?.title).filter((t): t is string => Boolean(t)),
    [healthCredoIds],
  );

  const refreshTasks = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;
    try {
      if (!silent) setTasksLoading(true);
      const [todayTasks, allTasksResult] = await Promise.all([
        fetchTasksList(`/api/tasks?date=${today}`),
        fetchTasksList("/api/tasks"),
      ]);
      setTasksToday(todayTasks);
      setAllTaskRows(allTasksResult);
      setTaskError(null);
    } catch (e) {
      console.error(e);
      setTaskError(TASK_FETCH_ERROR_MESSAGE);
    } finally {
      if (!silent) setTasksLoading(false);
    }
  }, [today]);

  useEffect(() => {
    const id = setInterval(() => {
      const iso = getToday();
      if (iso !== today) {
        setToday(iso);
      }
      setNowTick(Date.now());
    }, 60_000);
    return () => clearInterval(id);
  }, [today]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `dashboard-goal-${today}`;
    const stored = window.localStorage.getItem(key);
    if (stored !== null) {
      setGoalInput(stored);
      setSavedGoal(stored);
    } else {
      setGoalInput("");
      setSavedGoal("");
    }
  }, [today]);

  const handleSaveGoal = () => {
    if (typeof window === "undefined") return;
    const key = `dashboard-goal-${today}`;
    const trimmed = goalInput.trim();
    window.localStorage.setItem(key, trimmed);
    setSavedGoal(trimmed);
  };

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/settings/profile");
        if (!res.ok) throw new Error(`failed ${res.status}`);
        const data = (await res.json()) as Profile;
        if (!active) return;
        setProfile(data);
        setProfileError(null);
      } catch (e) {
        console.error(e);
        if (active) setProfileError("プロフィール情報を取得できませんでした");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setConditionLoading(true);
        const res = await fetch(`/api/credo/practices?date=${today}`);
        if (!res.ok) {
          if (res.status === 401) throw new Error("サインインしてください");
          throw new Error(`failed ${res.status}`);
        }
        const data = (await res.json()) as { values?: Record<string, CredoPracticeFormValue> };
        if (!active) return;
        const values = data.values ?? {};
        const done = healthCredoIds.filter((id) => values[id]?.done).length;
        const total = healthCredoIds.length;
        const note = healthCredoIds
          .map((id) => values[id]?.note?.trim())
          .find((n) => n && n.length > 0);
        setCondition({ done, total, note: note || undefined });
        setConditionError(null);
      } catch (e) {
        console.error(e);
        if (active) {
          setCondition(null);
          setConditionError((e as Error).message || "体調ログを取得できませんでした");
        }
      } finally {
        if (active) setConditionLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [healthCredoIds, today]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/coach/chat");
        if (!res.ok) {
          if (res.status === 401) throw new Error("サインインしてください");
          throw new Error(`failed ${res.status}`);
        }
        const data = (await res.json()) as { messages: CoachMessage[] };
        if (!active) return;
        setMessages(data.messages.slice(-6));
        setMessageError(null);
      } catch (e) {
        console.error(e);
        if (active) setMessageError((e as Error).message || "連絡の取得に失敗しました");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const allTasks = useMemo(() => dedupeTasks(allTaskRows), [allTaskRows]);
  const rootTasks = useMemo(() => tasksToday.filter((t) => !t.parentId), [tasksToday]);

  const sortedRootTasks = useMemo(() => {
    const order: Record<StudyTask["status"], number> = { in_progress: 0, todo: 1, paused: 2, done: 3 };
    return [...rootTasks].sort((a, b) => order[a.status] - order[b.status]);
  }, [rootTasks]);

  const activeTask = useMemo(() => {
    for (const parent of sortedRootTasks) {
      const nextChild = nextChildTask(parent);
      if (nextChild) return { task: nextChild, parent };
      if (parent.status !== "done") return { task: parent, parent: parent };
    }
    return null;
  }, [sortedRootTasks]);

  const todayTopTask = activeTask?.task ?? null;
  const todayTopParent = activeTask?.parent ?? null;
  const currentTodoList = useMemo(() => {
    const parent = todayTopParent ?? todayTopTask;
    return parent?.children ?? [];
  }, [todayTopParent, todayTopTask]);
  const activeRootId = todayTopParent?.id ?? (todayTopTask && !todayTopParent ? todayTopTask.id : null);
  const planTodoList = useMemo(
    () => sortedRootTasks.filter((t) => t.status !== "done" && t.id !== activeRootId),
    [activeRootId, sortedRootTasks],
  );
  const topTodo = planTodoList[0] ?? null;
  const nextTodo = planTodoList[1] ?? null;
  const autoCompleteRef = useRef<string | null>(null);

  const findTaskAndParent = useCallback(
    (id: string): { task: StudyTask | null; parent: StudyTask | null } => {
      for (const root of rootTasks) {
        if (root.id === id) return { task: root, parent: null };
        if (root.children?.length) {
          const stack = [...(root.children ?? [])];
          while (stack.length) {
            const cur = stack.pop()!;
            if (cur.id === id) return { task: cur, parent: root };
            if (cur.children?.length) stack.push(...cur.children);
          }
        }
      }
      return { task: null, parent: null };
    },
    [rootTasks],
  );

  const findNextChild = useCallback((parent?: StudyTask | null) => {
    if (!parent?.children?.length) return null;
    return parent.children.find((c) => c.status !== "done") ?? null;
  }, []);


  const handleAddDetail = useCallback(async () => {
    // ルートレベルの今日のTodoとして追加する
    const title = detailTitle.trim();
    const description = detailDesc.trim();
    if (!title) {
      setDetailError("タイトルを入力してください");
      return;
    }
    setDetailLoading(true);
    setDetailError(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          date: today,
          parentId: null,
          source: "dashboard",
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setDetailError(data.error || "追加に失敗しました");
        return;
      }
      setDetailTitle("");
      setDetailDesc("");
      setDetailModalOpen(false);
      await refreshTasks({ silent: true });
    } catch (e) {
      console.error(e);
      setDetailError("追加に失敗しました。ネットワークをご確認ください。");
    } finally {
      setDetailLoading(false);
    }
  }, [detailDesc, detailTitle, refreshTasks, today]);

  const openEditModal = useCallback((task: StudyTask) => {
    setEditTarget(task);
    setEditTitle(task.title);
    setEditDesc(task.description ?? "");
    setEditModalOpen(true);
  }, []);

  const handleUpdateChild = useCallback(async () => {
    if (!editTarget) return;
    const title = editTitle.trim();
    const description = editDesc.trim();
    if (!title) {
      setDetailError("タイトルを入力してください");
      return;
    }
    setEditLoading(true);
    setDetailError(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editTarget.id,
          title,
          description: description || null,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setDetailError(data.error || "更新に失敗しました");
        return;
      }
      setEditModalOpen(false);
      setEditTarget(null);
      await refreshTasks({ silent: true });
    } catch (e) {
      console.error(e);
      setDetailError("更新に失敗しました。ネットワークをご確認ください。");
    } finally {
      setEditLoading(false);
    }
  }, [editDesc, editTarget, editTitle, refreshTasks]);

  const handleDeleteChild = useCallback(
    async (id: string) => {
      setDeleteLoadingId(id);
      setDetailError(null);
      try {
        const res = await fetch("/api/tasks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setDetailError(data.error || "削除に失敗しました");
          return;
        }
        await refreshTasks({ silent: true });
      } catch (e) {
        console.error(e);
        setDetailError("削除に失敗しました。ネットワークをご確認ください。");
      } finally {
        setDeleteLoadingId(null);
      }
    },
    [refreshTasks],
  );

  const todayStats = useMemo(() => {
    const inProgress = rootTasks.filter((t) => t.status === "in_progress").length;
    const done = rootTasks.filter((t) => t.status === "done").length;
    return {
      total: rootTasks.length,
      inProgress,
      done,
      remaining: Math.max(rootTasks.length - done, 0),
    };
  }, [rootTasks]);

  const seriesMaps = useMemo(() => {
    const daily = new Map<string, number>();
    const weekly = new Map<string, number>();
    const monthly = new Map<string, number>();
    const now = nowTick;

    allTasks.forEach((task) => {
      if (!task.dueDate) return;
      const dayKey = task.dueDate.slice(0, 10);
      const value = effectiveSeconds(task, now);

      daily.set(dayKey, (daily.get(dayKey) ?? 0) + value);

      const weekKey = startOfWeekIso(dayKey);
      weekly.set(weekKey, (weekly.get(weekKey) ?? 0) + value);

      const monthKey = dayKey.slice(0, 7);
      monthly.set(monthKey, (monthly.get(monthKey) ?? 0) + value);
    });

    return { daily, weekly, monthly };
  }, [allTasks, nowTick]);

  const totalSeconds = useMemo(() => {
    const now = nowTick;
    return allTasks.reduce((sum, t) => sum + effectiveSeconds(t, now), 0);
  }, [allTasks, nowTick]);

  const dailySeries = useMemo(() => {
    const rows: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const iso = addDays(today, -i);
      rows.push({
        label: iso.slice(5),
        value: seriesMaps.daily.get(iso) ?? 0,
      });
    }
    return rows;
  }, [seriesMaps.daily, today]);

  const weeklySeries = useMemo(() => {
    const currentWeek = startOfWeekIso(today);
    const rows: { label: string; value: number }[] = [];
    for (let i = 7; i >= 0; i -= 1) {
      const weekStart = addDays(currentWeek, -7 * i);
      const date = parseLocalDate(weekStart);
      const label = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
      rows.push({
        label,
        value: seriesMaps.weekly.get(weekStart) ?? 0,
      });
    }
    return rows;
  }, [seriesMaps.weekly, today]);

  const monthlySeries = useMemo(() => {
    const rows: { label: string; value: number }[] = [];
    const base = parseLocalDate(today);
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      rows.push({
        label: key,
        value: seriesMaps.monthly.get(key) ?? 0,
      });
    }
    return rows;
  }, [seriesMaps.monthly, today]);

  const totalMax = Math.max(
    ...dailySeries.map((s) => s.value),
    ...weeklySeries.map((s) => s.value),
    ...monthlySeries.map((s) => s.value),
    0,
  );

  const planHint =
    profile?.activeHours === "morning"
      ? "朝型（6-9時）が集中しやすい設定になっています"
      : profile?.activeHours === "evening"
        ? "夜型（18-21時）が集中しやすい設定になっています"
        : profile?.activeHours === "day"
          ? "日中（12-15時）が集中しやすい設定になっています"
          : null;

  const healthPreview = healthCredoTitles.slice(0, 3).join(" / ");

  const handleStatusChange = useCallback(
    async (id: string, status: StudyTask["status"]) => {
      setStatusUpdating(id);
      setStatusError(null);
      try {
        const setStatusSilent = async (targetId: string, targetStatus: StudyTask["status"]) => {
          await fetch("/api/tasks", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: targetId, status: targetStatus }),
          }).catch(console.error);
        };

        const res = await fetch("/api/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          if (data.error === "child_not_done") {
            setStatusError("子タスクが未完了です。先に子タスクを完了してください。");
          } else {
            setStatusError("更新に失敗しました。リロードして再度お試しください。");
          }
          return;
        }
        // 追加の自動遷移ロジック
        const { task, parent } = findTaskAndParent(id);

        // 親タスクを実行 -> 最初の未完了子を実行状態に
        if (status === "in_progress" && task && !parent) {
          const next = findNextChild(task);
          if (next && next.status !== "in_progress") {
            await setStatusSilent(next.id, "in_progress");
          }
          // 今日のTodoのトップも実行に
          if (topTodo && topTodo.status !== "in_progress") {
            await setStatusSilent(topTodo.id, "in_progress");
          }
        }

        // 今日のTodo一番上を一時停止 -> 今やっているタスクも一時停止
        if (status === "paused" && topTodo && id === topTodo.id && todayTopTask && todayTopTask.status !== "paused") {
          await setStatusSilent(todayTopTask.id, "paused");
        }

        // 今日のTodo一番上が完了 -> 次のTodoを実行、無ければ今やっているタスクを完了
        if (status === "done" && topTodo && id === topTodo.id) {
          if (nextTodo) {
            if (nextTodo.status !== "in_progress") {
              await setStatusSilent(nextTodo.id, "in_progress");
            }
          } else if (todayTopTask && todayTopTask.status !== "done") {
            await setStatusSilent(todayTopTask.id, "done");
          }
        }

        // 子タスクが完了 -> 次の子を実行、なければ親を完了
        if (status === "done" && parent) {
          const next = findNextChild(parent);
          if (next) {
            if (next.status !== "in_progress") {
              await setStatusSilent(next.id, "in_progress");
            }
          } else if (parent.status !== "done") {
            await setStatusSilent(parent.id, "done");
          }
        }

        await refreshTasks({ silent: true });
      } catch (e) {
        console.error(e);
        setStatusError("更新に失敗しました。ネットワークをご確認ください。");
      } finally {
        setStatusUpdating(null);
      }
    },
    [findNextChild, findTaskAndParent, nextTodo, refreshTasks, todayTopTask, topTodo],
  );

  // 子Todoがすべて完了したら親（もしくは現在のタスク）を完了にする
  useEffect(() => {
    const parent = todayTopParent ?? todayTopTask;
    if (!parent || currentTodoList.length === 0) return;
    if (statusUpdating) return;
    const allDone = currentTodoList.every((c) => c.status === "done");
    if (!allDone) {
      autoCompleteRef.current = null;
      return;
    }
    if (autoCompleteRef.current === parent.id) return;
    autoCompleteRef.current = parent.id;
    handleStatusChange(parent.id, "done");
  }, [currentTodoList, handleStatusChange, statusUpdating, todayTopParent, todayTopTask]);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-slate-500">Dashboard</p>
        <h1 className="text-3xl font-semibold text-slate-900">ダッシュボード</h1>
        <p className="text-sm text-slate-600">
          プランページ・コーチ・クレドからの実データをまとめて確認できます。今日の一歩と時間の使い方をここで振り返りましょう。
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">今日の学習プラン</h2>
              <p className="text-xs text-slate-600">/plan のタスクから取得しています</p>
            </div>
            {taskError && <p className="text-xs text-red-500">{taskError}</p>}
          </div>

          {statusError && <p className="text-xs text-red-500">{statusError}</p>}

          {tasksLoading ? (
            <p className="text-sm text-slate-600">読み込み中...</p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                  <p className="text-xs text-slate-500">残タスク</p>
                  <p className="text-2xl font-semibold text-slate-900">{todayStats.remaining}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                  <p className="text-xs text-slate-500">進行中</p>
                  <p className="text-2xl font-semibold text-amber-600">{todayStats.inProgress}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                  <p className="text-xs text-slate-500">完了</p>
                  <p className="text-2xl font-semibold text-emerald-600">{todayStats.done}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                  <p className="text-xs text-slate-500">合計</p>
                  <p className="text-2xl font-semibold text-slate-900">{todayStats.total}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-slate-500">今やっているタスク</p>
                    {statusUpdating && todayTopTask?.id === statusUpdating && (
                      <span className="text-[11px] text-slate-500">更新中...</span>
                    )}
                  </div>
                  {todayTopTask ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-slate-900">{todayTopTask.title}</p>
                        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] text-white">
                          {statusLabel[todayTopTask.status]}
                        </span>
                        {todayTopParent && todayTopParent.id !== todayTopTask.id && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                            親: {todayTopParent.title}
                          </span>
                        )}
                        {todayTopTask.dueDate && (
                          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-700">
                            {todayTopTask.dueDate.slice(0, 10)} {todayTopTask.dueDate.slice(11, 16)}
                          </span>
                        )}
                      </div>
                      {todayTopTask.description && (
                        <p className="text-sm text-slate-700">{todayTopTask.description}</p>
                      )}
                      <TaskActions task={todayTopTask} onChange={handleStatusChange} disabled={statusUpdating !== null} />
                      <div className="rounded-md border border-dashed border-slate-300 bg-white px-3 py-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-semibold text-slate-800">タスクの具体化（子Todo追加）</p>
                          <button
                            type="button"
                            onClick={() => {
                              setDetailModalOpen(true);
                              setDetailError(null);
                            }}
                            disabled={!todayTopTask}
                            className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                          >
                            追加する
                          </button>
                        </div>
                        {detailError && <span className="text-[11px] text-red-500">{detailError}</span>}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">今日のタスクはまだ作成されていません</p>
                  )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-slate-500">今日の学習プランのTodo</p>
                    {statusUpdating && <span className="text-[11px] text-slate-500">更新中...</span>}
                  </div>
                  {planTodoList.length === 0 ? (
                    <p className="text-sm text-slate-600">まだTodoはありません</p>
                  ) : (
                    <div className="space-y-2">
                      {planTodoList.map((child) => (
                        <div key={child.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p
                                className={`text-sm font-semibold ${child.status === "done" ? "text-slate-500 line-through" : "text-slate-900"}`}
                              >
                                {child.title}
                              </p>
                              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] text-white">
                                {statusLabel[child.status]}
                              </span>
                              {child.dueDate && (
                                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-700">
                                  {child.dueDate.slice(0, 10)} {child.dueDate.slice(11, 16)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(child)}
                                className="rounded-md border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
                              >
                                編集
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteChild(child.id)}
                                disabled={deleteLoadingId === child.id}
                                className="rounded-md border border-red-300 px-2 py-1 text-[11px] text-red-700 hover:bg-red-50 disabled:opacity-60"
                              >
                                {deleteLoadingId === child.id ? "削除中" : "削除"}
                              </button>
                            </div>
                          </div>
                          {child.description && (
                            <p
                              className={`mt-1 text-xs ${child.status === "done" ? "text-slate-500 line-through" : "text-slate-700"}`}
                            >
                              {child.description}
                            </p>
                          )}
                          <div className="mt-2">
                            <TaskActions task={child} onChange={handleStatusChange} disabled={statusUpdating !== null} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {planHint && <p className="text-[11px] text-slate-500">設定ページより: {planHint}</p>}
            </>
          )}
        </section>

        <Modal
          open={detailModalOpen}
          title="子Todoを追加"
          onClose={() => {
            setDetailModalOpen(false);
            setDetailError(null);
          }}
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDetailModalOpen(false);
                  setDetailError(null);
                }}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleAddDetail}
                disabled={detailLoading || !todayTopTask}
                className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {detailLoading ? "追加中..." : "追加"}
              </button>
            </div>
          }
        >
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800" htmlFor="detail-title">
                タイトル
              </label>
              <input
                id="detail-title"
                type="text"
                value={detailTitle}
                onChange={(e) => setDetailTitle(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="子タスクのタイトル"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800" htmlFor="detail-desc">
                メモ（任意）
              </label>
              <textarea
                id="detail-desc"
                value={detailDesc}
                onChange={(e) => setDetailDesc(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                rows={3}
                placeholder="補足メモがあれば入力"
              />
            </div>
            <p className="text-xs text-slate-500">追加先: 今日の学習プラン（トップレベル）</p>
            {detailError && <p className="text-xs text-red-500">{detailError}</p>}
          </div>
        </Modal>

        <Modal
          open={editModalOpen}
          title="子Todoを編集"
          onClose={() => {
            setEditModalOpen(false);
            setDetailError(null);
          }}
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditModalOpen(false);
                  setDetailError(null);
                }}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleUpdateChild}
                disabled={editLoading || !editTarget}
                className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {editLoading ? "更新中..." : "更新"}
              </button>
            </div>
          }
        >
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800" htmlFor="edit-title">
                タイトル
              </label>
              <input
                id="edit-title"
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="子タスクのタイトル"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800" htmlFor="edit-desc">
                メモ（任意）
              </label>
              <textarea
                id="edit-desc"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                rows={3}
                placeholder="補足メモがあれば入力"
              />
            </div>
            {detailError && <p className="text-xs text-red-500">{detailError}</p>}
          </div>
        </Modal>

        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">今日の目標</h2>
          {profile?.weeklyGoal && (
            <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
              <p className="text-[11px] font-medium text-indigo-800">週間目標（設定ページより）</p>
              <p className="text-sm text-indigo-900">{profile.weeklyGoal}</p>
            </div>
          )}
          {profileError && <p className="text-xs text-red-500">{profileError}</p>}
          <div className="space-y-2">
            <textarea
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              rows={4}
              placeholder="今日のフォーカスや目標をメモ（例: 章末問題を2問解く）"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
            />
            <button
              type="button"
              onClick={handleSaveGoal}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              目標を保存
            </button>
            {savedGoal ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-600">表示中の目標（{today}）</p>
                <p className="text-sm text-slate-900">{savedGoal}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">保存するとここに表示されます</p>
            )}
          </div>
        </section>
      </div>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">学習時間トラッカー</h2>
            <p className="text-xs text-slate-600">タスクの経過時間（totalWorkTime）を集計しています</p>
          </div>
          <div className="rounded-lg bg-slate-900 px-3 py-2 text-right text-white">
            <p className="text-[11px] uppercase tracking-wide text-slate-200">累計</p>
            <p className="text-xl font-semibold">{formatDuration(totalSeconds)}</p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-700">月次</p>
            {monthlySeries.map((row) => (
              <Bar
                key={row.label}
                label={row.label}
                value={row.value}
                max={totalMax}
                className="bg-linear-to-r from-indigo-400 to-indigo-600"
              />
            ))}
          </div>
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-700">週次（週の開始は月曜）</p>
            {weeklySeries.map((row) => (
              <Bar
                key={row.label}
                label={row.label}
                value={row.value}
                max={totalMax}
                className="bg-linear-to-r from-emerald-400 to-emerald-600"
              />
            ))}
          </div>
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-700">日次（直近7日）</p>
            {dailySeries.map((row) => (
              <Bar
                key={row.label}
                label={row.label}
                value={row.value}
                max={totalMax}
                className="bg-linear-to-r from-amber-400 to-amber-600"
              />
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">今日の体調</h2>
              <p className="text-xs text-slate-600">クレドページのログから計算</p>
            </div>
            {conditionError && <p className="text-xs text-red-500">{conditionError}</p>}
          </div>
          {conditionLoading ? (
            <p className="text-sm text-slate-600">読み込み中...</p>
          ) : condition ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-emerald-100 bg-emerald-50">
                  <span className="text-lg font-semibold text-emerald-700">
                    {Math.round((condition.done / condition.total) * 100)}%
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {condition.done} / {condition.total} を実行
                  </p>
                  <p className="text-xs text-slate-600">
                    体調/セルフケアに関するチェックを完了するとここに反映されます
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                対象: {condition.total} 項目（睡眠・体調・休息系を優先抽出）{healthPreview ? ` / 例: ${healthPreview}` : ""}
              </p>
              {condition.note && (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold text-slate-700">メモ</p>
                  <p className="text-sm text-slate-900">{condition.note}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-600">今日のクレド記録はまだありません</p>
          )}
        </section>

        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">連絡・メモ</h2>
              <p className="text-xs text-slate-600">AIコーチの最新メッセージを表示</p>
            </div>
            {messageError && <p className="text-xs text-red-500">{messageError}</p>}
          </div>
          {messages.length === 0 ? (
            <p className="text-sm text-slate-600">まだメッセージがありません</p>
          ) : (
            <div className="space-y-2">
              {messages
                .slice(-4)
                .reverse()
                .map((msg) => (
                  <div key={msg.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold">{msg.role === "assistant" ? "AIコーチ" : "あなた"}</span>
                      <span>{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-900">{msg.message}</p>
                  </div>
                ))}
            </div>
          )}
          <p className="text-[11px] text-slate-500">
            詳細は /coach でチャットできます。緊急の連絡メモにも使えます。
          </p>
        </section>
      </div>
    </main>
  );
}
