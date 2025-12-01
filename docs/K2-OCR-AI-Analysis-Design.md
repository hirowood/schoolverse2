# K2群: OCR + AI分析機能 詳細設計書

## 📅 作成日: 2025年12月1日
## 📄 バージョン: 1.0
## 🎯 対象期間: Week 36-37

---

## 1. 機能概要

### 1.1 目的

```
【ゴール】
画像から文字を自動認識し、AIが内容を分析・要約・タグ付けすることで、
学習ノートの作成効率と振り返り品質を大幅に向上させる

【ユーザーストーリー】
- 生徒として、教科書やプリントの写真を撮ると自動でテキスト化したい
- 生徒として、ノートの内容をAIに要約してもらいたい
- 生徒として、学習内容に自動でタグが付くと後で探しやすい
- 生徒として、手書きメモも認識して記録に残したい
```

### 1.2 機能一覧

| ID | 機能名 | 説明 | 優先度 |
|----|--------|------|--------|
| K2-001 | 画像OCR精度向上 | 前処理・後処理で認識精度を改善 | 🔴 P0 |
| K2-002 | AI内容分析 | OCRテキストの意味解析・構造化 | 🔴 P0 |
| K2-003 | AI要約生成 | 長文を簡潔に要約 | 🔴 P0 |
| K2-004 | 自動タグ付け | 学習分野・キーワードの自動抽出 | 🔴 P0 |
| K2-005 | 手書き認識強化 | 日本語手書き文字の認識改善 | 🟡 P1 |
| K2-006 | 数式認識 | LaTeX形式での数式抽出 | 🟡 P1 |
| K2-007 | 表・図解析 | 表形式データの構造化抽出 | 🟢 P2 |

---

## 2. システムアーキテクチャ

### 2.1 処理フロー

```
┌─────────────────────────────────────────────────────────────────┐
│                        OCR + AI分析フロー                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  画像    │───▶│  前処理      │───▶│  OCR処理     │───▶│  後処理      │
│  入力    │    │  (Canvas)    │    │  (Tesseract) │    │  (テキスト)  │
└──────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                      │                    │                    │
                      ▼                    ▼                    ▼
                 ・リサイズ            ・日本語+英語        ・ノイズ除去
                 ・コントラスト調整    ・信頼度スコア       ・改行整形
                 ・傾き補正            ・文字座標           ・誤字修正候補
                 ・ノイズ除去          
                                                              │
                                                              ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  自動タグ    │◀───│  要約生成    │◀───│  内容分析    │◀───│  AI処理      │
│  付け        │    │              │    │              │    │  (Claude)    │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
       │                  │                    │
       ▼                  ▼                    ▼
  ・教科分類          ・3行要約            ・文書タイプ判定
  ・キーワード抽出    ・重要ポイント       ・構造解析
  ・難易度推定        ・学習アドバイス     ・関連トピック
```

### 2.2 コンポーネント構成

```
src/
├── components/notes/
│   ├── OcrProcessor.tsx          # 既存: OCR処理UI
│   ├── OcrEnhanced.tsx           # 新規: 強化版OCR（前処理付き）
│   ├── AiAnalyzer.tsx            # 新規: AI分析UI
│   └── AutoTagger.tsx            # 新規: 自動タグ表示
│
├── lib/ocr/
│   ├── preprocessor.ts           # 新規: 画像前処理
│   ├── postprocessor.ts          # 新規: テキスト後処理
│   └── recognizer.ts             # 新規: OCRラッパー
│
├── lib/ai/
│   ├── analyzer.ts               # 新規: AI分析ロジック
│   ├── summarizer.ts             # 新規: 要約生成
│   └── tagger.ts                 # 新規: 自動タグ付け
│
└── app/api/notes/
    ├── [id]/
    │   ├── ocr/route.ts          # 既存: OCRテキスト保存
    │   ├── analyze/route.ts      # 新規: AI分析API
    │   └── tags/route.ts         # 新規: タグ管理API
    └── ocr-analyze/route.ts      # 新規: OCR+分析一括API
```

---

## 3. データベース設計

### 3.1 スキーマ変更

