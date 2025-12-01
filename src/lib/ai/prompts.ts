// src/lib/ai/prompts.ts

export function buildAnalyzePrompt(text: string): string {
  return `あなたは学習コンテンツ分析の専門家です。
以下のテキストを分析し、JSON形式で結果を返してください。

## 分析対象テキスト
${text.slice(0, 3000)}

## 出力形式（必ずこのJSON形式のみを返してください）
{
  "documentType": "教科書" | "プリント" | "手書きノート" | "問題集" | "その他",
  "subject": {
    "main": "教科名",
    "sub": "単元名（あれば）",
    "confidence": 0.0-1.0
  },
  "structure": {
    "hasTitle": true/false,
    "hasList": true/false,
    "hasFormula": true/false,
    "hasTable": true/false,
    "paragraphCount": 数値
  },
  "keyPoints": ["重要ポイント1", "重要ポイント2"],
  "relatedTopics": ["関連トピック1"],
  "difficulty": {
    "level": 1-5,
    "reason": "理由"
  },
  "studyAdvice": "この内容を学習する際のアドバイス（100文字以内）"
}

注意：
- 日本の中学・高校レベルを基準に難易度を判定（1=基礎, 5=発展）
- 教科が特定できない場合は confidence を低くする
- JSON以外の出力は不要、説明文も不要`;
}

export function buildSummarizePrompt(text: string, maxLength: number = 200): string {
  return `以下のテキストを${maxLength}文字以内で要約してください。

## 要約のルール
1. 最も重要な情報を優先
2. 専門用語はそのまま使用
3. 箇条書きではなく自然な文章で
4. 学習者が復習時に役立つ内容

## 対象テキスト
${text.slice(0, 3000)}

## 出力
要約文のみを出力してください（説明や前置きは不要）。`;
}

export function buildTaggerPrompt(text: string): string {
  return `以下のテキストから学習に役立つタグを抽出してください。

## タグのカテゴリ
1. subject: 教科・科目（例：数学、英語、物理）
2. topic: 単元・トピック（例：二次関数、関係代名詞）
3. keyword: 重要キーワード（例：微分、エネルギー保存）
4. difficulty: 難易度（基礎/標準/発展）

## 対象テキスト
${text.slice(0, 2000)}

## 出力形式（JSONのみ）
{
  "tags": [
    { "name": "タグ名", "type": "subject", "confidence": 0.9 },
    { "name": "タグ名", "type": "topic", "confidence": 0.85 }
  ]
}

注意：
- タグは合計10個以内
- 日本語で出力
- confidence 0.7未満は含めない
- JSON以外の出力は不要`;
}
