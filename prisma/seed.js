/* eslint-disable @typescript-eslint/no-require-imports */
// prisma/seed.js
// Supabase / Postgres にシードデータを投入するスクリプト

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ============================================
// 既存データ: デモユーザー
// ============================================
const DEMO_USER = {
  id: "demo-user",
  email: "demo@example.com",
  passwordHash: "$2b$10$yR9FptqIldmcxd9YVvN6e.j4nHb3hlxEZ5i8oqLcLh3yM.EuX1X1.",
  name: "Demo User",
};

// ============================================
// 既存データ: Credo アイテム
// ============================================
const CREDO_ITEMS = [
  {
    id: "credo-1",
    order: 1,
    category: "情報の受け取り方",
    title: "頭で覚えず、必ず見える化する",
    description:
      "指示・予定は不変の紙やメモに1行情報で書き出し、口頭指示は自分の言葉でメモする。",
  },
  {
    id: "credo-2",
    order: 2,
    category: "思考・整理のしかた",
    title: "まず全部出し、ピラミッド型で整理する",
    description:
      "予定のタスク・感情を強ぜて書き出し、学校/生活/趣味などに分けてMECEを意識して整理する。",
  },
  {
    id: "credo-3",
    order: 3,
    category: "タスク管理・行動のしかた",
    title: "今日やる3つと、〜15分タスクで進める",
    description:
      "シングルタスクで小さな成功を積み、終わったらチェック。終わらなければ細かく分解して翌日に回す。",
  },
  {
    id: "credo-4",
    order: 4,
    category: "身体の感情・疲労の扱い方",
    title: "状態を記録し、呼吸と瞑想で整える",
    description:
      "睡眠/体調/感情を記録し、思考が詰まったら4-4-6呼吸と短い瞑想でリセットする。",
  },
  {
    id: "credo-5",
    order: 5,
    category: "ジムでの運動",
    title: "前日に時間とメニュー3つを決めて臨む、とやる",
    description:
      "行く時間とウォーターマシン・ストレッチを決め、当日は迷わず実行。行けない日はストレッチや散歩で代替。",
  },
  {
    id: "credo-6",
    order: 6,
    category: "食事（味と体の燃料）",
    title: "プロテイン・魚の頻度を意識してとる",
    description:
      "完璧を追わず、取れた要素に注目して自己調整する。朝やおやつ後にプロテイン、魚と野菜を生活に組み込む。",
  },
  {
    id: "credo-7",
    order: 7,
    category: "部屋の生活環境の整理",
    title: "最初の朝・最後の週1の30分リセットで整える",
    description:
      "短いリセットをルーティン化し、週1回は徹底分解。不用品は処分と紙の仕分けもこの時間に完了。",
  },
  {
    id: "credo-8",
    order: 8,
    category: "日々の改善・学習の継続",
    title: "毎日「小さな改善と不足」を1つ拾う",
    description:
      "読書や実務体験などから1つ学びをメモし、呼吸/運動/食事/整理など続いた習慣にチェックを入れる。",
  },
  {
    id: "credo-9",
    order: 9,
    category: "自己容認・自己肯定の考え方",
    title: "できなかった日も「今日のデータ」として受け取る",
    description:
      "過去ではなく今日の事実で調整し、終れるサイズの成功を習慣化。できたら必ず記録して自信に変える。",
  },
  {
    id: "credo-10",
    order: 10,
    category: "対人・コミュニケーション・人生の姿勢",
    title: "事実と感情を分け、目的と言葉選びを大事にする",
    description:
      "「事実→自分の感情」してほしいこと、で考え、相手立場を意識してからメッセージを送る。",
  },
  {
    id: "credo-11",
    order: 11,
    category: "1日の終わらせ方（ナイトルール）",
    title: "今日の不足・学び・改善を書いて「ここで終わり」と決める",
    description:
      "完了タスクと学びや1つ記録し、4-4-6呼吸と短い瞑想で区切る。続いた習慣にチェックを入れる。",
  },
];

