// src/lib/ocr/postprocessor.ts

/**
 * OCR後のテキスト後処理
 */

/**
 * 不要な空白・改行を正規化
 */
export function normalizeWhitespace(text: string): string {
  return text
    // 連続する空白を1つに
    .replace(/[ \t]+/g, " ")
    // 3つ以上の連続改行を2つに
    .replace(/\n{3,}/g, "\n\n")
    // 行頭・行末の空白を削除
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

/**
 * 日本語OCRでよくある誤認識を修正
 */
export function fixCommonOcrErrors(text: string): string {
  const replacements: [RegExp, string][] = [
    // 数字の誤認識
    [/[oO](?=\d)/g, "0"], // O → 0 (数字の前)
    [/(?<=\d)[oO]/g, "0"], // O → 0 (数字の後)
    [/[lI](?=\d)/g, "1"], // l/I → 1 (数字の前)
    [/(?<=\d)[lI]/g, "1"], // l/I → 1 (数字の後)
    
    // 句読点の正規化
    [/[、,]/g, "、"],
    [/[。.]/g, "。"],
    
    // 括弧の正規化
    [/[（\(]/g, "（"],
    [/[）\)]/g, "）"],
    
    // 全角・半角の統一（数字は半角に）
    [/[０-９]/g, (match) => String.fromCharCode(match.charCodeAt(0) - 0xfee0)],
    
    // よくある誤認識パターン
    [/ー{2,}/g, "ー"], // 連続する長音を1つに
    [/っっ+/g, "っ"], // 連続する促音を1つに
  ];

  let result = text;
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * 文字化けっぽい文字を除去
 */
export function removeGarbage(text: string): string {
  // 制御文字を除去（改行・タブは保持）
  return text.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "");
}

/**
 * 行の順序を整理（座標情報がある場合）
 */
export function sortLinesByPosition(
  lines: Array<{ text: string; y: number }>
): string {
  return lines
    .sort((a, b) => a.y - b.y)
    .map((line) => line.text)
    .join("\n");
}

/**
 * 信頼度が低い部分をマーク
 */
export function markLowConfidence(
  text: string,
  words: Array<{ text: string; confidence: number }>,
  threshold: number = 0.6
): string {
  let result = text;
  for (const word of words) {
    if (word.confidence < threshold && word.text.length > 0) {
      // 信頼度が低い単語を【】で囲む
      result = result.replace(word.text, `【${word.text}?】`);
    }
  }
  return result;
}

/**
 * テキスト後処理のメイン関数
 */
export function postprocessOcrText(text: string): string {
  let result = text;
  
  // 1. ゴミ文字除去
  result = removeGarbage(result);
  
  // 2. よくあるOCRエラーを修正
  result = fixCommonOcrErrors(result);
  
  // 3. 空白・改行を正規化
  result = normalizeWhitespace(result);
  
  return result;
}

/**
 * テキストの品質スコアを計算
 */
export function calculateTextQuality(text: string): number {
  if (!text.trim()) return 0;
  
  const length = text.length;
  
  // 日本語・英語の文字数
  const japaneseChars = (text.match(/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  const numberChars = (text.match(/[0-9０-９]/g) || []).length;
  
  // 意味のある文字の割合
  const meaningfulRatio = (japaneseChars + englishChars + numberChars) / length;
  
  // ノイズ文字（連続する同じ文字など）
  const noisePattern = /(.)\1{4,}/g;
  const noiseCount = (text.match(noisePattern) || []).length;
  
  // スコア計算
  let score = meaningfulRatio;
  score -= noiseCount * 0.1;
  score = Math.max(0, Math.min(1, score));
  
  return score;
}
