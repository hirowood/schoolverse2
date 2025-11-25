// src/features/credo/types/credo.ts

// クレドのカテゴリ（UI表示用）
export type CredoCategory =
  | "情報の受け取り方"
  | "思考の整理"
  | "タスク管理"
  | "体調と気分"
  | "運動"
  | "食事"
  | "部屋と環境"
  | "日々の改善"
  | "自己受容"
  | "コミュニケーション"
  | "1日の終わり方";

// クレドID（マスタ）
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

// クレド1件分の定義
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

// フォームで扱う1クレド単位の値
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

// 永続化用のレコード
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
