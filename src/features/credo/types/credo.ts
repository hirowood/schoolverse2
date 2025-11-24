// src/features/credo/types/credo.ts

// クレドのカテゴリ（UIでのラベルに使う）
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

// クレド1項目分の定義
export interface CredoItem {
  id: string; // "C-01" など
  code: string; // "#01 情報の受け取り方" など
  title: string;
  shortDescription: string;
  detail: string;
  category: CredoCategory;
}

// ★ UI内部で使う「クレド1つ分の状態」
export interface CredoDailyItemValue {
  credoId: string;
  done: boolean;
  note: string;
}

// ★ 保存するときに使う「1日分の実践ログ」
export interface CredoPracticeFormValue {
  date: string; // "YYYY-MM-DD"
  items: CredoDailyItemValue[];
}
