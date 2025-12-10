"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LessonTimer } from "@/components/curriculum/LessonTimer";
import { useCurriculum } from "@/hooks/useCurriculum";

const statusLabel = {
  locked: { text: "ロック中", color: "bg-slate-100 text-slate-500" },
  available: { text: "解放", color: "bg-emerald-50 text-emerald-700" },
  in_progress: { text: "学習中", color: "bg-amber-50 text-amber-700" },
  completed: { text: "完了", color: "bg-blue-50 text-blue-700" },
};

export default function LessonDetailPage() {
  const params = useParams<{ lineId: string; slug: string }>();
  const lineId = params?.lineId;
  const slug = params?.slug;

  const {
    lines,
    fetchLines,
    currentLesson,
    lessonLoading,
    lessonError,
    loadLesson,
    startLesson,
    completeLesson,
    lessonActionLoading,
    progressOverview,
    fetchProgress,
  } = useCurriculum();

  const [elapsedSec, setElapsedSec] = useState(0);
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [localError, setLocalError] = useState<string | null>(null);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);

  useEffect(() => {
    if (lineId) void fetchLines({ lineId });
  }, [fetchLines, lineId]);

  useEffect(() => {
    if (slug) {
      void loadLesson(slug);
    }
  }, [loadLesson, slug]);

  useEffect(() => {
    void fetchProgress();
  }, [fetchProgress]);

  const line = useMemo(() => lines.find((l) => l.id === lineId), [lines, lineId]);

  const lessonState = currentLesson && currentLesson.lesson.slug === slug ? currentLesson : null;
  const status = lessonState?.progress?.status ?? "locked";
  const badge = statusLabel[status];

  const handleStart = async () => {
    if (!slug) return;
    setLocalError(null);
    setDoneMessage(null);
    try {
      await startLesson(slug);
    } catch (error) {
      console.error(error);
      setLocalError("レッスン開始に失敗しました");
    }
  };

  const handleComplete = async () => {
    if (!slug) return;
    setLocalError(null);
    setDoneMessage(null);
    try {
      await completeLesson(slug, {
        timeSpentSec: elapsedSec,
        notes: notes.trim() || undefined,
        rating,
      });
      setDoneMessage("完了を記録しました 🎉");
    } catch (error) {
      console.error(error);
      setLocalError("完了処理に失敗しました");
    }
  };

  const isLocked = status === "locked";

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div className="flex items-center gap-3 text-sm text-emerald-700">
        <Link href="/curriculum" className="underline hover:text-emerald-900">
          カリキュラム一覧
        </Link>
        {line && (
          <Link href={`/curriculum/${line.id}`} className="underline hover:text-emerald-900">
            {line.title}
          </Link>
        )}
      </div>

      {lessonLoading && (
        <div className="space-y-3">
          <div className="h-7 w-1/2 animate-pulse rounded bg-slate-100" />
          <div className="h-20 animate-pulse rounded bg-slate-100" />
        </div>
      )}

      {lessonError && (
        <div className="rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">{lessonError}</div>
      )}

      {lessonState && (
        <>
          <header className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Lesson</p>
                <h1 className="text-3xl font-semibold text-slate-900">{lessonState.lesson.title}</h1>
              </div>
              <span className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${badge.color}`}>{badge.text}</span>
            </div>
            {lessonState.lesson.description && (
              <p className="text-sm text-slate-700">{lessonState.lesson.description}</p>
            )}
            <div className="flex flex-wrap gap-3 text-xs text-slate-600">
              <span>目安時間: {lessonState.lesson.estimatedMinutes}分</span>
              <span>XP: +{lessonState.lesson.xpReward}</span>
              {lessonState.lesson.bonusXp > 0 && <span>ボーナス: +{lessonState.lesson.bonusXp}</span>}
            </div>
          </header>

          <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-800">前提レッスン</p>
            {lessonState.lesson.prerequisites.length === 0 ? (
              <p className="text-sm text-slate-600">前提はありません。すぐに開始できます。</p>
            ) : (
              <ul className="list-inside list-disc text-sm text-slate-600">
                {lessonState.lesson.prerequisites.map((slug) => (
                  <li key={slug}>{slug}</li>
                ))}
              </ul>
            )}
          </div>

          {isLocked && (
            <div className="rounded-lg bg-amber-50 p-4 text-sm font-semibold text-amber-700">
              前提レッスンを完了すると解放されます。
            </div>
          )}

          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">学習内容</p>
              {progressOverview && (
                <p className="text-xs text-slate-500">
                  総完了: {progressOverview.stats.totalLessonsCompleted} /{" "}
                  {progressOverview.stats.totalTimeSpentSec}秒
                </p>
              )}
            </div>
            <p className="text-sm text-slate-700">
              コンテンツのMarkdownがまだ準備されていません。学習メモを取りながら進めましょう。
            </p>
          </div>

          <LessonTimer onChange={setElapsedSec} disabled={lessonActionLoading} />

          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">学習メモ</p>
                <p className="text-xs text-slate-500">完了時に一緒に保存されます。</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <label htmlFor="rating" className="text-xs text-slate-500">
                  理解度
                </label>
                <input
                  id="rating"
                  type="range"
                  min={1}
                  max={5}
                  value={rating ?? 3}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="h-2 w-32 accent-emerald-600"
                />
                <span className="w-6 text-right text-xs text-slate-600">{rating ?? 3}</span>
              </div>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              placeholder="学んだこと、詰まった点、次回のTODOなどをメモ"
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleStart}
                disabled={lessonActionLoading || isLocked}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
              >
                {status === "in_progress" ? "再開として記録" : "学習開始"}
              </button>
              <button
                type="button"
                onClick={handleComplete}
                disabled={lessonActionLoading || isLocked}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60"
              >
                完了してXPを獲得
              </button>
              <span className="text-xs text-slate-500">タイマー計測: {elapsedSec}秒</span>
            </div>
            {localError && <p className="text-sm font-semibold text-red-700">{localError}</p>}
            {doneMessage && <p className="text-sm font-semibold text-emerald-700">{doneMessage}</p>}
          </div>
        </>
      )}
    </main>
  );
}
