import Link from "next/link";
import { CurriculumProgress } from "./CurriculumProgress";
import type { CurriculumLineSummary } from "@/hooks/useCurriculum";

type Props = {
  line: CurriculumLineSummary;
};

export function CurriculumLineCard({ line }: Props) {
  const progress = line.progress ?? { completed: 0, total: 0, percentage: 0 };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{line.title}</h2>
            <p className="text-sm text-slate-600">{line.summary}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {progress.percentage}% 完了
          </span>
        </div>

        <CurriculumProgress completed={progress.completed} total={progress.total} />
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-slate-700">
        <div className="flex flex-wrap gap-2">
          {line.units.slice(0, 3).map((unit) => (
            <span
              key={unit.id}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {unit.title}
            </span>
          ))}
          {line.units.length > 3 && <span className="text-xs text-slate-500">+{line.units.length - 3} 他</span>}
        </div>
        <Link
          href={`/curriculum/${line.id}`}
          className="text-sm font-semibold text-emerald-700 underline underline-offset-4 hover:text-emerald-900"
        >
          続きを学ぶ →
        </Link>
      </div>
    </div>
  );
}