// ============================================
// 新規データ: アバターテンプレート
// ============================================
const AVATAR_TEMPLATES = [
  {
    id: "avatar_student_1",
    name: "生徒A",
    category: "human",
    modelUrl: "/models/avatars/avatar_student_1.glb",
    thumbnailUrl: "/images/avatars/avatar_student_1.png",
    customizable: { color: true, accessories: true },
    defaultColor: "#4F46E5",
    isPremium: false,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "avatar_student_2",
    name: "生徒B",
    category: "human",
    modelUrl: "/models/avatars/avatar_student_2.glb",
    thumbnailUrl: "/images/avatars/avatar_student_2.png",
    customizable: { color: true, accessories: true },
    defaultColor: "#10B981",
    isPremium: false,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "avatar_student_3",
    name: "生徒C",
    category: "human",
    modelUrl: "/models/avatars/avatar_student_3.glb",
    thumbnailUrl: "/images/avatars/avatar_student_3.png",
    customizable: { color: true, accessories: true },
    defaultColor: "#F59E0B",
    isPremium: false,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "avatar_teacher_1",
    name: "先生",
    category: "human",
    modelUrl: "/models/avatars/avatar_teacher_1.glb",
    thumbnailUrl: "/images/avatars/avatar_teacher_1.png",
    customizable: { color: true, accessories: true },
    defaultColor: "#EF4444",
    isPremium: false,
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "avatar_cat",
    name: "ねこ",
    category: "animal",
    modelUrl: "/models/avatars/avatar_cat.glb",
    thumbnailUrl: "/images/avatars/avatar_cat.png",
    customizable: { color: true, accessories: false },
    defaultColor: "#8B5CF6",
    isPremium: false,
    isActive: true,
    sortOrder: 5,
  },
  {
    id: "avatar_dog",
    name: "いぬ",
    category: "animal",
    modelUrl: "/models/avatars/avatar_dog.glb",
    thumbnailUrl: "/images/avatars/avatar_dog.png",
    customizable: { color: true, accessories: false },
    defaultColor: "#EC4899",
    isPremium: false,
    isActive: true,
    sortOrder: 6,
  },
  {
    id: "avatar_robot_1",
    name: "ロボット",
    category: "robot",
    modelUrl: "/models/avatars/avatar_robot_1.glb",
    thumbnailUrl: "/images/avatars/avatar_robot_1.png",
    customizable: { color: true, accessories: true },
    defaultColor: "#6366F1",
    isPremium: false,
    isActive: true,
    sortOrder: 7,
  },
];

// ============================================
// 新規データ: テスト用ルーム
// ============================================
const TEST_ROOMS = [
  {
    id: "test-classroom-1",
    name: "テスト教室",
    description: "開発テスト用の教室です。自由に入退室できます。",
    type: "CLASSROOM",
    maxParticipants: 20,
    isPublic: true,
    password: null,
    environmentId: "default_classroom",
    spawnPosition: { x: 0, y: 0, z: 5 },
    allowVideo: true,
    allowAudio: true,
    allowScreenShare: true,
    allowChat: true,
    status: "WAITING",
  },
  {
    id: "test-study-group-1",
    name: "テスト自習室",
    description: "自由に使える自習スペースです。静かに勉強しましょう。",
    type: "STUDY_GROUP",
    maxParticipants: 10,
    isPublic: true,
    password: null,
    environmentId: "default_classroom",
    spawnPosition: { x: 0, y: 0, z: 5 },
    allowVideo: true,
    allowAudio: true,
    allowScreenShare: true,
    allowChat: true,
    status: "WAITING",
  },
];

