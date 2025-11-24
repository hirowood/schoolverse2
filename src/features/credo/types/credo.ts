// クレド機能全体で使う型定義

export type CredoCategory =
  | "情報の受け取り方"
  | "思考の整理"
  | "タスク管理・行動"
  | "コンディション"
  | "対人・コミュニケーション"
  | "ナイトルール"
  | "その他";

export interface CredoItem {
  id: string;               // 一意なID（例: "C-01"）
  code: string;             // 表示用の番号・コード（例: "#01 行動の土台"）
  title: string;            // ルール名
  shortDescription: string; // 一行説明（カードのサブタイトル）
  detail: string;           // もう少し長い説明（本文）
  category: CredoCategory;  // どのカテゴリのクレドか
}