```prisma
// prisma/schema.prisma に追加

model Note {
  // 既存フィールド...
  
  // K2群: OCR + AI分析用フィールド
  ocrRawText      String?   @db.Text    // OCR生テキスト
  ocrConfidence   Float?                 // OCR信頼度スコア (0-1)
  aiSummary       String?   @db.Text    // AI生成要約
  aiAnalysis      Json?                  // AI分析結果 (構造化データ)
  autoTags        String[]  @default([]) // 自動生成タグ
  analyzedAt      DateTime?              // 分析実行日時
}

model OcrHistory {
  id            String   @id @default(cuid())
  noteId        String
  note          Note     @relation(fields: [noteId], references: [id], onDelete: Cascade)
  imageUrl      String   @db.Text
  rawText       String   @db.Text
  confidence    Float
  processedText String?  @db.Text
  createdAt     DateTime @default(now())
  
  @@index([noteId])
}
```

### 3.2 AI分析結果のJSON構造

```typescript
// lib/ai/types.ts

export interface AiAnalysisResult {
  // 文書タイプ
  documentType: "教科書" | "プリント" | "手書きノート" | "問題集" | "その他";
  
  // 教科分類
  subject: {
    main: string;      // 例: "数学"
    sub?: string;      // 例: "二次関数"
    confidence: number;
  };
  
  // 構造解析
  structure: {
    hasTitle: boolean;
    hasList: boolean;
    hasFormula: boolean;
    hasTable: boolean;
    paragraphCount: number;
  };
  
  // キーポイント
  keyPoints: string[];  // 最大5つ
  
  // 関連トピック
  relatedTopics: string[];
  
  // 難易度
  difficulty: {
    level: 1 | 2 | 3 | 4 | 5;  // 1=基礎, 5=発展
    reason: string;
  };
  
  // 学習アドバイス
  studyAdvice: string;
}

export interface AutoTagResult {
  tags: Array<{
    name: string;
    type: "subject" | "topic" | "keyword" | "difficulty";
    confidence: number;
  }>;
}
```

---

## 4. API設計

### 4.1 エンドポイント一覧

| メソッド | エンドポイント | 説明 |
|----------|---------------|------|
| POST | `/api/notes/ocr-analyze` | 画像からOCR+AI分析を一括実行 |
| POST | `/api/notes/[id]/analyze` | 既存ノートをAI分析 |
| GET | `/api/notes/[id]/analysis` | 分析結果を取得 |
| POST | `/api/notes/[id]/tags` | タグを追加 |
| DELETE | `/api/notes/[id]/tags/[tag]` | タグを削除 |
| POST | `/api/notes/[id]/regenerate-tags` | タグを再生成 |

### 4.2 API詳細

#### POST `/api/notes/ocr-analyze`

```typescript
// リクエスト
{
  imageData: string;       // Base64画像データ
  noteId?: string;         // 既存ノートに追加する場合
  options?: {
    enhanceImage: boolean; // 画像前処理を行うか
    generateSummary: boolean;
    generateTags: boolean;
    language: "jpn" | "eng" | "jpn+eng";
  }
}

// レスポンス
{
  success: true;
  data: {
    ocrText: string;
    confidence: number;
    summary: string;
    analysis: AiAnalysisResult;
    suggestedTags: string[];
    processingTime: number; // ms
  }
}
```

#### POST `/api/notes/[id]/analyze`

```typescript
// リクエスト
{
  content?: string;  // 分析対象テキスト（省略時はノートのcontentを使用）
  options?: {
    regenerateSummary: boolean;
    regenerateTags: boolean;
  }
}

// レスポンス
{
  success: true;
  data: {
    summary: string;
    analysis: AiAnalysisResult;
    tags: string[];
    analyzedAt: string;
  }
}
```

---

## 5. 画像前処理アルゴリズム

### 5.1 前処理パイプライン

```typescript
// lib/ocr/preprocessor.ts

export interface PreprocessOptions {
  resize?: { maxWidth: number; maxHeight: number };
  contrast?: number;      // 1.0 = 変更なし
  brightness?: number;    // 0 = 変更なし
  sharpen?: boolean;
  denoise?: boolean;
  deskew?: boolean;       // 傾き補正
  binarize?: boolean;     // 二値化
}

export async function preprocessImage(
  imageData: string,
  options: PreprocessOptions = {}
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // 1. 画像読み込み
  const img = await loadImage(imageData);
  
  // 2. リサイズ（大きすぎる画像の処理速度改善）
  const { width, height } = calculateSize(img, options.resize);
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);
  
  // 3. グレースケール変換
  const imageData = ctx.getImageData(0, 0, width, height);
  toGrayscale(imageData);
  
  // 4. コントラスト調整
  if (options.contrast) {
    adjustContrast(imageData, options.contrast);
  }
  
  // 5. シャープ化
  if (options.sharpen) {
    sharpenImage(imageData);
  }
  
  // 6. ノイズ除去
  if (options.denoise) {
    medianFilter(imageData);
  }
  
  // 7. 二値化（Otsu's method）
  if (options.binarize) {
    otsuBinarize(imageData);
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}
```

