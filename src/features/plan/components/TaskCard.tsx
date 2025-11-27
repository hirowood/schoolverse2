"use client";

import type { ComponentProps, CSSProperties } from "react";
import { useEffect, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { StudyTask } from "../types";
import { PLAN_TEXT } from "../constants";

type Props = {
  task: StudyTask;
  onStatusChange: (id: string, status: StudyTask["status"]) => void;
  onEdit?: (task: StudyTask) => void;
  onAddChild?: (task: StudyTask) => void;
};

// 深さ優先で最初の未完了の子孫タスクを取得
const findNextChildTask = (children?: StudyTask[]): StudyTask | null => {
  if (!children?.length) return null;
  for (const child of children) {
    if (child.status !== "done") return child;
    const descendant = findNextChildTask(child.children);
    if (descendant) return descendant;
  }
  return null;
};

// 秒を時:分:秒形式に変換
const formatWorkTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}時間${minutes}分${seconds}秒`;
  }
  if (minutes > 0) {
    return `${minutes}分${seconds}秒`;
  }
  return `${seconds}秒`;
};

// 子タスクの作業時間を再帰的に合計（実行中のタスクの経過時間も含む）
const calculateTotalWorkTime = (children: StudyTask[] | undefined, now: number): number => {
  if (!children?.length) return 0;
  return children.reduce((total, child) => {
    let childTime = child.totalWorkTime ?? 0;
    // 実行中の子タスクの経過時間を加算
    if (child.status === "in_progress" && child.lastStartedAt) {
      const startTime = new Date(child.lastStartedAt).getTime();
      childTime += Math.floor((now - startTime) / 1000);
    }
    // 孫タスクの時間も加算
    childTime += calculateTotalWorkTime(child.children, now);
    return total + childTime;
  }, 0);
};

type CardContentProps = Props & {
  setNodeRef?: (element: HTMLElement | null) => void;
  style?: CSSProperties;
  dragProps?: ComponentProps<"div">;
  isDragging?: boolean;
};

// 子タスクカードコンポーネント（作業時間とステータスボタン付き）
const NextChildTaskCard = ({
  child,
  onStatusChange,
}: {
  child: StudyTask;
  onStatusChange: (id: string, status: StudyTask["status"]) => void;
}) => {
  const [childWorkTime, setChildWorkTime] = useState(0);

  useEffect(() => {
    const updateWorkTime = () => {
      const now = Date.now();
      let time = child.totalWorkTime ?? 0;
      if (child.status === "in_progress" && child.lastStartedAt) {
        const startTime = new Date(child.lastStartedAt).getTime();
        time += Math.floor((now - startTime) / 1000);
      }
      setChildWorkTime(time);
    };

    updateWorkTime();

    if (child.status === "in_progress") {
      const interval = setInterval(updateWorkTime, 1000);
      return () => clearInterval(interval);
    }
  }, [child.status, child.lastStartedAt, child.totalWorkTime]);

  const childStatusLabel =
    child.status === "done"
      ? PLAN_TEXT.statusDone
      : child.status === "in_progress"
      ? PLAN_TEXT.statusInProgress
      : child.status === "paused"
      ? PLAN_TEXT.statusPaused
      : PLAN_TEXT.statusTodo;

  return (
    <div className="mt-2 rounded-md border border-dashed border-slate-300 bg-white px-3 py-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-800">次の子タスク</p>
      </div>
      <p className="text-xs font-semibold text-slate-900">{child.title}</p>
      {child.description && <p className="text-[11px] text-slate-700">{child.description}</p>}
      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
        <span>
          {PLAN_TEXT.labelStatus}: {childStatusLabel}
        </span>
        <span>
          {PLAN_TEXT.labelSchedule}:{" "}
          {child.dueDate ? `${child.dueDate.slice(0, 10)} ${child.dueDate.slice(11, 16)}` : PLAN_TEXT.notSet}
        </span>
        <span className={child.status === "in_progress" ? "font-medium text-amber-600" : ""}>
          {PLAN_TEXT.labelWorkTime}: {formatWorkTime(childWorkTime)}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(child.id, "todo");
          }}
          className={`rounded-md px-2 py-1 text-[11px] ${
            child.status === "todo"
              ? "bg-slate-900 text-white"
              : "border border-slate-300 text-slate-700"
          }`}
        >
          {PLAN_TEXT.statusTodo}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(child.id, "in_progress");
          }}
          className={`rounded-md px-2 py-1 text-[11px] ${
            child.status === "in_progress"
              ? "bg-amber-500 text-white"
              : "border border-slate-300 text-slate-700"
          }`}
        >
          {PLAN_TEXT.statusInProgress}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(child.id, "paused");
          }}
          className={`rounded-md px-2 py-1 text-[11px] ${
            child.status === "paused"
              ? "bg-blue-500 text-white"
              : "border border-slate-300 text-slate-700"
          }`}
        >
          {PLAN_TEXT.statusPaused}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(child.id, "done");
          }}
          className={`rounded-md px-2 py-1 text-[11px] ${
            child.status === "done"
              ? "bg-emerald-600 text-white"
              : "border border-slate-300 text-slate-700"
          }`}
        >
          {PLAN_TEXT.statusDone}
        </button>
      </div>
    </div>
  );
};

const TaskCardContent = ({
  task,
  onStatusChange,
  onEdit,
  onAddChild,
  setNodeRef,
  style,
  dragProps,
  isDragging,
}: CardContentProps) => {
  // リアルタイム作業時間計算
  const [currentWorkTime, setCurrentWorkTime] = useState(0);
  const hasChildren = !!task.children?.length;

  useEffect(() => {
    const updateWorkTime = () => {
      const now = Date.now();
      
      if (hasChildren) {
        // 親タスクの場合: 子タスクの合計時間を計算
        setCurrentWorkTime(calculateTotalWorkTime(task.children, now));
      } else {
        // 子タスクがない場合: 自分自身の時間を計算
        let time = task.totalWorkTime ?? 0;
        if (task.status === "in_progress" && task.lastStartedAt) {
          const startTime = new Date(task.lastStartedAt).getTime();
          time += Math.floor((now - startTime) / 1000);
        }
        setCurrentWorkTime(time);
      }
    };

    // 初期値を計算
    updateWorkTime();

    // 実行中のタスクがあるかチェック（自分または子タスク）
    const hasInProgressTask = task.status === "in_progress" || 
      (hasChildren && task.children?.some(c => c.status === "in_progress"));

    if (hasInProgressTask) {
      // 1秒ごとに更新
      const interval = setInterval(updateWorkTime, 1000);
      return () => clearInterval(interval);
    }
  }, [task.status, task.lastStartedAt, task.totalWorkTime, task.children, hasChildren]);

  const statusLabel =
    task.status === "done"
      ? PLAN_TEXT.statusDone
      : task.status === "in_progress"
      ? PLAN_TEXT.statusInProgress
      : task.status === "paused"
      ? PLAN_TEXT.statusPaused
      : PLAN_TEXT.statusTodo;
  const canAddChild = !!onAddChild && !task.parentId;
  const nextChild = findNextChildTask(task.children);
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-1 rounded-lg border border-slate-200 bg-slate-50 p-3 ${
        isDragging ? "shadow-lg shadow-slate-300" : ""
      }`}
      style={style}
      {...dragProps}
      onDoubleClick={() => onEdit?.(task)}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-slate-900">{task.title}</p>
          {task.description && <p className="text-xs text-slate-700">{task.description}</p>}
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
            >
              {PLAN_TEXT.editTaskButton}
            </button>
          )}
          {canAddChild && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(task);
              }}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
            >
              {PLAN_TEXT.addChildButton}
            </button>
          )}
          <button
            type="button"
            onClick={() => onStatusChange(task.id, "todo")}
            className={`rounded-md px-2 py-1 text-xs ${
              task.status === "todo"
                ? "bg-slate-900 text-white"
                : "border border-slate-300 text-slate-700"
            }`}
          >
            {PLAN_TEXT.statusTodo}
          </button>
          <button
            type="button"
            onClick={() => onStatusChange(task.id, "in_progress")}
            className={`rounded-md px-2 py-1 text-xs ${
              task.status === "in_progress"
                ? "bg-amber-500 text-white"
                : "border border-slate-300 text-slate-700"
            }`}
          >
            {PLAN_TEXT.statusInProgress}
          </button>
          <button
            type="button"
            onClick={() => onStatusChange(task.id, "paused")}
            className={`rounded-md px-2 py-1 text-xs ${
              task.status === "paused"
                ? "bg-blue-500 text-white"
                : "border border-slate-300 text-slate-700"
            }`}
          >
            {PLAN_TEXT.statusPaused}
          </button>
          <button
            type="button"
            onClick={() => onStatusChange(task.id, "done")}
            className={`rounded-md px-2 py-1 text-xs ${
              task.status === "done"
                ? "bg-emerald-600 text-white"
                : "border border-slate-300 text-slate-700"
            }`}
          >
            {PLAN_TEXT.statusDone}
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span>
          {PLAN_TEXT.labelStatus}: {statusLabel}
        </span>
        <span>
          {PLAN_TEXT.labelSchedule}: {task.dueDate ? `${task.dueDate.slice(0, 10)} ${task.dueDate.slice(11, 16)}` : PLAN_TEXT.notSet}
        </span>
        <span className={(task.status === "in_progress" || (hasChildren && task.children?.some(c => c.status === "in_progress"))) ? "font-medium text-amber-600" : ""}>
          {PLAN_TEXT.labelWorkTime}: {formatWorkTime(currentWorkTime)}
        </span>
      </div>
      {nextChild && (
        <NextChildTaskCard 
          child={nextChild} 
          onStatusChange={onStatusChange}
        />
      )}
    </div>
  );
};

/**
 * Sortable task card shown in today / tomorrow / history lists.
 */
export const TaskCard = ({ task, onStatusChange, onEdit, onAddChild }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TaskCardContent
      task={task}
      onStatusChange={onStatusChange}
      onEdit={onEdit}
      onAddChild={onAddChild}
      setNodeRef={setNodeRef}
      style={style}
      dragProps={{ ...attributes, ...listeners }}
      isDragging={isDragging}
    />
  );
};

/** Read-only card (no drag registration) used for non-movable views/overlays. */
export const TaskCardReadonly = ({ task, onStatusChange, onEdit, onAddChild }: Props) => (
  <TaskCardContent
    task={task}
    onStatusChange={onStatusChange}
    onEdit={onEdit}
    onAddChild={onAddChild}
  />
);
