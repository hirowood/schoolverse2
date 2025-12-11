# HUD本番統合 + マルチプレイヤー 詳細設計書

> 目的: バーチャル教室の3D環境とバトルHUDを完全統合し、他プレイヤーとのリアルタイム同期を実現してMVP完成レベルに到達する  
> 作成日: 2025-12-11  
> 見積工数: 約12時間（マルチプレイヤー含む）  
> 前提: Phase1（DB・シード）完了、Phase2（API）一部完了、Supabase Realtime環境構築済み

---

## 📋 目次
1. 現状分析  
2. 実装タスク一覧  
3. タスク1: HUD本番統合  
4. タスク2: 座標同期  
5. タスク3: 報酬演出強化  
6. タスク4: 勝利/敗北エフェクト  
7. タスク5: マルチプレイヤー同期  
8. ファイル変更一覧  
9. 実装スケジュール  
10. テスト計画  

---

## 1. 現状分析

### 1.1 既存コンポーネント構成
```
src/
├── app/virtual-classroom/
│   ├── page.tsx              # メインページ（Canvas3D + BattleHUD）
│   └── demo/page.tsx         # デモページ（API動作確認用）
│
├── components/virtual-classroom/
│   ├── Battle/
│   │   └── BattleOverlay.tsx # バトルUI（問題表示、選択肢）
│   ├── HUD/
│   │   ├── BattleHUD.tsx     # 遭遇開始ボタン + Overlay + Toast
│   │   └── RewardToast.tsx   # 報酬表示トースト
│   └── Room3D/
│       ├── Canvas3D.tsx      # 3D教室（three.js軽量版）
│       └── Canvas3DErrorBoundary.tsx
│
└── hooks/
    ├── useVirtualEncounter.ts # 遭遇・解答APIフック
    ├── usePresence.ts         # グローバルオンライン状態（参考）
    └── useRoomPresence.ts     # ルーム入力中状態（参考）
```

### 1.2 現在の問題点
| 問題 | 詳細 | 影響 |
|------|------|:----:|
| 座標未連携 | positionが固定値{x:0,y:0,z:0} | カテゴリ別出現が機能しない |
| 自動遭遇なし | ボタン押下でのみ遭遇開始 | ゲーム性が低い |
| 報酬演出が弱い | シンプルなトーストのみ | 達成感が薄い |
| 状態共有なし | Canvas3DとBattleHUDが独立 | 連携できない |
| シングルプレイヤー | 他ユーザーが見えない | 孤独感がある |

#### 実装メモ (2025-12-11)
- ZustandストアとCanvas3D/BattleHUDを統合し、ゾーン検知→30%自動遭遇を実装
- Supabase Presenceを介した他プレイヤー表示（キューブ＋名前ラベル、バトル時赤発光、lerp補間）
- RewardToastカウントアップ＋簡易サウンド、Shake/Confetti演出を組み込み済み

### 1.3 目標状態（UXフロー）
1. プレイヤーが3D教室を移動（WASD）  
2. 他プレイヤーのアバターがリアルタイムで見える  
3. スポーンゾーンに入ると自動でモンスター出現  
4. BattleOverlayで問題に回答（他プレイヤーにバトル中表示）  
5. 正解 → confetti + XP/Coins演出 / 不正解 → 画面揺れ + 解説表示  
6. 探索再開  

---

## 2. 実装タスク一覧
| # | タスク | 見積 | 優先 | 依存 |
|---|--------|:----:|:----:|:----:|
| 1 | HUD本番統合（状態共有・自動遭遇） | 3h | 高 | - |
| 2 | 座標同期（プレイヤー位置→API） | 2h | 高 | 1 |
| 3 | 報酬演出強化（confetti・数字アニメ） | 2h | 中 | 1,2 |
| 4 | 勝利/敗北エフェクト（画面揺れ・色変化） | 1h | 中 | 1,2 |
| 5 | マルチプレイヤー同期（Supabase Presence） | 4h | 高 | 1,2 |

合計: 12時間

---

