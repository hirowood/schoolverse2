"use server";

import Link from "next/link";
import { notFound } from "next/navigation";
import { CURRICULUM_MAP } from "@/lib/curriculum/map";

type CertDetail = {
  title: string;
  summary: string;
  steps: string[];
  practice: string[];
  subjects?: { label: string; href: string }[];
  pastExamLink?: string;
};

const CERT_DETAILS: Record<string, CertDetail> = {
  itpassport: {
    title: "ITパスポート試験",
    summary: "ITの全体像とリテラシーを広く学ぶ国家試験。最初の1資格としても最適です。",
    steps: [
      "シラバス全体をざっと読み、ストラテジ／マネジメント／テクノロジの比率を把握",
      "過去問を1日1〜2セット解き、用語の定着を優先",
      "弱点分野を参考書や動画で補強し、ミニテストで確認",
      "模試や過去問で時間管理を練習する",
    ],
    practice: [
      "PC/ネットワークの基本設定を自分で触ってみる",
      "セキュリティ三要素（CIA）を具体例とセットで説明できるようにする",
      "情報・法律・データ活用など、幅広い用語を10問ずつ小分けに復習",
    ],
  },
  fe: {
    title: "基本情報技術者試験",
    summary: "アルゴリズム／ネットワーク／DB／セキュリティ／マネジメントの基礎を問う国家試験。",
    steps: [
      "午前：分野別に6〜8割を安定させる（毎日短時間の積み上げ）",
      "アルゴリズム：計算量と代表的な探索・ソートを3日で復習",
      "午後：得意な2分野を決め、過去問を週3〜4問解く",
      "模試で時間配分と記述の書き方を確認",
    ],
    practice: [
      "計算量のオーダーを比較する（O(n), O(log n) など）",
      "簡単なSQLを10問解く（SELECT/JOIN/集計）",
      "IPアドレスとサブネット計算を3問解く",
    ],
    subjects: [
      { label: "科目A（午前）：基礎理論と分野別対策", href: "/certifications/fe/subject-a" },
      { label: "科目B（午後）：記述・設計・セキュリティ", href: "/certifications/fe/subject-b" },
    ],
    pastExamLink: "https://www.fe-siken.com/fekakomon.php",
  },
  ap: {
    title: "応用情報技術者試験",
    summary: "基本情報の発展。設計・マネジメント・アーキテクチャ・セキュリティまで幅広く問う。",
    steps: [
      "午前：過去問を8割程度キープ",
      "午後：得意なシナリオ（設計・セキュリティ・マネジメントなど）を2〜3分野に絞る",
      "設計系シナリオを1週間に1本は手書きで回答する",
      "模試で記述量と時間配分を最終調整",
    ],
    practice: [
      "ウォーターフォールとアジャイルの違いを図示",
      "セキュリティ設計での脅威と対策をセットで列挙",
      "午後問題のサンプルを5〜6問トレースして型を掴む",
    ],
  },
  info1: {
    title: "情報Ⅰ（高校情報）",
    summary: "高校必修の情報科目。アルゴリズム／情報デザイン／ネットワーク／プログラミングを横断的に学ぶ。",
    steps: [
      "教科書レベルの内容をマインドマップにまとめる",
      "代表的なアルゴリズム（フローチャート・探索・ソート）を絵で説明できるようにする",
      "ネットワークとセキュリティの基礎用語を毎日少しずつ復習",
      "小テストや演習で理解度をチェック",
    ],
    practice: [
      "フローチャートを書いて処理の流れを説明する",
      "情報モラル・著作権の事例を調べ、ポイントを整理",
      "IPアドレス／ドメイン／DNSの関係を図で描いてみる",
    ],
  },
};

export default async function CertificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const certNode = CURRICULUM_MAP.contentLines.certifications[0]?.children.find((c) => c.id === id);
  const detail = CERT_DETAILS[id];

  if (!certNode || !detail) {
    return notFound();
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">資格学習</p>
        <h1 className="text-3xl font-semibold text-slate-900">{detail.title}</h1>
        <p className="text-sm text-slate-600">{detail.summary}</p>
        <div className="flex flex-wrap gap-2 text-sm text-slate-600">
          <Link href="/certifications" className="text-emerald-600 hover:underline">
            ← 資格一覧に戻る
          </Link>
          <Link href={`/learning-chat?topic=${encodeURIComponent(id)}`} className="text-emerald-600 hover:underline">
            学習チャットで相談
          </Link>
          <Link href={`/plan?topic=${encodeURIComponent(id)}`} className="text-emerald-600 hover:underline">
            学習プランに追加
          </Link>
        </div>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">学習ステップ</h2>
        <ol className="mt-3 space-y-2 list-decimal pl-5 text-sm text-slate-700">
          {detail.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">練習アイデア／演習</h2>
        <ul className="mt-3 space-y-2 list-disc pl-5 text-sm text-slate-700">
          {detail.practice.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>

      {detail.subjects && detail.subjects.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">科目（リンク）</h2>
          <ul className="mt-3 space-y-2 list-disc pl-5 text-sm text-slate-700">
            {detail.subjects.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="underline text-emerald-700 hover:text-emerald-900">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {detail.pastExamLink && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-amber-900">過去問／演習リンク</h2>
          <p className="mt-2 text-sm text-amber-800">
            <Link href={detail.pastExamLink} className="underline font-semibold hover:text-amber-900">
              過去問を見る
            </Link>
          </p>
        </section>
      )}
    </div>
  );
}
