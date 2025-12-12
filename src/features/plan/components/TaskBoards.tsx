"use client";

// 日/明日のタスクボードと履歴パネルをまとめたモジュール（ドラッグ&ドロップを含む）
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CalendarGrid } from "./CalendarGrid";
import { HistoryPanel } from "./HistoryPanel";
import { TaskColumn } from "./TaskColumn";
import { TaskCardReadonly } from "./TaskCard";
import type { StudyTask } from "../types";
import { cardClassName } from "@/components/ui/Card";

type Props = {
  today: string;
  tomorrow: string;
  currentMonthIso: string;
  historyDate: string;
  isHistoryToday: boolean;
  isHistoryTomorrow: boolean;
  historyTasks: StudyTask[];
  historyLoading: boolean;
  historyColumnId: string;
  historyPlaceholderId: string;
  itemsToday: string[];
  itemsTomorrow: string[];
  tasksToday: StudyTask[];
  tasksTomorrow: StudyTask[];
  todayLeafProgress?: { percent: number; done: number; total: number };
  onSelectHistoryDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onOpenModalForDate: (date: string) => void;
  onStatusChange: (id: string, status: StudyTask["status"]) => void;
  onEdit: (task: StudyTask) => void;
  onAddChild: (task: StudyTask) => void;
  onDetail: (task: StudyTask) => void;
  onLoadHistory: (date: string) => void;
  activeTask: StudyTask | null;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  sensors?: ReturnType<typeof useSensors>;
  collisionDetection?: CollisionDetection;
  historyTodayTasks: StudyTask[];
  historyTomorrowTasks: StudyTask[];
};

export function TaskBoards({
  today,
  tomorrow,
  currentMonthIso,
  historyDate,
  isHistoryToday,
  isHistoryTomorrow,
  historyTasks,
  historyLoading,
  historyColumnId,
  historyPlaceholderId,
  itemsToday,
  itemsTomorrow,
  tasksToday,
  tasksTomorrow,
  todayLeafProgress,
  onSelectHistoryDate,
  onPrevMonth,
  onNextMonth,
  onOpenModalForDate,
  onStatusChange,
  onEdit,
  onAddChild,
  onDetail,
  onLoadHistory,
  activeTask,
  onDragStart,
  onDragEnd,
  sensors,
  collisionDetection = closestCenter,
  historyTodayTasks,
  historyTomorrowTasks,
}: Props) {
  // センサーは親から渡されなければデフォルト設定を使う
  const defaultSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const resolvedSensors = sensors ?? defaultSensors;

  return (
    <DndContext
      sensors={resolvedSensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="grid gap-3 md:gap-4 md:grid-cols-2">
        <SortableContext items={itemsToday} strategy={verticalListSortingStrategy}>
          <TaskColumn
            id="today"
            title={`今日 (${today})`}
            tasks={tasksToday}
            progress={todayLeafProgress}
            progressLabel="完了タスク"
            showAddButton
            onAddClick={() => onOpenModalForDate(today)}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onAddChild={onAddChild}
            onDetail={onDetail}
          />
        </SortableContext>

        <SortableContext items={itemsTomorrow} strategy={verticalListSortingStrategy}>
          <TaskColumn
            id="tomorrow"
            title={`明日 (${tomorrow})`}
            tasks={tasksTomorrow}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onAddChild={onAddChild}
            onDetail={onDetail}
          />
        </SortableContext>
      </div>

      <section className={cardClassName({ className: "space-y-3" })}>
        <CalendarGrid
          today={today}
          currentMonthIso={currentMonthIso}
          selectedDate={historyDate}
          onSelect={(date) => {
            onSelectHistoryDate(date);
            onLoadHistory(date);
          }}
          onPrevMonth={onPrevMonth}
          onNextMonth={onNextMonth}
        />

        <HistoryPanel
          selectedDate={historyDate}
          isToday={isHistoryToday}
          isTomorrow={isHistoryTomorrow}
          tasks={isHistoryToday ? historyTodayTasks : isHistoryTomorrow ? historyTomorrowTasks : historyTasks}
          loading={historyLoading}
          droppableId={historyColumnId}
          placeholderId={historyPlaceholderId}
          onAddClick={() => onOpenModalForDate(historyDate)}
          onStatusChange={onStatusChange}
          onEdit={onEdit}
          onAddChild={onAddChild}
          onDetail={onDetail}
        />
      </section>

      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {activeTask ? (
          <TaskCardReadonly task={activeTask} onStatusChange={onStatusChange} onEdit={onEdit} onAddChild={onAddChild} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
