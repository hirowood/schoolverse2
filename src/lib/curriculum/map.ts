import { CurriculumMap } from "./types";

export const CURRICULUM_MAP: CurriculumMap = {
  coreCurriculum: [
    {
      id: "core",
      name: "カリキュラム階層",
      description: "Category → Subject → Unit → Lesson → Activity の5階層",
      children: [
        { id: "category", name: "Category" },
        { id: "subject", name: "Subject" },
        { id: "unit", name: "Unit" },
        { id: "lesson", name: "Lesson", description: "lecture / practice / quiz / project / discussion" },
        { id: "activity", name: "Activity" },
      ],
      meta: {
        curriculum: ["学年", "難易度", "期間", "タグ", "前提", "ステータス"],
        lesson: ["タイプ", "所要時間", "XP"],
        unit: ["学習目標", "解放条件", "ボーナスXP"],
      },
    },
  ],
  learningPaths: {
    types: ["AI生成", "テンプレ", "カスタム", "ハイブリッド"],
    nodeTypes: ["lesson", "milestone", "checkpoint", "break", "reward"],
  },
  contentLines: {
    certifications: [
      {
        id: "cert",
        name: "資格系",
        children: [
          { id: "itpassport", name: "ITパスポート", description: "ITリテラシーの入門資格" },
          { id: "fe", name: "基本情報", description: "アルゴリズムや開発技術の基礎" },
          { id: "ap", name: "応用情報", description: "設計・セキュリティ・マネジメントを学ぶ" },
          { id: "info1", name: "情報I", description: "高校「情報I」範囲" },
        ],
      },
    ],
    languages: [
      {
        id: "lang",
        name: "プログラミング言語",
        children: [
          { id: "ruby", name: "Ruby" },
          { id: "java", name: "Java" },
          { id: "js", name: "JavaScript" },
          { id: "ts", name: "TypeScript" },
          { id: "go", name: "Go" },
          { id: "python", name: "Python" },
          { id: "csharp", name: "C#" },
          { id: "cpp", name: "C++" },
        ],
      },
    ],
    webFrameworks: [
      {
        id: "web",
        name: "Web/フレームワーク",
        children: [
          { id: "rails", name: "Rails" },
          { id: "spring", name: "Spring Boot" },
          { id: "django", name: "Django/Flask" },
          { id: "express", name: "Express" },
          { id: "next_full", name: "Next.js Fullstack" },
        ],
      },
    ],
    react: [
      {
        id: "react",
        name: "Reactカリキュラム",
        children: [
          { id: "react-intro", name: "入門" },
          { id: "react-basic", name: "初級" },
          { id: "react-mid", name: "中級" },
          { id: "react-adv", name: "上級" },
          { id: "react-expert", name: "エキスパート" },
        ],
      },
    ],
    nextjs: [
      {
        id: "nextjs",
        name: "Next.jsカリキュラム",
        children: [
          { id: "next-intro", name: "入門" },
          { id: "next-mid", name: "中級" },
          { id: "next-adv", name: "上級" },
          { id: "next-practice", name: "実践" },
        ],
      },
    ],
    ai: [
      {
        id: "ai",
        name: "AI/ML/LLM",
        children: [
          { id: "ai-usage", name: "AI活用" },
          { id: "ml-basic", name: "ML基礎" },
          { id: "dl", name: "ディープラーニング" },
          { id: "mlops", name: "MLOps" },
          { id: "rag", name: "LLM/RAG/エージェント" },
        ],
      },
    ],
    officeDxAx: [
      {
        id: "office",
        name: "事務・DX/AX・業務効率",
        children: [
          { id: "excel", name: "Excel" },
          { id: "word", name: "Word" },
          { id: "spreadsheet", name: "Google Spreadsheet/Docs" },
          { id: "gas", name: "GAS/自動化" },
          { id: "dx", name: "DX" },
          { id: "ax", name: "AX" },
        ],
      },
    ],
    thinking: [
      {
        id: "thinking",
        name: "思考スキル",
        children: [
          { id: "research_literacy", name: "調べる力" },
          { id: "note_externalization", name: "メモ・外在化" },
          { id: "hypothesis_thinking", name: "仮説思考" },
          { id: "logical_thinking", name: "論理的思考" },
          { id: "lateral_thinking", name: "水平思考" },
          { id: "critical_thinking", name: "批判的思考" },
          { id: "no_answer_world", name: "答えのない問いへの対応" },
        ],
        meta: { tags: ["RESEARCH_KEYWORDING", "NOTE_5W2H", "HYPOTHESIS_TESTING", "LOGIC_MECE"] },
      },
    ],
    handsOn: [
      {
        id: "hands-on",
        name: "ハンズオン演習",
        description: "手を動かして学ぶステップバイステップ教材",
        children: [
          {
            id: "ho-react-todo",
            name: "React: Todoアプリ",
            description: "状態管理とフォーム、ローカルストレージ",
          },
          {
            id: "ho-next-api",
            name: "Next.js: API & DB連携",
            description: "App RouterでCRUD APIを実装し、PrismaでDB接続",
          },
          {
            id: "ho-auth-ui",
            name: "認証UIハンズオン",
            description: "サインイン/サインアップ/ガード付きページ",
          },
          {
            id: "ho-llm-rag",
            name: "LLM RAGミニ演習",
            description: "簡易RAG構成を試し、質問応答のパイプラインを体験",
          },
          {
            id: "ho-office-automation",
            name: "事務自動化: GASで勤怠集計",
            description: "スプレッドシートから集計し、Slackへ通知",
          },
        ],
      },
    ],
    roleLines: [
      {
        id: "fe-line",
        title: "フロントエンドライン",
        summary: "UI/UX を実装できるようになる",
        units: [
          { id: "fe-1", title: "HTML/CSS基礎" },
          { id: "fe-2", title: "JavaScript基礎" },
          { id: "fe-3", title: "React基礎" },
          { id: "fe-4", title: "状態管理・API連携" },
          { id: "fe-5", title: "UI/UX・a11y" },
          { id: "fe-6", title: "テスト・パフォーマンス" },
        ],
        missions: ["学習ダッシュボード実装", "学習ロググラフ表示"],
      },
      {
        id: "be-line",
        title: "バックエンドライン",
        summary: "API とデータを設計・実装する",
        units: [
          { id: "be-1", title: "HTTP/REST基礎" },
          { id: "be-2", title: "フレームワーク入門" },
          { id: "be-3", title: "DB設計・SQL" },
          { id: "be-4", title: "認証・認可" },
          { id: "be-5", title: "エラー/ログ設計" },
          { id: "be-6", title: "レイヤード設計" },
        ],
        missions: ["学習ログAPI設計", "ミッションCRUD実装"],
      },
      {
        id: "infra-line",
        title: "インフラ/クラウドライン",
        summary: "安全に運用し続けるための基礎",
        units: [
          { id: "inf-1", title: "サーバ/OS/プロセス" },
          { id: "inf-2", title: "ネットワーク基礎" },
          { id: "inf-3", title: "クラウド概念" },
          { id: "inf-4", title: "デプロイ実践" },
          { id: "inf-5", title: "監視・ログ" },
          { id: "inf-6", title: "セキュリティ基礎" },
        ],
        missions: ["テスト環境を立ち上げる", "障害時の切り分けワーク"],
      },
      {
        id: "office-line",
        title: "事務×ITライン",
        summary: "Office・自動化で業務効率を上げる",
        units: [
          { id: "of-1", title: "Excel/関数" },
          { id: "of-2", title: "VBA基礎" },
          { id: "of-3", title: "GAS/クラウドツール" },
          { id: "of-4", title: "業務プロセス改善" },
        ],
        missions: ["勤怠集計を自動化", "問い合わせFAQを作成"],
      },
    ],
  },
  careers: {
    engineer: [
      {
        id: "fe",
        name: "フロントエンドエンジニア",
        what: "画面・UI/UX を実装する",
        linkedCurriculumIds: ["react", "nextjs", "fe-line"],
        sampleMissions: ["ダッシュボードUI実装"],
      },
      {
        id: "be",
        name: "バックエンドエンジニア",
        what: "API/ロジック/DB を設計・実装",
        linkedCurriculumIds: ["web", "be-line"],
        sampleMissions: ["学習ログAPI"],
      },
      {
        id: "fs",
        name: "フルスタックエンジニア",
        what: "フロント＋バックエンド＋簡単なインフラ",
        linkedCurriculumIds: ["web", "react", "nextjs", "fe-line", "be-line"],
      },
      {
        id: "infra",
        name: "インフラ/クラウドエンジニア",
        what: "サーバ・ネットワーク・クラウド運用",
        linkedCurriculumIds: ["infra-line", "web"],
      },
      {
        id: "qa",
        name: "QA/テストエンジニア",
        what: "テスト計画と自動化の設計",
        linkedCurriculumIds: ["fe-line", "be-line"],
      },
      {
        id: "data-eng",
        name: "データエンジニア",
        what: "データパイプラインをつくる",
        linkedCurriculumIds: ["ai", "web"],
      },
      {
        id: "ml",
        name: "ML/AIエンジニア",
        what: "ML/LLM を組み込んだアプリをつくる",
        linkedCurriculumIds: ["ai", "web", "react"],
      },
    ],
    office: [
      {
        id: "office-it",
        name: "事務×IT",
        what: "データ入力・資料作成・SaaS活用",
        linkedCurriculumIds: ["office", "cert", "office-line"],
        sampleMissions: ["勤怠・売上のレポート作成"],
      },
      {
        id: "sys-assist",
        name: "情報システム部アシスタント",
        what: "社内ヘルプデスク・アカウント管理",
        linkedCurriculumIds: ["office", "infra-line"],
        sampleMissions: ["FAQ・マニュアル整備"],
      },
    ],
    axDxData: [
      {
        id: "dx",
        name: "DX推進",
        what: "業務ヒアリング→課題整理→ツール導入",
        linkedCurriculumIds: ["office", "ai"],
      },
      {
        id: "ax",
        name: "AX（自動化/AI活用）",
        what: "RPA・ノーコード・AIチャット導入",
        linkedCurriculumIds: ["office", "ai"],
      },
      {
        id: "data-analyst",
        name: "データアナリスト/BI",
        what: "SQL・スプレッドシートで可視化",
        linkedCurriculumIds: ["ai", "office"],
      },
    ],
  },
  hypotheses: [
    "ハンズオンを早期に体験すると継続率が上がる",
    "思考スキルと技術スキルの両輪で学ぶと定着が良い",
  ],
  pitfalls: ["機能とコンテンツの混在に注意", "時間制約を無視した過密プランを避ける"],
};
