export type NavItem = {
  label: string;
  href: string;
  description?: string;
  icon?: string;
};

// 左ナビとモバイルボトムバーで共通利用するメニュー定義
export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    label: "AIコーチ",
    href: "/coach",
    description: "AIコーチとの対話で学習を進めましょう",
  },
  {
    label: "学習チャット",
    href: "/learning-chat",
    description: "科目ごとの質問や相談をチャットで",
  },
  {
    label: "ユーザーチャット",
    href: "/user-chat",
    description: "他のユーザーとのDM・グループチャット",
  },
  {
    label: "ダッシュボード",
    href: "/dashboard",
    description: "タスク・進捗・ベンチマークをまとめて確認",
  },
  {
    label: "カリキュラムマップ",
    href: "/curriculum-map",
    description: "資格・技術ライン・思考スキルを俯瞰するマップ",
  },
  {
    label: "サマリーレポート",
    href: "/report",
    description: "AIがまとめたMarkdownレポートを確認",
  },
  {
    label: "ノート",
    href: "/notes",
    description: "スケッチやOCR付きノートで学びを記録",
  },
  {
    label: "マインドマップ",
    href: "/mindmap",
    description: "アイデア整理に使えるマインドマッピング",
  },
  {
    label: "学習プラン",
    href: "/plan",
    description: "学習タスクと目標をまとめて管理",
  },
  {
    label: "クレド",
    href: "/credo",
    description: "11の原則とサマリー",
  },
  {
    label: "設定",
    href: "/settings",
    description: "プロフィール・目標・コーチ設定",
  },
];
