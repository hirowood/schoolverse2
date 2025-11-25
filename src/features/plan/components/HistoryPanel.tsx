"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { StudyTask } from "../types";
import { TaskCard } from "./TaskCard";
import { PlaceholderCard } from "./PlaceholderCard";
import { PLAN_TEXT } from "../constants";

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
}: Props) => {
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });
  const items = tasks.length === 0 ? [placeholderId] : tasks.map((t) => t.id);

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
          {tasks.length === 0 ? (
            <p className="text-xs text-slate-500">{PLAN_TEXT.todayEmpty}</p>
          ) : (
            tasks.map((t) => (
              <div key={t.id} className="rounded-md border border-slate-200 bg-white px-3 py-2">
                <p className="text-sm font-medium text-slate-900">{t.title}</p>
                {t.description && <p className="text-xs text-slate-600">{t.description}</p>}
                <p className="text-[11px] text-slate-500">
                  {PLAN_TEXT.labelStatus}: {t.status}
                </p>
                {onEdit && (
                  <button
                    type="button"
                    className="mt-1 text-[11px] text-slate-600 underline"
                    onClick={() => onEdit(t)}
                  >
                    {PLAN_TEXT.editTaskButton}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      ) : isTomorrow ? (
        <div className="mt-2 space-y-2 rounded-md border border-slate-200 bg-white/60 p-3">
          <p className="text-xs font-medium text-slate-700">{PLAN_TEXT.tomorrowReadOnly}</p>
          {tasks.length === 0 ? (
            <p className="text-xs text-slate-500">{PLAN_TEXT.tomorrowEmpty}</p>
          ) : (
            tasks.map((t) => (
              <div key={t.id} className="rounded-md border border-slate-200 bg-white px-3 py-2">
                <p className="text-sm font-medium text-slate-900">{t.title}</p>
                {t.description && <p className="text-xs text-slate-600">{t.description}</p>}
                <p className="text-[11px] text-slate-500">
                  {PLAN_TEXT.labelStatus}: {t.status}
                </p>
                {onEdit && (
                  <button
                    type="button"
                    className="mt-1 text-[11px] text-slate-600 underline"
                    onClick={() => onEdit(t)}
                  >
                    {PLAN_TEXT.editTaskButton}
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
            ) : tasks.length === 0 ? (
              <PlaceholderCard id={placeholderId} label={PLAN_TEXT.historyPlaceholder} />
            ) : (
              tasks.map((t) => (
                <TaskCard key={t.id} task={t} onStatusChange={onStatusChange} onEdit={onEdit} />
              ))
            )}
          </div>
        </SortableContext>
      )}
    </div>
  );
};
