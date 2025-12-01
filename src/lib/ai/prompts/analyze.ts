export function buildAnalyzePrompt(text: string): string {
  return `あなたは学習コンテンツ分析の専門家です。
以下のテキストを分析し、JSON形式で結果を返してください。

## 分析対象テキスト
${text}

## 出力形式（必ずこのJSON形式で返してください）
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
  "keyPoints": ["重要ポイント1", "重要ポイント2", ...],
  "relatedTopics": ["関連トピック1", ...],
  "difficulty": {
    "level": 1-5,
    "reason": "理由"
  },
  "studyAdvice": "この内容を学習する際のアドバイス（100文字以内）"
}

注意：
- 日本の中学・高校レベルを基準に難易度を判定
- 教科が特定できない場合は confidence を低くする
- JSON以外の出力は不要`;
}
