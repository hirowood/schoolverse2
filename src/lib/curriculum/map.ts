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
        description: "PART→CHAPTER→ミニ課題でアウトプットするハンズオン形式。初心者が『入力→小さな出力』を繰り返し、最終的にオリジナルアプリまで進む流れ。",
        children: [
          {
            id: "react-part1",
            name: "PART 1 Reactの基本を学ぶ（Week1）",
            children: [
              { id: "react-1-1", name: "1-1 Reactはどんなもの？（45〜60分）", description: "Reactの役割と特徴を理解する。従来のWebサイトとSPAの違いをノートに描き、1〜3行で自分の言葉にする。" },
              { id: "react-1-2", name: "1-2 Reactで何ができる？（30〜45分）", description: "Reactが使われていそうなサービスを3〜5個挙げ、フォーム＋一覧UIの例を観察。作ってみたいアプリのアイデアをメモする。" },
              { id: "react-1-3", name: "1-3 Reactを学ぶメリット（30〜45分）", description: "就職・ポートフォリオ・自作ツールなど目的を言語化し、VueではなくReactを選ぶ理由を自分視点でまとめる。" },
              { id: "react-1-4", name: "1-4 開発環境を構築する（Node / VSCode / Vite）（60〜90分）", description: "Node/VSCをセットアップし、ViteでReactプロジェクトを作成してdevサーバを起動する。", sampleCode: "# プロジェクト作成
npm create vite@latest my-react-app -- --template react-ts
cd my-react-app
npm install
npm run dev" },
              { id: "react-1-5", name: "1-5 はじめてのReactアプリ『Hello React』（45〜60分）", description: "Vite初期コードを書き換え、Hello Reactと名前入りメッセージを表示。ホットリロードを体験する。", sampleCode: "// src/App.tsx
export default function App() {
  const name = 'Hiroki';
  return <h1>Hello, {name}!</h1>;
}" },
              { id: "react-2-1", name: "2-1 JSXの基本（60〜90分）", description: "1つのルート要素・className・{}でJSを書くルールを練習し、プロフィール画面を作成。" },
              { id: "react-2-2", name: "2-2 コンポーネントの基本（自己紹介カード）（90〜120分）", description: "functionコンポーネントを複数配置し再利用性を体感。『コンポーネントとは』を図解で整理。", sampleCode: "function ProfileCard({ name, bio }: { name: string; bio: string }) {
  return (
    <div className='card'>
      <h3>{name}</h3>
      <p>{bio}</p>
    </div>
  );
}" },
              { id: "react-2-3", name: "2-3 イベントの基本（60〜90分）", description: "onClickでメッセージを変えるボタンを実装し、ハンドラの書き方を練習。", sampleCode: "export default function Clicker() {
  const handleClick = () => alert('Clicked!');
  return <button onClick={handleClick}>押す</button>;
}" },
              { id: "react-3-1", name: "3-1 useStateと宣言的UI（90〜120分）", description: "カウンター(+1/-1)でstate更新と再描画の流れを理解。prev => 形式も確認。", sampleCode: "const [count, setCount] = useState(0);
return (
  <div>
    <p>{count}</p>
    <button onClick={() => setCount((p) => p + 1)}>+1</button>
  </div>
);" },
              { id: "react-3-2", name: "3-2 配列表示とmap（90〜120分）", description: "mapとkeyの意味を学び、文字列配列のリスト表示を実装。", sampleCode: "const friends = ['Aki', 'Mio', 'Ken'];
return <ul>{friends.map((n) => <li key={n}>{n}</li>)}</ul>;" },
              { id: "react-3-3", name: "3-3 条件分岐表示（60〜90分）", description: "&&と三項演算子で表示/非表示を切り替え、残タスク0なら祝福メッセージを出すUIを作る。" },
              { id: "react-mini-a", name: "ミニアプリA：カウンター＆いいねボタン（90〜120分）", description: "stateを2〜3種類持たせる小アプリ。READMEに学びを書き、スクショを残す。" }
            ]
          },
          {
            id: "react-part2",
            name: "PART 2 小さなWebアプリを作る（Week2〜3）",
            children: [
              { id: "react-4-1", name: "4-1 ToDo概要と画面設計（60〜90分）", description: "紙でレイアウトと機能を書き出し、コンポーネント分割案を決める。" },
              { id: "react-4-2", name: "4-2 タスク一覧表示（90〜120分）", description: "tasks配列をstateに持ち、mapでTaskItem表示。keyにidを使う。" },
              { id: "react-4-3", name: "4-3 タスク追加フォーム（90〜120分）", description: "onChangeで入力値を保持し、onSubmitで配列に追加する。" },
              { id: "react-4-4", name: "4-4 完了・削除機能（90〜120分）", description: "チェックでdone切替、削除で除外、完了タスクのスタイル変更。" },
              { id: "react-mini-b", name: "ミニアプリB：シンプルToDo完成（60〜90分）", description: "軽くリファクタしREADMEに使い方と学びを記載、スクショ保存。" },
              { id: "react-5-1", name: "5-1 気分ログ要件・設計（60〜90分）", description: "記録項目を決めてフォーム＋一覧のスケッチを描く。" },
              { id: "react-5-2", name: "5-2 複数フィールドのフォーム（90〜120分）", description: "気分スコアとコメントをstate管理し、簡単なバリデーションを入れる。" },
              { id: "react-5-3", name: "5-3 ログ一覧とフィルタ（90〜120分）", description: "カード表示・気分3以上フィルタ・日付ソートを実装。" },
              { id: "react-mini-c", name: "ミニアプリC：気分メモ完成（60〜90分）", description: "アプリ名を決め、READMEに目的と対象ユーザーを書く。自分で1件記録。" }
            ]
          },
          {
            id: "react-part3",
            name: "PART 3 状態を賢く扱う（Week3）",
            children: [
              { id: "react-6-1", name: "6-1 状態のリフトアップ（90〜120分）", description: "Accordionなどで開閉状態を親に集約し、『誰がどのデータの持ち主か』を整理する。" },
              { id: "react-6-2", name: "6-2 Contextでグローバルステート（90〜120分）", description: "createContext/useContextでテーマやユーザー名を配布し、propsバケツリレーとの違いを理解。" }
            ]
          },
          {
            id: "react-part4",
            name: "PART 4 オリジナルReactアプリに挑戦（Week4）",
            children: [
              { id: "react-7-1", name: "7-1 アイデア出し（45〜60分）", description: "困りごと10個を書き出し、Reactで作れそうな3つに絞る。" },
              { id: "react-7-2", name: "7-2 アイデアを決める（45〜60分）", description: "ターゲットと必須/あれば嬉しい機能に分解し、価値を3行で書く。" },
              { id: "react-7-3", name: "7-3 画面・コンポーネント設計（90〜120分）", description: "ワイヤーフレームとコンポーネントツリー、stateの持ち主を決める。" },
              { id: "react-8-1", name: "8-1 実装（4〜6時間）", description: "必須機能を完成させ、小さいコンポーネントに分割。余裕があれば＋α機能を追加。" },
              { id: "react-8-2", name: "8-2 エラー読解練習（90〜120分）", description: "典型エラーの原因と修正をメモし、スクショを残す。" },
              { id: "react-8-3", name: "8-3 アプリを説明する（60〜90分）", description: "README/スライドに目的・課題・構成をまとめ、3〜5分の説明シナリオを作る。" }
            ]
          },
          {
            id: "react-part5",
            name: "PART 5 Next.js & API連携（発展）",
            children: [
              { id: "react-9-1", name: "9-1 Next.jsとは（45〜60分）", description: "React単体との役割差とApp Routerの構造を理解し、1行で要約する。" },
              { id: "react-9-2", name: "9-2 Next.jsを動かす（60〜90分）", description: "create-next-appでプロジェクトを作り、Hello Next.jsを表示。" },
              { id: "react-10-1", name: "10-1 fetchでAPI呼び出し（90〜120分）", description: "公開APIをfetchし、useEffectで初回ロード＋ローディング/エラー表示を実装。" },
              { id: "react-10-2", name: "10-2 APIデータ一覧＋簡易ルーティング（90〜120分）", description: "一覧表示とIDリンクの詳細ページを作り、クライアントfetchとサーバー取得の違いを理解。" }
            ]
          }
        ]
      }
    ],nextjs: [
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




