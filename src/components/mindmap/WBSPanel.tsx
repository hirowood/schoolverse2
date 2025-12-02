"use client";

import { useMemo, useState, useCallback } from "react";
import type { MindMapNode, MindMapEdge, TaskStatus, TaskPriority } from "@/lib/mindmap/types";
import { STATUS_CONFIG, PRIORITY_CONFIG, DEFAULT_WBS_DATA } from "@/lib/mindmap/types";

interface WBSRow {
  id: string;
  wbsCode: string;
  label: string;
  level: number;
  assignee: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  actualHours: number;
  children: WBSRow[];
  isExpanded: boolean;
}

interface Props {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onUpdateWBS: (nodeId: string, wbs: Partial<NonNullable<MindMapNode["data"]["wbs"]>>) => void;
}

type SortField = "wbsCode" | "label" | "status" | "priority" | "progress" | "startDate" | "endDate";
type SortDirection = "asc" | "desc";

export default function WBSPanel({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onUpdateWBS,
}: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>("wbsCode");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [editingCell, setEditingCell] = useState<{ nodeId: string; field: string } | null>(null);

  // ツリー構造をWBS行に変換
  const buildWBSRows = useCallback((): WBSRow[] => {
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

    const buildRow = (nodeId: string, parentCode: string, index: number, visited = new Set<string>()): WBSRow | null => {
      if (visited.has(nodeId)) return null;
      visited.add(nodeId);

      const node = nodeMap.get(nodeId);
      if (!node) return null;

      const wbsCode = parentCode ? `${parentCode}.${index + 1}` : `${index + 1}`;
      const wbs = node.data.wbs || DEFAULT_WBS_DATA;
      const childIds = childrenMap.get(nodeId) || [];

      const children = childIds
        .map((cid, i) => buildRow(cid, wbsCode, i, new Set(visited)))
        .filter((c): c is WBSRow => c !== null);

      // 子タスクがある場合、進捗率を自動計算
      let progress = wbs.progress;
      if (children.length > 0) {
        progress = Math.round(children.reduce((sum, c) => sum + c.progress, 0) / children.length);
      }

      return {
        id: node.id,
        wbsCode,
        label: node.data.label,
        level: node.data.level,
        assignee: wbs.assignee || "",
        status: wbs.status,
        priority: wbs.priority,
        progress,
        startDate: wbs.startDate || "",
        endDate: wbs.endDate || "",
        estimatedHours: wbs.estimatedHours || 0,
        actualHours: wbs.actualHours || 0,
        children,
        isExpanded: expandedIds.has(node.id),
      };
    };

    return rootIds
      .map((id, i) => buildRow(id, "", i))
      .filter((r): r is WBSRow => r !== null);
  }, [nodes, edges, expandedIds]);

  // フラット化した行リスト
  const flattenRows = useCallback((rows: WBSRow[]): WBSRow[] => {
    const result: WBSRow[] = [];
    const flatten = (row: WBSRow) => {
      result.push(row);
      if (row.isExpanded || expandedIds.has(row.id)) {
        row.children.forEach(flatten);
      }
    };
    rows.forEach(flatten);
    return result;
  }, [expandedIds]);

  const wbsRows = useMemo(() => buildWBSRows(), [buildWBSRows]);
  const flatRows = useMemo(() => flattenRows(wbsRows), [flattenRows, wbsRows]);

  // フィルタリング
  const filteredRows = useMemo(() => {
    if (filterStatus === "all") return flatRows;
    return flatRows.filter((row) => row.status === filterStatus);
  }, [flatRows, filterStatus]);

  // ソート
  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "wbsCode":
          comparison = a.wbsCode.localeCompare(b.wbsCode, undefined, { numeric: true });
          break;
        case "label":
          comparison = a.label.localeCompare(b.label);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "priority":
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case "progress":
          comparison = a.progress - b.progress;
          break;
        case "startDate":
          comparison = (a.startDate || "9999").localeCompare(b.startDate || "9999");
          break;
        case "endDate":
          comparison = (a.endDate || "9999").localeCompare(b.endDate || "9999");
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredRows, sortField, sortDirection]);

  // 集計
  const summary = useMemo(() => {
    const total = flatRows.length;
    const completed = flatRows.filter((r) => r.status === "completed").length;
    const inProgress = flatRows.filter((r) => r.status === "in_progress").length;
    const totalEstimated = flatRows.reduce((sum, r) => sum + r.estimatedHours, 0);
    const totalActual = flatRows.reduce((sum, r) => sum + r.actualHours, 0);
    const avgProgress = total > 0 ? Math.round(flatRows.reduce((sum, r) => sum + r.progress, 0) / total) : 0;

    return { total, completed, inProgress, totalEstimated, totalActual, avgProgress };
  }, [flatRows]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <span className="text-blue-500">{sortDirection === "asc" ? "↑" : "↓"}</span>
        )}
      </div>
    </th>
  );

  // インラインセル編集
  const handleCellEdit = (nodeId: string, field: string, value: string | number) => {
    const updates: Partial<MindMapNode["data"]["wbs"]> = {};
    
    switch (field) {
      case "progress":
        updates.progress = Math.min(100, Math.max(0, Number(value)));
        break;
      case "status":
        updates.status = value as TaskStatus;
        break;
      case "priority":
        updates.priority = value as TaskPriority;
        break;
      case "startDate":
      case "endDate":
        updates[field] = value as string;
        break;
      case "estimatedHours":
      case "actualHours":
        updates[field] = Number(value);
        break;
      case "assignee":
        updates.assignee = value as string;
        break;
    }

    onUpdateWBS(nodeId, updates);
    setEditingCell(null);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* ヘッダー：フィルタと集計 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            📊 WBS
          </h3>
          
          {/* ステータスフィルタ */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TaskStatus | "all")}
            className="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
          >
            <option value="all">すべて</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>

        {/* 集計情報 */}
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>タスク: {summary.total}</span>
          <span className="text-green-600 dark:text-green-400">完了: {summary.completed}</span>
          <span className="text-blue-600 dark:text-blue-400">進行中: {summary.inProgress}</span>
          <span>進捗: {summary.avgProgress}%</span>
          <span>工数: {summary.totalActual}/{summary.totalEstimated}h</span>
        </div>
      </div>

      {/* テーブル */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10">
            <tr>
              <SortHeader field="wbsCode">WBS</SortHeader>
              <SortHeader field="label">タスク名</SortHeader>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">担当</th>
              <SortHeader field="status">ステータス</SortHeader>
              <SortHeader field="priority">優先度</SortHeader>
              <SortHeader field="progress">進捗</SortHeader>
              <SortHeader field="startDate">開始</SortHeader>
              <SortHeader field="endDate">終了</SortHeader>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">工数</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => {
              const isSelected = selectedNodeId === row.id;
              const statusConfig = STATUS_CONFIG[row.status];
              const priorityConfig = PRIORITY_CONFIG[row.priority];

              return (
                <tr
                  key={row.id}
                  className={`
                    border-b border-slate-100 dark:border-slate-700 cursor-pointer
                    ${isSelected ? "bg-blue-50 dark:bg-blue-900/30" : "hover:bg-slate-50 dark:hover:bg-slate-800"}
                  `}
                  onClick={() => onSelectNode(row.id)}
                >
                  {/* WBSコード */}
                  <td className="px-3 py-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {row.wbsCode}
                  </td>

                  {/* タスク名 */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2" style={{ paddingLeft: `${row.level * 16}px` }}>
                      {row.children.length > 0 && (
                        <button
                          className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(row.id);
                          }}
                        >
                          {expandedIds.has(row.id) ? "▼" : "▶"}
                        </button>
                      )}
                      <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[200px]">
                        {row.label}
                      </span>
                    </div>
                  </td>

                  {/* 担当者 */}
                  <td className="px-3 py-2">
                    {editingCell?.nodeId === row.id && editingCell?.field === "assignee" ? (
                      <input
                        type="text"
                        defaultValue={row.assignee}
                        className="w-20 px-1 py-0.5 text-xs border rounded dark:bg-slate-700 dark:border-slate-600"
                        autoFocus
                        onBlur={(e) => handleCellEdit(row.id, "assignee", e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCellEdit(row.id, "assignee", e.currentTarget.value);
                          if (e.key === "Escape") setEditingCell(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span
                        className="text-xs text-slate-600 dark:text-slate-400 cursor-text hover:bg-slate-100 dark:hover:bg-slate-700 px-1 py-0.5 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCell({ nodeId: row.id, field: "assignee" });
                        }}
                      >
                        {row.assignee || "-"}
                      </span>
                    )}
                  </td>

                  {/* ステータス */}
                  <td className="px-3 py-2">
                    <select
                      value={row.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleCellEdit(row.id, "status", e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs px-2 py-1 rounded border-0"
                      style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                    >
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* 優先度 */}
                  <td className="px-3 py-2">
                    <select
                      value={row.priority}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleCellEdit(row.id, "priority", e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                      style={{ color: priorityConfig.color }}
                    >
                      {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.icon} {config.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* 進捗 */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${row.progress}%`,
                            backgroundColor:
                              row.progress >= 100 ? "#22c55e" : row.progress >= 50 ? "#3b82f6" : "#f59e0b",
                          }}
                        />
                      </div>
                      <input
                        type="number"
                        value={row.progress}
                        min={0}
                        max={100}
                        onChange={(e) => handleCellEdit(row.id, "progress", e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-12 text-xs text-center border rounded dark:bg-slate-700 dark:border-slate-600"
                      />
                      <span className="text-xs text-slate-500">%</span>
                    </div>
                  </td>

                  {/* 開始日 */}
                  <td className="px-3 py-2">
                    <input
                      type="date"
                      value={row.startDate}
                      onChange={(e) => handleCellEdit(row.id, "startDate", e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs border rounded px-1 py-0.5 dark:bg-slate-700 dark:border-slate-600"
                    />
                  </td>

                  {/* 終了日 */}
                  <td className="px-3 py-2">
                    <input
                      type="date"
                      value={row.endDate}
                      onChange={(e) => handleCellEdit(row.id, "endDate", e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs border rounded px-1 py-0.5 dark:bg-slate-700 dark:border-slate-600"
                    />
                  </td>

                  {/* 工数 */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 text-xs">
                      <input
                        type="number"
                        value={row.actualHours}
                        min={0}
                        onChange={(e) => handleCellEdit(row.id, "actualHours", e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-10 text-center border rounded dark:bg-slate-700 dark:border-slate-600"
                      />
                      <span className="text-slate-400">/</span>
                      <input
                        type="number"
                        value={row.estimatedHours}
                        min={0}
                        onChange={(e) => handleCellEdit(row.id, "estimatedHours", e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-10 text-center border rounded dark:bg-slate-700 dark:border-slate-600"
                      />
                      <span className="text-slate-400">h</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sortedRows.length === 0 && (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
            <div className="text-3xl mb-2">📋</div>
            タスクがありません
          </div>
        )}
      </div>
    </div>
  );
}