// ============================================
// 新規データ: モンスター定義・質問
// ============================================
const MONSTER_DEFINITIONS = [
  // フロントエンドライン（6）
  { slug: "css_slime", name: "CSSスライム", category: "frontend", subcategory: "html-css", difficulty: 1, rarity: "common", baseXp: 10, baseCoin: 5, color: "#22c55e", spawnWeight: 120, spawnZones: ["classroom_front"] },
  { slug: "html_goblin", name: "HTMLゴブリン", category: "frontend", subcategory: "html-css", difficulty: 1, rarity: "common", baseXp: 10, baseCoin: 5, color: "#16a34a", spawnWeight: 110, spawnZones: ["classroom_front"] },
  { slug: "layout_sprite", name: "レイアウトスプライト", category: "frontend", subcategory: "layout", difficulty: 2, rarity: "uncommon", baseXp: 16, baseCoin: 8, color: "#0ea5e9", spawnWeight: 90, spawnZones: ["classroom_mid"] },
  { slug: "flex_ogre", name: "Flexオーガ", category: "frontend", subcategory: "layout", difficulty: 2, rarity: "uncommon", baseXp: 18, baseCoin: 9, color: "#2563eb", spawnWeight: 80, spawnZones: ["classroom_mid"] },
  { slug: "animation_fairy", name: "アニメーションフェアリー", category: "frontend", subcategory: "animation", difficulty: 3, rarity: "rare", baseXp: 28, baseCoin: 14, color: "#a855f7", spawnWeight: 50, spawnZones: ["classroom_back"] },
  { slug: "accessibility_spirit", name: "アクセシビリティスピリット", category: "frontend", subcategory: "accessibility", difficulty: 3, rarity: "rare", baseXp: 28, baseCoin: 14, color: "#14b8a6", spawnWeight: 40, spawnZones: ["classroom_back"] },

  // Reactライン（6）
  { slug: "component_slime", name: "コンポーネントスライム", category: "react", subcategory: "basics", difficulty: 2, rarity: "common", baseXp: 16, baseCoin: 8, color: "#22d3ee", spawnWeight: 110, spawnZones: ["classroom_front"] },
  { slug: "state_gremlin", name: "ステートグレムリン", category: "react", subcategory: "state", difficulty: 2, rarity: "common", baseXp: 18, baseCoin: 9, color: "#0ea5e9", spawnWeight: 90, spawnZones: ["classroom_mid"] },
  { slug: "hook_sprite", name: "フックスプライト", category: "react", subcategory: "hooks", difficulty: 3, rarity: "uncommon", baseXp: 24, baseCoin: 12, color: "#8b5cf6", spawnWeight: 70, spawnZones: ["classroom_mid"] },
  { slug: "context_golem", name: "コンテキストゴーレム", category: "react", subcategory: "context", difficulty: 3, rarity: "rare", baseXp: 28, baseCoin: 14, color: "#6366f1", spawnWeight: 50, spawnZones: ["classroom_back"] },
  { slug: "router_ghost", name: "ルーターゴースト", category: "react", subcategory: "routing", difficulty: 3, rarity: "rare", baseXp: 28, baseCoin: 14, color: "#1e3a8a", spawnWeight: 45, spawnZones: ["classroom_back"] },
  { slug: "nextjs_drake", name: "Next.js ドレイク", category: "react", subcategory: "nextjs", difficulty: 4, rarity: "epic", baseXp: 40, baseCoin: 20, color: "#0f172a", spawnWeight: 30, spawnZones: ["classroom_back"] },

  // バックエンドライン（6）
  { slug: "http_slime", name: "HTTPスライム", category: "backend", subcategory: "http", difficulty: 2, rarity: "common", baseXp: 16, baseCoin: 8, color: "#f97316", spawnWeight: 110, spawnZones: ["classroom_front"] },
  { slug: "rest_goblin", name: "RESTゴブリン", category: "backend", subcategory: "rest", difficulty: 2, rarity: "common", baseXp: 18, baseCoin: 9, color: "#fb923c", spawnWeight: 90, spawnZones: ["classroom_mid"] },
  { slug: "db_ogre", name: "DBオーガ", category: "backend", subcategory: "database", difficulty: 3, rarity: "uncommon", baseXp: 24, baseCoin: 12, color: "#10b981", spawnWeight: 70, spawnZones: ["classroom_mid"] },
  { slug: "auth_spirit", name: "認証スピリット", category: "backend", subcategory: "auth", difficulty: 3, rarity: "rare", baseXp: 28, baseCoin: 14, color: "#0ea5e9", spawnWeight: 50, spawnZones: ["classroom_back"] },
  { slug: "cache_sprite", name: "キャッシュスプライト", category: "backend", subcategory: "cache", difficulty: 3, rarity: "rare", baseXp: 28, baseCoin: 14, color: "#22c55e", spawnWeight: 45, spawnZones: ["classroom_back"] },
  { slug: "queue_golem", name: "キューゴーレム", category: "backend", subcategory: "queue", difficulty: 4, rarity: "epic", baseXp: 36, baseCoin: 18, color: "#ef4444", spawnWeight: 25, spawnZones: ["classroom_back"] },

  // インフラライン（6）
  { slug: "terminal_slime", name: "ターミナルスライム", category: "infra", subcategory: "cli", difficulty: 2, rarity: "common", baseXp: 16, baseCoin: 8, color: "#14b8a6", spawnWeight: 120, spawnZones: ["classroom_front"] },
  { slug: "network_ghost", name: "ネットワークゴースト", category: "infra", subcategory: "network", difficulty: 3, rarity: "common", baseXp: 20, baseCoin: 10, color: "#0ea5e9", spawnWeight: 90, spawnZones: ["classroom_mid"] },
  { slug: "docker_goblin", name: "Dockerゴブリン", category: "infra", subcategory: "docker", difficulty: 3, rarity: "uncommon", baseXp: 24, baseCoin: 12, color: "#2563eb", spawnWeight: 70, spawnZones: ["classroom_mid"] },
  { slug: "k8s_elemental", name: "K8sエレメンタル", category: "infra", subcategory: "kubernetes", difficulty: 4, rarity: "rare", baseXp: 34, baseCoin: 17, color: "#1d4ed8", spawnWeight: 40, spawnZones: ["classroom_back"] },
  { slug: "cloud_spirit", name: "クラウドスピリット", category: "infra", subcategory: "cloud", difficulty: 3, rarity: "rare", baseXp: 28, baseCoin: 14, color: "#0ea5e9", spawnWeight: 50, spawnZones: ["classroom_back"] },
  { slug: "ci_robot", name: "CIロボット", category: "infra", subcategory: "ci-cd", difficulty: 3, rarity: "rare", baseXp: 30, baseCoin: 15, color: "#f59e0b", spawnWeight: 45, spawnZones: ["classroom_back"] },

  // フルスタックライン（4: 基本情報含む）
  { slug: "mvc_slime", name: "MVCスライム", category: "fullstack", subcategory: "architecture", difficulty: 3, rarity: "uncommon", baseXp: 24, baseCoin: 12, color: "#0f172a", spawnWeight: 60, spawnZones: ["classroom_mid"] },
  { slug: "api_gateway_guardian", name: "APIゲートウェイガーディアン", category: "fullstack", subcategory: "api-design", difficulty: 4, rarity: "rare", baseXp: 36, baseCoin: 18, color: "#1e40af", spawnWeight: 35, spawnZones: ["classroom_back"] },
  { slug: "security_sphinx", name: "セキュリティスフィンクス", category: "fullstack", subcategory: "security", difficulty: 4, rarity: "epic", baseXp: 42, baseCoin: 20, color: "#ef4444", spawnWeight: 25, spawnZones: ["classroom_back"] },
  { slug: "basic_info_sentinel", name: "基本情報センチネル", category: "fullstack", subcategory: "basic-info", difficulty: 2, rarity: "common", baseXp: 18, baseCoin: 9, color: "#64748b", spawnWeight: 80, spawnZones: ["classroom_front"] },

  // 思考スキルライン（3）
  { slug: "research_slime", name: "リサーチスライム", category: "thinking", subcategory: "research", difficulty: 1, rarity: "common", baseXp: 10, baseCoin: 5, color: "#22c55e", spawnWeight: 120, spawnZones: ["classroom_front"] },
  { slug: "hypothesis_fairy", name: "仮説フェアリー", category: "thinking", subcategory: "hypothesis", difficulty: 2, rarity: "uncommon", baseXp: 18, baseCoin: 9, color: "#a855f7", spawnWeight: 80, spawnZones: ["classroom_mid"] },
  { slug: "logic_golem", name: "ロジックゴーレム", category: "thinking", subcategory: "logic", difficulty: 3, rarity: "rare", baseXp: 28, baseCoin: 14, color: "#0ea5e9", spawnWeight: 50, spawnZones: ["classroom_back"] },
];

