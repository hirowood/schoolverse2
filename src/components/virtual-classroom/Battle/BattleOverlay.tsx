"use client";

import { useMemo, useState } from "react";
import type { MonsterDefinition, MonsterQuestionOption } from "@/features/virtual-classroom/types";

type Props = {
  monster: MonsterDefinition | null;
  question: {
    id: string;
    questionText: string;
    questionType: string;
    options?: MonsterQuestionOption[] | null;
    timeLimit?: number | null;
    codeSnippet?: string | null;
  } | null;
  result:
    | { isCorrect: boolean; xpEarned: number; bonusXpEarned: number; coinsEarned: number }
    | null;
  loading: boolean;
  error: string | null;
  onAnswer: (answer: string) => Promise<void>;
  onClose: () => void;
};

export function BattleOverlay({ monster, question, result, loading, error, onAnswer, onClose }: Props) {
  const [input, setInput] = useState("");

  const canSubmit = useMemo(() => {
    if (!question) return false;
    if (question.options && question.options.length > 0) return true;
    return input.trim().length > 0;
  }, [question, input]);

  if (!monster || !question) return null;

  const handleOption = async (value: string) => {
    await onAnswer(value);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onAnswer(input.trim());
    setInput("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <header className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide opacity-80">Monster Encounter</p>
            <h3 className="text-xl font-bold">{monster.name}</h3>
            <p className="text-sm opacity-90">{monster.category} / {monster.subcategory ?? "general"}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md bg-white/15 px-3 py-1 text-sm font-semibold hover:bg-white/25"
            type="button"
          >
            閉じる
          </button>
        </header>

        <div className="p-6 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700 mb-2">問題</p>
            <p className="whitespace-pre-wrap text-slate-900">{question.questionText}</p>
            {question.codeSnippet && (
              <pre className="mt-3 rounded-lg bg-slate-900 text-white text-sm p-3 overflow-auto">{question.codeSnippet}</pre>
            )}
          </div>

          {question.options?.length ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {question.options.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleOption(opt.value)}
                  disabled={loading || Boolean(result)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-left transition ${
                    result
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:-translate-y-0.5 hover:shadow"
                  }`}
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-bold">
                    {opt.label}
                  </span>
                  <span className="text-sm text-slate-800">{opt.value}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="解答を入力"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading || Boolean(result)}
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || loading || Boolean(result)}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                解答する
              </button>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {result && (
            <div className={`rounded-lg border p-4 ${result.isCorrect ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
              <p className="text-base font-semibold text-slate-900">
                {result.isCorrect ? "正解！" : "残念、不正解"}
              </p>
              <p className="text-sm text-slate-700 mt-1">
                XP: {result.xpEarned} (+{result.bonusXpEarned}) / Coins: {result.coinsEarned}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
