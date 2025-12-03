"use client";

import Link from "next/link";

type Step = {
  id: string;
  title: string;
  steps: string[];
  analogy?: string;
  miniTasks?: string[];
  realWorld?: string[];
  minutes: number;
};

const blocks: Step[] = [
  {
    id: "discrete-math",
    title: "離散数学（2進数とビットの正体）",
    analogy:
      "長い廊下にスイッチが並んでいるイメージ。ON=1, OFF=0 の並びが数や文字、画像の画素まで全部を表す。重さ（1,2,4,8…）を足すだけで10進と往復できる。",
    minutes: 14,
    steps: [
      "2進数→10進数：右から 1,2,4,8... の重みを足すだけ。",
      "10進数→2進数：2で割って余りを下から上へ読む（13 → 1101）。",
      "ビットとバイト：スイッチ1個=1ビット、8個=1バイトで 0〜255 を表せる。2のn乗の感覚を養うと暗算が速くなる。",
      "テキストの符号化：ASCIIは1バイト=1文字、UTF-8は複数バイト。2進列の塊をどう区切るかが文字コードの違い。",
      "桁あふれの直感：8ビットで 255 + 1 をすると 0 に戻る（モジュロ演算）。補数は“借り”と“繰り上がり”の位置を変えるだけ。",
      "補数（2の補数）：マイナスは『反転して+1』で表す。1111 1111 は -1、1000 0000 は -128（8ビットの場合）。",
      "ブール代数の最小セット：AND/OR/NOT と真理値表。分配律・交換律・吸収律を覚えると式を簡約できる。",
      "論理式の簡約：ド・モルガンで否定を外に出し、同類項をまとめる（例：A + A·B = A）。",
    ],
    miniTasks: [
      "Q: (1010)₂ は何？ → 10",
      "Q: 25₁₀ を2進数で？ → 11001",
      "Q: 1バイトで表せる通り数は？ → 256",
      "Q: 1111 0000 (2進) を16進で表すと？ → F0",
      "Q: UTF-8で『A』は何バイト？ → 1バイト（0x41）",
      "Q: 8ビットで -1 を2の補数で書くと？ → 1111 1111",
      "Q: 桁あふれの例：1111 1111 に 0000 0001 を足すと？ → 0000 0000（オーバーフロー）",
      "Q: ブール代数で A + A·B を簡約すると？ → A",
    ],
    realWorld: [
      "組み込みやIoT：8ビット/16ビット境界でのオーバーフローがバグにつながるので、2の補数と桁あふれの挙動を知る。",
      "文字化け調査：UTF-8/Shift_JIS の違いは『どこで区切るか』の話。2進列の塊を意識するとデコード不良を切り分けやすい。",
      "回路・FPGA：ブール代数で式を簡約し、ゲート数を減らして省電力・小面積を達成する。",
    ],
  },
  {
    id: "sets",
    title: "集合（人のグループで考える）",
    analogy:
      "クラスに『サッカー好き』『ゲーム好き』の丸を描くベン図。丸の重なりが共通部分、はみ出たところが“だけ”。グループの重なりを数えるときは重複を引くのがコツ。",
    minutes: 10,
    steps: [
      "和集合 A ∪ B：どちらかに入っていればOK（両方含む）。",
      "積集合 A ∩ B：両方に入っている人だけ。",
      "Aだけ/Bだけ：A ∪ B から共通ともう一方を引けば計算できる。",
      "補集合：全体からA以外を取る。母集団をはっきり決めないと混乱するので先に定義する。",
      "頻度を数えるときの落とし穴：同じ人を二重に数えない。必ず A+B-共通。",
    ],
    miniTasks: [
      "Q: 犬か猫どちらかでも好き → A ∪ B",
      "Q: サッカー14人、ゲーム20人、両方8人。どちらか好きは？ → 26人",
      "Q: 公式メモ：A ∪ B = A + B - A ∩ B",
      "Q: 全体30人、サッカー14人、ゲーム20人、両方8人。サッカーもゲームも好きでない人は？ → 4人",
    ],
    realWorld: [
      "ログ分析：A=サイト訪問、B=購入 のとき A ∩ B がCV、A ∪ B は関心層。重複を引く発想でKPIを誤カウントしない。",
      "データクレンジング：異なるリストの重複（集合の共通）を探し、ユニーク件数（和集合）を把握する。",
      "ABテスト：母集団を明確にしないと『補集合』がズレる。全体定義を先に固定する重要性を体感。",
    ],
  },
  {
    id: "logic",
    title: "論理（AND / OR / NOT）",
    analogy:
      "AND=『宿題して かつ お風呂入ったらゲームOK』、OR=『カレー または ラーメン好きならOK（両方でも可）』、NOT=ひっくり返すスイッチ。if文の条件はまず日常文に置き換えると混乱しない。",
    minutes: 10,
    steps: [
      "AND: 両方真で初めて真。",
      "OR: どちらか1つでも真なら真（両方でもOK）。",
      "NOT: 真偽を反転させるだけのシンプル操作。",
      "真理値表で確認：4行の表を書けば必ず正しい。複雑な条件も分解して表にする。",
      "ド・モルガンの法則：NOT(A AND B) = (NOT A) OR (NOT B)。否定は外に出して記号をひっくり返すと覚える。",
    ],
    miniTasks: [
      "Q: 雨が降っていて、かさもある → A AND B",
      "Q: A OR B が真になるのは？ → AかBのどちらか1つでも真",
      "Q: Aが真のとき NOT A は？ → 偽",
      "Q: NOT(A AND B) を AND/OR/NOT だけで書き直すと？ → (NOT A) OR (NOT B)",
      "Q: (A OR B) AND NOT C の真理値表を4行で書いてみる（A,B,CはT/F）。",
    ],
    realWorld: [
      "条件分岐バグ防止：if の否定条件をド・モルガンで展開し、読みやすい形にする（例: !(a && b) → !a || !b）。",
      "検索クエリ：AND/OR/NOT は検索演算子そのもの。要件定義でも『両方必要？どちらかで良い？』を明示できる。",
      "アクセス制御：RBACで『管理者 AND 有効ユーザー AND 期限内』のように条件を組み合わせるとき論理式が基礎。",
    ],
  },
  {
    id: "probability",
    title: "確率（箱とカードのイメージ）",
    analogy:
      "色つきカードが入った箱を思い浮かべ、引く前に『何枚中何枚が当たり？』を数える。戻す/戻さないで分母が変わるのを“箱から減る・減らない”でイメージ。",
    minutes: 12,
    steps: [
      "事象と全体：全体を母集団（標本空間）と呼び、その中の当たりが事象。",
      "基本の確率：当たり枚数 ÷ 全体枚数。",
      "独立と従属：戻して引く＝独立、戻さない＝従属で確率が変わる。",
      "同時確率と条件付き確率：P(AかつB)、P(A|B) のように“前情報”があるとき分母が変わる。分数の分母を意識。",
      "場合の数：順列/組合せは小さい例で必ず手書き展開し、公式の意味を確認。",
    ],
    miniTasks: [
      "Q: 赤2枚, 青3枚の箱から1回引く。赤の確率は？ → 2/5",
      "Q: 戻さず2回引き、1回目赤,2回目青の確率は？ → (2/5) × (3/4) = 6/20",
      "Q: コイン2回投げて両方表の確率は？ → 1/4（独立だから 1/2×1/2）",
      "Q: 『1回目で赤』が起きたあとに『2回目で赤』の確率（戻さない）→ 1/2",
      "Q: 3本のくじに当たり1本。1本引いて戻さず、次に当たる確率は？ → 0/2 or 1/2 を場合分けして計算",
    ],
    realWorld: [
      "A/Bテスト：母集団の分母を正しく設定しないと検定が破綻。条件付き確率の意識が必須。",
      "信頼性設計：独立な故障確率を掛け合わせてシステム全体の稼働率を見積もる（直列/並列で変わる）。",
      "セキュリティ：ベイズの定理で検知の陽性/陰性の尤度を評価する（誤検知率を直感で説明できる）。",
    ],
  },
  {
    id: "information-theory",
    title: "情報理論（情報量と符号化の直感）",
    analogy:
      "20の質問ゲーム。『はい/いいえ』1回で1ビット。質問が少ないほど効率的な符号。よく出る答えを短く、珍しい答えを長くするほど会話が短縮できる＝ハフマン符号の発想。",
    minutes: 12,
    steps: [
      "情報量：選択肢が多いほど1回で必要なビットが増える（2択=1ビット, 4択=2ビット）。",
      "符号長と頻度：よく出る文字ほど短い符号を割り当てると全体が短くなる（ハフマン符号の考え方）。",
      "圧縮の直感：同じパターンが続くなら回数だけ送る方が短い（例: RLE）。",
      "通信と誤り訂正：1ビット余分に付けて偶数/奇数チェック（パリティ）をすれば簡単な誤り検出ができる。",
      "エントロピーの感覚：結果がバラけるほど“驚き”が大きくビット数が増える。偏りが大きいと短くできる。",
    ],
    miniTasks: [
      "Q: 4択クイズ1問に最低必要なビット数は？ → 2ビット",
      "Q: 日本語で一番多い文字『の』を1ビットに、珍しい文字を長くするのはなぜ？ → 全体を短くするため",
      "Q: \"AAAAA\" を回数で表すと？ → A×5 と書けば短くできる",
      "Q: 偶数パリティで 1011 に1ビット追加するなら？ → 10111（1を足して1の数を偶数に）",
      "Q: 毎回ほぼ『A』しか出ない文字列を送るなら、Aを1ビット、他を長くすると何が嬉しい？ → 平均符号長が短縮する",
    ],
    realWorld: [
      "HTTP圧縮：よく出る文字列を短く符号化するGzip/ハフマン符号の発想そのもの。転送量とレイテンシを減らす。",
      "ログ転送と監視：繰り返しパターン（RLE）や差分だけ送ることでコスト削減。帯域が細いIoTで効果大。",
      "通信エラー検出：パリティやCRCでビット反転を検知。実装時は“どこまで検出できて、どれが見逃されるか”をビット視点で説明できると強い。",
    ],
  },
];

