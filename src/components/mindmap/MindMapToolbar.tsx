"use client";

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
}

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
}: Props) {
  return (
    <div className="flex flex-wrap gap-2 items-center rounded-lg border border-slate-200 bg-white p-2 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <button className="toolbar-btn" onClick={onAddRoot}>
        🟦 ルート
      </button>
      <button className="toolbar-btn" onClick={onAddChild} disabled={!selectedNodeId}>
        🌿 子ノード
      </button>
      <button className="toolbar-btn" onClick={onEdit} disabled={!selectedNodeId}>
        ✏️ 編集
      </button>
      <button className="toolbar-btn" onClick={onDelete} disabled={!selectedNodeId}>
        🗑 削除
      </button>
      <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-600" />
      <button className="toolbar-btn" onClick={onUndo}>
        ↩︎ Undo
      </button>
      <button className="toolbar-btn" onClick={onRedo}>
        ↪︎ Redo
      </button>
      <button className="toolbar-btn" onClick={onLayout}>
        📐 レイアウト
      </button>
      <button className="toolbar-btn" onClick={onFitView}>
        🎯 Fit
      </button>
      <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
        {isDirty ? "未保存の変更あり" : "保存済み"}
      </span>
      <style jsx>{`
        .toolbar-btn {
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid rgba(148, 163, 184, 0.5);
          background: #f8fafc;
          color: #0f172a;
        }
        .toolbar-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        :global(.dark) .toolbar-btn {
          background: #1f2937;
          color: #e5e7eb;
          border-color: #334155;
        }
        :global(.toolbar-btn:hover:not(:disabled)) {
          background: #e2e8f0;
        }
        :global(.dark .toolbar-btn:hover:not(:disabled)) {
          background: #111827;
        }
      `}</style>
    </div>
  );
}
