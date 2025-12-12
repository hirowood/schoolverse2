"use client";

import Link from "next/link";
import type { ChangeEvent } from "react";

type CanvasHeaderProps = {
  title: string;
  description: string;
  isShareable: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onToggleShareable: (value: boolean) => void;
  onSave: () => void;
  saving: boolean;
  onSelectImageFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelectOcrFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onOpenCamera: (mode: "image" | "ocr") => void;
  taskTitle?: string | null;
};

export function CanvasHeader({
  title,
  description,
  isShareable,
  onTitleChange,
  onDescriptionChange,
  onToggleShareable,
  onSave,
  saving,
  onSelectImageFile,
  onSelectOcrFile,
  onOpenCamera,
  taskTitle,
}: CanvasHeaderProps) {
  return (
    <div className="p-2 sm:p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-2">
        <Link href="/notes" className="text-blue-600 hover:underline text-sm">
          ← ノート一覧に戻る
        </Link>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "保存中..." : "💾 保存"}
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="タイトル"
          className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="説明（任意）"
          className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
        <label className="flex items-center gap-2 px-3 py-2">
          <input
            type="checkbox"
            checked={isShareable}
            onChange={(e) => onToggleShareable(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">共有可能</span>
        </label>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        <label className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">
          🖼️ 画像追加
          <input type="file" accept="image/*" onChange={onSelectImageFile} className="hidden" />
        </label>

        <button
          type="button"
          onClick={() => onOpenCamera("image")}
          className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
        >
          📷 カメラ撮影
        </button>

        <label className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">
          🔎 OCR
          <input type="file" accept="image/*" onChange={onSelectOcrFile} className="hidden" />
        </label>

        <button
          type="button"
          onClick={() => onOpenCamera("ocr")}
          className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
        >
          📷→🔤 カメラ+OCR
        </button>
      </div>

      {taskTitle && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          📌 タスク「{taskTitle}」に関連付け
        </div>
      )}
    </div>
  );
}
