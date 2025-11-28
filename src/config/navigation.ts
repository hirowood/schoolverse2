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
    description: "AIコーチとの会話と学習プラン生成を行います",
  },
  {
    label: "ダッシュボード",
    href: "/dashboard",
    description: "今日のタスク・時間トラッカー・体調をまとめて確認",
  },
  {
    label: "週次レポート",
    href: "/report",
    description: "AI分析とMarkdownエクスポートで支援者と共有",
  },
  {
    label: "ノート",
    href: "/notes",
    description: "思考の整理・絵や画像・OCRをキャンバスで記録",
  },
  {
    label: "学習プラン",
    href: "/plan",
    description: "階層タスクと時間追跡で予定を可視化",
  },
  {
    label: "クレド",
    href: "/credo",
    description: "11箇条の実践記録と体調サマリー",
  },
  {
    label: "設定",
    href: "/settings",
    description: "プロフィール、週間目標、コーチ設定を調整",
  },
];
