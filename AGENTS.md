# AGENTS.md - Project Conventions

## Overview

メンズアパレルセレクトショップ「OUTLINE」の在庫管理ダッシュボードUI。閲覧専用。

## Tech Stack

- TanStack Start (React 19 + Vite 8) with file-based routing
- Tailwind CSS v4 + shadcn/ui (New York style, zinc base)
- TanStack Query for client-side data fetching
- TanStack Table for data tables
- Cloudflare Workers deployment

## Import Alias

- `#/*` → `./src/*` (primary, use this)
- `@/*` → `./src/*` (secondary)

## Formatting (Prettier)

- No semicolons
- Single quotes
- Trailing commas

## Page Naming Convention

- `Dashboard` - ダッシュボード
- `{EntityName}Collection` - 一覧ページ
- `{EntityName}Single` - 詳細ページ

## Route Structure

```
src/routes/
  __root.tsx
  index.tsx              → リダイレクト
  _guest.tsx             → 未認証レイアウト
  _guest/login.tsx       → ログイン
  _authed.tsx            → 認証済みレイアウト（サイドバー + ブレッドクラム）
  _authed/index.tsx      → Dashboard
  _authed/{entity}/
    index.tsx            → Collection
    $id.tsx              → Single
```

## Entities

- ItemCategory, Item, Location, Inventory, Transaction, Snapshot

## Data Fetching

- すべてクライアントサイド (TanStack Query)
- Query key factory pattern: `entityKeys.all`, `entityKeys.list()`, `entityKeys.detail(id)`
- staleTime: 5分（読み取り専用のため）

## Authentication

- API キーを `X-API-Key` ヘッダーで送信
- localStorage に保存して認証状態を保持
- `beforeLoad` で認証チェック（SSR 考慮）

## Current Scope

- 読み取り専用（作成・更新・削除は実装しない）
- タブレット〜デスクトップ対応（スマートフォン対応不要）
- 書き込みUIはデータ量に応じてダイアログで実装予定（将来）

## Component Patterns

- shadcn/ui コンポーネントを使用
- `cn()` ユーティリティでクラス名結合
- lucide-react でアイコン
