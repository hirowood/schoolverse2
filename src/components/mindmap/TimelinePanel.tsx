"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import type { MindMapNode, MindMapEdge } from "@/lib/mindmap/types";
import { STATUS_CONFIG, PRIORITY_CONFIG, DEFAULT_WBS_DATA } from "@/lib/mindmap/types";

interface TimelineRow {
  id: string;
  label: string;
  level: number;
  status: string;
  priority: string;
  progress: number;
  startDate: Date | null;
  endDate: Date | null;
  children: TimelineRow[];
}

interface Props {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}

export default function TimelinePanel({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewRange, setViewRange] = useState<{ start: Date; end: Date }>(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    return { start, end };
  });

  // ツリー構造を構築
  const buildRows = useMemo((): TimelineRow[] => {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const childrenMap = new Map<string, string[]>();
    const hasParent = new Set<string>();

    edges.forEach((edge) => {
      const children = childrenMap.get(edge.source) || [];
      children.push(edge.target);
      childrenMap.set(edge.source, children);
      hasParent.add(edge.target);
    });

    const rootIds = nodes.filter((n) => !hasParent.has(n.id)).map((n) => n.id);

    const buildRow = (nodeId: string, visited = new Set<string>()): TimelineRow | null => {
      if (visited.has(nodeId)) return null;
      visited.add(nodeId);

      const node = nodeMap.get(nodeId);
      if (!node) return null;

      const wbs = node.data.wbs || DEFAULT_WBS_DATA;
      const childIds = childrenMap.get(nodeId) || [];
      const children = childIds
        .map((cid) => buildRow(cid, new Set(visited)))
        .filter((c): c is TimelineRow => c !== null);

      return {
        id: node.id,
        label: node.data.label,
        level: node.data.level,
        status: wbs.status,
        priority: wbs.priority,
        progress: wbs.progress,
        startDate: wbs.startDate ? new Date(wbs.startDate) : null,
        endDate: wbs.endDate ? new Date(wbs.endDate) : null,
        children,
      };
    };

    return rootIds
      .map((id) => buildRow(id))
      .filter((r): r is TimelineRow => r !== null);
  }, [nodes, edges]);

  // フラット化
  const flatRows = useMemo(() => {
    const result: TimelineRow[] = [];
    const flatten = (row: TimelineRow) => {
      result.push(row);
      row.children.forEach(flatten);
    };
    buildRows.forEach(flatten);
    return result;
  }, [buildRows]);

  // 日付配列を生成
  const days = useMemo(() => {
    const result: Date[] = [];
    const current = new Date(viewRange.start);
    while (current <= viewRange.end) {
      result.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return result;
  }, [viewRange]);

  // 週の開始を計算
  const weeks = useMemo(() => {
    const result: { start: Date; days: number }[] = [];
    let currentWeekStart = new Date(viewRange.start);
    let daysInWeek = 0;

    days.forEach((day, i) => {
      daysInWeek++;
      if (day.getDay() === 0 || i === days.length - 1) {
        result.push({ start: currentWeekStart, days: daysInWeek });
        currentWeekStart = new Date(day);
        currentWeekStart.setDate(currentWeekStart.getDate() + 1);
        daysInWeek = 0;
      }
    });

    return result;
  }, [days, viewRange]);

  const dayWidth = 30;
  const rowHeight = 36;

  // バーの位置計算
  const getBarStyle = (row: TimelineRow) => {
    if (!row.startDate || !row.endDate) return null;

    const startDiff = Math.floor(
      (row.startDate.getTime() - viewRange.start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const duration = Math.floor(
      (row.endDate.getTime() - row.startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    const left = Math.max(0, startDiff * dayWidth);
    const width = Math.max(dayWidth, duration * dayWidth);

    const statusConfig = STATUS_CONFIG[row.status as keyof typeof STATUS_CONFIG];

    return {
      left,
      width,
      backgroundColor: statusConfig?.bgColor || "#e2e8f0",
      borderColor: statusConfig?.color || "#94a3b8",
    };
  };

  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatMonth = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  };

  // 今日の位置
  const todayOffset = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.floor((today.getTime() - viewRange.start.getTime()) / (1000 * 60 * 60 * 24));
    return diff * dayWidth;
  }, [viewRange]);

  const handlePrevMonth = () => {
    setViewRange((prev) => ({
      start: new Date(prev.start.getFullYear(), prev.start.getMonth() - 1, 1),
      end: new Date(prev.end.getFullYear(), prev.end.getMonth(), 0),
    }));
  };

  const handleNextMonth = () => {
    setViewRange((prev) => ({
      start: new Date(prev.start.getFullYear(), prev.start.getMonth() + 1, 1),
      end: new Date(prev.end.getFullYear(), prev.end.getMonth() + 2, 0),
    }));
  };

  const handleToday = () => {
    const now = new Date();
    setViewRange({
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 2, 0),
    });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            📅 タイムライン
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatMonth(viewRange.start)} - {formatMonth(viewRange.end)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            ◀ 前月
          </button>
          <button
            onClick={handleToday}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            今日
          </button>
          <button
            onClick={handleNextMonth}
            className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            次月 ▶
          </button>
        </div>
      </div>

      {/* タイムラインコンテンツ */}
      <div className="flex-1 overflow-auto" ref={containerRef}>
        <div className="flex">
          {/* タスク名列 */}
          <div className="sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 min-w-[200px]">
            {/* ヘッダー */}
            <div className="h-12 border-b border-slate-200 dark:border-slate-700 flex items-center px-3 bg-slate-100 dark:bg-slate-800">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                タスク名
              </span>
            </div>

            {/* タスク行 */}
            {flatRows.map((row) => {
              const isSelected = selectedNodeId === row.id;
              return (
                <div
                  key={row.id}
                  className={`
                    h-9 border-b border-slate-100 dark:border-slate-700 flex items-center px-3 cursor-pointer
                    ${isSelected ? "bg-blue-50 dark:bg-blue-900/30" : "hover:bg-slate-50 dark:hover:bg-slate-800"}
                  `}
                  style={{ paddingLeft: `${row.level * 12 + 12}px` }}
                  onClick={() => onSelectNode(row.id)}
                >
                  <span className="text-sm truncate text-slate-700 dark:text-slate-200">
                    {row.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ガントチャート部分 */}
          <div className="flex-1 overflow-x-auto">
            <div style={{ width: days.length * dayWidth, minWidth: "100%" }}>
              {/* 日付ヘッダー */}
              <div className="h-12 border-b border-slate-200 dark:border-slate-700 flex bg-slate-100 dark:bg-slate-800 relative">
                {days.map((day, i) => {
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isFirstOfMonth = day.getDate() === 1;

                  return (
                    <div
                      key={i}
                      className={`
                        flex flex-col items-center justify-center text-xs border-r
                        ${isWeekend ? "bg-slate-200/50 dark:bg-slate-700/50" : ""}
                        ${isToday ? "bg-blue-100 dark:bg-blue-900/30" : ""}
                        ${isFirstOfMonth ? "border-l-2 border-l-slate-400" : "border-slate-100 dark:border-slate-700"}
                      `}
                      style={{ width: dayWidth }}
                    >
                      {isFirstOfMonth && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {day.getMonth() + 1}月
                        </span>
                      )}
                      <span className={`${isToday ? "font-bold text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}>
                        {day.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* タスクバー行 */}
              <div className="relative">
                {/* 今日の線 */}
                {todayOffset >= 0 && todayOffset <= days.length * dayWidth && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ left: todayOffset + dayWidth / 2 }}
                  />
                )}

                {flatRows.map((row, rowIndex) => {
                  const barStyle = getBarStyle(row);
                  const isSelected = selectedNodeId === row.id;

                  return (
                    <div
                      key={row.id}
                      className={`
                        h-9 border-b border-slate-100 dark:border-slate-700 relative
                        ${isSelected ? "bg-blue-50/50 dark:bg-blue-900/20" : ""}
                      `}
                      onClick={() => onSelectNode(row.id)}
                    >
                      {/* 背景グリッド */}
                      <div className="absolute inset-0 flex">
                        {days.map((day, i) => {
                          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                          return (
                            <div
                              key={i}
                              className={`border-r border-slate-100 dark:border-slate-700 ${isWeekend ? "bg-slate-50 dark:bg-slate-800/50" : ""}`}
                              style={{ width: dayWidth }}
                            />
                          );
                        })}
                      </div>

                      {/* タスクバー */}
                      {barStyle && (
                        <div
                          className="absolute top-1 h-7 rounded cursor-pointer transition-all hover:opacity-80 flex items-center px-2 overflow-hidden"
                          style={{
                            left: barStyle.left,
                            width: barStyle.width,
                            backgroundColor: barStyle.backgroundColor,
                            border: `2px solid ${barStyle.borderColor}`,
                          }}
                        >
                          {/* 進捗バー */}
                          <div
                            className="absolute left-0 top-0 bottom-0 opacity-30"
                            style={{
                              width: `${row.progress}%`,
                              backgroundColor: barStyle.borderColor,
                            }}
                          />
                          <span className="relative text-xs font-medium truncate" style={{ color: barStyle.borderColor }}>
                            {row.label}
                          </span>
                        </div>
                      )}

                      {/* 日付未設定のマーカー */}
                      {!barStyle && (
                        <div className="absolute top-2 left-2 text-xs text-slate-400 dark:text-slate-500">
                          日付未設定
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 凡例 */}
      <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center gap-4 text-xs">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: config.bgColor, border: `1px solid ${config.color}` }}
              />
              <span className="text-slate-600 dark:text-slate-400">{config.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