### 5.2 推奨設定

```typescript
// 文書タイプ別の推奨設定
export const PREPROCESS_PRESETS = {
  // 印刷物（教科書・プリント）
  printed: {
    resize: { maxWidth: 2000, maxHeight: 2000 },
    contrast: 1.2,
    sharpen: true,
    denoise: false,
    binarize: false,
  },
  
  // 手書きノート
  handwritten: {
    resize: { maxWidth: 2500, maxHeight: 2500 },
    contrast: 1.4,
    sharpen: true,
    denoise: true,
    binarize: true,
  },
  
  // 写真（斜め撮り等）
  photo: {
    resize: { maxWidth: 3000, maxHeight: 3000 },
    contrast: 1.3,
    sharpen: true,
    denoise: true,
    deskew: true,
    binarize: false,
  },
};
```

---

## 6. AI分析プロンプト設計

### 6.1 内容分析プロンプト

```typescript
// lib/ai/prompts/analyze.ts

export function buildAnalyzePrompt(text: string): string {
  return `あなたは学習コンテンツ分析の専門家です。
以下のテキストを分析し、JSON形式で結果を返してください。

## 分析対象テキスト
${text}

## 出力形式（必ずこのJSON形式で返してください）
{
  "documentType": "教科書" | "プリント" | "手書きノート" | "問題集" | "その他",
  "subject": {
    "main": "教科名",
    "sub": "単元名（あれば）",
    "confidence": 0.0-1.0
  },
  "structure": {
    "hasTitle": true/false,
    "hasList": true/false,
    "hasFormula": true/false,
    "hasTable": true/false,
    "paragraphCount": 数値
  },
  "keyPoints": ["重要ポイント1", "重要ポイント2", ...],  // 最大5つ
  "relatedTopics": ["関連トピック1", ...],  // 最大3つ
  "difficulty": {
    "level": 1-5,
    "reason": "理由"
  },
  "studyAdvice": "この内容を学習する際のアドバイス（100文字以内）"
}

注意：
- 日本の中学・高校レベルを基準に難易度を判定
- 教科が特定できない場合は confidence を低くする
- JSON以外の出力は不要`;
}
```

### 6.2 要約生成プロンプト

```typescript
// lib/ai/prompts/summarize.ts

export function buildSummarizePrompt(text: string, maxLength: number = 200): string {
  return `以下のテキストを${maxLength}文字以内で要約してください。

## 要約のルール
1. 最も重要な情報を優先
2. 専門用語はそのまま使用
3. 箇条書きではなく自然な文章で
4. 学習者が復習時に役立つ内容

## 対象テキスト
${text}

## 出力
要約文のみを出力してください（説明や前置きは不要）。`;
}
```

### 6.3 自動タグ付けプロンプト

```typescript
// lib/ai/prompts/tagger.ts

export function buildTaggerPrompt(text: string): string {
  return `以下のテキストから学習に役立つタグを抽出してください。

## タグのカテゴリ
1. subject: 教科・科目（例：数学、英語、物理）
2. topic: 単元・トピック（例：二次関数、関係代名詞）
3. keyword: 重要キーワード（例：微分、エネルギー保存）
4. difficulty: 難易度（基礎/標準/発展）

## 対象テキスト
${text}

## 出力形式（JSON）
{
  "tags": [
    { "name": "タグ名", "type": "subject|topic|keyword|difficulty", "confidence": 0.0-1.0 },
    ...
  ]
}

注意：
- タグは合計10個以内
- 日本語で出力
- confidence 0.7未満は除外`;
}
```

---

## 7. UI/UX設計

### 7.1 強化版OCRモーダル

