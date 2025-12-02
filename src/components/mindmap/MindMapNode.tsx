"use client";

import { Handle, Position, type NodeProps } from "reactflow";
import type { MindMapNodeData } from "@/lib/mindmap/types";
import { STATUS_CONFIG, PRIORITY_CONFIG, DEFAULT_WBS_DATA } from "@/lib/mindmap/types";
import { useMindMapStore } from "@/lib/mindmap/store";

interface ExtendedMindMapNodeData extends MindMapNodeData {
  childCount?: number;
}

export default function MindMapNode({
  id,
  data,
  selected,
}: NodeProps<ExtendedMindMapNodeData>) {
  const {
    label,
    description,
    backgroundColor,
    borderColor,
    textColor,
    fontSize,
    shape,
    level,
    isCollapsed,
    childCount = 0,
    wbs,
  } = data;

  const toggleCollapse = useMindMapStore((state) => state.toggleCollapse);
  const wbsData = wbs || DEFAULT_WBS_DATA;
  const statusConfig = STATUS_CONFIG[wbsData.status];
  const priorityConfig = PRIORITY_CONFIG[wbsData.priority];

  const borderRadius =
    shape === "ellipse"
      ? "9999px"
      : shape === "rectangle"
      ? "6px"
      : shape === "diamond"
      ? "0px"
      : "12px";

  const levelIndicatorColor =
    level === 0
      ? "#3b82f6"
      : level === 1
      ? "#22c55e"
      : level === 2
      ? "#eab308"
      : "#94a3b8";

  const handleStyle = {
    width: 10,
    height: 10,
    backgroundColor: selected ? "#3b82f6" : "#94a3b8",
    border: "2px solid white",
    transition: "all 0.2s ease",
  };

  const hasChildren = childCount > 0;
  const showWBS = wbsData.status !== "not_started" || wbsData.progress > 0 || wbsData.assignee;

  return (
    <div
      style={{
        backgroundColor,
        border: `2px solid ${borderColor}`,
        color: textColor,
        borderRadius,
        transform: shape === "diamond" ? "rotate(45deg)" : "none",
        minWidth: 150,
        minHeight: 50,
        boxShadow: selected
          ? "0 0 0 3px rgba(59,130,246,0.3), 0 4px 12px rgba(0,0,0,0.1)"
          : "0 2px 8px rgba(0,0,0,0.08)",
      }}
      className="px-3 py-2 text-sm leading-tight relative group"
    >
      {/* 接続ハンドル */}
      <Handle type="target" position={Position.Top} id="top" style={{ ...handleStyle, top: -5 }} className="hover:scale-125" />
      <Handle type="source" position={Position.Right} id="right" style={{ ...handleStyle, right: -5 }} className="hover:scale-125" />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ ...handleStyle, bottom: -5 }} className="hover:scale-125" />
      <Handle type="target" position={Position.Left} id="left" style={{ ...handleStyle, left: -5 }} className="hover:scale-125" />

      {/* レベルインジケーター */}
      <div
        className="absolute -top-1 -left-1 w-3 h-3 rounded-full border-2 border-white shadow-sm"
        style={{ backgroundColor: levelIndicatorColor }}
        title={`レベル ${level}`}
      />

      {/* 優先度インジケーター（高以上の場合のみ） */}
      {(wbsData.priority === "high" || wbsData.priority === "critical") && (
        <div
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] border border-white shadow-sm"
          style={{ backgroundColor: priorityConfig.color, color: "white" }}
          title={`優先度: ${priorityConfig.label}`}
        >
          {priorityConfig.icon}
        </div>
      )}

      {/* 折りたたみボタン */}
      {hasChildren && (
        <button
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-500 shadow-sm flex items-center justify-center text-xs text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-400 hover:text-blue-600 transition-all z-10"
          onClick={(e) => {
            e.stopPropagation();
            toggleCollapse(id);
          }}
          title={isCollapsed ? "展開する" : "折りたたむ"}
          style={{
            transform: shape === "diamond" ? "rotate(-45deg) translateX(-50%)" : "translateX(-50%)",
          }}
        >
          {isCollapsed ? "▶" : "▼"}
        </button>
      )}

      {/* 子ノード数バッジ */}
      {hasChildren && isCollapsed && (
        <div
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold shadow-sm"
          title={`${childCount}個の子ノード`}
          style={{ transform: shape === "diamond" ? "rotate(-45deg)" : "none" }}
        >
          {childCount}
        </div>
      )}

      {/* ノードコンテンツ */}
      <div className="space-y-1" style={{ transform: shape === "diamond" ? "rotate(-45deg)" : "none" }}>
        {/* タスク名 */}
        <div className="font-semibold text-center" style={{ fontSize }}>
          {label}
        </div>

        {/* 説明 */}
        {description && (
          <div className="text-xs opacity-80 text-center line-clamp-2">
            {description}
          </div>
        )}

        {/* WBS情報（コンパクト表示） */}
        {showWBS && (
          <div className="space-y-1 pt-1 border-t border-slate-200/50 dark:border-slate-600/50">
            {/* ステータスと担当者 */}
            <div className="flex items-center justify-between text-[10px]">
              <span
                className="px-1.5 py-0.5 rounded"
                style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
              >
                {statusConfig.label}
              </span>
              {wbsData.assignee && (
                <span className="opacity-70 truncate max-w-[60px]" title={wbsData.assignee}>
                  {wbsData.assignee}
                </span>
              )}
            </div>

            {/* 進捗バー */}
            <div className="flex items-center gap-1">
              <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${wbsData.progress}%`,
                    backgroundColor:
                      wbsData.progress >= 100 ? "#22c55e" : wbsData.progress >= 50 ? "#3b82f6" : "#f59e0b",
                  }}
                />
              </div>
              <span className="text-[10px] font-medium w-7 text-right">
                {wbsData.progress}%
              </span>
            </div>

            {/* 期限（設定されている場合） */}
            {wbsData.endDate && (
              <div className="text-[10px] text-center opacity-70">
                〆 {new Date(wbsData.endDate).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ホバー時の詳細情報 */}
      <div
        className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20"
        style={{ transform: shape === "diamond" ? "rotate(-45deg) translateX(-50%)" : "translateX(-50%)" }}
      >
        <div className="text-xs bg-slate-800 text-white px-2 py-1 rounded shadow-lg">
          <div>Lv.{level} {hasChildren && `(子${childCount})`}</div>
          {wbsData.estimatedHours && (
            <div>工数: {wbsData.actualHours || 0}/{wbsData.estimatedHours}h</div>
          )}
        </div>
      </div>
    </div>
  );
}