const MONSTER_QUESTIONS = [
  {
    slug: "css_slime",
    questions: [
      {
        id: "css_slime-q1",
        questionText: "要素を親の中央に水平・垂直配置するCSSプロパティの組み合わせは？",
        questionType: "multiple_choice",
        options: [
          { label: "A", value: "display: grid; place-items: center;", isCorrect: true },
          { label: "B", value: "float: center;" },
          { label: "C", value: "position: absolute; top:0;" },
          { label: "D", value: "text-align: middle;" },
        ],
        correctAnswer: "display: grid; place-items: center;",
        explanation: "もっともシンプルに中央配置できるのはCSS Gridでplace-items: center;を使う方法。",
        hints: ["flexかgridを思い出そう"],
        difficulty: 1,
        timeLimit: 45,
        bonusXp: 0,
        isAiGenerated: false,
      },
    ],
  },
  {
    slug: "component_slime",
    questions: [
      {
        id: "component_slime-q1",
        questionText: "Reactの関数コンポーネントの最小構文は？",
        questionType: "multiple_choice",
        options: [
          { label: "A", value: "function Button(){ return <button />; }", isCorrect: true },
          { label: "B", value: "component Button => <button />" },
          { label: "C", value: "new Component('Button')" },
          { label: "D", value: "render(Button)" },
        ],
        correctAnswer: "function Button(){ return <button />; }",
        explanation: "JSXを返す関数を定義し、コンポーネント名をパスカルケースにする。",
        hints: ["関数でJSXを返すだけ"],
        difficulty: 2,
        timeLimit: 45,
        bonusXp: 5,
        isAiGenerated: false,
      },
    ],
  },
  {
    slug: "hook_sprite",
    questions: [
      {
        id: "hook_sprite-q1",
        questionText: "次のコードでカウンターを増やす正しい書き方は？",
        questionType: "code",
        codeSnippet: "const [count, setCount] = useState(0);\n// TODO: ボタン押下で +1\n",
        options: [
          { label: "A", value: "setCount(count + 1);", isCorrect: true },
          { label: "B", value: "count = count + 1;" },
          { label: "C", value: "useState(count + 1);" },
          { label: "D", value: "setState({ count: count + 1 });" },
        ],
        correctAnswer: "setCount(count + 1);",
        explanation: "Reactのステート更新はセット関数を使う。プリミティブの再代入では再描画されない。",
        hints: ["useStateの返り値を使う"],
        difficulty: 2,
        timeLimit: 60,
        bonusXp: 5,
        isAiGenerated: false,
      },
    ],
  },
  {
    slug: "http_slime",
    questions: [
      {
        id: "http_slime-q1",
        questionText: "HTTPで安全なリソース取得に使うメソッドはどれ？",
        questionType: "multiple_choice",
        options: [
          { label: "A", value: "GET", isCorrect: true },
          { label: "B", value: "POST" },
          { label: "C", value: "PUT" },
          { label: "D", value: "PATCH" },
        ],
        correctAnswer: "GET",
        explanation: "GETはリソース取得のための安全で副作用がないメソッド。",
        hints: ["安全性と冪等性を思い出す"],
        difficulty: 1,
        timeLimit: 40,
        bonusXp: 0,
        isAiGenerated: false,
      },
    ],
  },
  {
    slug: "docker_goblin",
    questions: [
      {
        id: "docker_goblin-q1",
        questionText: "Dockerfileからイメージをビルドするコマンドは？",
        questionType: "multiple_choice",
        options: [
          { label: "A", value: "docker build -t myapp .", isCorrect: true },
          { label: "B", value: "docker run myapp" },
          { label: "C", value: "docker compose up" },
          { label: "D", value: "docker image start" },
        ],
        correctAnswer: "docker build -t myapp .",
        explanation: "buildコマンドでタグを付けてビルドする。",
        hints: ["build -t <name> <path>"],
        difficulty: 2,
        timeLimit: 45,
        bonusXp: 5,
        isAiGenerated: false,
      },
    ],
  },
  {
    slug: "k8s_elemental",
    questions: [
      {
        id: "k8s_elemental-q1",
        questionText: "KubernetesのDeploymentの役割として正しいものは？",
        questionType: "multiple_choice",
        options: [
          { label: "A", value: "Podの希望状態を管理しローリングアップデートを提供する", isCorrect: true },
          { label: "B", value: "クラスタネットワークを構成する" },
          { label: "C", value: "永続ボリュームを作成する" },
          { label: "D", value: "Serviceのエントリポイントを定義する" },
        ],
        correctAnswer: "Podの希望状態を管理しローリングアップデートを提供する",
        explanation: "DeploymentはReplicaSetを管理し、バージョン更新を安全に行う。",
        hints: ["ワークロードコントローラ"],
        difficulty: 3,
        timeLimit: 60,
        bonusXp: 8,
        isAiGenerated: false,
      },
    ],
  },
  {
    slug: "mvc_slime",
    questions: [
      {
        id: "mvc_slime-q1",
        questionText: "MVCアーキテクチャでControllerの役割は？",
        questionType: "multiple_choice",
        options: [
          { label: "A", value: "入力を受け取りModelとViewをつなぐ", isCorrect: true },
          { label: "B", value: "データ永続化を担う" },
          { label: "C", value: "テンプレートを描画する" },
          { label: "D", value: "ビルドとデプロイを自動化する" },
        ],
        correctAnswer: "入力を受け取りModelとViewをつなぐ",
        explanation: "Controllerはルーティングや入力処理を行い、ModelとViewを橋渡しする。",
        hints: ["橋渡し役"],
        difficulty: 2,
        timeLimit: 45,
        bonusXp: 5,
        isAiGenerated: false,
      },
    ],
  },
  {
    slug: "basic_info_sentinel",
    questions: [
      {
        id: "basic_info_sentinel-q1",
        questionText: "基本情報技術者試験の頻出テーマ。OSI参照モデル第3層の名称は？",
        questionType: "multiple_choice",
        options: [
          { label: "A", value: "ネットワーク層", isCorrect: true },
          { label: "B", value: "データリンク層" },
          { label: "C", value: "トランスポート層" },
          { label: "D", value: "セッション層" },
        ],
        correctAnswer: "ネットワーク層",
        explanation: "第3層はネットワーク層で、IPなど経路制御を担う。",
        hints: ["IPが動く層"],
        difficulty: 2,
        timeLimit: 45,
        bonusXp: 5,
        isAiGenerated: false,
      },
    ],
  },
  {
    slug: "security_sphinx",
    questions: [
      {
        id: "security_sphinx-q1",
        questionText: "SQLインジェクション対策として最も効果的なものは？",
        questionType: "multiple_choice",
        options: [
          { label: "A", value: "プリペアドステートメントでバインドする", isCorrect: true },
          { label: "B", value: "WHERE句を減らす" },
          { label: "C", value: "コメントを多く書く" },
          { label: "D", value: "JavaScriptで入力をブロックするだけ" },
        ],
        correctAnswer: "プリペアドステートメントでバインドする",
        explanation: "サーバ側でプレースホルダを使うことで、入力がSQLとして解釈されない。",
        hints: ["バインド変数"],
        difficulty: 3,
        timeLimit: 50,
        bonusXp: 6,
        isAiGenerated: false,
      },
    ],
  },
  {
    slug: "research_slime",
    questions: [
      {
        id: "research_slime-q1",
        questionText: "エラー `TypeError: undefined is not a function` の原因を調べる際、最も有効な検索クエリは？",
        questionType: "multiple_choice",
        options: [
          { label: "A", value: "TypeError undefined is not a function React", isCorrect: true },
          { label: "B", value: "エラー よくわからない" },
          { label: "C", value: "JavaScript" },
          { label: "D", value: "undefined error" },
        ],
        correctAnswer: "TypeError undefined is not a function React",
        explanation: "具体的なエラーメッセージと技術スタックを含めると検索精度が上がる。",
        hints: ["エラー文をそのまま検索"],
        difficulty: 1,
        timeLimit: 40,
        bonusXp: 0,
        isAiGenerated: false,
      },
    ],
  },
];

