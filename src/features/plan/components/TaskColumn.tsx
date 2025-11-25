"use client";

import { useDroppable } from "@dnd-kit/core";
import { StudyTask } from "../types";
import { PLAN_TEXT } from "../constants";
import { TaskCard } from "./TaskCard";

type Props = {
  id: string;
  title: string;
  tasks: StudyTask[];
  showAddButton?: boolean;
  onAddClick?: () => void;
  onStatusChange: (id: string, status: StudyTask["status"]) => void;
};

/**
 * Droppable column with optional “新規タスク”ボタン.
 */
export const TaskColumn = ({ id, title, tasks, showAddButton, onAddClick, onStatusChange }: Props) => {
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
        {showAddButton && (
          <button
            type="button"
            onClick={onAddClick}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            {PLAN_TEXT.newTaskButton}
          </button>
        )}
      </div>
      {tasks.length === 0 ? (
        <p className="text-sm text-slate-500">{PLAN_TEXT.boardEmptyGeneric}</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
};
