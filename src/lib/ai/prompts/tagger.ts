export function buildTaggerPrompt(text: string): string {
  return `以下のテキストから学習に役立つタグを抽出してください。

## タグのカテゴリ
1. subject: 教科・科目（例：数学、英語、物理）
2. topic: 単元・トピック（例：二次関数、関係代名詞）
3. keyword: 重要キーワード（例：微分、エネルギー保存）
4. difficulty: 難易度（基礎/標準/発展）

## 対象テキスト
${text}

## 出力形式（JSON）
{
  "tags": [
    { "name": "タグ名", "type": "subject|topic|keyword|difficulty", "confidence": 0.0-1.0 },
    ...
  ]
}

注意：
- タグは合計10個以内
- 日本語で出力
- confidence 0.7未満は除外`;
}
