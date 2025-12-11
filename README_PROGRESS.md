# 🎓 Schoolverse2 - プロジェクト進捗管理

> **AI学習コーチプラットフォーム** - 14-18歳の不登校・学校に行きづらい生徒向け

---

## 📊 全体進捗

| 指標 | 値 |
|------|:--:|
| **MVP完成度** | **90%** |
| **カリキュラム設計** | ✅ 完了 |
| **カリキュラムバックエンド** | ✅ 完了 |
| **カリキュラムフロントエンド** | ✅ 完了 |
| **XP・実績連携** | ✅ 完了 |
| **ユーザーチャット改善** | ✅ 完了 |
| **最終更新** | 2025-12-11 (教室チャットモーダル化・入力中は3D一時停止・既読スロットル) |
| **フェーズ** | MVP開発中 |

```
進捗バー: ??????????????????????????? 79%
```

---

## 🎯 プロジェクト概要

### ビジョン
従来の学校教育に馴染めない生徒に対して、AIコーチによる個別最適化された学習体験を提供する統合プラットフォーム。

### コアコンセプト
- **ToDo3**: 1日のタスクは最大3つまで（認知負荷軽減）
- **ヒント優先**: 直接回答ではなく、考えるヒントを提供
- **ライフコーチング**: 学習だけでなく生活習慣・メンタルもサポート
- **ゲーミフィケーション**: RPG要素で継続的な動機付け

---

## 📋 機能別進捗一覧

### 🟢 完成（90%以上）

| 機能 | 進捗 | 説明 |
|------|:----:|------|
| 認証システム | 95% | NextAuth Credentials Provider |
| クレド（11箇条） | 95% | 日次実践チェック、体調連携 |
| ダッシュボード | 90% | ゲーミフィケーションウィジェット統合 |
| AIコーチチャット | 90% | Claude API連携、プラン生成 |
| タスク管理 | 90% | 階層構造、時間追跡、D&D対応 |
| 週次レポート | 90% | AI生成、Markdownエクスポート |

### 🟡 開発中（50-89%）

| 機能 | 進捗 | 説明 | 残作業 |
|------|:----:|------|--------|
| ノート機能 | 85% | キャンバス・OCR・AI分析 | UI改善 |
| マインドマップ | 85% | ReactFlow統合 | AI自動生成強化 |
| クエストシステム | 85% | AI生成デイリークエスト | バランス調整 |
| 実績システム | 90% | 定義・進捗追跡・カリキュラム連携 | UI強化 |
| 設定画面 | 80% | プロフィール、ポモドーロ | オンボーディング |
| 学習進捗追跡 | 75% | スキル定義、XP | 詳細スキルツリー |
| ユーザーチャット | 100% | Presence・入力中・未読・モバイル対応 | 通知機能 |
| カリキュラム | 100% | DB・API・UI・XP/実績連携完了 | コンテンツ充実のみ |

### 🔴 未着手/初期段階（50%未満）

| 機能 | 進捗 | 説明 | 必要作業 |
|------|:----:|------|----------|
| バーチャル教室 | 96% | three.js軽量版＋2Dフォールバック、FPSカメラ＆WASD、キャンバス全幅、他プレイヤー表示、2D補間同期、チャットパネル最適化 | AI問題品質向上、E2Eスモーク |
| モンスターエンカウンター | 80% | 設計＋シード拡充（155問）＋遭遇/解答API＋HUD＋AI補完 | バトルUI本番統合、報酬演出強化 |
| **ビデオ通話（WebRTC）** | 5% | 詳細設計済み（WebRTC・空間オーディオ・録画）、DBスキーマ準備済み | 実装着手、シグナリングサーバー、P2P接続 |
| ホワイトボード共有 | 5% | 詳細設計済み（Excalidraw/Yjs CRDT同期） | 実装着手、リアルタイム同期 |
| コミュニティ機能 | 0% | 未着手 | 設計から |

---

## 🏗️ 技術スタック

### フロントエンド
```
Next.js 15.5.7 (App Router, CVE patched)
React 18.2.0
TypeScript 5.9.3
Tailwind CSS v4
Zustand 5.0.4 (状態管理)
```

