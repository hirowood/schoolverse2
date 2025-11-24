// ナビゲーションアイテムの型定義
export type NavItem = {
  label: string;        // 表示名（日本語）
  href: string;         // 遷移先パス
  description?: string; // 補足説明（必要なら）
};

// メインサイドバー用ナビリスト
export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    label: "AIコーチ",
    href: "/", // トップページ＝AIコーチダッシュボード
    description: "AIコーチとの対話や今日の提案",
  },
  {
    label: "学習計画",
    href: "/plan",
    description: "週間・月間の学習プラン",
  },
  {
    label: "クレド実践",
    href: "/credo",
    description: "クレド11箇条のチェック・振り返り",
  },
  {
    label: "設定",
    href: "/settings",
    description: "アカウントや通知の設定",
  },
];
