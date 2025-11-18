# ai-exec-os-dashboard

AI OSコア用の管理ダッシュボード。エージェント・ワークフロー・ジョブ・メトリクスを可視化するNext.js製フロント。

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack React Query
- **Icons**: Lucide React

## Features

- **Dashboard**: エージェント数、ワークフロー数、実行ジョブ数などの統計を表示
- **Agents**: エージェント一覧と新規作成・削除機能
- **Workflows**: ワークフロー一覧と手動トリガー機能
- **Jobs**: ジョブ一覧とステータス監視、詳細モーダル表示

## Getting Started

### 前提条件

- Node.js 18.x 以上
- npm または yarn
- ai-exec-os-core が起動していること（デフォルト: http://localhost:8000）

### インストール

```bash
# 依存パッケージのインストール
npm install
```

### 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、必要な環境変数を設定します：

```bash
cp .env.local.example .env.local
```

`.env.local` の内容：

```env
# APIサーバのベースURL（ai-exec-os-core）
NEXT_PUBLIC_CORE_API_BASE_URL=http://localhost:8000

# 環境名（ヘッダーに表示されるバッジ）
# local, staging, production のいずれか
NEXT_PUBLIC_ENVIRONMENT=local
```

### 開発サーバの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開きます。自動的に `/dashboard` にリダイレクトされます。

### ビルド

```bash
# プロダクションビルド
npm run build

# ビルドしたアプリの起動
npm start
```

## ディレクトリ構成

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # ダッシュボードルートグループ
│   │   ├── dashboard/      # ダッシュボードページ
│   │   ├── agents/         # エージェント管理ページ
│   │   ├── workflows/      # ワークフロー管理ページ
│   │   ├── jobs/           # ジョブ監視ページ
│   │   └── layout.tsx      # ダッシュボード共通レイアウト
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # トップページ（リダイレクト）
│   ├── providers.tsx       # React Query プロバイダー
│   └── globals.css         # グローバルスタイル
├── components/
│   ├── layout/             # レイアウトコンポーネント
│   │   ├── sidebar.tsx     # サイドバーナビゲーション
│   │   └── header.tsx      # ヘッダー（環境バッジ含む）
│   └── ui/                 # shadcn/ui コンポーネント
│       ├── button.tsx
│       ├── card.tsx
│       ├── table.tsx
│       ├── dialog.tsx
│       ├── badge.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── loading.tsx
│       ├── status-badge.tsx
│       └── error-message.tsx
├── hooks/                  # React Query カスタムフック
│   ├── useAgents.ts
│   ├── useWorkflows.ts
│   ├── useJobs.ts
│   └── useDashboard.ts
├── lib/
│   ├── apiClient.ts        # API通信ヘルパー
│   └── utils.ts            # ユーティリティ関数
└── types/
    └── index.ts            # 型定義
```

## API連携

このダッシュボードは `ai-exec-os-core` の以下のエンドポイントを想定しています：

- `GET /dashboard/stats` - ダッシュボード統計
- `GET /agents` - エージェント一覧
- `POST /agents` - エージェント作成
- `DELETE /agents/:id` - エージェント削除
- `GET /workflows` - ワークフロー一覧
- `POST /workflows` - ワークフロー作成
- `POST /workflows/:id/trigger` - ワークフロー実行
- `GET /jobs` - ジョブ一覧
- `GET /jobs/:id` - ジョブ詳細

## License

MIT
