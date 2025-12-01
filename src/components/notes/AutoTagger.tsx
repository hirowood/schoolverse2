"use client";

import { useState, useCallback } from "react";

interface AutoTaggerProps {
  noteId: string;
  manualTags: string[];
  autoTags: string[];
  onTagsChange?: (tags: { manual: string[]; auto: string[] }) => void;
}

export default function AutoTagger({
  noteId,
  manualTags: initialManualTags,
  autoTags: initialAutoTags,
  onTagsChange,
}: AutoTaggerProps) {
  const [manualTags, setManualTags] = useState<string[]>(initialManualTags);
  const [autoTags, setAutoTags] = useState<string[]>(initialAutoTags);
  const [newTag, setNewTag] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // タグ追加
  const handleAddTag = useCallback(async () => {
    if (!newTag.trim()) return;

    setIsAdding(true);
    setError(null);

    try {
      const response = await fetch(`/api/notes/${noteId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: newTag.trim() }),
      });

      if (!response.ok) {
        throw new Error("タグの追加に失敗しました");
      }

      const data = await response.json();
      setManualTags(data.tags);
      setNewTag("");
      onTagsChange?.({ manual: data.tags, auto: autoTags });
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsAdding(false);
    }
  }, [noteId, newTag, autoTags, onTagsChange]);

  // タグ削除
  const handleRemoveTag = useCallback(async (tag: string) => {
    setError(null);

    try {
      const response = await fetch(`/api/notes/${noteId}/tags`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag }),
      });

      if (!response.ok) {
        throw new Error("タグの削除に失敗しました");
      }

      const data = await response.json();
      setManualTags(data.tags);
      onTagsChange?.({ manual: data.tags, auto: autoTags });
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    }
  }, [noteId, autoTags, onTagsChange]);

  // 自動タグ再生成
  const handleRegenerate = useCallback(async () => {
    setIsRegenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/notes/${noteId}/tags`, {
        method: "PUT",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "タグの再生成に失敗しました");
      }

      const data = await response.json();
      setAutoTags(data.autoTags);
      onTagsChange?.({ manual: manualTags, auto: data.autoTags });
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsRegenerating(false);
    }
  }, [noteId, manualTags, onTagsChange]);

  const allTags = [...new Set([...manualTags, ...autoTags])];

  return (
    <div className="space-y-3">
      {/* タグ表示 */}
      <div className="flex flex-wrap gap-2">
        {allTags.length === 0 ? (
          <span className="text-xs text-slate-500 dark:text-slate-400">タグがありません</span>
        ) : (
          allTags.map((tag) => {
            const isManual = manualTags.includes(tag);
            const isAuto = autoTags.includes(tag);
            
            return (
              <span
                key={tag}
                className={`group inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                  isAuto && !isManual
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {isAuto && !isManual && <span className="text-[10px]">🤖</span>}
                #{tag}
                {isManual && (
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hidden text-slate-400 hover:text-red-500 group-hover:inline"
                  >
                    ×
                  </button>
                )}
              </span>
            );
          })
        )}
      </div>

      {/* タグ追加フォーム */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTag();
            }
          }}
          placeholder="新しいタグを追加..."
          className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-700"
        />
        <button
          onClick={handleAddTag}
          disabled={isAdding || !newTag.trim()}
          className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-600"
        >
          {isAdding ? "追加中..." : "追加"}
        </button>
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="rounded-md border border-blue-300 px-3 py-1 text-xs text-blue-700 hover:bg-blue-50 disabled:opacity-50 dark:border-blue-600 dark:text-blue-400"
          title="AIでタグを再生成"
        >
          {isRegenerating ? "🔄" : "🤖 再生成"}
        </button>
      </div>

      {/* エラー表示 */}
      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* 凡例 */}
      <div className="flex gap-4 text-[10px] text-slate-500 dark:text-slate-400">
        <span>
          <span className="inline-block w-3 h-3 rounded bg-slate-100 dark:bg-slate-700 mr-1" />
          手動タグ
        </span>
        <span>
          <span className="inline-block w-3 h-3 rounded bg-blue-100 dark:bg-blue-800 mr-1" />
          🤖 AIタグ
        </span>
      </div>
    </div>
  );
}
