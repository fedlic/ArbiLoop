# ArbiLoop (アービループ)

## 言語
- やり取りは日本語で行うこと

## コンセプト
「日本で買って、世界へ繋ぐ（Loop）」
外国人観光客が日本でポケカBOXをスキャンし、日本免税価格と海外相場（タイ: SASOM/Shopee/Lazada, グローバル: eBay）を瞬時に比較して利益を算出するツール。

## 最優先事項
**API使用量とコストの最小化** — 既存VPS資産を最大限活用する。

## インフラ
- 実行環境: さくらのVPS (Ubuntu/CentOS) + 既存 PostgreSQL (CardMapJP)
- フロントエンド: Next.js (App Router) + Tailwind CSS
- ORM: Prisma
- DB: PostgreSQL (さくらのVPS)

## APIコスト削減ルール
1. **キャッシュ層**: 外部API（eBay）やスクレイピング（SASOM/Shopee）の結果はDBに最低24時間キャッシュ。無駄なリクエストを遮断。
2. **オンデバイス・スキャン**: ブラウザ側でJANコード（バーコード）を認識。Vision API等の課金リクエストを回避。
3. **為替レート**: 1日1回のバッチ取得に限定。全計算でその固定値を使用。

## コア機能
- 商品特定: バーコードスキャン優先。自前DBのJANコードと照合。
- 利益シミュレーター: (海外相場 - 日本免税価格 - 手数料 - 送料) = 純利益
- 現地価格投稿: マニラ・バンコク遠征時に現地販売価格をDBへ直接投稿・更新

## UI方針
- プロ仕様のダークモードを基調
- 通貨切り替え: THB / USD / JPY 対応

## 技術スタック
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Prisma (PostgreSQL)
- Playwright (スクレイピング用 - サーバーサイドのみ)
