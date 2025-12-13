"use client";

import Link from "next/link";
import type { ChangeEvent } from "react";

interface CanvasHeaderProps {
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
}

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
    <section
      className="sticky top-0 z-10 border-b bg-white/95 px-3 pb-3 pt-2 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-800/95 sm:px-4 sm:pb-4 sm:pt-3"
      data-canvas-header
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link href="/notes" className="text-sm font-semibold text-blue-600 underline-offset-4 hover:underline">
            ← ノート一覧に戻る
          </Link>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">スマホでも押しやすい大きさに最適化しています</p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {saving ? "保存中..." : "💾 保存"}
        </button>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="text"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="タイトル"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700"
        />
        <input
          type="text"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="説明（任意）"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700"
        />
        <label className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
          <input
            type="checkbox"
            checked={isShareable}
            onChange={(event) => onToggleShareable(event.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-semibold">共有可能</span>
        </label>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
        <label className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-100 px-4 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-200 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
          🖼 画像追加
          <input type="file" accept="image/*" onChange={onSelectImageFile} className="hidden" />
        </label>

        <button
          type="button"
          onClick={() => onOpenCamera("image")}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-100 px-4 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300 active:scale-[0.99] dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        >
          📷 カメラ撮影
        </button>

        <label className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-100 px-4 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-200 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
          🔠 OCR
          <input type="file" accept="image/*" onChange={onSelectOcrFile} className="hidden" />
        </label>

        <button
          type="button"
          onClick={() => onOpenCamera("ocr")}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-100 px-4 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300 active:scale-[0.99] dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        >
          📷→📝 カメラ+OCR
        </button>
      </div>

      {taskTitle && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          🔗 タスク「{taskTitle}」に関連付け
        </div>
      )}
    </section>
  );
}
