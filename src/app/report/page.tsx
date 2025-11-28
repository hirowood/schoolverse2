"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import OnboardingPanel, { type OnboardingStep } from "@/components/OnboardingPanel";
import type { WeeklyReportContext, WeeklyReportRecord } from "@/lib/report/types";
import { formatDuration, startOfWeek, toIsoDate } from "@/lib/report/utils";

const DEFAULT_WEEK_START = toIsoDate(startOfWeek(new Date(), 1));
const REPORT_ONBOARDING_KEY = "schoolverse2-onboarding-report";
const REPORT_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "週の始まりを確認",
    detail: "日付セレクタで分析したい週を選び、対象のタスクやクレドを切り替えましょう。",
  },
  {
    title: "AI生成を活用",
    detail: "「AI生成」ボタンでClaudeに分析を頼み、レポート＋アドバイスを受け取れます。",
  },
  {
    title: "Markdownで共有",
    detail: "エクスポートからMarkdown形式で支援者に共有、ノートやレポートに貼り付けも可能です。",
  },
];

export default function ReportPage() {
  const [requestedWeek, setRequestedWeek] = useState(DEFAULT_WEEK_START);
  const [weekInput, setWeekInput] = useState(DEFAULT_WEEK_START);
  const [context, setContext] = useState<WeeklyReportContext | null>(null);
  const [report, setReport] = useState<WeeklyReportRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(REPORT_ONBOARDING_KEY) !== "1";
  });

  const fetchReport = useCallback(async (weekStart: string) => {
    setLoading(true);
    try {
      const query = weekStart ? `?weekStart=${weekStart}` : "";
      const response = await fetch(`/api/report/weekly${query}`);
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "週次レポートを取得できませんでした");
      }
      const data = await response.json() as {
        context: WeeklyReportContext;
        report: WeeklyReportRecord | null;
      };
      setContext(data.context);
      setReport(data.report);
      setWeekInput(data.context.weekStart);
      setError(null);
      if (data.context.weekStart !== weekStart) {
        setRequestedWeek(data.context.weekStart);
      }
    } catch (err) {
      setContext(null);
      setReport(null);
      setError(err instanceof Error ? err.message : "取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(requestedWeek);
  }, [fetchReport, requestedWeek]);

  const handleDismissOnboarding = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(REPORT_ONBOARDING_KEY, "1");
    setShowOnboarding(false);
  }, []);

  const handleShowOnboarding = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(REPORT_ONBOARDING_KEY);
    setShowOnboarding(true);
  }, []);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const targetWeek = context?.weekStart ?? requestedWeek;
      const response = await fetch("/api/report/weekly/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekStart: targetWeek }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "レポート生成に失敗しました");
      }
      const data = await response.json() as {
        context: WeeklyReportContext;
        report: WeeklyReportRecord;
      };
      setContext(data.context);
      setReport(data.report);
      setRequestedWeek(data.context.weekStart);
      setWeekInput(data.context.weekStart);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI生成に失敗しました");
    } finally {
      setIsGenerating(false);
    }
  }, [context?.weekStart, requestedWeek]);

  const handleExport = useCallback(async () => {
    if (!context) return;
    setIsExporting(true);
    try {
      const response = await fetch(`/api/report/weekly/export?weekStart=${context.weekStart}`);
      if (!response.ok) {
        const payload = await response.text().catch(() => null);
        throw new Error(payload || "エクスポートに失敗しました");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `weekly-report-${context.weekStart}.md`;
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エクスポートに失敗しました");
    } finally {
      setIsExporting(false);
    }
  }, [context]);

  const dailySummary = useMemo(
    () =>
      context?.summary.daily.map((row) => ({
        ...row,
        display: `${row.label} ${formatDuration(row.seconds)}`,
      })) ?? [],
    [context],
  );

  const statusSummary = useMemo(
    () => context?.summary.statusCounts ?? null,
    [context],
  );

  const weekLabel = context?.weekLabel ?? "週次レポート";

  return (
    <div className="space-y-6">
      {showOnboarding ? (
        <OnboardingPanel
          show
          title="週次レポートの使いかた"
          description="週の切り替え・AI生成・Markdownエクスポートの順で進めば、支援者共有もスムーズです。"
          steps={REPORT_ONBOARDING_STEPS}
          onClose={handleDismissOnboarding}
        />
      ) : (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleShowOnboarding}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Onboardingを再表示
          </button>
        </div>
      )}
      <header className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">週次レポート</p>
          <h1 className="text-2xl font-semibold text-slate-900">{weekLabel}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium text-slate-600" htmlFor="week-start">
            週開始日（原則月曜）
          </label>
          <input
            id="week-start"
            type="date"
            value={weekInput}
            onChange={(e) => setWeekInput(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm"
          />
          <button
            type="button"
            onClick={() => setRequestedWeek(weekInput)}
            disabled={!weekInput || loading}
            className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            表示
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || loading}
            className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            {isGenerating ? "生成中..." : "AIで生成"}
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={!report || isExporting}
            className="rounded-md border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {isExporting ? "エクスポート中..." : "Markdown出力"}
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">合計学習時間</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {context ? formatDuration(context.summary.totalSeconds) : "―"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">タスク状況</p>
            {statusSummary ? (
              <div className="mt-2 text-sm text-slate-700 space-y-1">
                <p>完了: {statusSummary.done}</p>
                <p>進行中: {statusSummary.inProgress}</p>
                <p>一時停止: {statusSummary.paused}</p>
                <p>未着手: {statusSummary.todo}</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">取得中...</p>
            )}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">クレド実践率</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {context ? `${context.credoSummary.practicedRate}%` : "―"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              上位: {context?.credoSummary.ranking.slice(0, 3).map((item) => item.title).join(" / ") || "記録なし"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">日ごとの学習時間</p>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              {dailySummary.length === 0 && <p>取得中...</p>}
              {dailySummary.map((row) => (
                <p key={row.date}>{row.display}</p>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">体調・クレドハイライト</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {context?.conditionHighlights && context.conditionHighlights.length > 0 ? (
                context.conditionHighlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                  >
                    {highlight}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">記録なし</p>
              )}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              ※ クレド／体調関連の記録とハイライト
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">AIレポート</h2>
          <p className="text-xs text-slate-500">
            {report ? "AIが生成済みの内容です" : "まだレポートが生成されていません"}
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-500">体調まとめ</p>
            <p className="mt-1 text-sm text-slate-700">{report?.conditionSummary ?? "AI生成で体調サマリーが表示されます"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">活動まとめ</p>
            <p className="mt-1 text-sm text-slate-700">{report?.activitySummary ?? "活動の振り返りを生成してください"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">AI分析</p>
            <p className="mt-1 text-sm text-slate-700">{report?.aiAnalysis ?? "AIならではの視点を表示します"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">来週のフォーカス</p>
            {report?.nextWeekFocus.length ? (
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {report.nextWeekFocus.map((focus) => (
                  <li key={focus}>{focus}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-slate-700">行動提案を生成してください</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">支援者向けメッセージ</p>
            <p className="mt-1 text-sm text-slate-700">{report?.supporterExport ?? "保護者・先生向けのポイントを生成します"}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