// ============================================
// 新規データ: スポーンゾーン
// ============================================
const SPAWN_ZONES = [
  {
    id: "spawn-classroom-front",
    roomId: "test-classroom-1",
    name: "教室前方",
    slug: "classroom_front",
    minX: -6,
    maxX: 6,
    minY: 0,
    maxY: 2,
    minZ: -1,
    maxZ: 3,
    spawnCategories: ["math", "english"],
    spawnInterval: 30,
    maxMonsters: 3,
    difficultyMin: 1,
    difficultyMax: 3,
  },
  {
    id: "spawn-classroom-mid",
    roomId: "test-classroom-1",
    name: "教室中央",
    slug: "classroom_mid",
    minX: -6,
    maxX: 6,
    minY: 0,
    maxY: 2,
    minZ: 3,
    maxZ: 7,
    spawnCategories: ["japanese", "math", "english"],
    spawnInterval: 40,
    maxMonsters: 2,
    difficultyMin: 1,
    difficultyMax: 4,
  },
  {
    id: "spawn-classroom-back",
    roomId: "test-classroom-1",
    name: "教室後方",
    slug: "classroom_back",
    minX: -6,
    maxX: 6,
    minY: 0,
    maxY: 2,
    minZ: 7,
    maxZ: 12,
    spawnCategories: ["science", "social", "math"],
    spawnInterval: 50,
    maxMonsters: 2,
    difficultyMin: 2,
    difficultyMax: 5,
  },
];

