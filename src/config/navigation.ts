export type NavItem = {
  label: string;
  href: string;
  description?: string;
  icon?: string;
};

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    label: "🤖 AIコーチ",
    href: "/coach",
    description: "AIに相談しながら今日の流れや学習プランを整える",
  },
  {
    label: "📊 ダッシュボード",
    href: "/dashboard",
    description: "学習時間・タスク・体調を一画面で把握する",
  },
  {
    label: "📈 週次レポート",
    href: "/report",
    description: "1週間の活動と体調をAIがまとめるレポート",
  },
  {
    label: "🗒️ ノート",
    href: "/notes",
    description: "テンプレートに沿って週次振り返りを記録",
  },
  {
    label: "📝 学習プラン",
    href: "/plan",
    description: "タスクを管理しつつ階層・時間を追跡する",
  },
  {
    label: "💡 クレド",
    href: "/credo",
    description: "11箇条の実践と体調記録をつける",
  },
  {
    label: "⚙️ 設定",
    href: "/settings",
    description: "プロフィール・コーチトーン・ポモドーロ設定",
  },
];
