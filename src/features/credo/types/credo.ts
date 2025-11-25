// src/features/credo/types/credo.ts

// クレドのカテゴリ（UI表示用）
export type CredoCategory =
  | "学びの準備"
  | "振り返り"
  | "タスク管理"
  | "睡眠と体調"
  | "運動"
  | "相談"
  | "集中と休憩"
  | "挑戦"
  | "環境"
  | "コミュニケーション"
  | "一日の締め";

// クレドID（マスター）
export type CredoId =
  | "credo-1"
  | "credo-2"
  | "credo-3"
  | "credo-4"
  | "credo-5"
  | "credo-6"
  | "credo-7"
  | "credo-8"
  | "credo-9"
  | "credo-10"
  | "credo-11";

// クレド1件の定義
export interface CredoItem {
  id: CredoId;
  order: number;
  category: CredoCategory;
  title: string;
  description: string;
}

// CredoBoard 用のprops
export interface CredoBoardProps {
  items?: CredoItem[];
  doneMap?: Record<CredoId, boolean>;
  onSelect?: (item: CredoItem) => void;
}

// フォームに載る1クレド1日の値
export interface CredoPracticeFormValue {
  credoId: CredoId;
  date: string; // "YYYY-MM-DD"
  done: boolean;
  note: string;
}

// 1日分のクレド実践
export interface CredoDailyPractice {
  date: string; // "YYYY-MM-DD"
  values: Record<CredoId, CredoPracticeFormValue>;
}

// 取得用のレコード
export interface CredoPracticeLog {
  id: string; // UUID
  userId: string;
  date: string;
  credoId: CredoId;
  done: boolean;
  note: string;
  createdAt: string;
  updatedAt: string;
}
