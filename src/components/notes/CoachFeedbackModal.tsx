"use client";

// AIコーチのフィードバックを表示する汎用モーダル
// 使い方:
// <CoachFeedbackModal
//   open={showCoachModal}
//   feedback={coachFeedback}
//   noteTitle={feedbackNote?.title ?? "無題のノート"}
//   onClose={() => { setShowCoachModal(false); ... }}
// />

type Props = {
  open: boolean;
  feedback: string | null;
  noteTitle?: string | null;
  onClose: () => void;
};

export function CoachFeedbackModal({ open, feedback, noteTitle, onClose }: Props) {
  if (!open || !feedback) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AIコーチからのフィードバック</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="フィードバックを閉じる"
          >
            ✕
          </button>
        </div>

        {noteTitle && (
          <div className="mb-4 rounded-lg bg-slate-100 p-3 dark:bg-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">対象ノート</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{noteTitle}</p>
          </div>
        )}

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
          <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300">
            {feedback.split("\n").map((line, i) => (
              <p key={i} className={line.trim() === "" ? "h-2" : ""}>
                {line}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