### バックエンド
```
Next.js API Routes
Prisma 6.19.0
PostgreSQL (Supabase)
NextAuth 4.24.13
```

### AI・専門ライブラリ
```
@anthropic-ai/sdk 0.71.0 (Claude API)
@excalidraw/excalidraw 0.18.0 (キャンバス)
reactflow 11.11.3 (マインドマップ)
tesseract.js 6.0.1 (OCR)
@supabase/supabase-js 2.48.0 (Realtime)
@react-three/fiber 8.13.7 / @react-three/drei 9.122.0 / three 0.159.0 (R3F教室)
mermaid/domPurify/nanoid override: patched版固定
```

### 開発ツール
```
Vitest 4.0.13 (テスト)
ESLint 9
Zod 4.1.13 (バリデーション)
```

---

## 📁 ディレクトリ構造

```
schoolverse2/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # APIエンドポイント
│   │   ├── dashboard/         # ダッシュボード
│   │   ├── coach/             # AIコーチ
│   │   ├── plan/              # 学習プラン
│   │   ├── notes/             # ノート機能
│   │   ├── mindmap/           # マインドマップ
│   │   ├── quests/            # クエスト
│   │   ├── achievements/      # 実績
│   │   ├── credo/             # クレド
│   │   ├── report/            # 週次レポート
│   │   ├── learning-chat/     # 学習チャット
│   │   ├── user-chat/         # ユーザー間チャット
│   │   ├── curriculum/        # カリキュラム
│   │   ├── profile/           # プロフィール
│   │   ├── settings/          # 設定
│   │   └── xp-history/        # XP履歴
│   ├── components/            # 再利用コンポーネント
│   ├── features/              # 機能別モジュール
│   ├── hooks/                 # カスタムフック
│   ├── lib/                   # ユーティリティ・サービス
│   ├── types/                 # 型定義
│   └── config/                # 設定ファイル
├── prisma/
│   ├── schema.prisma          # DBスキーマ
│   ├── migrations/            # マイグレーション履歴
│   └── seed.js                # シードデータ
├── docs/                      # 設計ドキュメント
├── tests/                     # テストファイル
└── public/                    # 静的ファイル
```

---

## 🗄️ データベースモデル一覧

### ユーザー関連
- `User` - ユーザー基本情報
- `UserProfile` - 設定・プリファレンス
- `UserGoals` - 目標設定
- `UserGameProfile` - ゲーミフィケーション

### 学習関連
- `StudyTask` - タスク（階層構造対応）
- `Note` - ノート・メモ
- `MindMap` / `MindMapNode` / `MindMapEdge` - マインドマップ
- `LearningSession` - 学習セッション
- `LearningChatSession` / `LearningChatMessage` - 学習チャット

### ゲーミフィケーション
- `XpTransaction` - XP取引履歴
- `QuestDefinition` / `QuestProgress` - クエスト
- `AchievementDefinition` / `UserAchievement` - 実績
- `AIGeneratedQuest` - AI生成クエスト
- `SkillDefinition` / `UserSkill` - スキルツリー

### コミュニケーション
- `ChatRoom` / `ChatRoomMember` / `ChatRoomMessage` - ユーザーチャット
- `ChatMessage` - AIコーチチャット

### バーチャル教室（DB準備済み）
- `VirtualRoom` - 仮想教室
- `RoomParticipant` - 参加者（位置、アバター、ビデオ/オーディオ状態）
- `Whiteboard` / `WhiteboardSnapshot` - ホワイトボード
- `RoomMessage` - 教室内チャット
- `RoomRecording` - 会議録画
- `AvatarTemplate` - アバター
- `MonsterDefinition` / `MonsterQuestion` - モンスター定義・問題
- `MonsterEncounter` / `UserMonsterStats` - 遭遇・統計
- `SpawnZone` - 出現エリア

### その他
- `CredoItem` / `CredoPracticeLog` - クレド
- `WeeklyReport` - 週次レポート
- `DailyCondition` / `DailyLifeLog` - 生活ログ
- `HabitTracker` / `HabitCompletion` - 習慣トラッカー

