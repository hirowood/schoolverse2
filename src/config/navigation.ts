// ナビゲーション項目の型
export type NavItem = {
  label: string;        // 表示ラベル
  href: string;         // 画面へのパス
  description?: string; // 補足説明（任意）
};

// メインサイドバーのナビリスト
export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    label: "AIコーチ",
    href: "/", // トップページはAIコーチダッシュボード
    description: "AIコーチとの対話・相談の入口",
  },
  {
    label: "ダッシュボード",
    href: "/dashboard",
    description: "今日のプラン・目標・体調・連絡のまとめ",
  },
  {
    label: "学習プラン",
    href: "/plan",
    description: "週次・日次の学習プランを管理",
  },
  {
    label: "クレド実践",
    href: "/credo",
    description: "クレド11箇条のチェックと実践ログ",
  },
  {
    label: "設定",
    href: "/settings",
    description: "アカウントや通知の設定",
  },
];
