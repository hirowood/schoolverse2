// クレド1項目分の型定義
export type CredoItem = {
  id: string;           // 一意なID（"credo-1" など）
  order: number;        // 表示順（1〜11）
  category: string;     // 大カテゴリ名（例：情報の受け取り方）
  title: string;        // タイトル（短い見出し）
  description: string;  // 説明（1〜3行程度）
};
