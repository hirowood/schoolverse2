// src/app/page.tsx
export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-50">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Schoolverse2</h1>
      <p className="mb-2 text-center text-lg">
        「AI学習コーチ × クレド実践」のための学びのハブ
      </p>
      <p className="text-sm text-slate-300 text-center max-w-xl">
        今日の一歩と小さな改善を積み上げる場所です。サイドバーからクレド実践ボードやコーチ機能にアクセスできます。
      </p>
    </main>
  );
}
