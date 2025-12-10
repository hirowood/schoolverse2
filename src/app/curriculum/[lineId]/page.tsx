"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CurriculumProgress } from "@/components/curriculum/CurriculumProgress";
import { LessonList } from "@/components/curriculum/LessonList";
import { useCurriculum } from "@/hooks/useCurriculum";

export default function CurriculumLinePage() {
  const params = useParams<{ lineId: string }>();
  const lineId = params?.lineId;
  const {
    lines,
    linesLoading,
    fetchLines,
    progressOverview,
    fetchProgress,
    progressLoading,
    progressError,
  } = useCurriculum();

  useEffect(() => {
    if (lineId) {
      void fetchLines({ lineId });
    }
  }, [fetchLines, lineId]);

  useEffect(() => {
    void fetchProgress();
  }, [fetchProgress]);

  const line = lines.find((l) => l.id === lineId);

  const lessons = useMemo(() => {
    if (!progressOverview) return [];
    return progressOverview.lessons
      .filter((item) => item.lesson.lineId === lineId)
      .sort((a, b) => a.lesson.order - b.lesson.order);
  }, [progressOverview, lineId]);

  const lineProgress =
    progressOverview?.progressByLine[lineId ?? ""] ??
    line?.progress ??
    (lessons.length
      ? {
          completed: lessons.filter((l) => l.progress?.status === "completed").length,
          total: lessons.length,
          percentage: Math.round(
            (lessons.filter((l) => l.progress?.status === "completed").length / lessons.length) * 100,
          ),
        }
      : { completed: 0, total: 0, percentage: 0 });

  const groupedLessons = useMemo(() => {
    if (!line) return [];
    const knownUnits = line.units.map((unit) => ({
      unit,
      lessons: lessons.filter((lesson) => lesson.lesson.unitId === unit.id),
    }));
    const remaining = lessons.filter((lesson) => !line.units.some((u) => u.id === lesson.lesson.unitId));
    if (remaining.length > 0) {
      knownUnits.push({
        unit: { id: "others", title: "その他" },
        lessons: remaining,
      });
    }
    return knownUnits;
  }, [lessons, line]);

  const isNotFound = !line && !linesLoading;

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <div className="flex items-center gap-3 text-sm text-emerald-700">
        <Link href="/curriculum" className="underline hover:text-emerald-900">
          ← カリキュラム一覧
        </Link>
      </div>

      {isNotFound && (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          指定されたラインが見つかりませんでした。
        </div>
      )}

      {line && (
        <>
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Curriculum Line</p>
            <h1 className="text-3xl font-semibold text-slate-900">{line.title}</h1>
            <p className="text-sm text-slate-600">{line.summary}</p>
          </header>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <CurriculumProgress
              completed={lineProgress.completed}
              total={lineProgress.total}
              label="ライン進捗"
            />
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
              <span>完了: {lineProgress.completed} レッスン</span>
              <span>全体: {lineProgress.total} レッスン</span>
            </div>
          </div>

          {progressError && (
            <div className="rounded-lg bg-amber-50 p-4 text-sm font-semibold text-amber-700">
              進捗を取得できませんでした。ログインして再度お試しください。
            </div>
          )}

          {(progressLoading && !lessons.length) || linesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-24 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : (
            groupedLessons.map((group) => (
              <section key={group.unit.id} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">UNIT</p>
                    <h2 className="text-lg font-semibold text-slate-900">{group.unit.title}</h2>
                    {group.unit.description && (
                      <p className="text-sm text-slate-600">{group.unit.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">{group.lessons.length} レッスン</span>
                </div>
                <LessonList lessons={group.lessons} basePath={`/curriculum/${line.id}`} />
              </section>
            ))
          )}
        </>
      )}
    </main>
  );
}
