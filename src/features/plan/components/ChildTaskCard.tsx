"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { PLAN_TEXT } from "@/features/plan/constants";
import { StudyTask } from "@/features/plan/types";

type ChildCardProps = {
  child: StudyTask;
  onEdit: (task: StudyTask) => void;
};

export const ChildSortableCard = ({ child, onEdit }: ChildCardProps) => {
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

type ChildTaskCardProps = {
  task: StudyTask;
  depth?: number;
  onOpenDetail: (task: StudyTask) => void;
  onStatusChange: (id: string, status: StudyTask["status"]) => void;
};

export const ChildTaskCard = ({ task, depth = 0, onOpenDetail, onStatusChange }: ChildTaskCardProps) => {
  const hasChildren = task.children && task.children.length > 0;
  const statusColors: Record<StudyTask["status"], string> = {
    done: "bg-emerald-100 text-emerald-700",
    in_progress: "bg-amber-100 text-amber-700",
    paused: "bg-blue-100 text-blue-700",
    todo: "bg-slate-100 text-slate-700",
  };
  const statusLabels: Record<StudyTask["status"], string> = {
    done: "����",
    in_progress: "�i�s��",
    paused: "�ꎞ��~",
    todo: "������",
  };
  const sourceLabel = task.source === "dashboard" ? "?? �_�b�V���{�[�h" : null;

  return (
    <div
      className={`rounded-md border bg-slate-50 p-3 ${depth > 0 ? "border-slate-200" : "border-slate-300"}`}
      style={{ marginLeft: depth > 0 ? `${depth * 12}px` : 0 }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">{task.title}</span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] ${statusColors[task.status]}`}>
            {statusLabels[task.status]}
          </span>
          {sourceLabel && (
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] text-indigo-700">{sourceLabel}</span>
          )}
          {hasChildren && (
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] text-slate-600">
              �q�^�X�N: {task.children!.length}��
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {hasChildren && (
            <button
              type="button"
              onClick={() => onOpenDetail(task)}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
            >
              �ڍ�
            </button>
          )}
        </div>
      </div>
      {task.dueDate && (
        <p className="mt-1 text-[11px] text-slate-600">
          �\��: {task.dueDate.slice(0, 10)} {task.dueDate.slice(11, 16)}
        </p>
      )}
      {task.description && <p className="mt-1 text-xs text-slate-700">{task.description}</p>}
      <div className="mt-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => onStatusChange(task.id, "in_progress")}
          className={`rounded px-2 py-1 text-[11px] font-medium ${
            task.status === "in_progress"
              ? "bg-amber-500 text-white"
              : "border border-slate-300 text-slate-700 hover:bg-slate-100"
          }`}
        >
          ���s
        </button>
        <button
          type="button"
          onClick={() => onStatusChange(task.id, "paused")}
          className={`rounded px-2 py-1 text-[11px] font-medium ${
            task.status === "paused"
              ? "bg-blue-500 text-white"
              : "border border-slate-300 text-slate-700 hover:bg-slate-100"
          }`}
        >
          �ꎞ��~
        </button>
        <button
          type="button"
          onClick={() => onStatusChange(task.id, "done")}
          className={`rounded px-2 py-1 text-[11px] font-medium ${
            task.status === "done"
              ? "bg-emerald-600 text-white"
              : "border border-slate-300 text-slate-700 hover:bg-slate-100"
          }`}
        >
          ����
        </button>
      </div>
    </div>
  );
};
