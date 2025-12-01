"use client";

import { useState, useCallback } from "react";
import type { AiAnalysisResult } from "@/lib/ai/types";

interface AiAnalyzerProps {
  noteId: string;
  initialAnalysis?: AiAnalysisResult | null;
  initialSummary?: string | null;
  initialTags?: string[];
  onUpdate?: (data: { analysis?: AiAnalysisResult; summary?: string; tags?: string[] }) => void;
}

export default function AiAnalyzer({
  noteId,
  initialAnalysis,
  initialSummary,
  initialTags = [],
  onUpdate,
}: AiAnalyzerProps) {
  const [analysis, setAnalysis] = useState<AiAnalysisResult | null>(initialAnalysis ?? null);
  const [summary, setSummary] = useState<string | null>(initialSummary ?? null);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(`/api/notes/${noteId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "分析に失敗しました");
      }

      const data = await response.json();
      setAnalysis(data.data.analysis);
      setSummary(data.data.summary);
      setTags(data.data.tags);

      onUpdate?.({
        analysis: data.data.analysis,
        summary: data.data.summary,
        tags: data.data.tags,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsAnalyzing(false);
    }
  }, [noteId, onUpdate]);

  const getDifficultyStars = (level: number) => {
    return "★".repeat(level) + "☆".repeat(5 - level);
  };

  // まだ分析されていない場合
  if (!analysis && !summary && tags.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔍</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">AI分析</span>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isAnalyzing ? "分析中..." : "分析する"}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔍</span>
          <span className="text-sm font-medium text-slate-900 dark:text-white">AI分析結果</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-600 hover:underline dark:text-blue-400"
          >
            {expanded ? "閉じる" : "詳細を見る"}
          </button>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="rounded-md border border-blue-300 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100 disabled:opacity-50 dark:border-blue-600 dark:text-blue-300"
          >
            {isAnalyzing ? "🔄" : "再分析"}
          </button>
        </div>
      </div>

      {/* 要約 */}
      {summary && (
        <div className="mt-3">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">💡 要約</p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{summary}</p>
        </div>
      )}

      {/* タグ */}
      {tags.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">🏷️ 自動タグ</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-800 dark:text-blue-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 詳細分析（展開時） */}
      {expanded && analysis && (
        <div className="mt-4 space-y-3 border-t border-blue-200 pt-3 dark:border-blue-700">
          {/* 基本情報 */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded bg-white p-2 dark:bg-slate-800">
              <p className="text-slate-500">📄 文書タイプ</p>
              <p className="font-medium text-slate-900 dark:text-white">{analysis.documentType}</p>
            </div>
            <div className="rounded bg-white p-2 dark:bg-slate-800">
              <p className="text-slate-500">📚 教科</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {analysis.subject.main}
                {analysis.subject.sub && ` > ${analysis.subject.sub}`}
              </p>
            </div>
          </div>

          {/* 難易度 */}
          <div className="rounded bg-white p-2 dark:bg-slate-800">
            <p className="text-xs text-slate-500">📈 難易度</p>
            <p className="font-medium text-amber-600">
              {getDifficultyStars(analysis.difficulty.level)}
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {analysis.difficulty.reason}
            </p>
          </div>

          {/* キーポイント */}
          {analysis.keyPoints.length > 0 && (
            <div className="rounded bg-white p-2 dark:bg-slate-800">
              <p className="text-xs text-slate-500">📌 キーポイント</p>
              <ul className="mt-1 list-inside list-disc text-xs text-slate-700 dark:text-slate-300">
                {analysis.keyPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 学習アドバイス */}
          {analysis.studyAdvice && (
            <div className="rounded bg-green-50 p-2 dark:bg-green-900/20">
              <p className="text-xs text-green-700 dark:text-green-400">💬 学習アドバイス</p>
              <p className="mt-1 text-xs text-green-800 dark:text-green-300">
                {analysis.studyAdvice}
              </p>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
