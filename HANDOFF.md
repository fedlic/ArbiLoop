# ArbiLoop 引き継ぎプロンプト (VPS向け)

以下をVPSのClaude Codeに貼り付けてください:

---

## プロンプト

```
あなたはArbiLoop（アービループ）プロジェクトの開発を引き継ぎます。
日本語でやり取りしてください。

## プロジェクト概要
ポケカBOXの日本免税価格と海外相場（eBay/SASOM/Shopee）を比較し、利益を算出するツール。
最優先事項は「API使用量とコストの最小化」。

## 現在の状況
- Next.js 16 + Prisma 6 + Tailwind CSS v4 で初期構築済み
- ビルド確認済み (npm run build 成功)
- GitHub: https://github.com/fedlic/ArbiLoop

## 完了済み
- ディレクトリ構造・全ソースファイル作成
- Prismaスキーマ (Product, PriceCache, ExchangeRate, LocalPrice)
- APIルート (products/[jan], prices/search, prices/local, exchange-rate)
- キャッシュロジック (24h TTL, DB-backed)
- 為替レート (1日1回バッチ取得)
- eBay API スクレイパー (実装済み)
- SASOM / Shopee スクレイパー (Playwright雛形のみ、TODO)
- UIコンポーネント (バーコードスキャナー, 利益カード, 現地価格投稿, 通貨切替)
- ダークモードUI基調

## VPSでやるべきこと（優先順）
1. `git clone` → `npm install` → `.env` にDB接続情報設定 → `npx prisma db push`
2. 既存のCardMapJP DBがあれば、接続情報を確認して `.env` の DATABASE_URL を設定
3. 商品マスタ（JANコード）の初期データ投入（ポケカBOXのJAN一覧）
4. SASOM / Shopee のPlaywrightスクレイパー実装 (src/lib/scrapers/sasom.ts, shopee.ts)
5. `npm run dev` で動作確認
6. 本番デプロイ設定 (pm2 or systemd)

## 技術的な注意点
- Prisma v6 を使用（v7ではない）。スキーマに `url = env("DATABASE_URL")` あり
- package.json の type は "module" (ESM)
- スクレイパーはサーバーサイドのみで実行（Playwrightが必要: npm install playwright && npx playwright install chromium）
- バーコードスキャンはブラウザ側 BarcodeDetector API（APIコスト0）
- 外部API結果は必ず cache.ts 経由で24hキャッシュすること

## CLAUDE.md を必ず読んでから作業を開始してください
```
