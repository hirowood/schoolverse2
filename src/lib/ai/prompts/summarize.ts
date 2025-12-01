export function buildSummarizePrompt(text: string, maxLength: number = 200): string {
  return `以下のテキストを${maxLength}文字以内で要約してください。

## 要約のルール
1. 最も重要な情報を優先
2. 専門用語はそのまま使用
3. 箇条書きではなく自然な文章で
4. 学習者が復習時に役立つ内容

## 対象テキスト
${text}

## 出力
要約文のみを出力してください（説明や前置きは不要）。`;
}