// ============================================
// シード関数: ユーザー
// ============================================
async function seedUsers() {
  await prisma.user.upsert({
    where: { id: DEMO_USER.id },
    update: {
      email: DEMO_USER.email,
      passwordHash: DEMO_USER.passwordHash,
      name: DEMO_USER.name,
    },
    create: DEMO_USER,
  });
  console.log("✅ Demo user seeded");
}

// ============================================
// シード関数: Credo アイテム
// ============================================
async function seedCredoItems() {
  for (const item of CREDO_ITEMS) {
    await prisma.credoItem.upsert({
      where: { id: item.id },
      update: {
        order: item.order,
        category: item.category,
        title: item.title,
        description: item.description,
      },
      create: item,
    });
  }
  console.log("✅ Credo items seeded (11 items)");
}

// ============================================
// シード関数: アバターテンプレート
// ============================================
async function seedAvatarTemplates() {
  for (const avatar of AVATAR_TEMPLATES) {
    await prisma.avatarTemplate.upsert({
      where: { id: avatar.id },
      update: {
        name: avatar.name,
        category: avatar.category,
        modelUrl: avatar.modelUrl,
        thumbnailUrl: avatar.thumbnailUrl,
        customizable: avatar.customizable,
        defaultColor: avatar.defaultColor,
        isPremium: avatar.isPremium,
        isActive: avatar.isActive,
        sortOrder: avatar.sortOrder,
      },
      create: avatar,
    });
  }
  console.log("✅ Avatar templates seeded (7 items)");
}


