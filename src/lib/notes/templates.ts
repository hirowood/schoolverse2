export const NOTE_TEMPLATE_OPTIONS = [
  {
    id: "fact-feeling",
    label: "感情と事実",
    summary: "感情と事実を分けて整理し、客観的に状況を把握する",
    hints: ["状況：何が起きた？", "事実：見た・聞いたこと", "感情：どう感じた？", "思考：どう解釈した？", "ニーズ：本当に求めていること", "行動：これからどうする？"],
  },
  {
    id: "5w2h",
    label: "5W2H",
    summary: "「何を」「なぜ」「誰が」「いつ」「どこで」「どうやって」「どれくらい」を整理して振り返る",
    hints: ["Why（なぜ）", "What（何を）", "When（いつ）", "Where（どこで）", "Who（誰が）", "How（どうやって）", "How much/long（どれくらい）"],
  },
  {
    id: "5why",
    label: "5 Why",
    summary: "課題に対して「なぜ？」を5回繰り返して原因と対策を探る",
    hints: ["問題を書き出す", "なぜ1：その理由は？", "なぜ2：さらに原因を問う", "なぜ3～5：深掘り", "結論と対策をまとめる"],
  },
  {
    id: "free",
    label: "自由記述",
    summary: "気づき・出来事・感情を自由に描き出す",
    hints: ["思いついたまま書き出す", "誰かに話すように書く", "次週の問いやテーマを含める"],
  },
  {
    id: "canvas",
    label: "キャンバス(描画)",
    summary: "図形・矢印・テキスト・画像を組み合わせて構造化する",
    hints: ["図形や線を自由に配置", "テキストをクリックで追加", "画像をドラッグ＆ドロップ"],
  },
] as const;

export type NoteTemplateId = (typeof NOTE_TEMPLATE_OPTIONS)[number]["id"];
