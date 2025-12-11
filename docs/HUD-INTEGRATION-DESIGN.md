# HUD本番統合 詳細設計サマリー (2025-12-11)

## ゴール
- バーチャル教室の遭遇/回答/結果フローを一貫したHUDで本番化
- 位置/ゾーン/バトル状態をZustandで一元管理し、3DとHUDを疎結合に連携
- 勝敗演出（confetti/shake）と報酬トーストを組み込み、体験を強化

## アーキテクチャ
```
useVirtualRoomStore (Zustand)
  - playerPosition, currentZone
  - encounterId, monster, question, result
  - isBattleActive, showConfetti, showShake
  - actions: setPosition, setZone, startEncounter, answerEncounter, resetBattle, triggerAutoEncounter

Canvas3D
  - WASD/FPS移動 → setPosition
  - 簡易ゾーン判定 → setZone → triggerAutoEncounter(30%, 4.5sクールダウン)

BattleHUD
  - カテゴリ選択＋遭遇開始 / リセット
  - BattleOverlay表示 / RewardToast表示
  - 状態ラベル（待機/ロード/バトル中）

Effects
  - ConfettiEffect (勝利時)
  - ShakeEffect (失敗時)
  - ZoneIndicator (現在ゾーン表示)
```

## 状態・データ
- playerPosition: {x,y,z} をCanvas3Dから同期
- currentZone: 簡易ルールで算出（例: x>2 → frontend, x<-2 → backend, z>2 → infra, z<-2 → react, center → fullstack, else thinking）
- encounter: `/api/monster/encounter` に position / category / playerLevel を送信
- answer: `/api/monster/answer` に encounterId / answer を送信
- result: { isCorrect, xpEarned, bonusXpEarned, coinsEarned } → showConfetti / showShake を決定
- auto encounter: triggerAutoEncounter(zone) が 30% 確率、4.5s クールダウンで発火

## 画面構成
- Canvas3D: 画面全幅、FPSカメラ、WASD移動、2Dトグル
- BattleHUD: 固定下部バー（カテゴリ選択、遭遇開始、リセット、状態表示）
- BattleOverlay: 問題表示（MC/入力）、結果表示（日本語）、制限時間ラベル
- RewardToast: 勝利/失敗を日本語で表示、XP/Bonus/Coins 表示、閉じるボタン
- ZoneIndicator: 現在ゾーンを右下に表示
- ConfettiEffect: 勝利時の紙吹雪、ShakeEffect: 失敗時の揺れ

## 実装ファイル
- `src/stores/useVirtualRoomStore.ts` （新規）: Zustandストア
- `src/components/virtual-classroom/Effects/ConfettiEffect.tsx` （新規）
- `src/components/virtual-classroom/Effects/ShakeEffect.tsx` （新規）
- `src/components/virtual-classroom/HUD/ZoneIndicator.tsx` （新規）
- `src/components/virtual-classroom/HUD/BattleHUD.tsx` （更新・ストア連携）
- `src/components/virtual-classroom/Room3D/Canvas3D.tsx` （位置・ゾーン同期、オート遭遇トリガ）
- `src/app/virtual-classroom/page.tsx` （揺れ/紙吹雪/ゾーン表示統合）
- `src/app/virtual-classroom/demo/page.tsx` （新ストア版デモ）

## 未完了 / 今後
- HUDと3Dの演出（着地・攻撃モーション）追加
- モンスター3Dスプライト/アニメの導入（R3F or three.jsで軽量に）
- 報酬アニメーションを段階的カウントアップ＋サウンドに拡張
- 正式ゾーン設計（座標→ゾーン判定をデータ駆動に）
- プレイヤーレベル/ロードアウトUI連携
