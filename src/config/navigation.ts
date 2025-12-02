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
    description: "AIコーチとの対話で学習計画を進めましょう",
  },
  {
    label: "学習チャット",
    href: "/learning-chat",
    description: "専門モードで学習や進路の相談を整理",
  },
  {
    label: "ダッシュボード",
    href: "/dashboard",
    description: "タスク・時間トラッカー・休息状況をまとめて確認",
  },
  {
    label: "サマリーレポート",
    href: "/report",
    description: "AI要約のMarkdownレポートで振り返り",
  },
  {
    label: "ノート",
    href: "/notes",
    description: "スケッチやOCR付きノートで学びを記録",
  },
  {
    label: "マインドマップ",
    href: "/mindmap",
    description: "アイデアを広げて整理するラピッドマッピング",
  },
  {
    label: "学習プラン",
    href: "/plan",
    description: "学習タスクと優先順位を可視化",
  },
  {
    label: "クレド",
    href: "/credo",
    description: "11の行動原則とサマリー",
  },
  {
    label: "設定",
    href: "/settings",
    description: "プロフィール・目標・コーチ設定",
  },
];