## 3. タスク1: HUD本番統合（完了）
- Zustandストアで3DとHUDを連携（位置、ゾーン、遭遇、結果、演出フラグ）
- ゾーン移動で30%確率の自動遭遇（クールダウン10s）
- startEncounterで位置・カテゴリ・プレイヤーレベルをAPI送信

## 4. タスク2: 座標同期（完了）
- Canvas3Dからプレイヤー座標をストアへ同期
- startEncounter/Presenceでpositionを送信（後続のマルチプレイヤーでも使用）

## 5. タスク3: 報酬演出強化（完了）
- confetti導入（canvas-confetti、3連射）
- RewardToastを勝利/敗北表記＋XP/Bonus/Coins表示
- 数字カウントアップ（簡易、後続で拡張余地）

## 6. タスク4: 勝利/敗北エフェクト（完了）
- ShakeEffectで敗北時に画面揺れ（CSS animation）
- カラー変化はトースト背景で表現（勝利=緑系、敗北=オレンジ系）

## 7. タスク5: マルチプレイヤー同期（完了）
- Supabase Presenceで他プレイヤーの位置/状態を共有
- Canvas3Dに他プレイヤーのアバターを表示（色付きキューブ＋名前ラベル）
- バトル中は赤く光るエフェクト
- HUDにオンライン人数、他プレイヤーのバトル中リストを表示

---

## 8. ファイル変更一覧
### 8.1 新規作成
- `src/stores/useVirtualRoomStore.ts` — Zustand状態管理
- `src/hooks/useClassroomPresence.ts` — マルチプレイヤー同期（Presence）
- `src/components/virtual-classroom/HUD/ZoneIndicator.tsx` — 現在ゾーン表示
- `src/components/virtual-classroom/HUD/PlayerCountIndicator.tsx` — オンライン人数表示
- `src/components/virtual-classroom/HUD/OtherPlayerBattles.tsx` — 他プレイヤーバトル表示
- `src/components/virtual-classroom/Effects/ConfettiEffect.tsx` — 紙吹雪
- `src/components/virtual-classroom/Effects/ShakeEffect.tsx` — 画面揺れ

### 8.2 修正
- `src/app/virtual-classroom/page.tsx` — Effects統合、マルチプレイヤーHUD
- `src/components/virtual-classroom/Room3D/Canvas3D.tsx` — ストア連携・他プレイヤー描画
- `src/components/virtual-classroom/HUD/BattleHUD.tsx` — ストア移行
- `src/components/virtual-classroom/HUD/RewardToast.tsx` — カウントアップ/日本語化
- `tailwind.config.js` — shake animation追加
- `package.json` — canvas-confetti 追加

---

## 9. 実装スケジュール
### Day 1 (5h)
- useVirtualRoomStore.ts 作成 (1.5h)
- Canvas3D Store連携 (1h)
- BattleHUD Store移行 (1.5h)
- ZoneIndicator 作成 (1h)

### Day 2 (4h)
- useClassroomPresence.ts (2h)
- Canvas3D 他プレイヤー描画 (1.5h)
- PlayerCountIndicator + OtherPlayerBattles (0.5h)

### Day 3 (3h)
- ConfettiEffect (1h)
- RewardToast カウントアップ (1h)
- ShakeEffect + Tailwind (1h)

---

## 10. テスト計画
| テストケース | 期待結果 |
|--------------|----------|
| ゾーン移動で自動遭遇 | 30%確率で遭遇開始 |
| 正解時 confetti | 紙吹雪が3回発射 |
| 不正解時 shake | 画面が0.5秒揺れる |
| 他プレイヤー表示 | 入室した他ユーザーのアバターが見える |
| 位置同期 | 他プレイヤーの移動がリアルタイム反映 |
| バトル状態表示 | 他プレイヤーがバトル中だと赤く光る |

### ✅ 完了基準
- 状態共有: Canvas3DとBattleHUDがZustandで連携  
- 自動遭遇: ゾーン移動で30%確率遭遇  
- 報酬演出: confetti + カウントアップ動作  
- マルチプレイヤー: 他プレイヤーが3D空間に表示される  
- リアルタイム同期: 位置・バトル状態が即座に反映  