// ============================================
// シード関数: モンスター定義・問題
// ============================================
async function seedMonsters() {
  const monsterIdMap = new Map();
  for (const monster of MONSTER_DEFINITIONS) {
    const record = await prisma.monsterDefinition.upsert({
      where: { slug: monster.slug },
      update: {
        name: monster.name,
        description: monster.description ?? null,
        category: monster.category,
        subcategory: monster.subcategory ?? null,
        difficulty: monster.difficulty,
        rarity: monster.rarity,
        baseXp: monster.baseXp,
        baseCoin: monster.baseCoin,
        spriteUrl: monster.spriteUrl ?? null,
        modelUrl: monster.modelUrl ?? null,
        color: monster.color ?? null,
        size: monster.size ?? 1.0,
        minPlayerLevel: monster.minPlayerLevel ?? 1,
        maxPlayerLevel: monster.maxPlayerLevel ?? null,
        spawnWeight: monster.spawnWeight ?? 100,
        spawnZones: monster.spawnZones ?? [],
        isActive: true,
      },
      create: {
        name: monster.name,
        slug: monster.slug,
        description: monster.description ?? null,
        category: monster.category,
        subcategory: monster.subcategory ?? null,
        difficulty: monster.difficulty,
        rarity: monster.rarity,
        baseXp: monster.baseXp,
        baseCoin: monster.baseCoin,
        spriteUrl: monster.spriteUrl ?? null,
        modelUrl: monster.modelUrl ?? null,
        color: monster.color ?? null,
        size: monster.size ?? 1.0,
        minPlayerLevel: monster.minPlayerLevel ?? 1,
        maxPlayerLevel: monster.maxPlayerLevel ?? null,
        spawnWeight: monster.spawnWeight ?? 100,
        spawnZones: monster.spawnZones ?? [],
        isActive: true,
      },
    });
    monsterIdMap.set(monster.slug, record.id);
  }

  for (const entry of MONSTER_QUESTIONS) {
    const monsterId = monsterIdMap.get(entry.slug);
    if (!monsterId) continue;
    for (const q of entry.questions) {
      await prisma.monsterQuestion.upsert({
        where: { id: q.id },
        update: {
          monsterId,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          hints: q.hints,
          difficulty: q.difficulty,
          timeLimit: q.timeLimit,
          bonusXp: q.bonusXp,
          tags: q.tags ?? [],
          isAiGenerated: q.isAiGenerated,
        },
        create: {
          id: q.id,
          monsterId,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          hints: q.hints,
          difficulty: q.difficulty,
          timeLimit: q.timeLimit,
          bonusXp: q.bonusXp,
          tags: q.tags ?? [],
          isAiGenerated: q.isAiGenerated,
        },
      });
    }
  }
  const questionTotal = MONSTER_QUESTIONS.reduce((sum, m) => sum + m.questions.length, 0);
  console.log(`✅ Monsters seeded (${MONSTER_DEFINITIONS.length} definitions, ${questionTotal} questions)`);
}