export default function BasicTheoryPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">基本情報 技術者試験</p>
        <h1 className="text-3xl font-semibold text-slate-900">科目A：基礎理論（離散数学・集合・論理・確率・情報理論）</h1>
        <p className="text-sm text-slate-600">
          スイッチ・カード・丸いベン図など、身近なたとえで「仕組みがイメージできる」ことをゴールにした超入門ステップ集です。
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-emerald-700">
          <Link href="/certifications/fe/subject-a" className="underline hover:text-emerald-800">
            ← 科目Aトップへ戻る
          </Link>
        </div>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">このページでやること</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-700">
            <li>たとえ話で全体像をつかむ → 覚えずにイメージする</li>
            <li>手を動かすミニタスクで「自分でもできた」を作る</li>
            <li>クイズ形式で即フィードバックを受ける（丸付け→解説）</li>
          </ol>
        </div>

        {blocks.map((b) => (
          <div key={b.title} id={b.id} className="space-y-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">{b.title}</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                  所要目安: {b.minutes}分
                </span>
              </div>
              {b.analogy && <p className="text-sm text-slate-700">たとえ：{b.analogy}</p>}
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {b.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            {b.miniTasks && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">ミニタスク（その場で答えを出す）</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {b.miniTasks.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
            {b.realWorld && (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-900">
                <p className="font-semibold">現場ではこう使う</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {b.realWorld.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm space-y-2 text-sm text-amber-800">
        <h2 className="text-base font-semibold text-amber-900">進め方のコツ</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>イメージ→手書き→クイズの順で「わかる」を「できる」にする。</li>
          <li>式で詰まったら必ず絵に戻す（スイッチ列・ベン図・カード箱）。</li>
          <li>1ブロック10分以内を目安に細切れで学ぶと続きやすい。</li>
        </ul>
      </section>
    </div>
  );
}
