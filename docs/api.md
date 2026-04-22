# Inventory Management API ドキュメント

## 概要

OUTLINE 在庫管理システムのバックエンド API。メンズアパレルセレクトショップの在庫管理に使用。

## 認証

すべての `/api/*` エンドポイントは API キー認証が必要。

```
Header: X-API-Key: <your-api-key>
```

認証失敗時は `401 { "error": "Unauthorized" }` を返す。

## ベース URL

- 本番: `https://inventory-management-api.seekseep.workers.dev`
- ローカル: `http://localhost:8787`

## エンドポイント一覧

### カテゴリ (Item Categories)

| Method | Path                        | 説明         |
| ------ | --------------------------- | ------------ |
| GET    | `/api/item-categories`      | カテゴリ一覧 |
| GET    | `/api/item-categories/{id}` | カテゴリ詳細 |
| POST   | `/api/item-categories`      | カテゴリ作成 |
| PUT    | `/api/item-categories/{id}` | カテゴリ更新 |
| DELETE | `/api/item-categories/{id}` | カテゴリ削除 |

**レスポンス例:**

```json
{
  "id": "cat-tops",
  "parentId": null,
  "name": "トップス",
  "description": "トップスカテゴリ",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### 商品 (Items)

| Method | Path              | 説明     |
| ------ | ----------------- | -------- |
| GET    | `/api/items`      | 商品一覧 |
| GET    | `/api/items/{id}` | 商品詳細 |
| POST   | `/api/items`      | 商品作成 |
| PUT    | `/api/items/{id}` | 商品更新 |
| DELETE | `/api/items/{id}` | 商品削除 |

**フィールド:**

- `name` (string, required) - 商品名
- `sku` (string, required, unique) - SKU コード
- `description` (string | null) - 説明
- `color` (string | null) - 色
- `size` (string | null) - サイズ
- `type` (enum: `staple` | `seasonal` | `limited`) - 商品タイプ
- `status` (enum: `draft` | `active` | `on_sale` | `discontinued`) - ステータス
- `season` (string | null) - シーズン
- `price` (integer) - 価格（整数）
- `itemCategoryId` (string) - カテゴリ ID

### ロケーション (Locations)

| Method | Path                  | 説明             |
| ------ | --------------------- | ---------------- |
| GET    | `/api/locations`      | ロケーション一覧 |
| GET    | `/api/locations/{id}` | ロケーション詳細 |
| POST   | `/api/locations`      | ロケーション作成 |
| PUT    | `/api/locations/{id}` | ロケーション更新 |
| DELETE | `/api/locations/{id}` | ロケーション削除 |

**フィールド:**

- `name` (string, required) - 名前
- `type` (enum: `store` | `warehouse`) - タイプ
- `address` (string | null) - 住所

### 在庫 (Inventories)

| Method | Path                    | 説明     |
| ------ | ----------------------- | -------- |
| GET    | `/api/inventories`      | 在庫一覧 |
| GET    | `/api/inventories/{id}` | 在庫詳細 |
| PUT    | `/api/inventories/{id}` | 在庫更新 |

**クエリパラメータ (GET一覧):**

- `locationId` - ロケーションで絞り込み
- `itemId` - 商品で絞り込み

**フィールド:**

- `itemId` (string) - 商品 ID
- `locationId` (string) - ロケーション ID
- `quantity` (integer) - 在庫数
- `safetyStock` (integer) - 安全在庫数

### 取引 (Transactions)

| Method | Path                     | 説明                 |
| ------ | ------------------------ | -------------------- |
| GET    | `/api/transactions`      | 取引一覧             |
| GET    | `/api/transactions/{id}` | 取引詳細（明細含む） |
| POST   | `/api/transactions`      | 取引作成             |

**取引タイプと必須フィールド:**

- `purchase` (仕入): `toLocationId` のみ
- `transfer` (移動): `fromLocationId` + `toLocationId`
- `sale` (販売): `fromLocationId` のみ
- `disposal` (廃棄): `fromLocationId` のみ

**詳細レスポンス例:**

```json
{
  "id": "tx-001",
  "fromLocationId": null,
  "toLocationId": "loc-warehouse-main",
  "type": "purchase",
  "note": "仕入メモ",
  "createdAt": "2025-01-01T00:00:00Z",
  "items": [
    {
      "id": "ti-001",
      "transactionId": "tx-001",
      "itemId": "item-001",
      "quantity": 100
    }
  ]
}
```

### 棚卸 (Snapshots)

| Method | Path                  | 説明                 |
| ------ | --------------------- | -------------------- |
| GET    | `/api/snapshots`      | 棚卸一覧             |
| GET    | `/api/snapshots/{id}` | 棚卸詳細（明細含む） |
| POST   | `/api/snapshots`      | 棚卸作成             |

**明細フィールド:**

- `itemId` (string) - 商品 ID
- `quantity` (integer) - 実数（実際のカウント）
- `expectedQuantity` (integer) - 理論値（システム上の数量）

差異 = `quantity - expectedQuantity`

## 共通仕様

- すべての ID は UUID v4 形式
- 日時は ISO 8601 形式（例: `2025-01-01T00:00:00Z`）
- null 許容フィールドは `null` を返す（空文字ではない）
- Swagger UI: `/docs`
- OpenAPI JSON: `/openapi.json`
