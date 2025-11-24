// src/features/credo/types.ts

// クレドそのものの定義（マスタ）
// 今の CREDO_ITEMS と対応
export interface CredoItem {
  id: string;          // 例: "credo-1"
  order: number;       // 表示順
  category: string;    // 大カテゴリ（情報の受け取り方など）
  title: string;       // 見出し
  description: string; // 要約説明
}

// 1 クレドに対する「今日の実践」の入力値
export interface CredoDailyFormValue {
  done: boolean; // 今日やったかどうか（チェックボックス）
  note: string;  // 今日の一言メモ
}

// フォーム全体の状態（credoId → 入力値）
// 例: { "credo-1": { done: true, note: "〜〜した" }, ... }
export type CredoDailyFormState = Record<string, CredoDailyFormValue>;

// 保存用のログ 1 件
export interface CredoDailyLogItem {
  credoId: string;
  done: boolean;
  note: string;
}

export interface CredoDailyLog {
  id: string;                  // ログのID（クライアント側で一意になればOK）
  date: string;                // "YYYY-MM-DD"
  items: CredoDailyLogItem[];  // その日のクレド実践一覧
  createdAt: string;           // ISO文字列
}
