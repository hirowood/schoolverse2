"use client";

import { useState, useEffect, useCallback } from "react";
import { createWorker, Worker, LoggerMessage } from "tesseract.js";

/* eslint-disable @next/next/no-img-element */

interface OcrProcessorProps {
  imageUrl: string;
  onComplete: (text: string) => void;
  onCancel: () => void;
}

export default function OcrProcessor({ imageUrl, onComplete, onCancel }: OcrProcessorProps) {
  const [status, setStatus] = useState("準備中...");
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runOcr = useCallback(async () => {
    let worker: Worker | null = null;
    
    try {
      setIsProcessing(true);
      setError(null);
      setStatus("OCRエンジンを初期化中...");

      // Tesseract.js v5 の新しいAPI
      worker = await createWorker("jpn+eng", 1, {
        logger: (m: LoggerMessage) => {
          if (m.status) {
            setStatus(getStatusText(m.status));
          }
          if (typeof m.progress === "number") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      setStatus("テキストを認識中...");
      const result = await worker.recognize(imageUrl);
      
      const text = result.data.text.trim();
      
      if (!text) {
        setError("テキストが検出されませんでした。画像を確認してください。");
        setExtractedText("");
      } else {
        setExtractedText(text);
        setError(null);
      }
    } catch (err) {
      console.error("OCR error:", err);
      setError(err instanceof Error ? err.message : "OCR処理中にエラーが発生しました");
    } finally {
      if (worker) {
        await worker.terminate();
      }
      setIsProcessing(false);
    }
  }, [imageUrl]);

  useEffect(() => {
    runOcr();
  }, [runOcr]);

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      "loading tesseract core": "コアを読み込み中...",
      "initializing tesseract": "初期化中...",
      "loading language traineddata": "言語データを読み込み中...",
      "initializing api": "APIを初期化中...",
      "recognizing text": "テキストを認識中...",
    };
    return statusMap[status] || status;
  };

  const handleInsert = () => {
    onComplete(extractedText);
  };

  const handleRetry = () => {
    setExtractedText("");
    setError(null);
    setProgress(0);
    runOcr();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold">📝 OCR（文字認識）</h3>
        </div>

        <div className="p-4 space-y-4">
          {/* プレビュー画像 */}
          <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
            <img
              src={imageUrl}
              alt="OCR対象"
              className="w-full h-full object-contain"
            />
          </div>

          {/* 処理中 */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{status}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* エラー */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
              <p className="text-sm">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-2 text-sm underline hover:no-underline"
              >
                再試行
              </button>
            </div>
          )}

          {/* 抽出結果 */}
          {!isProcessing && extractedText && (
            <div className="space-y-2">
              <label className="text-sm font-medium">抽出されたテキスト（編集可能）</label>
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="w-full h-40 p-3 border rounded-lg resize-none text-sm dark:bg-gray-700 dark:border-gray-600"
                placeholder="抽出されたテキストがここに表示されます..."
              />
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="p-4 border-t dark:border-gray-700 flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            キャンセル
          </button>
          {!isProcessing && extractedText && (
            <button
              onClick={handleInsert}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              キャンバスに挿入
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
