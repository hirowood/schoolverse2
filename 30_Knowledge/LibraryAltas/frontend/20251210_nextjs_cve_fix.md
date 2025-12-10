# Next.js / React RSC 系 CVE 対応ログ（Knowledgeカード）

path: 30_Knowledge/LibraryAltas/frontend/20251210_nextjs_cve_fix.md  
tags: [security, nextjs, react, dependency-update]

---

## 0. スナップショット

- **日時**: 2025-12-10
- **対象プロジェクト**: Next.js アプリ（React Server Components 利用）
- **目的**: Next.js / React Server Components 周りの **CVE 脆弱性対応**
- **作業概要**: `fix-react2shell-next` ツールで依存関係を一括アップデート

---

## 1. 何をしたか（What）

`fix-react2shell-next` ツールを使い、React 公式アドバイザリに基づいて、脆弱なバージョンのパッケージを **安全なバージョンへ自動更新** した。

更新されたパッケージ（全て安全なバージョンへ更新済み）：

- `next`
- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

プロジェクト内の **すべての `package.json` をスキャン** し、該当パッケージのバージョンを修正。

---

## 2. なぜやったか（Why）

- Next.js / React Server Components 周りに、**リモートコード実行などの可能性を含む CVE 脆弱性** が発表されたため。
- 公開アプリ・今後公開予定のアプリで、**既知の脆弱性を放置しない**ため。
- 将来の自分が
  - 「このプロジェクトはこの日に脆弱性対応済み」と説明できるようにするため。
  - セキュリティ関連の対応履歴をログとして残す習慣を作るため。

---

## 3. どうやったか（How）

1. `fix-react2shell-next` ツールを実行
2. ツールが各 `package.json` をスキャンし、Next.js / React RSC 関連パッケージのバージョンを確認
3. React 公式アドバイザリに基づき、**脆弱なバージョン → 修正版バージョン** へ書き換え
4. 依存関係の整合性を保ったまま、すべての対象パッケージを更新
5. その後（※ここは要実施）
   - `npm install` or `pnpm install` で lock ファイル再生成
   - `npm run lint` / `npm run test` / `npm run build` などでビルド確認

---

## 4. 5W2H で整理

- **What**  
  Next.js / React Server Components 周りの CVE 対応として、該当パッケージを安全なバージョンに更新。

- **Why**  
  既知のセキュリティホールを塞ぎ、将来のトラブル（情報漏えい・不正アクセスなど）のリスクを下げるため。

- **Who**  
  自分（開発者）。React 公式アドバイザリ＆ `fix-react2shell-next` ツールを参照。

- **When**  
  2025-12-10（CVE 情報を確認後のタイミング）。

- **Where**  
  ローカル開発環境の Next.js プロジェクト（複数の `package.json` を持つモノレポの可能性あり）。

- **How**  
  自動更新ツール `fix-react2shell-next` を実行し、Next / react-server-dom-* のバージョンを書き換えたうえで、依存関係を再インストールする流れ。

- **How much**  
  作業時間は数十分規模（ツール実行＋インストール＋ビルド確認）。将来のセキュリティ事故回避コストを考えると「投資」としてはかなり効率が良い。

---

## 5. 仮説（5本）

1. **H1: 既存コードへの影響は小さい**  
   - パッチは主にセキュリティと内部挙動に関する修正であり、API 互換性は基本的に維持されている可能性が高い。

2. **H2: 一部の RSC / Route Handler / App Router 周りで微妙な挙動差が出る可能性**  
   - キャッシュ・ストリーミング・エラーハンドリング周りで挙動が変わるかもしれない。

3. **H3: `react-server-dom-*` 系のバージョン不整合があると、ビルド時 or 実行時にエラーになる可能性**  
   - Next / React / react-server-dom-* のバージョンはセットで揃える必要がある。

4. **H4: 今回の対応をきっかけに、今後も「CVE 情報 → 早めのパッチ適用」という流れを習慣化できる**  
   - セキュリティ対応の「最初の一歩」として良い成功体験になる。

5. **H5: 将来、採用面談などで「脆弱性対応をちゃんとやっている開発姿勢」として話せるネタになる**  
   - 「依存パッケージの脆弱性情報をキャッチして、実際にログを残しながら対応した経験」として語れる。

---

## 6. 今後やること（Next Actions）

1. 依存関係のインストール / 再インストール
   - `npm install` or `pnpm install` を実行し、lock ファイルを更新。

2. 最低限の確認
   - `npm run dev` でローカル起動し、
     - トップページ
     - API Route / Route Handler
     - 主要な画面遷移
     をざっと動かしてエラーが出ないか確認。

3. 可能ならテスト・ビルド
   - `npm run test`（用意していれば）
   - `npm run build` でビルドが通るかを確認。

4. Git ログに残す
   - コミットメッセージ例：  
     `chore: update Next.js and RSC deps for CVE fixes`

5. この md を `30_Knowledge/LibraryAltas/frontend` に保存し、  
   「セキュリティ対応の履歴 & 再利用できる知識カード」として使い回す。
