"use client";

import { useCallback, useEffect, useState } from "react";
import { createWorker, type Worker } from "tesseract.js";

interface OcrProcessorProps {
  imageDataUrl: string;
  onComplete: (text: string) => void;
  onClose: () => void;
}

export default function OcrProcessor({ imageDataUrl, onComplete, onClose }: OcrProcessorProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("準備中...");
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runOcr = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setStatus("OCRエンジンを初期化中...");
    let worker: Worker | null = null;

    try {
      worker = await createWorker({
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
            setStatus("テキストを認識中...");
          } else if (m.status === "loading language traineddata") {
            setStatus("言語データを読み込み中...");
            setProgress(Math.round(m.progress * 50));
          } else if (m.status === "initializing api") {
            setStatus("APIを初期化中...");
          }
        },
      });

      await worker.loadLanguage("jpn+eng");
      await worker.initialize("jpn+eng");

      setStatus("画像を解析中...");
      const result = await worker.recognize(imageDataUrl);
      const text = result.data.text.trim();
      if (!text) {
        setError("テキストを検出できませんでした。画像を確認してください。");
      } else {
        setExtractedText(text);
      }
    } catch (err) {
      console.error("OCR error:", err);
      setError(err instanceof Error ? err.message : "OCR処理に失敗しました");
    } finally {
      if (worker) {
        await worker.terminate();
      }
      setIsProcessing(false);
      setStatus("");
    }
  }, [imageDataUrl]);

  useEffect(() => {
    runOcr();
  }, [runOcr]);

  const handleConfirm = useCallback(() => {
    if (extractedText) {
      onComplete(extractedText);
    }
  }, [extractedText, onComplete]);

  const handleRetry = useCallback(() => {
    setExtractedText(null);
    setError(null);
    runOcr();
  }, [runOcr]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4">
      <div className="relative flex w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-200 p-3 sm:p-4">
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">🔍 OCR テキスト抽出</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            aria-label="閉じる"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-3 sm:p-4">
          <div className="mb-4 overflow-hidden rounded-lg border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageDataUrl} alt="OCR対象画像" className="max-h-48 w-full object-contain bg-slate-50" />
          </div>

          {isProcessing && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">{status}</p>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-sm text-slate-500">{progress}%</p>
            </div>
          )}

          {error && !isProcessing && (
            <div className="space-y-3">
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
              <button
                type="button"
                onClick={handleRetry}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                🔄 再試行
              </button>
            </div>
          )}

          {extractedText && !isProcessing && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                抽出されたテキスト（編集可能）
              </label>
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                rows={8}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="抽出されたテキスト"
              />
              <p className="text-xs text-slate-500">
                ※ 必要に応じてテキストを編集してから挿入できます。
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-slate-200 p-3 sm:p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:py-2"
          >
            キャンセル
          </button>
          {extractedText && !isProcessing && (
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-500 sm:py-2"
            >
              ✅ テキストを挿入
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
