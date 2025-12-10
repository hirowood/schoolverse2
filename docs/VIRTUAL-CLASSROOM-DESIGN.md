# バーチャル教室・モンスター遭遇システム 詳細設計書

> **目的**: 3Dバーチャル教室環境でRPG風の学習体験を提供し、モンスター遭遇による問題解答でXP獲得・レベルアップを実現する

**作成日**: 2025-12-10  
**ステータス**: Phase1完了・Phase2一部完了（遭遇/解答API + デモUI）  
**見積工数**: 約40時間（5-7日）

---

## 📋 目次

1. [現状分析](#1-現状分析)
2. [コンセプト・要件定義](#2-コンセプト要件定義)
3. [アーキテクチャ設計](#3-アーキテクチャ設計)
4. [データベース設計](#4-データベース設計)
5. [3D環境設計](#5-3d環境設計)
6. [モンスター遭遇システム設計](#6-モンスター遭遇システム設計)
7. [API設計](#7-api設計)
8. [フロントエンド設計](#8-フロントエンド設計)
9. [実装計画](#9-実装計画)
10. [テスト計画](#10-テスト計画)

---

## 1. 現状分析

### 1.1 既存実装（✅ DB定義済み）

```
データベース（存在するが未使用）:
├── VirtualRoom          # 教室ルーム定義
├── RoomParticipant      # 参加者（位置、アバター）
├── Whiteboard           # ホワイトボード
├── WhiteboardSnapshot   # スナップショット
├── RoomMessage          # ルーム内チャット
├── RoomRecording        # 録画
└── AvatarTemplate       # アバターテンプレート

Enum:
├── RoomType        # CLASSROOM, STUDY_GROUP, CONSULTATION, PRESENTATION
├── RoomStatus      # WAITING, ACTIVE, PAUSED, ENDED
├── ParticipantRole # HOST, TEACHER, STUDENT, OBSERVER
└── MessageType     # TEXT, SYSTEM, QUESTION, FILE
```

### 1.2 カリキュラムライン（モンスターカテゴリの基盤）

```
既存カリキュラム:
├── fe-line        # フロントエンドライン（HTML/CSS/JS/React）
├── react-line     # Reactカリキュラム（コンポーネント〜Next.js）
├── be-line        # バックエンドライン（HTTP/REST/DB/認証）
├── infra-line     # インフラ/クラウドライン（サーバ/ネットワーク/デプロイ）
├── fullstack-line # フルスタック・連携
└── thinking-line  # 思考スキルライン（検索/メモ/仮説/ロジック）
```

### 1.3 未実装・追加が必要

| カテゴリ | 内容 | 状態 |
|----------|------|:----:|
| **3D環境** | Three.js/R3Fレンダリング | ❌ |
| **アバター操作** | キーボード/タッチ移動 | ❌ |
| **モンスター定義** | DBモデル・静的データ | ❌ |
| **遭遇システム** | 出現ロジック・バトル | ❌ |
| **問題生成** | AI生成・カテゴリ別 | ❌ |
| **報酬システム** | XP・アイテム・実績連携 | ❌ |
| **リアルタイム同期** | 位置・状態の共有 | ❌ |
| **フロントエンドUI** | ルーム一覧・3D画面 | ❌ |

---

## 2. コンセプト・要件定義

### 2.1 コンセプト

```
┌─────────────────────────────────────────────────────────────────┐
│                    Schoolverse バーチャル教室                    │
│                                                                 │
│   "ITスキルの冒険"                                              │
│   - 教室を探索しながらITモンスター（問題）と遭遇                 │
│   - プログラミング知識で戦い、経験値を積み、成長する            │
│   - カリキュラムと連動した問題で実践的なスキルを習得            │
│                                                                 │
│   ターゲット: 14-18歳の不登校・学校に通いづらい生徒             │
│   - ゲーム感覚でプログラミング学習のハードルを下げる            │
│   - 達成感・成長実感でモチベーション維持                        │
│   - カリキュラム進捗と連動したモンスター解放                    │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 機能要件

| ID | 要件 | 優先度 |
|----|------|:------:|
| FR-3D1 | 3D教室環境の表示（Three.js） | 高 |
| FR-3D2 | アバターの移動（WASD/矢印/タッチ） | 高 |
| FR-3D3 | カメラ追従（三人称視点） | 高 |
| FR-M1 | モンスター定義（IT6カテゴリ対応） | 高 |
| FR-M2 | モンスター出現（カリキュラム連動） | 高 |
| FR-M3 | 遭遇バトル（問題出題、時間制限） | 高 |
| FR-M4 | AI問題生成（カテゴリ別、難易度調整） | 中 |
| FR-M5 | 正誤判定・報酬付与 | 高 |

### 2.3 非機能要件

| 要件 | 目標値 |
|------|--------|
| 3D描画FPS | 30fps以上（モバイル含む） |
| モンスター出現応答 | < 500ms |
| 問題生成（AI） | < 3秒 |
| モバイル対応 | タッチ操作、375px以上 |

---

## 3. アーキテクチャ設計

### 3.1 技術スタック

```
フロントエンド:
├── React Three Fiber (R3F)  # Three.jsのReactラッパー
├── @react-three/drei        # R3F便利コンポーネント
├── Zustand                  # 3D状態管理
└── Supabase Realtime        # 位置同期（将来）

バックエンド:
├── Next.js API Routes       # REST API
├── Prisma                   # DB操作
├── Claude API               # AI問題生成
└── Supabase Presence        # リアルタイム

3Dアセット:
├── プリミティブ形状         # 簡易オブジェクト（MVP）
└── 2Dスプライト             # モンスター
```

### 3.2 ファイル構成

```
src/
├── app/
│   ├── virtual-classroom/
│   │   ├── page.tsx              # ルーム一覧
│   │   └── [roomId]/
│   │       └── page.tsx          # 3D教室画面
│   └── api/
│       ├── virtual-room/
│       │   ├── route.ts          # ルーム一覧/作成
│       │   └── [roomId]/
│       │       ├── route.ts      # ルーム詳細
│       │       └── join/route.ts # 入室
│       └── monster/
│           ├── encounter/route.ts # 遭遇開始
│           ├── answer/route.ts    # 解答送信
│           └── definitions/route.ts # モンスター定義
│
├── components/
│   └── virtual-classroom/
│       ├── RoomList/             # ルーム一覧UI
│       ├── Room3D/               # 3D関連
│       │   ├── Canvas3D.tsx      # R3F Canvas
│       │   ├── Environment.tsx   # 教室環境
│       │   ├── PlayerAvatar.tsx  # 自分のアバター
│       │   ├── MonsterSprite.tsx # モンスター表示
│       │   └── Controls.tsx      # 移動操作
│       └── Battle/               # バトルUI
│           ├── BattleOverlay.tsx # バトル画面
│           ├── QuestionCard.tsx  # 問題表示
│           └── ResultModal.tsx   # 結果表示
│
├── hooks/
│   ├── useVirtualRoom.ts         # ルーム状態管理
│   └── useMonsterEncounter.ts    # 遭遇管理
│
└── lib/
    └── virtual-classroom/
        ├── monster-service.ts    # モンスターロジック
        ├── encounter-service.ts  # 遭遇処理
        ├── question-generator.ts # AI問題生成
        ├── monsters-data.ts      # モンスター初期データ
        └── types.ts              # 型定義
```

---

## 4. データベース設計

### 4.1 新規モデル

```prisma
// ===== モンスター定義 =====

model MonsterDefinition {
  id              String   @id @default(cuid())
  name            String                        // CSSスライム、DOMゴブリン等
  slug            String   @unique              // css_slime_1
  description     String?
  category        String                        // frontend, react, backend, infra, fullstack, thinking
  subcategory     String?                       // html-css, javascript, hooks等
  difficulty      Int      @default(1)          // 1-5
  rarity          String   @default("common")   // common, uncommon, rare, epic, legendary
  baseXp          Int      @default(10)
  baseCoin        Int      @default(5)
  spriteUrl       String?                       // 2Dスプライト画像URL
  color           String   @default("#94a3b8")
  size            Float    @default(1.0)        // スケール
  
  // 出現条件
  minPlayerLevel  Int      @default(1)
  maxPlayerLevel  Int?
  spawnWeight     Int      @default(100)        // 出現確率の重み
  relatedLineId   String?                       // 対応カリキュラムライン
  
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  encounters      MonsterEncounter[]
  questionBank    MonsterQuestion[]

  @@index([category])
  @@index([difficulty])
  @@index([rarity])
  @@index([relatedLineId])
}

// ===== モンスター別問題バンク =====

model MonsterQuestion {
  id              String   @id @default(cuid())
  monsterId       String
  monster         MonsterDefinition @relation(fields: [monsterId], references: [id], onDelete: Cascade)
  
  questionText    String   @db.Text             // 問題文
  questionType    String   @default("multiple_choice") // multiple_choice, text, code
  options         Json?                         // 選択肢 [{label, value, isCorrect}]
  correctAnswer   String                        // 正解
  explanation     String?  @db.Text             // 解説
  hints           String[] @default([])         // ヒント
  codeSnippet     String?  @db.Text             // コード問題用
  
  difficulty      Int      @default(1)
  timeLimit       Int      @default(60)         // 秒
  bonusXp         Int      @default(0)          // 時間内正解ボーナス
  
  tags            String[] @default([])
  isAiGenerated   Boolean  @default(false)
  usageCount      Int      @default(0)
  correctRate     Float?
  
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([monsterId])
  @@index([difficulty])
}

// ===== 遭遇記録 =====

model MonsterEncounter {
  id              String   @id @default(cuid())
  
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  monsterId       String
  monster         MonsterDefinition @relation(fields: [monsterId], references: [id])
  roomId          String?
  room            VirtualRoom? @relation(fields: [roomId], references: [id])
  
  questionText    String   @db.Text
  questionType    String
  options         Json?
  correctAnswer   String
  userAnswer      String?
  
  isCorrect       Boolean?
  answeredAt      DateTime?
  timeSpentSec    Int?
  hintsUsed       Int      @default(0)
  
  xpEarned        Int      @default(0)
  bonusXpEarned   Int      @default(0)
  coinsEarned     Int      @default(0)
  
  status          String   @default("active")   // active, completed, fled, timeout
  
  positionX       Float?
  positionY       Float?
  positionZ       Float?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId, createdAt(sort: Desc)])
  @@index([userId, status])
  @@index([monsterId])
}

// ===== ユーザーモンスター統計 =====

model UserMonsterStats {
  id                  String   @id @default(cuid())
  userId              String   @unique
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  totalEncounters     Int      @default(0)
  totalDefeated       Int      @default(0)
  totalFled           Int      @default(0)
  
  correctAnswers      Int      @default(0)
  wrongAnswers        Int      @default(0)
  
  totalXpFromMonsters Int      @default(0)
  totalCoinsFromMonsters Int   @default(0)
  
  // カテゴリ別統計（IT6カテゴリ）
  categoryStats       Json     @default("{}")
  // { "frontend": { encounters: 10, correct: 8 }, "react": {...} }
  
  rarityStats         Json     @default("{}")
  currentStreak       Int      @default(0)
  longestStreak       Int      @default(0)
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

// ===== スポーンゾーン定義 =====

model SpawnZone {
  id              String   @id @default(cuid())
  roomId          String?
  room            VirtualRoom? @relation(fields: [roomId], references: [id])
  
  name            String                        // "フロントエンドエリア"等
  slug            String
  
  minX            Float
  maxX            Float
  minY            Float    @default(0)
  maxY            Float    @default(2)
  minZ            Float
  maxZ            Float
  
  spawnCategories String[] @default([])         // 出現するカテゴリ
  spawnInterval   Int      @default(30)
  maxMonsters     Int      @default(3)
  difficultyMin   Int      @default(1)
  difficultyMax   Int      @default(5)
  
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())

  @@index([roomId])
}
```

---

## 5. 3D環境設計

### 5.1 教室レイアウト

```
┌─────────────────────────────────────────────────────────────┐
│                        黒板 (Z=0)                           │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              「ITスキルを鍛えよう！」                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│   [FE]     [React]    [BE]     [Infra]   [Full]   [Think]  │
│   エリア    エリア    エリア    エリア    エリア    エリア   │
│                                                             │
│     ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐        │
│     │ D │   │ D │   │ D │   │ D │   │ D │   │ D │        │
│     └───┘   └───┘   └───┘   └───┘   └───┘   └───┘        │
│                                                             │
│     ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐        │
│     │ D │   │ D │   │ D │   │ D │   │ D │   │ D │        │
│     └───┘   └───┘   └───┘   └───┘   └───┘   └───┘        │
│                                                             │
│                          入口 (Z=10)                        │
└─────────────────────────────────────────────────────────────┘

D = 机（Desk）
各エリア = 対応カテゴリのモンスターが出現
```

---

## 6. モンスター遭遇システム設計

### 6.1 モンスターカテゴリ（IT特化・6カテゴリ）

カリキュラムラインに完全対応：

| カテゴリ | slug | 対応ライン | 色 |
|----------|------|-----------|-----|
| フロントエンド | frontend | fe-line | 🟦 青 |
| React | react | react-line | 🟦 水色 |
| バックエンド | backend | be-line | 🟩 緑 |
| インフラ | infra | infra-line | 🟧 オレンジ |
| フルスタック | fullstack | fullstack-line | 🟪 紫 |
| 思考スキル | thinking | thinking-line | 🟨 黄 |

### 6.2 モンスター一覧（全30体）

#### フロントエンドモンスター（6体）

| 名前 | 難易度 | レアリティ | サブカテゴリ | 問題例 |
|------|:------:|-----------|-------------|--------|
| CSSスライム | 1 | common | html-css | 「要素を中央揃えするプロパティは？」 |
| セレクタゴブリン | 1 | common | html-css | 「class属性を選択するセレクタは？」 |
| Flexboxフロッグ | 2 | common | html-css | 「横並びにするdisplay値は？」 |
| DOMゴブリン | 2 | uncommon | javascript | 「要素を取得するメソッドは？」 |
| イベントインプ | 2 | uncommon | javascript | 「クリックイベントの書き方は？」 |
| 非同期アサシン | 3 | rare | javascript | 「async/awaitの使い方は？」 |

#### Reactモンスター（6体）

| 名前 | 難易度 | レアリティ | サブカテゴリ | 問題例 |
|------|:------:|-----------|-------------|--------|
| コンポーネントスライム | 2 | common | basics | 「関数コンポーネントの書き方は？」 |
| Propsフェアリー | 2 | common | basics | 「propsの受け取り方は？」 |
| Stateゴーレム | 3 | uncommon | state | 「useStateの戻り値は？」 |
| useEffectスペクター | 3 | uncommon | hooks | 「useEffectの依存配列の役割は？」 |
| Hooksハイドラ | 4 | rare | hooks | 「useCallbackとuseMemoの違いは？」 |
| Reactフェニックス | 4 | epic | advanced | 「仮想DOMの仕組みを説明せよ」 |

#### バックエンドモンスター（6体）

| 名前 | 難易度 | レアリティ | サブカテゴリ | 問題例 |
|------|:------:|-----------|-------------|--------|
| HTTPスライム | 2 | common | http | 「GETとPOSTの違いは？」 |
| RESTゴブリン | 2 | common | api | 「RESTfulなURLの特徴は？」 |
| SQLスネーク | 3 | uncommon | database | 「全件取得するSQLは？」 |
| クエリクラーケン | 3 | uncommon | database | 「JOINの種類を挙げよ」 |
| 認証ガーディアン | 4 | rare | auth | 「JWTの構成要素は？」 |
| APIドラゴン | 4 | epic | api | 「認可と認証の違いは？」 |

#### インフラモンスター（6体）

| 名前 | 難易度 | レアリティ | サブカテゴリ | 問題例 |
|------|:------:|-----------|-------------|--------|
| ターミナルスライム | 3 | common | server | 「ディレクトリ移動コマンドは？」 |
| プロセスゴースト | 3 | common | server | 「実行中プロセス確認コマンドは？」 |
| ネットワークスネーク | 4 | uncommon | network | 「HTTPステータス404の意味は？」 |
| クラウドイーグル | 4 | uncommon | cloud | 「IaaSとPaaSの違いは？」 |
| デプロイデーモン | 5 | rare | deploy | 「CI/CDの略称は？」 |
| セキュリティドラゴン | 5 | epic | security | 「XSS攻撃とは何か？」 |

#### フルスタックモンスター（3体）

| 名前 | 難易度 | レアリティ | サブカテゴリ | 問題例 |
|------|:------:|-----------|-------------|--------|
| フルスタックスライム | 3 | uncommon | general | 「MVCアーキテクチャとは？」 |
| アーキテクトゴーレム | 4 | rare | design | 「マイクロサービスの特徴は？」 |
| フルスタックキメラ | 5 | legendary | advanced | 「スケーラビリティを確保する方法は？」 |

#### 思考スキルモンスター（3体）

| 名前 | 難易度 | レアリティ | サブカテゴリ | 問題例 |
|------|:------:|-----------|-------------|--------|
| 検索スライム | 1 | common | research | 「効果的な検索キーワードの選び方は？」 |
| メモゴブリン | 1 | common | note | 「5W2Hの要素を挙げよ」 |
| ロジックスフィンクス | 3 | rare | logic | 「MECEとは何の略？」 |

### 6.3 レアリティと報酬

| レアリティ | 出現率 | 基本XP | XP倍率 | コイン |
|-----------|--------|--------|--------|--------|
| common | 50% | 10 | 1.0x | 5 |
| uncommon | 30% | 20 | 1.5x | 10 |
| rare | 15% | 30 | 2.0x | 20 |
| epic | 4% | 50 | 3.0x | 50 |
| legendary | 1% | 100 | 5.0x | 100 |

### 6.4 遭遇フロー

```
1. 探索フェーズ
   └── プレイヤーがカテゴリエリアを移動
           ↓
2. 遭遇判定
   ├── スポーンゾーン判定
   ├── プレイヤーレベルフィルタ
   └── カテゴリ・レアリティ抽選
           ↓
3. 「CSSスライムが現れた！」
   ├── バトルUI表示
   └── 問題取得（DBまたはAI生成）
           ↓
4. 解答フェーズ（60秒制限）
   ├── 選択式 or 記述式
   ├── ヒント使用可能（XP-20%）
   └── 解答送信
           ↓
5. 結果判定
   ├── 正解 → XP・コイン獲得
   ├── 不正解 → 解説表示
   └── 統計・実績更新
```

### 6.5 AI問題生成プロンプト

```typescript
const buildQuestionPrompt = (monster: MonsterDefinition) => `
あなたはIT教育用RPGゲームの問題作成者です。
以下の条件で問題を1問作成してください。

【モンスター情報】
- 名前: ${monster.name}
- カテゴリ: ${monster.category}
- サブカテゴリ: ${monster.subcategory}
- 難易度: ${monster.difficulty}/5

【カテゴリ別の出題範囲】
- frontend: HTML/CSS基礎、JavaScript、DOM操作
- react: コンポーネント、Hooks、状態管理
- backend: HTTP/REST、SQL、認証・認可
- infra: サーバー、ネットワーク、クラウド、デプロイ
- fullstack: アーキテクチャ、設計パターン
- thinking: 検索技術、メモ術、論理的思考

【出力形式】
{
  "questionText": "モンスターのセリフ風の問題文",
  "questionType": "multiple_choice",
  "options": [
    { "label": "A", "value": "選択肢1", "isCorrect": false },
    { "label": "B", "value": "選択肢2", "isCorrect": true },
    { "label": "C", "value": "選択肢3", "isCorrect": false },
    { "label": "D", "value": "選択肢4", "isCorrect": false }
  ],
  "correctAnswer": "B",
  "explanation": "解説（なぜその答えが正しいか）",
  "hints": ["ヒント1", "ヒント2"]
}
`;
```

---

## 7. API設計

### 7.1 エンドポイント一覧

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/virtual-room` | ルーム一覧 |
| POST | `/api/virtual-room` | ルーム作成 |
| GET | `/api/virtual-room/[roomId]` | ルーム詳細 |
| POST | `/api/virtual-room/[roomId]/join` | 入室 |
| GET | `/api/monster/definitions` | モンスター定義一覧 |
| POST | `/api/monster/encounter` | 遭遇開始 |
| POST | `/api/monster/answer` | 解答送信 |
| GET | `/api/monster/stats` | ユーザー統計 |

### 7.2 遭遇API詳細

```typescript
// POST /api/monster/encounter
// Request
{
  "roomId": "room-123",
  "position": { "x": 2.5, "y": 0, "z": 5.0 },
  "category": "frontend" // オプション：特定カテゴリ指定
}

// Response
{
  "success": true,
  "data": {
    "encounterId": "enc-456",
    "monster": {
      "id": "mon-789",
      "name": "CSSスライム",
      "category": "frontend",
      "subcategory": "html-css",
      "rarity": "common",
      "spriteUrl": "/monsters/css-slime.png"
    },
    "question": {
      "text": "CSSスライムからの挑戦！\n要素を横並びにするdisplayプロパティの値は？",
      "type": "multiple_choice",
      "options": [
        { "label": "A", "value": "block" },
        { "label": "B", "value": "inline" },
        { "label": "C", "value": "flex" },
        { "label": "D", "value": "grid" }
      ],
      "timeLimit": 60
    }
  }
}
```

---

## 8. フロントエンド設計

### 8.1 状態管理（Zustand）

```typescript
// src/hooks/useVirtualRoom.ts

type VirtualRoomStore = {
  roomId: string | null;
  playerPosition: { x: number; y: number; z: number };
  
  // バトル状態
  isBattleActive: boolean;
  battle: {
    encounterId: string | null;
    monster: Monster | null;
    question: Question | null;
    timeRemaining: number;
  };
  
  // アクション
  updatePosition: (pos: Position) => void;
  startBattle: (data: BattleData) => void;
  endBattle: () => void;
};
```

---

## 9. 実装計画

### 9.1 フェーズ分割

| Phase | 内容 | 時間 |
|:-----:|------|:----:|
| **1** | DB・基盤（スキーマ、シード30体） | 6h |
| **2** | API（遭遇、問題生成、解答） | 10h |
| **3** | 3D環境（R3F、教室、アバター） | 10h |
| **4** | バトルUI・統合（オーバーレイ、報酬） | 8h |
| **5** | テスト・調整 | 4h |
| | **合計** | **38h** |

### 9.2 Phase 1 詳細タスク

- [x] Prismaスキーマ追加（MonsterDefinition, MonsterQuestion, MonsterEncounter, UserMonsterStats, SpawnZone）
- [x] マイグレーション実行
- [x] モンスター初期データ（31体）作成：`prisma/seed.js`
- [x] 問題バンク初期データ（10問、カテゴリ別サンプル）※拡充予定
- [x] スポーンゾーン定義（3エリア、デモ用）
- [x] 型定義：`src/features/virtual-classroom/types.ts`
- [x] API試作：`/api/monster/definitions`, `/api/monster/encounter`, `/api/monster/answer`

### 9.3 現在の進捗メモ（Phase2途中）
- 遭遇ロジック：カテゴリ／レベルフィルタ＋重み抽選で出現
- 解答処理：正誤判定、レアリティ倍率によるXP/コイン算出、UserMonsterStats更新
- デモUI：`/virtual-classroom/demo` で遭遇→回答→結果表示まで通過（簡易バトルオーバーレイ）
- 問題バンク：31体・30問に拡充（カテゴリ別サンプル）。目標（各5問=150問）は未達。
- 未実装: AI問題生成呼び出し、3D/HUD統合、報酬アニメーション、150問化

---

## 10. テスト計画

### 10.1 テストケース

| カテゴリ | テストケース | 期待結果 |
|----------|--------------|----------|
| モンスター | カテゴリフィルタ | 指定カテゴリのみ出現 |
| モンスター | レベルフィルタ | プレイヤーレベル範囲内のみ |
| 遭遇 | 正解 | XP・コイン獲得 |
| 遭遇 | 不正解 | 解説表示、XPなし |
| 遭遇 | タイムアウト | 自動終了 |
| 統計 | カテゴリ別記録 | categoryStats更新 |

---

## 📊 完了基準

| 基準 | 達成条件 |
|------|----------|
| DB | 6カテゴリ30体のモンスター登録 |
| 3D環境 | 教室表示、アバター移動可能 |
| 遭遇 | カテゴリエリアで出現、問題出題 |
| 解答 | 正誤判定、XP付与 |
| 統計 | カテゴリ別正答率が記録 |

---

**次のアクション**: Phase 1（データベース・モンスターシード）の実装開始
