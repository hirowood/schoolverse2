// src/lib/ocr/recognizer.ts

import { createWorker, Worker } from "tesseract.js";
import { preprocessImage, PREPROCESS_PRESETS, type PreprocessOptions } from "./preprocessor";
import { postprocessOcrText, calculateTextQuality } from "./postprocessor";

export interface OcrResult {
  text: string;
  rawText: string;
  confidence: number;
  quality: number;
  processingTime: number;
}

export interface OcrOptions {
  language?: "jpn" | "eng" | "jpn+eng";
  imageType?: "printed" | "handwritten" | "photo";
  enhance?: boolean;
  onProgress?: (status: string, progress: number) => void;
}

/**
 * 画像からテキストを認識
 */
export async function recognizeText(
  imageData: string,
  options: OcrOptions = {}
): Promise<OcrResult> {
  const startTime = Date.now();
  const {
    language = "jpn+eng",
    imageType = "printed",
    enhance = true,
    onProgress,
  } = options;

  let processedImage = imageData;

  // 1. 画像前処理
  if (enhance && typeof window !== "undefined") {
    onProgress?.("画像を最適化中...", 0.1);
    const preset = PREPROCESS_PRESETS[imageType] || PREPROCESS_PRESETS.printed;
    try {
      processedImage = await preprocessImage(imageData, preset);
    } catch (error) {
      console.warn("Image preprocessing failed, using original:", error);
    }
  }

  // 2. Tesseract.js Worker作成
  onProgress?.("OCRエンジンを初期化中...", 0.2);
  
  let worker: Worker | null = null;
  try {
    worker = await createWorker(language, 1, {
      logger: (m) => {
        if (m.status === "recognizing text" && typeof m.progress === "number") {
          onProgress?.("テキストを認識中...", 0.2 + m.progress * 0.7);
        }
      },
    });

    // 3. OCR実行
    const result = await worker.recognize(processedImage);
    
    const rawText = result.data.text.trim();
    const confidence = result.data.confidence / 100; // 0-1に正規化
    
    // 4. 後処理
    onProgress?.("テキストを整形中...", 0.95);
    const text = postprocessOcrText(rawText);
    
    // 5. 品質スコア計算
    const quality = calculateTextQuality(text);
    
    const processingTime = Date.now() - startTime;
    onProgress?.("完了", 1.0);

    return {
      text,
      rawText,
      confidence,
      quality,
      processingTime,
    };
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}

/**
 * 複数画像を一括処理
 */
export async function recognizeMultiple(
  images: string[],
  options: OcrOptions = {}
): Promise<OcrResult[]> {
  const results: OcrResult[] = [];
  
  for (let i = 0; i < images.length; i++) {
    const progress = (current: number) => {
      options.onProgress?.(
        `画像 ${i + 1}/${images.length} を処理中...`,
        (i + current) / images.length
      );
    };
    
    const result = await recognizeText(images[i], {
      ...options,
      onProgress: (status, p) => progress(p),
    });
    results.push(result);
  }
  
  return results;
}

/**
 * OCR結果を結合
 */
export function mergeOcrResults(results: OcrResult[]): OcrResult {
  if (results.length === 0) {
    return {
      text: "",
      rawText: "",
      confidence: 0,
      quality: 0,
      processingTime: 0,
    };
  }
  
  if (results.length === 1) {
    return results[0];
  }
  
  const text = results.map((r) => r.text).join("\n\n---\n\n");
  const rawText = results.map((r) => r.rawText).join("\n\n");
  const confidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
  const quality = results.reduce((sum, r) => sum + r.quality, 0) / results.length;
  const processingTime = results.reduce((sum, r) => sum + r.processingTime, 0);
  
  return { text, rawText, confidence, quality, processingTime };
}
