// src/features/credo/types/credo.ts

// クレドのカテゴリ（UI表示用）
export type CredoCategory =
  | "情報の受け取り方"
  | "思考の整理のしかた"
  | "タスク管理・行動のしかた"
  | "身体・感情・休息の扱い方"
  | "ジムでの運動"
  | "食事（脳と体の燃料）"
  | "部屋・生活環境の整理"
  | "日々の改善・学習・継続"
  | "自己受容・自己成長の考え方"
  | "対人・コミュニケーション・人生の姿勢"
  | "1日の終わらせ方（ナイトルール）";

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
