# 📚 カリキュラム詳細設計書 v1.0

> **目的**: 学習内容の定義と進捗管理を実装し、生徒が自分のペースで達成感を得ながら学習できるようにする

**作成日**: 2025-12-10  
**最終更新**: 2025-12-10  
**ステータス**: ✅ Phase 1-3 全完了

---

## 📋 目次

1. [現状分析](#1-現状分析)
2. [要件定義](#2-要件定義)
3. [アーキテクチャ設計](#3-アーキテクチャ設計)
4. [データベース設計](#4-データベース設計)
5. [API設計](#5-api設計)
6. [UI/UX設計](#6-uiux設計)
7. [実装計画](#7-実装計画)
8. [テスト計画](#8-テスト計画)

---

## 1. 現状分析

### 1.1 既存実装

```
✅ 完了済み
├── カリキュラムマップ静的定義 (lib/curriculum/map.ts)
├── カリキュラムライン定義 (lib/curriculum/lines-data.ts)
├── 型定義 (lib/curriculum/types.ts)
├── React学習ページ基本UI (/curriculum/react)
└── 検索API (/api/curriculum/lines)

❌ 未実装
├── ユーザー進捗追跡（DBモデル）
├── レッスン完了判定ロジック
├── 前提条件・解放システム
├── XP/実績連携
├── 個別レッスン詳細ページ
└── 学習時間記録
```

### 1.2 関連する既存モデル

```prisma
// 既存：スキル定義（カリキュラムと連携可能）
model SkillDefinition {
  id            String    @id
  name          String
  slug          String    @unique
  category      String
  parentId      String?
  requiredXp    Int       @default(100)
  prerequisites String[]  @default([])
  // ...
}

model UserSkill {
  id          String    @id
  userId      String
  skillId     String
  currentXp   Int       @default(0)
  level       Int       @default(0)
  status      String    @default("locked")
  // ...
}
```

### 1.3 課題ツリー（因果関係）

```
問題: カリキュラム進捗が追跡できない
│
├── 原因1: DBにユーザー進捗モデルがない
│   └── 結果: 完了状態を保存できない
│
├── 原因2: レッスン詳細ページがない
│   └── 結果: 学習コンテンツを表示できない
│
├── 原因3: XP連携がない
│   └── 結果: ゲーミフィケーションの動機付けが働かない
│
└── 原因4: 前提条件システムがない
    └── 結果: 段階的な学習フローを制御できない
```

---

## 2. 要件定義

### 2.1 機能要件

| ID | 要件 | 優先度 | 依存 |
|----|------|:------:|------|
| FR-C1 | ユーザーごとのカリキュラム進捗を保存 | 高 | - |
| FR-C2 | レッスン完了をマーク可能 | 高 | FR-C1 |
| FR-C3 | 進捗に応じてXPを付与 | 高 | FR-C2 |
| FR-C4 | 前提条件を満たしたレッスンを解放 | 中 | FR-C1 |
| FR-C5 | カリキュラムライン別の進捗表示 | 高 | FR-C1 |
| FR-C6 | レッスン詳細ページ（学習コンテンツ） | 高 | - |
| FR-C7 | 学習時間の記録 | 中 | FR-C2 |
| FR-C8 | 実績との連携 | 低 | FR-C2 |
| FR-C9 | カリキュラム一覧・検索UI | 中 | - |

### 2.2 非機能要件

| ID | 要件 | 基準 |
|----|------|------|
| NFR-1 | レスポンス時間 | API < 500ms |
| NFR-2 | モバイル対応 | レスポンシブUI |
| NFR-3 | オフライン耐性 | 進捗はサーバー同期 |
| NFR-4 | 拡張性 | 新しいカリキュラム追加が容易 |

### 2.3 ユーザーストーリー

```
US-1: 生徒として、自分がどこまで学習したかを確認したい
US-2: 生徒として、レッスンを完了したらXPがもらえてほしい
US-3: 生徒として、次に学ぶべきレッスンを知りたい
US-4: 生徒として、各カリキュラムの全体像を把握したい
US-5: 生徒として、レッスンの学習内容を見たい
```

---

## 3. アーキテクチャ設計

### 3.1 システム構成図

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
├─────────────────────────────────────────────────────────────┤
│  /curriculum                  カリキュラム一覧             │
│  /curriculum/[lineId]         ライン詳細                   │
│  /curriculum/[lineId]/[lessonId]  レッスン詳細             │
│  /curriculum-map              全体マップ（既存）           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         API Layer                           │
├─────────────────────────────────────────────────────────────┤
│  GET  /api/curriculum/lines          ライン一覧            │
│  GET  /api/curriculum/lines/[id]     ライン詳細            │
│  GET  /api/curriculum/lessons/[id]   レッスン詳細          │
│  GET  /api/curriculum/progress       ユーザー進捗          │
│  POST /api/curriculum/progress       進捗更新              │
│  POST /api/curriculum/complete       レッスン完了          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                          │
├─────────────────────────────────────────────────────────────┤
│  CurriculumService      カリキュラムデータ取得             │
│  ProgressService        進捗管理・解放判定                 │
│  XpService              XP付与（既存連携）                 │
│  AchievementService     実績判定（既存連携）               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                         │
├─────────────────────────────────────────────────────────────┤
│  CurriculumLesson       レッスン定義（静的→DB移行検討）   │
│  UserLessonProgress     ユーザー進捗                       │
│  UserCurriculumStats    統計サマリー                       │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 データフロー

```
1. レッスン完了フロー
   ユーザー操作 → API呼び出し → 進捗保存 → XP付与 → 解放判定 → UI更新

2. 進捗表示フロー
   ページロード → 進捗API取得 → カリキュラムデータとマージ → UI描画
```

---

## 4. データベース設計

### 4.1 新規モデル

```prisma
// ================================
// カリキュラムレッスン定義
// ================================
model CurriculumLesson {
  id              String   @id @default(cuid())
  lineId          String                         // fe-line, react, etc.
  unitId          String?                        // 親ユニットID
  slug            String   @unique               // react-1-1, fe-1, etc.
  title           String
  description     String?  @db.Text
  content         String?  @db.Text              // Markdown学習コンテンツ
  lessonType      String   @default("lecture")   // lecture/practice/quiz/project
  order           Int      @default(0)
  estimatedMinutes Int     @default(60)
  xpReward        Int      @default(50)
  bonusXp         Int      @default(0)           // 時間内完了ボーナス
  prerequisites   String[] @default([])          // 前提レッスンslug配列
  tags            String[] @default([])
  resources       Json?                          // 参考リンク等
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  userProgress    UserLessonProgress[]

  @@index([lineId])
  @@index([lineId, order])
  @@index([slug])
}

// ================================
// ユーザーレッスン進捗
// ================================
model UserLessonProgress {
  id              String            @id @default(cuid())
  userId          String
  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  lessonId        String
  lesson          CurriculumLesson  @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  status          String   @default("locked")    // locked/available/in_progress/completed
  startedAt       DateTime?
  completedAt     DateTime?
  totalTimeSpent  Int      @default(0)           // 秒
  attempts        Int      @default(0)           // 挑戦回数
  score           Int?                           // クイズ等のスコア
  notes           String?  @db.Text              // 学習メモ
  rating          Int?                           // 1-5の満足度
  
  xpEarned        Int      @default(0)
  bonusXpEarned   Int      @default(0)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([userId, lessonId])
  @@index([userId, status])
  @@index([userId, completedAt])
}

// ================================
// ユーザーカリキュラム統計
// ================================
model UserCurriculumStats {
  id                    String   @id @default(cuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  totalLessonsCompleted Int      @default(0)
  totalTimeSpentSec     Int      @default(0)
  totalXpFromCurriculum Int      @default(0)
  currentStreak         Int      @default(0)      // 連続学習日数
  longestStreak         Int      @default(0)
  lastStudiedAt         DateTime?
  
  // ライン別進捗（JSON）
  lineProgress          Json     @default("{}")   // { "fe-line": { completed: 3, total: 6 }, ... }
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

### 4.2 Userモデルへの追加

```prisma
model User {
  // ... 既存フィールド
  
  // 追加
  lessonProgress      UserLessonProgress[]
  curriculumStats     UserCurriculumStats?
}
```

### 4.3 ER図

```
┌──────────────────┐       ┌──────────────────────┐
│      User        │       │  CurriculumLesson    │
├──────────────────┤       ├──────────────────────┤
│ id               │       │ id                   │
│ email            │       │ lineId               │
│ name             │       │ slug                 │
└────────┬─────────┘       │ title                │
         │                 │ prerequisites[]      │
         │                 │ xpReward             │
         │                 └──────────┬───────────┘
         │                            │
         │    ┌───────────────────────┘
         │    │
         ▼    ▼
┌──────────────────────────┐
│   UserLessonProgress     │
├──────────────────────────┤
│ id                       │
│ userId ─────────────────►│
│ lessonId ───────────────►│
│ status                   │
│ completedAt              │
│ xpEarned                 │
└──────────────────────────┘
         │
         │
         ▼
┌──────────────────────────┐
│  UserCurriculumStats     │
├──────────────────────────┤
│ userId (unique)          │
│ totalLessonsCompleted    │
│ lineProgress (JSON)      │
└──────────────────────────┘
```

---

## 5. API設計

### 5.1 エンドポイント一覧

| Method | Endpoint | 説明 | 認証 |
|--------|----------|------|:----:|
| GET | `/api/curriculum/lines` | ライン一覧（進捗付き） | ✓ |
| GET | `/api/curriculum/lines/[lineId]` | ライン詳細 | ✓ |
| GET | `/api/curriculum/lessons/[slug]` | レッスン詳細 | ✓ |
| GET | `/api/curriculum/progress` | ユーザー全体進捗 | ✓ |
| POST | `/api/curriculum/lessons/[slug]/start` | レッスン開始 | ✓ |
| POST | `/api/curriculum/lessons/[slug]/complete` | レッスン完了 | ✓ |
| PATCH | `/api/curriculum/lessons/[slug]/progress` | 進捗更新 | ✓ |

### 5.2 API詳細

#### GET /api/curriculum/lines（進捗付き）

```typescript
// Response
{
  "success": true,
  "data": [
    {
      "id": "fe-line",
      "title": "フロントエンドライン",
      "summary": "UI/UXを実装できるようになる",
      "progress": {
        "completed": 2,
        "total": 6,
        "percentage": 33
      },
      "units": [
        {
          "id": "fe-1",
          "title": "HTML/CSS基礎",
          "status": "completed"
        },
        // ...
      ]
    }
  ]
}
```

#### POST /api/curriculum/lessons/[slug]/complete

```typescript
// Request
{
  "timeSpentSec": 3600,
  "score": 85,          // optional: クイズの場合
  "notes": "学習メモ",  // optional
  "rating": 4           // optional: 1-5
}

// Response
{
  "success": true,
  "data": {
    "lessonId": "...",
    "status": "completed",
    "xpEarned": 50,
    "bonusXpEarned": 10,
    "unlockedLessons": ["react-1-2", "react-1-3"],
    "achievementsUnlocked": []
  }
}
```

### 5.3 進捗計算ロジック

```typescript
// lib/curriculum/progress-service.ts

interface ProgressCalculation {
  // 前提条件チェック
  checkPrerequisites(userId: string, lessonSlug: string): Promise<boolean>;
  
  // レッスン解放
  unlockAvailableLessons(userId: string): Promise<string[]>;
  
  // 完了処理
  completeLesson(userId: string, lessonSlug: string, data: CompletionData): Promise<CompletionResult>;
  
  // XP計算
  calculateXp(lesson: CurriculumLesson, timeSpentSec: number): { base: number; bonus: number };
}
```

---

## 6. UI/UX設計

### 6.1 画面一覧

| 画面 | パス | 説明 |
|------|------|------|
| カリキュラム一覧 | `/curriculum` | 全ライン表示、進捗バー |
| ライン詳細 | `/curriculum/[lineId]` | ユニット・レッスン一覧 |
| レッスン詳細 | `/curriculum/[lineId]/[slug]` | 学習コンテンツ、完了ボタン |

### 6.2 カリキュラム一覧画面（ワイヤーフレーム）

```
┌─────────────────────────────────────────────────────────────┐
│ 🎓 カリキュラム                                    [検索🔍] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 💻 フロントエンドライン                             │   │
│  │ UI/UXを実装できるようになる                         │   │
│  │ ████████░░░░░░░░░░░░░░ 33% (2/6)                    │   │
│  │                                      [続きを学ぶ →] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⚛️ Reactカリキュラム                                │   │
│  │ コンポーネント設計からアプリ制作まで                 │   │
│  │ ██████████████░░░░░░░░ 60% (15/25)                  │   │
│  │                                      [続きを学ぶ →] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🖥️ バックエンドライン                  🔒 ロック中   │   │
│  │ APIとデータを設計・提供する                         │   │
│  │ ░░░░░░░░░░░░░░░░░░░░░░ 0% (0/6)                     │   │
│  │ 前提: フロントエンド基礎を完了してください          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 ライン詳細画面

```
┌─────────────────────────────────────────────────────────────┐
│ ← カリキュラム一覧                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ⚛️ Reactカリキュラム                                       │
│  コンポーネント設計からアプリ制作まで                       │
│                                                             │
│  進捗: ████████████████░░░░ 60%   総学習時間: 12時間30分   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📦 PART 1: Reactの基本を学ぶ                    ✅ 完了    │
│  ├── ✅ 1-1 Reactはどんなもの？           45分    +50XP    │
│  ├── ✅ 1-2 Reactで何ができる？           30分    +50XP    │
│  ├── ✅ 1-3 Reactを学ぶメリット           30分    +50XP    │
│  └── ... (残り9レッスン)                                   │
│                                                             │
│  📦 PART 2: 小さなWebアプリを作る           🔄 進行中      │
│  ├── ✅ 4-1 ToDo概要と画面設計             60分    +50XP    │
│  ├── 🔄 4-2 タスク一覧表示                 [続きから →]    │
│  ├── 🔒 4-3 タスク追加フォーム                             │
│  └── ...                                                   │
│                                                             │
│  📦 PART 3: 状態を賢く扱う                  🔒 ロック中    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 レッスン詳細画面

```
┌─────────────────────────────────────────────────────────────┐
│ ← Reactカリキュラム                          ⏱️ 学習中 15:30│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📖 4-2 タスク一覧表示                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                             │
│  🎯 学習目標                                                │
│  tasks配列をstateに持ち、mapでTaskItem表示。keyにidを使う。 │
│                                                             │
│  ⏱️ 目安時間: 90〜120分    💎 獲得XP: 50                    │
│                                                             │
│  ──────────────────────────────────────────────────────────│
│                                                             │
│  ## ステップ1: 配列をstateで管理する                        │
│                                                             │
│  まず、タスクを配列として管理しましょう...                  │
│                                                             │
│  ```jsx                                                     │
│  const [tasks, setTasks] = useState([                       │
│    { id: 1, title: '買い物', done: false },                 │
│    { id: 2, title: '勉強', done: false },                   │
│  ]);                                                        │
│  ```                                                        │
│                                                             │
│  ...（Markdownコンテンツ）...                               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📝 学習メモ（任意）                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ⭐ 理解度: ○ ○ ○ ○ ○                                      │
│                                                             │
│  ┌───────────────────┐  ┌───────────────────┐              │
│  │   ← 前のレッスン   │  │ ✅ 完了して次へ → │              │
│  └───────────────────┘  └───────────────────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.5 コンポーネント設計

```
src/components/curriculum/
├── CurriculumCard.tsx          # ライン概要カード
├── CurriculumProgress.tsx      # 進捗バー
├── LessonList.tsx              # レッスン一覧
├── LessonItem.tsx              # レッスン行
├── LessonContent.tsx           # Markdownレンダラー
├── LessonTimer.tsx             # 学習タイマー
├── LessonComplete.tsx          # 完了モーダル
├── PrerequisitesBadge.tsx      # 前提条件表示
└── XpRewardBadge.tsx           # XP報酬表示
```

---

## 7. 実装計画

### 7.1 フェーズ分割

```
Phase 1: 基盤構築（3日） ✅ 完了
├── ✅ DBスキーマ追加 + マイグレーション
├── ✅ 進捗API実装
└── ✅ 静的レッスンデータ + progress-service

Phase 2: フロントエンド（4日） ✅ 完了
├── ✅ カリキュラム一覧UI (/curriculum)
├── ✅ ライン詳細UI (/curriculum/[lineId])
├── ✅ レッスン詳細UI (/curriculum/[lineId]/[slug])
└── ✅ タイマー・完了フロー (LessonTimer.tsx)

Phase 3: 連携・調整（2日） ✅ 完了
├── ✅ xp-service.ts / achievement-service.ts
├── ✅ progress-service.ts 連携
├── ✅ Gamification API実データ化
└── ✅ XpGainToast / AchievementUnlockToast
```

### 7.2 タスク詳細

#### Phase 1: 基盤構築 ✅ 完了

| タスク | 見積 | 成果物 | ステータス |
|--------|:----:|--------|:------:|
| Prismaスキーマ追加 | 2h | schema.prisma | ✅ |
| マイグレーション実行 | 1h | 20251210092622_add_curriculum_progress | ✅ |
| 型定義更新 | 1h | types.ts (LessonProgressStatus追加) | ✅ |
| 進捗サービス実装 | 4h | progress-service.ts | ✅ |
| API実装（GET） | 3h | lessons/[slug], progress | ✅ |
| API実装（POST） | 3h | lessons/[slug]/start, complete | ✅ |
| 静的レッスンデータ | 2h | lessons-static.ts | ✅ |

#### Phase 2: フロントエンド ✅ 完了

| タスク | 見積 | 成果物 | ステータス |
|--------|:----:|--------|:------:|
| カリキュラム一覧ページ | 4h | /curriculum/page.tsx | ✅ |
| ライン詳細ページ | 4h | /curriculum/[lineId]/page.tsx | ✅ |
| レッスン詳細ページ | 6h | /curriculum/[lineId]/[slug]/page.tsx | ✅ |
| コンポーネント群 | 6h | CurriculumLineCard, CurriculumProgress, LessonList | ✅ |
| 状態管理フック | 3h | useCurriculum.ts (Zustand) | ✅ |
| タイマー機能 | 2h | LessonTimer.tsx | ✅ |

#### Phase 3: 連携・調整

| タスク | 見積 | 成果物 |
|--------|:----:|--------|
| XpService連携 | 2h | xp-integration.ts |
| 実績トリガー追加 | 2h | achievement-triggers.ts |
| ダッシュボード連携 | 2h | DashboardカリキュラムWidget |
| 統合テスト | 3h | curriculum.test.ts |
| バグ修正・調整 | 3h | - |

### 7.3 工数サマリー

| フェーズ | 見積工数 |
|----------|:--------:|
| Phase 1 | 17時間 |
| Phase 2 | 25時間 |
| Phase 3 | 12時間 |
| **合計** | **54時間** |

---

## 8. テスト計画

### 8.1 テスト項目

```typescript
// tests/curriculum.test.ts

describe('カリキュラム機能', () => {
  describe('進捗管理', () => {
    it('レッスン開始で status が in_progress になる');
    it('レッスン完了で status が completed になる');
    it('完了時にXPが付与される');
    it('時間内完了でボーナスXPが付与される');
    it('前提条件未達成のレッスンは解放されない');
    it('前提条件達成で次のレッスンが解放される');
  });

  describe('API', () => {
    it('GET /api/curriculum/lines が進捗付きで返る');
    it('POST /api/curriculum/lessons/[slug]/complete が正常に動作');
    it('未認証リクエストが401を返す');
  });

  describe('UI', () => {
    it('進捗バーが正しいパーセンテージを表示');
    it('ロック中レッスンはクリック不可');
    it('完了ボタンが正常に動作');
  });
});
```

### 8.2 テストカバレッジ目標

| 対象 | 目標 |
|------|:----:|
| サービス層 | 80% |
| API層 | 90% |
| UI層 | 60% |

---

## 📝 補足事項

### 静的データ vs DB管理

現在のカリキュラム定義（`map.ts`, `lines-data.ts`）は静的ファイルです。

**推奨アプローチ**:
1. **レッスン定義**: DBに移行（管理画面から編集可能に）
2. **カリキュラム構造**: 静的ファイルを維持（変更頻度低）
3. **進捗データ**: DBで管理（ユーザーごと）

### XP設計

| アクション | 基本XP | ボーナス条件 |
|-----------|:------:|--------------|
| レッスン完了 | 50 | 目安時間内: +10 |
| ユニット完了 | 100 | 全レッスン完了時 |
| ライン完了 | 500 | 全ユニット完了時 |
| ミッション完了 | 200 | 実践課題 |

---

## 📋 次のアクション

1. [ ] 本設計書のレビュー・承認
2. [ ] Phase 1 開始: DBスキーマ追加
3. [ ] README_PROGRESS.md 更新

---

*設計書バージョン: 1.0*  
*最終更新: 2025-12-10*