```
┌─────────────────────────────────────────────────────────────┐
│  📸 画像からテキストを抽出                              ✕  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │              [画像プレビュー]                       │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📋 画像タイプを選択                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │ 📄 印刷物 │ │ ✍️ 手書き │ │ 📷 写真  │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
│                                                             │
│  ⚙️ オプション                                              │
│  ☑️ 画像を自動補正する                                      │
│  ☑️ AI分析・要約を生成する                                  │
│  ☑️ 自動タグ付けを行う                                      │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ⏳ 処理中... (ステップ 2/4: テキスト認識)          │    │
│  │ ████████████████░░░░░░░░░░░░░░░░░░░░  45%         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                              [キャンセル]  [🚀 処理開始]    │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 分析結果表示

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 AI分析結果                                          ✕  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📝 抽出テキスト                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 二次関数 y = ax² + bx + c のグラフは放物線と呼ば   │   │
│  │ れ、a > 0 のとき下に凸、a < 0 のとき上に凸の形...  │   │
│  └─────────────────────────────────────────────────────┘   │
│  信頼度: ████████████░░░ 87%                                │
│                                                             │
│  ──────────────────────────────────────────────────────    │
│                                                             │
│  📊 分析結果                                                │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 📚 教科: 数学 > 二次関数                           │    │
│  │ 📄 文書タイプ: 教科書                              │    │
│  │ 📈 難易度: ★★★☆☆ 標準                            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  💡 要約                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 二次関数のグラフの特徴について説明。aの符号によっ  │   │
│  │ て凸の向きが決まり、頂点の座標は...                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🏷️ 提案タグ                                                │
│  [数学] [二次関数] [グラフ] [放物線] [標準]                 │
│                                                             │
│  💬 学習アドバイス                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 頂点の公式を覚えた後、実際にグラフを書く練習をす   │   │
│  │ ると理解が深まります。                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [タグを編集]  [再分析]        [キャンセル]  [保存する]     │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 ノート一覧でのタグ表示

```
┌─────────────────────────────────────────────────────────────┐
│ 📝 二次関数の基礎                           2024/12/01    │
├─────────────────────────────────────────────────────────────┤
│ テンプレート: 自由記述 ・ 画像: 2件 ・ AI分析済み ✓        │
│                                                             │
│ 二次関数のグラフについて学習した内容をまとめた...          │
│                                                             │
│ 🏷️ [数学] [二次関数] [グラフ] [標準]                       │
│                                                             │
│ 💡 AI要約: 二次関数y=ax²+bx+cのグラフは放物線で、aの符号   │
│ によって凸の向きが決まる。頂点の座標は(-b/2a, ...)         │
│                                                             │
│ [編集] [キャンバス] [🎓 AIコーチ] [🔍 再分析] [削除]        │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. 実装タスク

### Week 36: OCR精度向上 + 基盤整備

| 日 | タスク | 工数 |
|----|--------|------|
| Day 1 | 画像前処理モジュール実装 (preprocessor.ts) | 4h |
| Day 2 | テキスト後処理モジュール実装 (postprocessor.ts) | 3h |
| Day 3 | 強化版OCRコンポーネント作成 (OcrEnhanced.tsx) | 4h |
| Day 4 | Prismaスキーマ更新 + マイグレーション | 2h |
| Day 5 | OCR一括処理API実装 (/api/notes/ocr-analyze) | 4h |
| Day 6 | テスト + バグ修正 | 3h |
| Day 7 | バッファ | - |

### Week 37: AI分析機能

| 日 | タスク | 工数 |
|----|--------|------|
| Day 1 | AI分析プロンプト設計 + ロジック実装 | 4h |
| Day 2 | 要約生成機能実装 | 3h |
| Day 3 | 自動タグ付け機能実装 | 3h |
| Day 4 | 分析結果表示UIコンポーネント作成 | 4h |
| Day 5 | ノート一覧へのタグ・要約表示統合 | 3h |
| Day 6 | 既存ノート一括分析機能 | 2h |
| Day 7 | 統合テスト + ドキュメント | 3h |

---

## 9. リスクと対策

| リスク | 影響 | 対策 |
|--------|------|------|
| OCR精度が低い | ユーザー体験低下 | 画像タイプ別の前処理プリセット提供 |
| AI API コスト増加 | 運用費増 | 分析はオプション化、キャッシュ活用 |
| 処理時間が長い | UX低下 | プログレス表示、バックグラウンド処理 |
| 手書き認識精度 | 日本語手書きは難しい | ユーザーに編集機能を提供 |

---

## 10. 成功指標

| 指標 | 目標値 | 測定方法 |
|------|--------|----------|
| OCR認識精度 | 印刷物90%以上 | テストデータセットで評価 |
| 処理時間 | 10秒以内 | API応答時間の計測 |
| タグ精度 | 80%以上が適切 | ユーザーのタグ修正率 |
| 利用率 | 50%のノートでOCR利用 | 分析ログ |

---

## 付録: 技術スタック

| 領域 | 技術 |
|------|------|
| OCR | Tesseract.js v6 (jpn + eng) |
| 画像処理 | Canvas API |
| AI分析 | Claude API (Sonnet) |
| UI | React + Tailwind CSS |
| 状態管理 | React useState/useCallback |
| API | Next.js App Router |
| DB | Prisma + PostgreSQL |

---

**以上**
