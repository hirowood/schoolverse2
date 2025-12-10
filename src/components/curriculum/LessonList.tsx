import Link from "next/link";
import type { LessonState, LessonStatus } from "@/hooks/useCurriculum";

type Props = {
  lessons: LessonState[];
  basePath: string;
};

const statusLabel: Record<LessonStatus, { text: string; color: string }> = {
  locked: { text: "ロック中", color: "bg-slate-100 text-slate-500" },
  available: { text: "解放", color: "bg-emerald-50 text-emerald-700" },
  in_progress: { text: "学習中", color: "bg-amber-50 text-amber-700" },
  completed: { text: "完了", color: "bg-blue-50 text-blue-700" },
};

export function LessonList({ lessons, basePath }: Props) {
  if (!lessons.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        レッスンがまだ追加されていません。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {lessons.map((item) => {
        const status = item.progress?.status ?? "locked";
        const label = statusLabel[status];
        const isLocked = status === "locked";
        return (
          <Link
            key={item.lesson.slug}
            href={`${basePath}/${item.lesson.slug}`}
            className={`flex flex-col gap-2 rounded-lg border p-4 transition hover:-translate-y-0.5 hover:shadow-sm ${
              isLocked ? "pointer-events-none border-slate-200 bg-slate-50 cursor-not-allowed" : "border-slate-200 bg-white"
            }`}
            aria-disabled={isLocked}
            tabIndex={isLocked ? -1 : 0}
            prefetch={!isLocked}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-mono text-slate-500">{item.lesson.slug}</p>
                <h3 className="text-base font-semibold text-slate-900">{item.lesson.title}</h3>
                {item.lesson.description && (
                  <p className="text-sm text-slate-600 line-clamp-2">{item.lesson.description}</p>
                )}
              </div>
              <span className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${label.color}`}>{label.text}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span>目安: {item.lesson.estimatedMinutes}分</span>
              <span>XP: +{item.lesson.xpReward}</span>
              {item.lesson.bonusXp > 0 && <span>ボーナス: +{item.lesson.bonusXp}</span>}
              {item.lesson.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.lesson.tags.map((tag) => (
                    <span key={tag} className="rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
