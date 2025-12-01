export type NavItem = {
  label: string;
  href: string;
  description?: string;
  icon?: string;
};

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    label: "AIコーチ",
    href: "/coach",
    description: "AIコーチとの会話で学習プランを相談しましょう",
  },
  {
    label: "ダッシュボード",
    href: "/dashboard",
    description: "タスク・時間トラッカー・進捗をまとめて確認",
  },
  {
    label: "週次レポート",
    href: "/report",
    description: "AI分析とMarkdownエクスポートで保護者と共有",
  },
  {
    label: "ノート",
    href: "/notes",
    description: "思考の整理・描画・OCRでキャプチャして記録",
  },
  {
    label: "マインドマップ",
    href: "/mindmap",
    description: "ノートを視覚的にまとめてアイデアを整理",
  },
  {
    label: "学習プラン",
    href: "/plan",
    description: "学習タスクと時間追跡で予定を立てる",
  },
  {
    label: "クレド",
    href: "/credo",
    description: "11個の信条の実践記録とサマリー",
  },
  {
    label: "設定",
    href: "/settings",
    description: "プロフィール、サブ目標、コーチ設定を調整",
  },
];