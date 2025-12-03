"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import type { MindMapNodeData, WBSData, TaskStatus, TaskPriority } from "@/lib/mindmap/types";
import { STATUS_CONFIG, PRIORITY_CONFIG, DEFAULT_WBS_DATA } from "@/lib/mindmap/types";

type ShapeOption = MindMapNodeData["shape"];
type TabType = "basic" | "wbs" | "style";

interface NodeEditorProps {
  open: boolean;
  nodeId: string | null;
  data: MindMapNodeData | null;
  onSave: (data: Partial<MindMapNodeData>) => void;
  onClose: () => void;
}

export default function NodeEditor({ open, nodeId, data, onSave, onClose }: NodeEditorProps) {
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  
  // 基本情報
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  
  // スタイル
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [borderColor, setBorderColor] = useState("#e2e8f0");
  const [textColor, setTextColor] = useState("#1e293b");
  const [fontSize, setFontSize] = useState(14);
  const [shape, setShape] = useState<ShapeOption>("rounded");
  
  // WBS属性
  const [status, setStatus] = useState<TaskStatus>("not_started");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [progress, setProgress] = useState(0);
  const [assignee, setAssignee] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState<number | undefined>(undefined);
  const [actualHours, setActualHours] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (data) {
      // 基本情報
      setLabel(data.label ?? "");
      setDescription(data.description ?? "");
      
      // スタイル
      setBackgroundColor(data.backgroundColor ?? "#ffffff");
      setBorderColor(data.borderColor ?? "#e2e8f0");
      setTextColor(data.textColor ?? "#1e293b");
      setFontSize(data.fontSize ?? 14);
      setShape(data.shape ?? "rounded");
      
      // WBS属性
      const wbs = data.wbs ?? DEFAULT_WBS_DATA;
      setStatus(wbs.status);
      setPriority(wbs.priority);
      setProgress(wbs.progress);
      setAssignee(wbs.assignee ?? "");
      setStartDate(wbs.startDate ?? "");
      setEndDate(wbs.endDate ?? "");
      setDueDate(wbs.dueDate ?? "");
      setEstimatedHours(wbs.estimatedHours);
      setActualHours(wbs.actualHours);
      setNotes(wbs.notes ?? "");
      setTags(wbs.tags?.join(", ") ?? "");
    }
  }, [data]);

  // ステータスが「完了」になったら進捗を100%に
  useEffect(() => {
    if (status === "completed" && progress < 100) {
      setProgress(100);
    }
  }, [status, progress]);

  if (!open || !nodeId) return null;

  const handleSave = () => {
    const wbs: WBSData = {
      status,
      priority,
      progress,
      assignee: assignee || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      dueDate: dueDate || undefined,
      estimatedHours,
      actualHours,
      notes: notes || undefined,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
    };

    onSave({
      label,
      description,
      backgroundColor,
      borderColor,
      textColor,
      fontSize,
      shape,
      wbs,
    });
  };

  const tabs: Array<{ id: TabType; label: string; icon: string }> = [
    { id: "basic", label: "基本", icon: "📝" },
    { id: "wbs", label: "タスク", icon: "📋" },
    { id: "style", label: "スタイル", icon: "🎨" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white shadow-xl dark:bg-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">ノード編集</p>
            <h3 className="text-lg font-semibold truncate max-w-[400px]">{data?.label ?? nodeId}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full px-3 py-1 text-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            ×
          </button>
        </div>

        {/* タブ */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors
                ${activeTab === tab.id
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 基本タブ */}
          {activeTab === "basic" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="タスク名を入力"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                  説明
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="タスクの詳細を入力..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                  メモ
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="補足メモ..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                  タグ（カンマ区切り）
                </label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="例: 重要, デザイン, レビュー"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900"
                />
                {tags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WBSタブ */}
          {activeTab === "wbs" && (
            <div className="space-y-4">
              {/* ステータス・優先度 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                    ステータス
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-900"
                  >
                    {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_CONFIG[s].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                    優先度
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-900"
                  >
                    {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => (
                      <option key={p} value={p}>
                        {PRIORITY_CONFIG[p].icon} {PRIORITY_CONFIG[p].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ステータス・優先度のプレビュー */}
              <div className="flex gap-2">
                <span
                  className="px-2 py-1 text-xs rounded-full"
                  style={{
                    backgroundColor: STATUS_CONFIG[status].bg,
                    color: STATUS_CONFIG[status].color,
                  }}
                >
                  {STATUS_CONFIG[status].label}
                </span>
                <span
                  className="px-2 py-1 text-xs rounded-full"
                  style={{
                    backgroundColor: PRIORITY_CONFIG[priority].color + "20",
                    color: PRIORITY_CONFIG[priority].color,
                  }}
                >
                  {PRIORITY_CONFIG[priority].icon} {PRIORITY_CONFIG[priority].label}
                </span>
              </div>

              {/* 進捗 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                  進捗率: {progress}%
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700"
                    style={{
                      background: `linear-gradient(to right, ${
                        progress >= 100 ? "#22c55e" : progress >= 50 ? "#3b82f6" : "#f97316"
                      } ${progress}%, #e2e8f0 ${progress}%)`,
                    }}
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={progress}
                    onChange={(e) => setProgress(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                    className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-sm text-center dark:border-slate-600 dark:bg-slate-900"
                  />
                </div>
                {/* クイックボタン */}
                <div className="flex gap-1 mt-2">
                  {[0, 25, 50, 75, 100].map((v) => (
                    <button
                      key={v}
                      onClick={() => setProgress(v)}
                      className={`
                        px-2 py-1 text-xs rounded transition-colors
                        ${progress === v
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300"
                        }
                      `}
                    >
                      {v}%
                    </button>
                  ))}
                </div>
              </div>

              {/* 担当者 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                  担当者
                </label>
                <input
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="担当者名"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-900"
                />
              </div>

              {/* 日付 */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                    開始日
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                    終了日
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || undefined}
                    className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                    期限
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-900"
                  />
                </div>
              </div>

              {/* 期間の表示 */}
              {startDate && endDate && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  📅 期間: {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}日間
                </div>
              )}

              {/* 工数 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                    見積工数（時間）
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={estimatedHours ?? ""}
                    onChange={(e) => setEstimatedHours(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="例: 8"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                    実績工数（時間）
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={actualHours ?? ""}
                    onChange={(e) => setActualHours(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="例: 6"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-900"
                  />
                </div>
              </div>

              {/* 工数の比較 */}
              {estimatedHours !== undefined && estimatedHours > 0 && actualHours !== undefined && (
                <div className={`text-xs px-3 py-2 rounded-lg ${
                  actualHours <= estimatedHours
                    ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                }`}>
                  {actualHours <= estimatedHours ? "✅" : "⚠️"} 
                  {" "}実績 {actualHours}h / 見積 {estimatedHours}h
                  {" "}({Math.round((actualHours / estimatedHours) * 100)}%)
                </div>
              )}
            </div>
          )}

          {/* スタイルタブ */}
          {activeTab === "style" && (
            <div className="space-y-4">
              {/* 色設定 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    背景色
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="h-10 w-10 rounded cursor-pointer border border-slate-300"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-mono dark:border-slate-600 dark:bg-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    枠線色
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="h-10 w-10 rounded cursor-pointer border border-slate-300"
                    />
                    <input
                      type="text"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-mono dark:border-slate-600 dark:bg-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    文字色
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="h-10 w-10 rounded cursor-pointer border border-slate-300"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-mono dark:border-slate-600 dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* プリセットカラー */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                  プリセット
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { bg: "#ffffff", border: "#e2e8f0", text: "#1e293b", name: "デフォルト" },
                    { bg: "#fef3c7", border: "#f59e0b", text: "#92400e", name: "警告" },
                    { bg: "#dcfce7", border: "#22c55e", text: "#166534", name: "成功" },
                    { bg: "#fee2e2", border: "#ef4444", text: "#991b1b", name: "エラー" },
                    { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af", name: "情報" },
                    { bg: "#f3e8ff", border: "#a855f7", text: "#6b21a8", name: "アクセント" },
                    { bg: "#1e293b", border: "#64748b", text: "#f1f5f9", name: "ダーク" },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setBackgroundColor(preset.bg);
                        setBorderColor(preset.border);
                        setTextColor(preset.text);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-400 dark:border-slate-600 transition-colors"
                      style={{ backgroundColor: preset.bg }}
                    >
                      <span
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: preset.border, borderColor: preset.border }}
                      />
                      <span className="text-xs" style={{ color: preset.text }}>
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* フォントサイズ */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                  フォントサイズ: {fontSize}px
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={10}
                    max={24}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700"
                  />
                  <input
                    type="number"
                    min={10}
                    max={32}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value) || 14)}
                    className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-sm text-center dark:border-slate-600 dark:bg-slate-900"
                  />
                </div>
              </div>

              {/* 形状 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                  形状
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { id: "rounded", label: "角丸", icon: "▢" },
                    { id: "rectangle", label: "四角", icon: "□" },
                    { id: "ellipse", label: "楕円", icon: "○" },
                    { id: "diamond", label: "ひし形", icon: "◇" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setShape(opt.id)}
                      className={`
                        flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all
                        ${shape === opt.id
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-600 dark:text-slate-300"
                        }
                      `}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <span className="text-xs">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* プレビュー */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                  プレビュー
                </label>
                <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg flex justify-center">
                  <div
                    className={`
                      px-4 py-2 border-2 shadow-sm inline-flex items-center justify-center min-w-[120px]
                      ${shape === "rounded" ? "rounded-lg" : ""}
                      ${shape === "rectangle" ? "rounded-none" : ""}
                      ${shape === "ellipse" ? "rounded-full" : ""}
                      ${shape === "diamond" ? "transform rotate-45" : ""}
                    `}
                    style={{
                      backgroundColor,
                      borderColor,
                      color: textColor,
                      fontSize: `${fontSize}px`,
                    }}
                  >
                    <span className={shape === "diamond" ? "transform -rotate-45" : ""}>
                      {label || "サンプル"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={!label.trim()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
