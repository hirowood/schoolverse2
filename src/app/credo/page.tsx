// src/app/credo/page.tsx
import { CredoBoard } from "@/components/credo/CredoBoard";
import { CredoDailyForm } from "@/components/credo/CredoDailyForm";

export default function Page() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="mb-2 text-2xl font-semibold">クレド実践ボード</h1>
        <p className="mb-4 text-sm text-slate-600">
          池田さんのクレド11箇条と、日々の実践状況を確認するボードです。
        </p>
        <CredoBoard />
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h2 className="mb-2 text-lg font-medium text-slate-900">
          今日のクレド実践ログ
        </h2>
        <p className="mb-3 text-xs text-slate-600">
          各クレドについて「できた／できなかった」とメモを書き込んでください。
        </p>
        <CredoDailyForm />
      </section>
    </div>
  );
}