---

## 🚀 開発ロードマップ

### Phase 1: MVP（現在）
- [x] 認証システム
- [x] AIコーチ基本機能
- [x] タスク管理
- [x] ノート機能
- [x] ゲーミフィケーション基盤
- [x] クレドシステム
- [ ] カリキュラム詳細
- [ ] テストカバレッジ向上

### Phase 2: 拡張（予定）
- [ ] バーチャル教室実装
- [ ] モンスターエンカウンター
- [ ] **ビデオ通話（WebRTC）** ⭐核心機能
- [ ] **ホワイトボード共有**
- [ ] 詳細スキルツリー
- [ ] モバイル最適化

### Phase 3: コミュニティ（将来）
- [ ] ブログ・知識共有
- [ ] ピアラーニング
- [ ] 外部リソース連携

---

## 📝 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|----------|
| 2025-12-11 | v0.9.2 | 2Dプレゼンス補間でワープ感軽減／リロード後の位置再送／教室チャットパネルを小型化・可読性改善 |
| 2025-12-11 | v0.9.3 | 教室チャットをモーダル化＆スクロール対応、入力フォーカス時にCanvas3Dを一時停止、既読APIのスロットルと楽観送信改善 |
| 2025-12-11 | v0.9.1 | 3D軽量化（ピクセル比制限・影オフ・机2x3）／RewardToast 演出仕上げ（reduce-motion配慮・サウンド制御） |
| 2025-12-11 | v0.9.0 | バーチャル教室: Supabase Presenceで他プレイヤー表示/人数表示、Canvas3Dリライト（lerp補間・バトル時赤色発光） |
| 2025-12-11 | v0.8.9 | バーチャル教室 Phase2進行（HUD日本語化・タイム制限表示・トースト強化、遭遇リクエスト整備） |
| 2025-12-10 | v0.8.8 | 依存CVEパッチ（Next 15.5.7、mermaid/dompurify/nanoid、drei）／R3F CanvasをSSR無効で統合 |
| 2025-12-10 | v0.8.7 | バーチャル教室API追加（モンスター定義/遭遇/解答） |
| 2025-12-10 | v0.8.6 | バーチャル教室モンスター基盤（スキーマ拡張・種/問題シード、基本情報問題追加） |
| 2025-12-10 | v0.8.5 | ユーザーチャット改善完了（Presence・UI分割・未読・モバイル） |
| 2025-12-10 | v0.8.4 | カリキュラムPhase3完了（XP・実績連携） |
| 2025-12-10 | v0.8.3 | カリキュラムPhase2完了（フロントエンド・タイマー） |
| 2025-12-10 | v0.8.2 | カリキュラムPhase1完了（DB・API・進捗サービス） |
| 2025-12-10 | v0.8.1 | カリキュラム詳細設計書作成 |
| 2025-12-10 | v0.8.0 | 進捗管理README作成、全体75%到達 |
| 2025-12-03 | v0.7.0 | バーチャル教室DBスキーマ追加 |
| 2025-12-03 | v0.6.0 | AI生成デイリークエスト実装 |
| 2025-12-03 | v0.5.0 | ゲーミフィケーションモデル追加 |
| 2025-12-02 | v0.4.0 | ユーザーチャット基盤 |
| 2025-12-02 | v0.3.0 | 学習チャットセッション |
| 2025-12-01 | v0.2.0 | マインドマップ・OCR・AI分析 |
| 2025-11-28 | v0.1.0 | ノート機能追加 |
| 2025-11-25 | v0.0.1 | 初期構築 |

---

## 🔧 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 型チェック
npm run type-check

# リント
npm run lint

# テスト実行
npm run test

# DBマイグレーション
npx prisma migrate dev

# DBシード
npm run db:seed

# Prismaクライアント生成
npx prisma generate
```

---

## 📞 お問い合わせ

開発者: 池田裕樹

---

*このファイルは開発進捗管理のために定期的に更新されます。*
