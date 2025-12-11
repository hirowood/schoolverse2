# FINAL MVP 詳細設計書

> Schoolverse2 を MVP 完了状態に到達させるための最終統合計画  
> 作成日: 2025-12-11 / ステータス: 設計完了・実装中  
> 対象期間: 12-15 日（バッファ込み）

---

## 1. ゴール / 完了基準
- **学習体験**: カリキュラム → レッスン → 問題解答 → XP/実績反映までノンストップで完走できる。
- **バーチャル教室**: 3D/2D 切替、WASD + マウス視点、ゾーンで自動遭遇、HUD と同期、他プレイヤー表示。
- **ゲーミフィケーション**: XP 付与が UserGameProfile と XpTransaction に確実に反映、実績判定が走る、フロント通知。
- **安定性**: `npm run build` / `npm run lint` / E2E スモークが通る。主要ページ 5 画面が 500/JS エラーなし。
- **運用性**: 既知の CVE 対応済み（Next/React/R3F/mermaid/domPurify/nanoid）、Node 24 でビルド可能。

---

## 2. スコープ
### 2.1 機能スコープ（必須）
- カリキュラム: 一覧 / ライン詳細 / レッスン詳細（学習タイマー・進捗送信）
- バーチャル教室: Canvas3D (three.js) + HUD + Monster Encounter API 連携
- ゲーミフィケーション: XP/実績判定、Reward Toast、Confetti/Shake 演出
- チャット: ユーザーチャット Presence/未読、UX 分割（既に完了）
- 認証/設定: NextAuth + プロファイル更新、最低限のオンボード

### 2.2 非スコープ（MVP後）
- 本格 3D アセット/モーション、マルチルーム UI、コミュニティ機能、スマホ最適化の細部

---

## 3. 進捗サマリ
- ✅ カリキュラム Phase1-3 完了（DB/API/FE/タイマー/XP 実績連携）
- ✅ ユーザーチャット刷新（Presence・入力中・未読・モバイル）
- ✅ バーチャル教室 Phase2: 軽量 Canvas3D + HUD 統合 + 他プレイヤー描画
- ✅ ゲーミフィケーション: XP/実績サービス・モックから実データ化
- ⚠️ 残: 報酬演出の微調整 / AI 問題品質向上 / スモーク自動テスト

---

## 4. アーキテクチャ（最終像）
```
Client (Next.js App Router)
├─ Curriculum pages (/curriculum/*)
├─ Virtual Classroom (/virtual-classroom)
│   ├─ Canvas3D (three.js, FPS view, 2D fallback)
│   ├─ BattleHUD (encounter/answer, RewardToast, timers)
│   └─ Presence (Supabase Realtime, other players draw)
├─ Gamification toasts (XP, Achievements)
└─ User Chat (Presence, unread)

Server (Next.js API Routes / Prisma)
├─ /api/monster/encounter, /answer, /definitions
├─ /api/gamification/* (XP, achievements, profile)
├─ /api/curriculum/* (lines, lessons, progress)
└─ /api/user-chat/* (rooms, unread, read)

DB (PostgreSQL / Prisma)
├─ MonsterDefinition / MonsterQuestion / MonsterEncounter
├─ SpawnZone / UserMonsterStats
├─ AchievementDefinition / UserAchievement / XpTransaction
└─ CurriculumLine / Lesson / UserLessonProgress
```

---

## 5. タスク詳細（残実装中心）
| 優先 | タスク | 概要 | 目安 |
|---|---|---|---|
| 高 | 報酬演出仕上げ | RewardToast 数字カウント精度、サウンドON/OFF、色覚配慮 | 0.5d |
| 高 | AI問題品質 | プロンプト調整 + 10問/カテゴリ 追加 | 1.0d |
| 中 | 3D軽量最適化 | デスク数削減/LOD、バトル時負荷確認 | 0.5d |
| 中 | スモークテスト | vitest/Playwright で主要 5 画面遷移と API 正常系 | 0.5d |
| 低 | モバイル微調整 | 3D 高さ可変、HUD ボタン間隔 | 0.5d |

---

## 6. 依存関係・前提
- Supabase Realtime 環境（URL/ANON KEY）設定済みであること
- Node 24 / npm 10 でビルド（Vercel は Node 24 オーバーライドを許容）
- `.env.local` に Monster API と NextAuth シークレットが入っていること

---

## 7. リスクと対策
| リスク | 影響 | 対策 |
|---|---|---|
| AI問題品質が低い | 学習価値低下 | 手動問題 10問/カテゴリを追加し最低保証 |
| 3D描画パフォーマンス | モバイルで FPS 低下 | デスク数削減・shadow 無効・canvas サイズ制限 |
| Supabase 接続失敗 | マルチプレイヤー不可 | Presence 無効フォールバック（他プレイヤー非表示で継続） |
| XP/実績二重付与 | メトリクス汚染 | API 側で idempotent 処理＆トランザクション |

---

## 8. 品質保証
- Lint/Build: `npm run lint`, `npm run build`
- API スモーク: `/api/monster/encounter`, `/answer`, `/gamification/profile`
- E2E ライト: 仮) Playwright で `/virtual-classroom` → 遭遇 → 解答まで通ることを確認
- モバイル確認: 375px ビューポートで HUD ボタン押下可能

---

## 9. ローンチ手順
1. `.env.local` 最終確認（Supabase / NextAuth / OpenAI/Claude キー）
2. `npm install && npm run lint && npm run build`
3. Vercel で **Clear build cache** してデプロイ（Node 24）
4. 手動スモーク（/dashboard, /curriculum, /virtual-classroom, /user-chat）
5. ログ監視（Next.js / Vercel ログ、Supabase 500 有無）

---

## 10. 付録：チェックリスト
- [ ] 3D Canvas: WASD + マウス視点、2D 切替が動く
- [ ] 他プレイヤー表示: 色付きキューブ＋名前ラベル、バトル時赤発光
- [ ] 自動遭遇: ゾーン移動で 30% 発火（クールダウン 4.5-10s）
- [ ] XP/実績: 完了時に UserGameProfile.totalXp, XpTransaction, 実績が更新
- [ ] トースト: 勝利=緑/紙吹雪、敗北=オレンジ/揺れ、数値カウントアップ
- [ ] ビルド: `npm run build` 通過
- [ ] デプロイ: Vercel 本番で 500/JS エラーなし
