"use client";

export default function DashboardPage() {
  const important = [
    { title: "今日の学習計画", desc: "AIコーチのプランを確認して、タスクを1つ完了する。" },
    { title: "クレド実践チェック", desc: "今日のクレドを1つ実践し、メモを残す。" },
  ];

  const optional = [
    { title: "チャット相談", desc: "気分や困りごとをAIコーチに相談する。" },
    { title: "週次サマリー", desc: "今週の実践率とハイライトをざっと眺める。" },
  ];

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-slate-500">Dashboard</p>
        <h1 className="text-3xl font-semibold text-slate-900">ダッシュボード</h1>
        <p className="text-sm text-slate-600">
          今日やるべき「重要」なことと、余裕があればやりたい「重要じゃない」ことを分けて並べました。
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">重要</h2>
          <ul className="space-y-2">
            {important.map((item) => (
              <li key={item.title} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-medium text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-600">{item.desc}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">重要じゃない</h2>
          <ul className="space-y-2">
            {optional.map((item) => (
              <li key={item.title} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-medium text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-600">{item.desc}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
