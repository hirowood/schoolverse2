"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { StudyTask } from "../types";
import { PLAN_TEXT } from "../constants";

type Props = {
  task: StudyTask;
  onStatusChange: (id: string, status: StudyTask["status"]) => void;
  onEdit?: (task: StudyTask) => void;
};

/**
 * Sortable task card shown in today / tomorrow / history lists.
 */
export const TaskCard = ({ task, onStatusChange, onEdit }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const statusLabel =
    task.status === "done"
      ? PLAN_TEXT.statusDone
      : task.status === "in_progress"
      ? PLAN_TEXT.statusInProgress
      : PLAN_TEXT.statusTodo;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col gap-1 rounded-lg border border-slate-200 bg-slate-50 p-3 ${
        isDragging ? "shadow-lg shadow-slate-300" : ""
      }`}
      {...attributes}
      {...listeners}
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
      </div>
    </div>
  );
};
