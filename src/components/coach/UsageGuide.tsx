// src/components/coach/UsageGuide.tsx
"use client";

interface UsageGuideProps {
  compact?: boolean;
}

export function UsageGuide({ compact = false }: UsageGuideProps) {
  if (compact) {
    return (
      <div className="rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-600">
        💡 困りごとや気分を送ると、クレドに沿った一歩を提案します
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm space-y-2">
      <p className="text-xs font-semibold text-slate-700">📖 使い方ガイド</p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
        <li>今日やりたいこと、困りごと、気分を短く送ってみてください。</li>
        <li>クレド実践の振り返りや、次にやる一歩を相談できます。</li>
        <li>学習計画ボタンで、設定値＋クレド状況から今日のプランを生成します。</li>
      </ul>
    </div>
  );
}
