"use client";

// 1カラム分のタスク一覧 + 追加ボタン + 進捗表示
import { useDroppable } from "@dnd-kit/core";
import { StudyTask } from "../types";
import { PLAN_TEXT } from "../constants";
import { TaskCard } from "./TaskCard";
import { buildTaskTree } from "../utils/date";
import { Button } from "@/components/ui/Button";
import { cardClassName } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type Props = {
  id: string;
  title: string;
  tasks: StudyTask[];
  showAddButton?: boolean;
  onAddClick?: () => void;
  onStatusChange: (id: string, status: StudyTask["status"]) => void;
  onEdit?: (task: StudyTask) => void;
  onAddChild?: (task: StudyTask) => void;
  onDetail?: (task: StudyTask) => void;
  progress?: { percent: number; done: number; total: number };
  progressLabel?: string;
};

/** Droppable column with optional add button */
export const TaskColumn = ({
  id,
  title,
  tasks,
  showAddButton,
  onAddClick,
  onStatusChange,
  onEdit,
  onAddChild,
  onDetail,
  progress,
  progressLabel,
}: Props) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const tree = buildTaskTree(tasks);

  return (
    <div
      ref={setNodeRef}
      className={cardClassName({
        padding: "board",
        className: cn("space-y-3 transition", isOver ? "ring-2 ring-slate-300" : ""),
      })}
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex-1 min-w-[160px]">{title}</h2>
        {progress ? (
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
            {progressLabel ? <span className="text-[11px] text-slate-500">{progressLabel}</span> : null}
            <span className="text-sm text-emerald-600">{progress.percent}%</span>
            <span className="text-[11px] text-slate-500">
              ({progress.done}/{progress.total})
            </span>
          </div>
        ) : null}
        {showAddButton && (
          <Button
            variant="solid"
            color="slate"
            size="tap"
            onClick={onAddClick}
            className="w-full shadow hover:-translate-y-0.5 sm:w-auto"
          >
            {PLAN_TEXT.newTaskButton}
          </Button>
        )}
      </div>
      {tasks.length === 0 ? (
        <p className="text-sm text-slate-500">{PLAN_TEXT.boardEmptyGeneric}</p>
      ) : (
        <div className="space-y-2">
          {tree.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onDetail={onDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
};