// ============================================
// シード関数: スポーンゾーン
// ============================================
async function seedSpawnZones() {
  for (const zone of SPAWN_ZONES) {
    await prisma.spawnZone.upsert({
      where: { id: zone.id },
      update: {
        roomId: zone.roomId,
        name: zone.name,
        slug: zone.slug,
        minX: zone.minX,
        maxX: zone.maxX,
        minY: zone.minY,
        maxY: zone.maxY,
        minZ: zone.minZ,
        maxZ: zone.maxZ,
        spawnCategories: zone.spawnCategories,
        spawnInterval: zone.spawnInterval,
        maxMonsters: zone.maxMonsters,
        difficultyMin: zone.difficultyMin,
        difficultyMax: zone.difficultyMax,
        isActive: true,
      },
      create: zone,
    });
  }
  console.log(`✅ Spawn zones seeded (${SPAWN_ZONES.length} zones)`);
}

// ============================================
// シード関数: テスト用ルーム
// ============================================
async function seedTestRooms() {
  for (const room of TEST_ROOMS) {
    // ルームを作成または更新
    const createdRoom = await prisma.virtualRoom.upsert({
      where: { id: room.id },
      update: {
        name: room.name,
        description: room.description,
        type: room.type,
        maxParticipants: room.maxParticipants,
        isPublic: room.isPublic,
        password: room.password,
        environmentId: room.environmentId,
        spawnPosition: room.spawnPosition,
        allowVideo: room.allowVideo,
        allowAudio: room.allowAudio,
        allowScreenShare: room.allowScreenShare,
        allowChat: room.allowChat,
        status: room.status,
      },
      create: {
        id: room.id,
        name: room.name,
        description: room.description,
        type: room.type,
        maxParticipants: room.maxParticipants,
        isPublic: room.isPublic,
        password: room.password,
        environmentId: room.environmentId,
        spawnPosition: room.spawnPosition,
        allowVideo: room.allowVideo,
        allowAudio: room.allowAudio,
        allowScreenShare: room.allowScreenShare,
        allowChat: room.allowChat,
        status: room.status,
        hostId: DEMO_USER.id, // デモユーザーをホストに設定
      },
    });

    // ホストを参加者として追加（存在しなければ）
    const participantId = `${room.id}-host`;
    await prisma.roomParticipant.upsert({
      where: { id: participantId },
      update: {
        role: "HOST",
        avatarId: "avatar_teacher_1",
        avatarColor: "#EF4444",
        displayName: DEMO_USER.name,
      },
      create: {
        id: participantId,
        roomId: createdRoom.id,
        userId: DEMO_USER.id,
        role: "HOST",
        avatarId: "avatar_teacher_1",
        avatarColor: "#EF4444",
        displayName: DEMO_USER.name,
        positionX: 0,
        positionY: 0,
        positionZ: 0,
        rotationY: 0,
        currentAction: "idle",
        isVideoOn: false,
        isAudioOn: false,
        isSharingScreen: false,
        isHandRaised: false,
        isConnected: false,
      },
    });

    // メインホワイトボードを作成（存在しなければ）
    const whiteboardId = `${room.id}-main-whiteboard`;
    await prisma.whiteboard.upsert({
      where: { id: whiteboardId },
      update: {
        name: "メインボード",
      },
      create: {
        id: whiteboardId,
        name: "メインボード",
        roomId: createdRoom.id,
        elements: [],
        appState: {},
        isLocked: false,
        allowedEditors: [],
      },
    });
  }
  console.log("✅ Test rooms seeded (2 rooms with participants & whiteboards)");
}

// ============================================
// メイン関数
// ============================================
async function main() {
  console.log("🌱 Starting seed...\n");

  // 既存シード
  await seedUsers();
  await seedCredoItems();

  // バーチャル教室用シード
  await seedAvatarTemplates();
  await seedTestRooms();
  await seedMonsters();
  await seedSpawnZones();

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
