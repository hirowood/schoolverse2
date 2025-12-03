"use client";

import Link from "next/link";

export default function SubjectBPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">基本情報技術者試験</p>
        <h1 className="text-3xl font-semibold text-slate-900">科目B（午後）</h1>
        <p className="text-sm text-slate-600">
          記述／設計／セキュリティ／アルゴリズムなど、長文と実践力を問う午後試験に備えるための学習ガイドです。分野を絞って集中的に演習しましょう。
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-emerald-700">
          <Link href="/certifications/fe" className="underline hover:text-emerald-800">
            ← 基本情報トップへ戻る
          </Link>
        </div>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">学習ステップ（例）</h2>
        <ol className="mt-3 space-y-2 list-decimal pl-5 text-sm text-slate-700">
          <li>午後の苦手な分野を2〜3つに絞り（アルゴリズム、データベース、セキュリティなど）</li>
          <li>公式シラバスと過去問を基に「頻出パターン」を整理し、1週間で3〜4問解く</li>
          <li>設計・テーブル定義・ERD作成など、手で書く練習を繰り返す</li>
          <li>模試または過去問で2時間通し演習を行い、回答の書き方を確認</li>
        </ol>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">重点トピック</h2>
        <ul className="mt-3 space-y-2 list-disc pl-5 text-sm text-slate-700">
          <li>プログラム設計（流れ図／疑似コード、変数・配列・スタック・キュー、トレース）</li>
          <li>データベース設計：正規化、ERD、トランザクションとロック制御</li>
          <li>情報セキュリティ：脅威と対策、認証・認可、アクセス制御</li>
          <li>システム設計・運用：可用性、バックアップ、監視、障害対応</li>
          <li>ネットワーク：プロトコル設計、アドレス設計、疎通確認の考え方</li>
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">ミニ演習アイデア</h2>
        <ul className="mt-3 space-y-2 list-disc pl-5 text-sm text-slate-700">
          <li>トレース問題：指定されたコードの出力を求め、途中状態をメモする</li>
          <li>ERD作成：与えられた文章からエンティティ・リレーションを抽出して図にする</li>
          <li>セキュリティ設計：脅威と対策を対にして並べ、理由を簡潔にまとめる</li>
        </ul>
      </section>
    </div>
  );
}
