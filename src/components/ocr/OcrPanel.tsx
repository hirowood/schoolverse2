"use client";

/**
 * 汎用OCRパネルコンポーネント
 *
 * 使い方例:
 * <OcrPanel
 *   title="画像・OCR（AI強化版）"
 *   description="画像をアップロードするとOCRで文字を抽出します。"
 *   imageFiles={imageFiles}
 *   ocrTexts={ocrTexts}
 *   ocrInput={ocrInput}
 *   ocrImageId={ocrImageId}
 *   sending={sendingOcr}
 *   onImageUpload={handleImageUpload}
 *   onOpenEnhanced={handleOpenOcrEnhanced}
 *   onSubmitManual={(e) => { e.preventDefault(); ... }}
 *   onChangeInput={setOcrInput}
 *   onChangeImageId={setOcrImageId}
 * />
 *
 * 必須ではない項目は undefined でも動作します。
 * UI は小さなカードとして独立し、他のページでもそのまま再利用できます。
 */

import type { ChangeEvent, FormEvent } from "react";

export type OcrImageFile = {
  id: string;
  url: string;
  name: string;
  width?: number;
  height?: number;
};

export type OcrText = {
  imageId?: string;
  text: string;
  confidence: number; // 0〜1 想定
};

type Props = {
  title?: string;
  description?: string;
  imageFiles: OcrImageFile[];
  ocrTexts: OcrText[];
  ocrInput: string;
  ocrImageId: string;
  sending?: boolean;
  onImageUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onOpenEnhanced: (url: string) => void;
  onSubmitManual: (event: FormEvent<HTMLFormElement>) => void;
  onChangeInput: (value: string) => void;
  onChangeImageId: (value: string) => void;
};

export function OcrPanel({
  title = "画像・OCR（AI強化版）",
  description = "画像をアップロードすると、OCRで文字を抽出できます。",
  imageFiles,
  ocrTexts,
  ocrInput,
  ocrImageId,
  sending,
  onImageUpload,
  onOpenEnhanced,
  onSubmitManual,
  onChangeInput,
  onChangeImageId,
}: Props) {
  return (
    <div className="space-y-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
      <div>
        <p className="text-base font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>

      {/* 画像アップロード */}
      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1 text-sm">
          画像追加（アップロード後にOCR処理画面が開く想定）
          <input type="file" accept="image/*" onChange={onImageUpload} className="text-sm text-slate-600 dark:text-slate-400" />
        </label>

        {/* 画像サムネイル + OCR起動 */}
        <div className="flex flex-wrap gap-2">
          {imageFiles.map((file) => (
            <div key={file.url} className="relative w-24 rounded border border-slate-200 bg-white p-1 text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={file.url} alt={file.name} className="h-16 w-16 object-cover" />
              <p className="truncate">{file.name}</p>
              <button
                type="button"
                onClick={() => onOpenEnhanced(file.url)}
                className="mt-1 w-full rounded bg-blue-500 px-1 py-0.5 text-[10px] text-white hover:bg-blue-600"
              >
                🔍 OCR
              </button>
            </div>
          ))}
          {imageFiles.length === 0 && <p className="text-xs text-slate-500 dark:text-slate-400">画像がありません</p>}
        </div>

        {/* 手動OCR入力 */}
        <form className="flex flex-col gap-2" onSubmit={onSubmitManual}>
          <label className="flex flex-col gap-1 text-sm">
            手動OCRメモ（AI OCRを使わない場合）
            <textarea
              className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
              rows={2}
              value={ocrInput}
              onChange={(e) => onChangeInput(e.target.value)}
              placeholder="画像から読み取ったテキストや注釈"
            />
          </label>
          {imageFiles.length > 0 && (
            <label className="flex flex-col gap-1 text-sm">
              関連画像ID（任意）
              <select
                value={ocrImageId}
                onChange={(e) => onChangeImageId(e.target.value)}
                className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
              >
                <option value="">画像と紐づけない</option>
                {imageFiles.map((file) => (
                  <option key={file.id} value={file.id}>
                    {file.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button
            type="submit"
            disabled={sending}
            className="self-start rounded-md bg-amber-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-60"
          >
            {sending ? "OCR保存中..." : "手動OCRを追加"}
          </button>
        </form>

        {/* 抽出済みテキスト一覧 */}
        {ocrTexts.length > 0 && (
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <p className="font-medium">🧾 抽出済みテキスト</p>
            {ocrTexts.map((ocr, idx) => (
              <div key={`${ocr.imageId ?? "none"}-${idx}`} className="rounded-md border border-slate-200 bg-white p-2 dark:border-slate-600 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-slate-500 dark:text-slate-500">
                    画像ID: {ocr.imageId || "未設定"} / 信頼度: {Math.round((ocr.confidence ?? 0) * 100)}%
                  </p>
                </div>
                <p className="mt-1">{ocr.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
