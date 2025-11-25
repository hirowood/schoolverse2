"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { StudyTask } from "../types";
import { TaskCard } from "./TaskCard";
import { PlaceholderCard } from "./PlaceholderCard";
import { PLAN_TEXT } from "../constants";
import { buildTaskTree } from "../utils/date";

type Props = {
  selectedDate: string;
  isToday: boolean;
  isTomorrow: boolean;
  tasks: StudyTask[];
  loading: boolean;
  droppableId: string;
  placeholderId: string;
  onAddClick: () => void;
  onStatusChange: (id: string, status: StudyTask["status"]) => void;
  onEdit?: (task: StudyTask) => void;
  onAddChild?: (task: StudyTask) => void;
};

/** カレンダーの「選択した日」のカードとタスクリスト。 */
export const HistoryPanel = ({
  selectedDate,
  isToday,
  isTomorrow,
  tasks,
  loading,
  droppableId,
  placeholderId,
  onAddClick,
  onStatusChange,
  onEdit,
  onAddChild,
}: Props) => {
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });
  const tree = buildTaskTree(tasks);
  const items = tree.length === 0 ? [placeholderId] : tree.map((t) => t.id);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-900">
          {PLAN_TEXT.selectedDate}: {selectedDate}
        </p>
        <button
          type="button"
          onClick={onAddClick}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          {PLAN_TEXT.addToThisDate}
        </button>
      </div>

      {isToday ? (
        <div className="mt-2 space-y-2 rounded-md border border-slate-200 bg-white/60 p-3">
          <p className="text-xs font-medium text-slate-700">{PLAN_TEXT.todayReadOnly}</p>
          {tree.length === 0 ? (
            <p className="text-xs text-slate-500">{PLAN_TEXT.todayEmpty}</p>
          ) : (
            tree.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onAddChild={onAddChild}
              />
            ))
          )}
        </div>
      ) : isTomorrow ? (
        <div className="mt-2 space-y-2 rounded-md border border-slate-200 bg-white/60 p-3">
          <p className="text-xs font-medium text-slate-700">{PLAN_TEXT.tomorrowReadOnly}</p>
          {tree.length === 0 ? (
            <p className="text-xs text-slate-500">{PLAN_TEXT.tomorrowEmpty}</p>
          ) : (
            tree.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onAddChild={onAddChild}
              />
            ))
          )}
        </div>
      ) : (
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div
            ref={setNodeRef}
            className={`mt-2 space-y-2 rounded-md border border-dashed border-slate-300 bg-white/70 p-3 ${
              isOver ? "ring-2 ring-slate-300" : ""
            }`}
          >
            {loading ? (
              <p className="text-xs text-slate-500">{PLAN_TEXT.loading}</p>
            ) : tree.length === 0 ? (
              <PlaceholderCard id={placeholderId} label={PLAN_TEXT.historyPlaceholder} />
            ) : (
              tree.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={onStatusChange}
                  onEdit={onEdit}
                  onAddChild={onAddChild}
                />
              ))
            )}
          </div>
        </SortableContext>
      )}
    </div>
  );
};
