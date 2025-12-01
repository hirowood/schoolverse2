// src/lib/ai/types.ts

export interface AiAnalysisResult {
  // 文書タイプ
  documentType: "教科書" | "プリント" | "手書きノート" | "問題集" | "その他";
  
  // 教科分類
  subject: {
    main: string;
    sub?: string;
    confidence: number;
  };
  
  // 構造解析
  structure: {
    hasTitle: boolean;
    hasList: boolean;
    hasFormula: boolean;
    hasTable: boolean;
    paragraphCount: number;
  };
  
  // キーポイント
  keyPoints: string[];
  
  // 関連トピック
  relatedTopics: string[];
  
  // 難易度
  difficulty: {
    level: 1 | 2 | 3 | 4 | 5;
    reason: string;
  };
  
  // 学習アドバイス
  studyAdvice: string;
}

export interface AutoTag {
  name: string;
  type: "subject" | "topic" | "keyword" | "difficulty";
  confidence: number;
}

export interface AutoTagResult {
  tags: AutoTag[];
}

export interface OcrAnalyzeOptions {
  enhanceImage?: boolean;
  generateSummary?: boolean;
  generateTags?: boolean;
  language?: "jpn" | "eng" | "jpn+eng";
  imageType?: "printed" | "handwritten" | "photo";
}

export interface OcrAnalyzeResult {
  ocrText: string;
  confidence: number;
  summary?: string;
  analysis?: AiAnalysisResult;
  suggestedTags?: string[];
  processingTime: number;
}
