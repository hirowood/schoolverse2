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
  const flatten = (nodes: StudyTask[], depth = 0): { task: StudyTask; depth: number }[] =>
    nodes.flatMap((n) => [{ task: n, depth }, ...flatten(n.children ?? [], depth + 1)]);
  const flatTasks = flatten(tree);
  const titleMap = new Map<string, string>();
  const walk = (nodes: StudyTask[]) => {
    nodes.forEach((n) => {
      titleMap.set(n.id, n.title);
      walk(n.children ?? []);
    });
  };
  walk(tree);
  const items = flatTasks.length === 0 ? [placeholderId] : flatTasks.map((t) => t.task.id);

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
          {flatTasks.length === 0 ? (
            <p className="text-xs text-slate-500">{PLAN_TEXT.todayEmpty}</p>
          ) : (
            flatTasks.map(({ task, depth }) => (
              <div key={task.id} className="rounded-md border border-slate-200 bg-white px-3 py-2">
                <p className="text-sm font-medium text-slate-900" style={{ marginLeft: depth * 12 }}>
                  {task.title}
                </p>
                {task.description && <p className="text-xs text-slate-600" style={{ marginLeft: depth * 12 }}>{task.description}</p>}
                <p className="text-[11px] text-slate-500" style={{ marginLeft: depth * 12 }}>
                  {PLAN_TEXT.labelStatus}: {task.status}
                </p>
                {task.parentId && (
                  <p className="text-[11px] text-slate-500" style={{ marginLeft: depth * 12 }}>
                    {PLAN_TEXT.modalParentLabel}: {titleMap.get(task.parentId)}
                  </p>
                )}
                {onEdit && (
                  <button
                    type="button"
                    className="text-[11px] text-slate-600 underline"
                    onClick={() => onEdit(task)}
                  >
                    {PLAN_TEXT.editTaskButton}
                  </button>
                )}
                {onAddChild && (
                  <button
                    type="button"
                    className="text-[11px] text-slate-600 underline"
                    onClick={() => onAddChild(task)}
                  >
                    {PLAN_TEXT.addChildButton}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      ) : isTomorrow ? (
        <div className="mt-2 space-y-2 rounded-md border border-slate-200 bg-white/60 p-3">
          <p className="text-xs font-medium text-slate-700">{PLAN_TEXT.tomorrowReadOnly}</p>
          {flatTasks.length === 0 ? (
            <p className="text-xs text-slate-500">{PLAN_TEXT.tomorrowEmpty}</p>
          ) : (
            flatTasks.map(({ task, depth }) => (
              <div key={task.id} className="rounded-md border border-slate-200 bg-white px-3 py-2">
                <p className="text-sm font-medium text-slate-900" style={{ marginLeft: depth * 12 }}>
                  {task.title}
                </p>
                {task.description && <p className="text-xs text-slate-600" style={{ marginLeft: depth * 12 }}>{task.description}</p>}
                <p className="text-[11px] text-slate-500" style={{ marginLeft: depth * 12 }}>
                  {PLAN_TEXT.labelStatus}: {task.status}
                </p>
                {task.parentId && (
                  <p className="text-[11px] text-slate-500" style={{ marginLeft: depth * 12 }}>
                    {PLAN_TEXT.modalParentLabel}: {titleMap.get(task.parentId)}
                  </p>
                )}
                {onEdit && (
                  <button
                    type="button"
                    className="text-[11px] text-slate-600 underline"
                    onClick={() => onEdit(task)}
                  >
                    {PLAN_TEXT.editTaskButton}
                  </button>
                )}
                {onAddChild && (
                  <button
                    type="button"
                    className="text-[11px] text-slate-600 underline"
                    onClick={() => onAddChild(task)}
                  >
                    {PLAN_TEXT.addChildButton}
                  </button>
                )}
              </div>
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
            ) : flatTasks.length === 0 ? (
              <PlaceholderCard id={placeholderId} label={PLAN_TEXT.historyPlaceholder} />
            ) : (
              flatTasks.map(({ task, depth }) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  depth={depth}
                  parentTitle={task.parentId ? titleMap.get(task.parentId) : undefined}
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
