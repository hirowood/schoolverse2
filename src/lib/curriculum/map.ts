import { CurriculumMap } from "./types";

export const CURRICULUM_MAP: CurriculumMap = {
  coreCurriculum: [
    {
      id: "core",
      name: "カリキュラム階層",
      children: [
        { id: "category", name: "Category" },
        { id: "subject", name: "Subject" },
        { id: "unit", name: "Unit" },
        { id: "lesson", name: "Lesson", description: "lecture/practice/quiz/project/discussion" },
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
          { id: "itpassport", name: "ITパスポート" },
          { id: "fe", name: "基本情報" },
          { id: "ap", name: "応用情報" },
          { id: "info1", name: "情報I" },
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
        meta: {
          levels: ["入門", "初級", "中級", "上級", "エキスパート"],
          sharedUnits: ["環境構築", "基本構文", "関数", "データ構造", "OOP", "例外", "非同期", "テスト", "パターン"],
        },
      },
    ],
    webFrameworks: [
      {
        id: "web",
        name: "Webアプリ開発",
        children: [
          { id: "rails", name: "Rails" },
          { id: "spring", name: "Spring Boot" },
          { id: "django", name: "Django/Flask" },
          { id: "express", name: "Express" },
          { id: "next_full", name: "Next.js Fullstack" },
        ],
        meta: { process: ["PLAN", "REQ", "DESIGN", "IMPLEMENT", "TEST", "DEPLOY"] },
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
        name: "AI・機械学習",
        children: [
          { id: "ai-usage", name: "AI活用" },
          { id: "ml-basic", name: "機械学習基礎" },
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
          { id: "note_externalization", name: "メモ書き・外在化" },
          { id: "hypothesis_thinking", name: "仮説思考" },
          { id: "logical_thinking", name: "論理的思考" },
          { id: "lateral_thinking", name: "水平思考" },
          { id: "critical_thinking", name: "批判的思考" },
          { id: "no_answer_world", name: "答えのない問いへの対応" },
        ],
        meta: { tags: ["RESEARCH_KEYWORDING", "NOTE_5W2H", "HYPOTHESIS_TESTING", "LOGIC_MECE"] },
      },
    ],
    roleLines: [
      {
        id: "fe-line",
        title: "フロントエンドライン",
        summary: "UI/UXを実装できるようになる",
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
        summary: "APIとデータを設計・提供する",
        units: [
          { id: "be-1", title: "HTTP/REST概念" },
          { id: "be-2", title: "フレームワーク入門" },
          { id: "be-3", title: "DB設計・SQL" },
          { id: "be-4", title: "認証・認可" },
          { id: "be-5", title: "エラー/ログ設計" },
          { id: "be-6", title: "レイヤード設計" },
        ],
        missions: ["学習ログAPI実装", "ミッションCRUD実装"],
      },
      {
        id: "infra-line",
        title: "インフラ/クラウドライン",
        summary: "安全に届け続ける基礎を学ぶ",
        units: [
          { id: "inf-1", title: "サーバ/OS/プロセス" },
          { id: "inf-2", title: "ネットワーク基礎" },
          { id: "inf-3", title: "クラウド入門" },
          { id: "inf-4", title: "デプロイ実践" },
          { id: "inf-5", title: "監視・ログ" },
          { id: "inf-6", title: "セキュリティ超入門" },
        ],
        missions: ["テスト環境立ち上げ", "障害原因の整理ワーク"],
      },
      {
        id: "fullstack-line",
        title: "フルスタック・連携",
        summary: "小さなプロダクトを一気通貫でつくる",
        units: [{ id: "fs-1", title: "設計〜実装〜デプロイ一気通貫" }],
        missions: ["学習ログアプリを設計・実装・デプロイ"],
      },
    ],
  },
  careers: {
    engineer: [
      {
        id: "fe",
        name: "フロントエンドエンジニア",
        what: "画面・UI/UXを実装する",
        linkedCurriculumIds: ["react", "nextjs", "fe-line"],
        sampleMissions: ["ダッシュボードUI実装"],
      },
      {
        id: "be",
        name: "バックエンドエンジニア",
        what: "API・ビジネスロジック・DBを設計実装",
        linkedCurriculumIds: ["web", "be-line"],
        sampleMissions: ["学習ログAPI"],
      },
      {
        id: "fs",
        name: "フルスタックエンジニア",
        what: "フロント+バックエンド+簡易インフラを扱う",
        linkedCurriculumIds: ["web", "react", "nextjs", "fullstack-line"],
      },
      {
        id: "infra",
        name: "インフラ/クラウドエンジニア",
        what: "サーバ・ネットワーク・クラウド環境の設計運用",
        linkedCurriculumIds: ["infra-line", "web"],
      },
      {
        id: "sre",
        name: "SRE/DevOps",
        what: "壊れにくく直しやすいサービス運用",
        linkedCurriculumIds: ["infra-line", "be-line"],
      },
      {
        id: "qa",
        name: "QA/テストエンジニア",
        what: "テスト計画と自動化を設計",
        linkedCurriculumIds: ["fe-line", "be-line"],
      },
      {
        id: "data-eng",
        name: "データエンジニア",
        what: "データパイプラインを構築",
        linkedCurriculumIds: ["ai", "web"],
      },
      {
        id: "ml",
        name: "ML/AIエンジニア",
        what: "機械学習・LLMを組み込んだ開発",
        linkedCurriculumIds: ["ai", "web"],
      },
    ],
    office: [
      {
        id: "office-general",
        name: "一般/営業/経理/人事事務",
        what: "データ入力・書類・メール・調整をこなす",
        linkedCurriculumIds: ["office", "cert"],
        sampleMissions: ["Excel業務改善ミッション"],
      },
      {
        id: "internal-it",
        name: "情シスアシスタント",
        what: "アカウント管理・ヘルプデスク補佐",
        linkedCurriculumIds: ["office", "infra-line"],
        sampleMissions: ["FAQ整備", "アカウント発行手順書"],
      },
    ],
    axDxData: [
      {
        id: "dx",
        name: "DX推進",
        what: "業務ヒアリング・課題整理・導入支援",
        linkedCurriculumIds: ["dx", "web"],
      },
      {
        id: "ax",
        name: "AX（自動化/AI活用）",
        what: "RPA/ノーコード/AIチャットボット導入",
        linkedCurriculumIds: ["ax", "ai"],
      },
      {
        id: "data-analyst",
        name: "データアナリスト/BI",
        what: "集計・可視化で現状を説明",
        linkedCurriculumIds: ["office", "ai"],
      },
    ],
  },
  hypotheses: [
    "ミッション型は継続しやすい",
    "質問力・時間管理の可視化が就労に直結",
    "資格と実務シミュレーションを同じ基盤で扱うとギャップが減る",
    "モダン技術を早めに触るとモチベが上がる",
    "レーダーチャート+AIコメントで伸びしろが直感的に分かる",
  ],
  pitfalls: [
    "機能とコンテンツを混ぜる",
    "学習パスとカリキュラムの混同",
    "評価指標が点数だけになる",
    "不登校文脈を忘れる",
    "拡張性を軽視してハードコード",
    "職業紹介がただの一覧になる",
  ],
};
