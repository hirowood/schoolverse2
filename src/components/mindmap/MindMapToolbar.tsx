"use client";

import { useState } from "react";
import type { LayoutType, ViewMode } from "@/lib/mindmap/types";

interface Props {
  onAddRoot: () => void;
  onAddChild: () => void;
  onEdit: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onLayout: () => void;
  onDelete: () => void;
  onFitView: () => void;
  isDirty: boolean;
  selectedNodeId: string | null;
  // レイアウト
  layoutType: LayoutType;
  onLayoutTypeChange: (type: LayoutType) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onToggleTreePanel: () => void;
  isTreePanelOpen: boolean;
  // ビューモード
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  // AIパネル
  onToggleAIPanel: () => void;
  isAIPanelOpen: boolean;
}

const LAYOUT_OPTIONS: { value: LayoutType; label: string; icon: string }[] = [
  { value: "tree", label: "ツリー", icon: "🌲" },
  { value: "horizontal", label: "横向き", icon: "➡️" },
  { value: "vertical", label: "縦向き", icon: "⬇️" },
  { value: "radial", label: "放射状", icon: "☀️" },
];

const VIEW_MODE_OPTIONS: { value: ViewMode; label: string; icon: string }[] = [
  { value: "mindmap", label: "マインドマップ", icon: "🧠" },
  { value: "wbs", label: "WBSテーブル", icon: "📊" },
  { value: "timeline", label: "タイムライン", icon: "📅" },
];

export default function MindMapToolbar({
  onAddRoot,
  onAddChild,
  onEdit,
  onUndo,
  onRedo,
  onLayout,
  onDelete,
  onFitView,
  isDirty,
  selectedNodeId,
  layoutType,
  onLayoutTypeChange,
  onExpandAll,
  onCollapseAll,
  onToggleTreePanel,
  isTreePanelOpen,
  viewMode,
  onViewModeChange,
  onToggleAIPanel,
  isAIPanelOpen,
}: Props) {
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);

  return (
    <div className="flex flex-wrap gap-2 items-center rounded-lg border border-slate-200 bg-white p-2 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* ビューモード切り替え */}
      <div className="flex rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
        {VIEW_MODE_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={`
              px-3 py-1.5 text-xs flex items-center gap-1 transition-colors
              ${viewMode === option.value
                ? "bg-blue-500 text-white"
                : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
              }
            `}
            onClick={() => onViewModeChange(option.value)}
            title={option.label}
          >
            <span>{option.icon}</span>
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        ))}
      </div>

      <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-600" />

      {/* AIコーチボタン */}
      <button
        className={`
          px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all
          ${isAIPanelOpen
            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md"
            : "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 hover:from-purple-200 hover:to-blue-200 dark:from-purple-900/40 dark:to-blue-900/40 dark:text-purple-300"
          }
        `}
        onClick={onToggleAIPanel}
        title="AIコーチパネル"
      >
        <span className="text-base">🤖</span>
        <span className="hidden sm:inline font-medium">AIコーチ</span>
        {isAIPanelOpen && <span className="hidden sm:inline">✓</span>}
      </button>

      <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-600" />

      {/* ツリーパネル切り替え（マインドマップモード時のみ） */}
      {viewMode === "mindmap" && (
        <button
          className={`toolbar-btn ${isTreePanelOpen ? "toolbar-btn-active" : ""}`}
          onClick={onToggleTreePanel}
          title="ツリーパネルを表示/非表示"
        >
          🌳
        </button>
      )}

      {/* ノード操作 */}
      <button className="toolbar-btn" onClick={onAddRoot} title="ルートノードを追加">
        🟦 ルート
      </button>
      <button
        className="toolbar-btn"
        onClick={onAddChild}
        disabled={!selectedNodeId}
        title="子ノードを追加"
      >
        🌿 子ノード
      </button>
      <button
        className="toolbar-btn"
        onClick={onEdit}
        disabled={!selectedNodeId}
        title="ノードを編集"
      >
        ✏️
      </button>
      <button
        className="toolbar-btn"
        onClick={onDelete}
        disabled={!selectedNodeId}
        title="ノードを削除"
      >
        🗑️
      </button>

      <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-600" />

      {/* 履歴操作 */}
      <button className="toolbar-btn" onClick={onUndo} title="元に戻す">
        ↩︎
      </button>
      <button className="toolbar-btn" onClick={onRedo} title="やり直し">
        ↪︎
      </button>

      <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-600" />

      {/* レイアウト（マインドマップモード時のみ） */}
      {viewMode === "mindmap" && (
        <>
          <div className="relative">
            <button
              className="toolbar-btn flex items-center gap-1"
              onClick={() => setShowLayoutMenu(!showLayoutMenu)}
              title="レイアウトを選択"
            >
              📐 {LAYOUT_OPTIONS.find((o) => o.value === layoutType)?.icon}
              <span className="text-xs">▼</span>
            </button>

            {showLayoutMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowLayoutMenu(false)}
                />
                <div className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg overflow-hidden min-w-[140px]">
                  {LAYOUT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      className={`
                        w-full px-3 py-2 text-left text-sm flex items-center gap-2
                        hover:bg-slate-100 dark:hover:bg-slate-700
                        ${layoutType === option.value ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : ""}
                      `}
                      onClick={() => {
                        onLayoutTypeChange(option.value);
                        setShowLayoutMenu(false);
                      }}
                    >
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                      {layoutType === option.value && <span className="ml-auto">✓</span>}
                    </button>
                  ))}
                  <div className="border-t border-slate-200 dark:border-slate-600">
                    <button
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => {
                        onLayout();
                        setShowLayoutMenu(false);
                      }}
                    >
                      🔄 自動整列
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <button className="toolbar-btn" onClick={onFitView} title="画面にフィット">
            🎯
          </button>

          <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-600" />

          {/* 展開/折りたたみ */}
          <button className="toolbar-btn" onClick={onExpandAll} title="すべて展開">
            ⊕
          </button>
          <button className="toolbar-btn" onClick={onCollapseAll} title="すべて折りたたむ">
            ⊖
          </button>
        </>
      )}

      {/* 保存状態 */}
      <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
        {isDirty ? (
          <>
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            保存中...
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-green-500" />
            保存済み
          </>
        )}
      </span>

      <style jsx>{`
        .toolbar-btn {
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid rgba(148, 163, 184, 0.5);
          background: #f8fafc;
          color: #0f172a;
          transition: all 0.15s ease;
        }
        .toolbar-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .toolbar-btn-active {
          background: #dbeafe;
          border-color: #3b82f6;
          color: #1d4ed8;
        }
        :global(.dark) .toolbar-btn {
          background: #1f2937;
          color: #e5e7eb;
          border-color: #334155;
        }
        :global(.dark) .toolbar-btn-active {
          background: #1e3a5f;
          border-color: #3b82f6;
          color: #93c5fd;
        }
        :global(.toolbar-btn:hover:not(:disabled)) {
          background: #e2e8f0;
          transform: translateY(-1px);
        }
        :global(.dark .toolbar-btn:hover:not(:disabled)) {
          background: #111827;
        }
      `}</style>
    </div>
  );
}
