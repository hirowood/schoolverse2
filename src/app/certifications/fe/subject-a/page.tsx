"use client";

import Link from "next/link";

export default function SubjectAPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">基本情報技術者試験</p>
        <h1 className="text-3xl font-semibold text-slate-900">科目A（午前）</h1>
        <p className="text-sm text-slate-600">
          午前試験で問われる基礎知識（テクノロジ系・マネジメント系・ストラテジ系）を短時間で復習するためのガイドです。
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-emerald-700">
          <Link href="/certifications/fe" className="underline hover:text-emerald-800">
            ← 基本情報トップへ戻る
          </Link>
          <Link href="/certifications/fe/subject-a/basic-theory" className="underline hover:text-emerald-800">
            基礎理論トップを見る
          </Link>
        </div>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">学習ステップ（例）</h2>
        <ol className="mt-3 space-y-2 list-decimal pl-5 text-sm text-slate-700">
          <li>シラバスに沿って過去問を分野別に10年分解き、苦手分野を特定</li>
          <li>弱点分野を参考書＋過去問アプリで補強（1日30分×2セクション）</li>
          <li>用語カードを作成し、週1で総復習（ネットワーク／セキュリティ／アルゴリズム）</li>
          <li>模試で時間配分を確認し、見直し時間を5〜10分確保する練習</li>
        </ol>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">重点トピック</h2>
        <ul className="mt-3 space-y-2 list-disc pl-5 text-sm text-slate-700">
          <li>アルゴリズムと計算量（基本のオーダー、探索・ソート）</li>
          <li>ネットワーク基礎（IP/DNS/ルーティング/セキュリティ）</li>
          <li>データベース（正規化、SQL基礎、トランザクション）</li>
          <li>情報セキュリティ（脅威・対策、暗号、認証）</li>
          <li>マネジメント／ストラテジ（開発プロセス、経営戦略、組織）</li>
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">出題範囲</h2>
        <div className="space-y-3 text-sm text-slate-700">
          <div>
            <h3 className="text-base font-semibold text-slate-900">テクノロジ系</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li className="font-semibold">
                <Link href="/certifications/fe/subject-a/basic-theory#discrete-math" className="underline text-emerald-700 hover:text-emerald-900">
                  基礎理論（離散数学・集合・論理・確率・情報理論の基本）
                </Link>
              </li>
              <ul className="mt-1 ml-5 list-disc space-y-1">
                <li>
                  <Link href="/certifications/fe/subject-a/basic-theory#discrete-math" className="underline text-emerald-700 hover:text-emerald-900">
                    離散数学：2進数／補数／符号化／ブール代数／桁あふれと桁借り
                  </Link>
                </li>
                <li>
                  <Link href="/certifications/fe/subject-a/basic-theory#sets" className="underline text-emerald-700 hover:text-emerald-900">
                    集合：和集合／積集合／ベン図、集合計算
                  </Link>
                </li>
                <li>
                  <Link href="/certifications/fe/subject-a/basic-theory#logic" className="underline text-emerald-700 hover:text-emerald-900">
                    命題・論理：真偽表／ド・モルガン／論理演算の基本
                  </Link>
                </li>
                <li>
                  <Link href="/certifications/fe/subject-a/basic-theory#probability" className="underline text-emerald-700 hover:text-emerald-900">
                    確率：事象と標本空間、独立・従属、同時確率
                  </Link>
                </li>
                <li>情報理論：情報量、エントロピー、符号長のイメージ</li>
              </ul>
              <li>アルゴリズムとプログラミング（計算量、探索・ソート、データ構造）</li>
              <li>コンピュータ構成要素（CPU／メモリ／入出力、キャッシュ、命令セット）</li>
              <li>システム構成要素（OS、プロセス／スレッド、仮想化、クラスタリング）</li>
              <li>ハードウェア（記憶装置、入出力装置、RAIDなど）</li>
              <li>ヒューマンインターフェース（UI/UX基礎、アクセシビリティ）</li>
              <li>マルチメディア（画像／音声／動画の表現と圧縮、画素と解像度）</li>
              <li>データベース（正規化、SQL、トランザクション、インデックス）</li>
              <li>ネットワーク（OSI/TCP/IP、IP/DNS/ルーティング、HTTP/HTTPS）</li>
              <li>セキュリティ（CIA、認証・認可、暗号／ハッシュ／アクセス制御）</li>
              <li>システム開発技術（要求、テスト、アーキテクチャ選定の考え方）</li>
              <li>ソフトウェア開発技術（開発プロセス、設計、品質・テスト管理）</li>
            </ul>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">マネジメント系</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>プロジェクトマネジメント（範囲・コスト・スケジュール）</li>
              <li>品質管理とレビュー、テスト計画の基本</li>
              <li>サービスマネジメント（SLM／変更／リリース／問題管理など）</li>
            </ul>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">ストラテジ系</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>経営戦略と情報システム戦略の関係</li>
              <li>ビジネスインパクト分析・リスクとリターン</li>
              <li>投資評価・OR（線形計画など）の基本的な考え方</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
