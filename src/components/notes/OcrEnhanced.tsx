"use client";

import { useState, useEffect, useCallback } from "react";
import { recognizeText, type OcrResult, type OcrOptions } from "@/lib/ocr/recognizer";
import { PREPROCESS_PRESETS } from "@/lib/ocr/preprocessor";

interface OcrEnhancedProps {
  imageUrl: string;
  onComplete: (result: OcrResult) => void;
  onCancel: () => void;
  onAnalyze?: (text: string) => void;
}

type ImageType = "printed" | "handwritten" | "photo";

const IMAGE_TYPE_OPTIONS: Array<{ value: ImageType; label: string; icon: string }> = [
  { value: "printed", label: "印刷物", icon: "📄" },
  { value: "handwritten", label: "手書き", icon: "✍️" },
  { value: "photo", label: "写真", icon: "📷" },
];

export default function OcrEnhanced({ imageUrl, onComplete, onCancel, onAnalyze }: OcrEnhancedProps) {
  const [imageType, setImageType] = useState<ImageType>("printed");
  const [enhance, setEnhance] = useState(true);
  const [runAnalysis, setRunAnalysis] = useState(true);
  const [status, setStatus] = useState("準備完了");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const ocrResult = await recognizeText(imageUrl, {
        imageType,
        enhance,
        language: "jpn+eng",
        onProgress: (s, p) => {
          setStatus(s);
          setProgress(Math.round(p * 100));
        },
      });

      setResult(ocrResult);

      if (!ocrResult.text.trim()) {
        setError("テキストが検出されませんでした。画像を確認してください。");
      }
    } catch (err) {
      console.error("OCR error:", err);
      setError(err instanceof Error ? err.message : "OCR処理中にエラーが発生しました");
    } finally {
      setIsProcessing(false);
    }
  }, [imageUrl, imageType, enhance]);

  const handleConfirm = () => {
    if (result) {
      onComplete(result);
      if (runAnalysis && onAnalyze && result.text.trim()) {
        onAnalyze(result.text);
      }
    }
  };

  const handleRetry = () => {
    setResult(null);
    setError(null);
    setProgress(0);
    setStatus("準備完了");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* ヘッダー */}
        <div className="p-4 border-b dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span>📸</span> 画像からテキストを抽出
          </h3>
          <button
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* プレビュー画像 */}
          <div className="aspect-video bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="OCR対象"
              className="w-full h-full object-contain"
            />
          </div>

          {/* 処理前の設定 */}
          {!result && !isProcessing && (
            <>
              {/* 画像タイプ選択 */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">📋 画像タイプを選択</p>
                <div className="flex gap-2">
                  {IMAGE_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setImageType(option.value)}
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition ${
                        imageType === option.value
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : "border-slate-200 text-slate-600 hover:border-slate-400 dark:border-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <span className="text-lg">{option.icon}</span>
                      <span className="ml-1">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* オプション */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">⚙️ オプション</p>
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={enhance}
                    onChange={(e) => setEnhance(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  画像を自動補正する（コントラスト調整・ノイズ除去）
                </label>
                {onAnalyze && (
                  <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={runAnalysis}
                      onChange={(e) => setRunAnalysis(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    AI分析・要約・タグ付けを行う
                  </label>
                )}
              </div>
            </>
          )}

          {/* 処理中 */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">{status}</span>
                <span className="font-medium text-slate-900 dark:text-white">{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
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
                設定を変更して再試行
              </button>
            </div>
          )}

          {/* 結果表示 */}
          {result && !isProcessing && (
            <div className="space-y-3">
              {/* 信頼度表示 */}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-600 dark:text-slate-400">信頼度:</span>
                <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      result.confidence > 0.8
                        ? "bg-green-500"
                        : result.confidence > 0.5
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>
                <span className="font-medium">{Math.round(result.confidence * 100)}%</span>
              </div>

              {/* 処理時間 */}
              <p className="text-xs text-slate-500 dark:text-slate-500">
                処理時間: {(result.processingTime / 1000).toFixed(1)}秒
              </p>

              {/* 抽出テキスト */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  抽出されたテキスト（編集可能）
                </label>
                <textarea
                  value={result.text}
                  onChange={(e) => setResult({ ...result, text: e.target.value })}
                  className="w-full h-48 p-3 border rounded-lg resize-none text-sm dark:bg-slate-700 dark:border-slate-600"
                  placeholder="抽出されたテキストがここに表示されます..."
                />
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="p-4 border-t dark:border-slate-700 flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            キャンセル
          </button>
          {!result && !isProcessing && (
            <button
              onClick={handleProcess}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              🚀 処理開始
            </button>
          )}
          {result && !isProcessing && result.text.trim() && (
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              ✓ 確定して挿入
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
