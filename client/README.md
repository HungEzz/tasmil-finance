# Tasmil Finance Client Dashboard

A production-grade, highly responsive Next.js frontend application serving as the user interface for **Tasmil Finance**—an AI-powered DeFi portfolio manager, smart swap router, and conversational trading assistant built on the **Aptos blockchain**.

The client features high-performance interactive asset charting, direct Web3 wallet connection, and conversational chat boxes integrated with the Vercel AI SDK to translate natural language inputs (text/voice) into automated blockchain executions.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Local Development](#local-development)
  - [Production Build](#production-build)
- [Environment Variables](#environment-variables)
- [Pages Overview](#pages-overview)
- [Core Features](#core-features)
- [API Integration & Proxies](#api-integration--proxies)
- [Charts & Analytics](#charts--analytics)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)

---

## Project Overview

The Tasmil Finance Client Dashboard provides a premium, real-time interface for tracking DeFi assets, managing portfolios, and executing trades via AI intent models.

* **Frontend Role**: Delivers real-time pricing cards, historical charts, and a conversational terminal where users can query market trends or execute swaps using text or voice.
* **Target Users**: DeFi traders, Web3 wallet owners on the Aptos network, and users seeking a simplified, conversational interface for executing blockchain trades.
* **Core Workflows**:
  1. **Authentication**: Users sign up with an email and password, or proceed as a guest.
  2. **Wallet Connection**: Users connect their Aptos wallet (e.g., Petra, Martian, Pontem, OKX) via the unified wallet adapter.
  3. **Security Signing**: The client signs a secure cryptographic nonce from the NestJS backend to establish a secure cookie-based JWT session.
  4. **Portfolio Tracking**: Users monitor their balances and asset history (BTC, ETH, SOL, APT).
  5. **AI Swaps**: Users converse with the AI agent to interpret trade intents, fetch smart swap routes, and execute transactions.

---

## Tech Stack

The application is built on a modern frontend stack designed for performance, type safety, and real-time responsiveness:

* **Framework**: Next.js (v15 canary) - App Router, React Server Components (RSCs), Middleware, and Partial Prerendering (PPR) enabled.
* **Library**: React (v19 RC) - uses advanced rendering architectures and Concurrent React features.
* **Language**: TypeScript (v5.6) - provides full type safety across components and API requests.
* **Styling**: Tailwind CSS (v4) - utility-first styling with custom animation libraries and animations powered by Framer Motion.
* **State Management**: 
  - **Zustand** (v5) - lightweight, client-side state manager used to persist Web3 states (connected status, address, public key).
  - **SWR** (v2) - handles client-side data fetching, automatic caching, and revalidation.
* **Database & ORM** (Metadata tracking): Drizzle ORM (v0.34) and `drizzle-kit` mapping to Vercel PostgreSQL (via `@vercel/postgres` or local `postgres`).
* **Web3 Integration**:
  - `@aptos-labs/wallet-adapter-react` & `@aptos-labs/wallet-adapter-core` - standard React context providers for connecting Aptos wallets.
  - `@aptos-labs/ts-sdk` - Aptos network interface library.
* **AI Integration**: Vercel AI SDK (`ai` v5, `@ai-sdk/openai`, `@ai-sdk/google`, `@ai-sdk/react`) - streams AI agent token responses and structures chat histories.
* **Charts**: Recharts (v2.15) - SVG-based charting library used to render performance history.
* **UI Primitives**: Radix UI (dialog, select, tooltip, switch, popover) and Shadcn-inspired components.

---

## System Architecture

The client follows Next.js App Router conventions, separating visual page structures, layout providers, server-side routes, and state stores.

```
                              ┌───────────────────────────────────┐
                              │            Web Browser            │
                              └───────────────────────────────────┘
                                   │                     │
                        Interact & │                     │ Connect &
                        Chat Logs  │                     │ Sign Message
                                   ▼                     ▼
                     ┌──────────────────┐      ┌─────────────────────────┐
                     │ Next.js Frontend │      │   Aptos Wallet Adapter  │
                     │ (React 19 / PPR) │      │ (Petra, Martian, etc.)  │
                     └──────────────────┘      └─────────────────────────┘
                               │                            │
                     Client    │                            │ Sign Nonce
                     Queries   │                            ▼
                               ▼                       [Verify Sig]
                     ┌──────────────────┐                   │
                     │  SWR Cache /     │                   │ Set Cookie
                     │  Zustand Store   │                   ▼
                     └──────────────────┘      ┌─────────────────────────┐
                               │               │   Next.js Middleware    │
                     Proxy API │               │    (NextAuth Token)     │
                     Calls     ▼               └─────────────────────────┘
                     ┌──────────────────┐                   │
                     │  Next.js API     │◄──────────────────┘
                     │  Route Proxies   │
                     └──────────────────┘
                               │
                Forward HTTP   │ (NEXT_PUBLIC_API_URL)
                Credentials    ▼
                     ┌──────────────────┐
                     │    NestJS API    │
                     │  (Server Port)   │
                     └──────────────────┘
```

### Key Architectural Patterns

1. **API Proxy Route Isolation**: To protect server routes and credentials, the client never talks to the NestJS backend directly. Instead, it queries Next.js serverless route handlers (`/src/app/api/...`) which forward the request with the secure credentials cookie.
2. **Resilient Mock Fallbacks**: Next.js API routes implement backup systems. If the NestJS backend is offline or returns an error, the proxy returns mock data to keep the dashboard functional.
3. **Reactive State Stores**: Web3 details are stored in a Zustand store. If the user disconnects their wallet, a reactive event resets the store and logs the user out from the backend.
4. **Serverless Database Routing**: Drizzle ORM maps to Vercel PostgreSQL to manage and store NextAuth credentials and metadata.

---

## Folder Structure

Below is the folder structure of the `/client` directory:

```text
client/
├── .next/                 # Next.js build compilation cache folder
├── public/                # Public static assets (images, logos, SVGs, avatars)
├── src/                   # Main source code directory
│   ├── app/               # Next.js App Router directories
│   │   ├── (auth)/        # Authentication routes (login, register)
│   │   │   ├── login/     # Login page view
│   │   │   ├── register/  # Sign up page view
│   │   │   ├── actions.ts # Server Actions for signing and session setup
│   │   │   ├── auth.ts    # NextAuth setup and callbacks
│   │   │   └── auth.config.ts # Core NextAuth configuration
│   │   │
│   │   ├── (main)/        # Main dashboard routes
│   │   │   ├── portfolio/ # Portfolio page and assets manager
│   │   │   ├── components/# Components used in dashboard (Market overview, token card, recharts area graph)
│   │   │   ├── layout.tsx # Layout shell configuring sidebar navigation
│   │   │   └── page.tsx   # Dashboard root page (renders MarketOverview)
│   │   │
│   │   ├── api/           # Serverless API routes (account, auth, dashboard proxies)
│   │   ├── globals.css    # Global stylesheet configuring Tailwind CSS and themes
│   │   └── layout.tsx     # Root layout mapping providers
│   │
│   ├── components/        # Reusable design components
│   │   ├── ui/            # Radix and Shadcn-inspired atomic primitives (button, card, dialog, input, etc.)
│   │   ├── layout/        # App navigation shells, sidebars, headers, and footer components
│   │   ├── wallet/        # Web3 wallet adapters, menus, and connection dialogues
│   │   ├── command-menu.tsx # Keyboard-driven command search palette
│   │   ├── icons.tsx      # SVG icons definition catalog
│   │   ├── theme-provider.tsx # Dark/Light theme injection wrapper
│   │   └── theme-switch.tsx   # Visual toggle for theme switching
│   │
│   ├── constants/         # Static configuration arrays and routing constants
│   │   └── routes.ts      # Paths mapping definition file
│   │
│   ├── context/           # React context providers (e.g., navigation state)
│   │
│   ├── hooks/             # Custom React hooks
│   │
│   ├── lib/               # Utility functions and library setup
│   │   ├── aptos/         # Aptos blockchain helper utils
│   │   └── db/            # Drizzle ORM configuration, migrations, database queries, and schema definitions
│   │
│   ├── providers/         # Next.js client-side provider wrappers
│   │   ├── connection.tsx # Wallet Connection state observer & session controller
│   │   ├── query.tsx      # React Query/TanStack Query client configuration
│   │   └── wallet.tsx     # Aptos wallet adapter provider configuration
│   │
│   ├── services/          # HTTP request wrappers for Next.js APIs (AuthService, AccountService, swap, bridge)
│   │
│   ├── store/             # Zustand global state stores (use-wallet.ts)
│   │
│   └── types/             # Shared TypeScript interfaces
│
├── vercel-template.json   # Vercel deployment metadata template
├── package.json           # Node.js project requirements, metadata, and build scripts
├── tsconfig.json          # TypeScript compilation settings
├── drizzle.config.ts      # Drizzle ORM schema path and output config
├── postcss.config.mjs     # PostCSS setup
├── playwright.config.ts   # Playwright end-to-end testing environment config
└── biome.jsonc            # Linter & Formatter config mapping
```

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
* **Node.js**: Version `>= 22.x`
* **Package Manager**: `pnpm`
* **PostgreSQL Database**: Required for database migrations and metadata logging.

### Installation

Navigate to the `/client` directory and install the dependencies:

```bash
cd client
pnpm install
```

### Environment Setup

Create a `.env.local` file in the root of the `/client` directory:

```bash
cp .env.example .env.local
```

Open `.env.local` and configure the environment variables:

* Set `NEXT_PUBLIC_API_URL` to point to your NestJS server (default: `http://localhost:5000/api`).
* Configure your `POSTGRES_URL` to connect to your database.
* Configure `AUTH_SECRET` for NextAuth session verification.

Run database migrations to initialize tables:

```bash
pnpm run db:generate
pnpm run db:migrate
```

### Local Development

Start the Next.js development server:

```bash
pnpm run dev
```

The application will be available at `http://localhost:3000`.

### Production Build

To build the project for production and start the server:

```bash
pnpm run build
pnpm run start
```

---

## Environment Variables

The client uses the following environment variables:

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `AUTH_SECRET` | Server-only | Secret key used by NextAuth to sign and verify session JWTs. |
| `AI_GATEWAY_API_KEY` | Server-only | Access token used to connect to the Vercel AI Gateway. |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Server-only | Google API key used for Gemini model integrations. |
| `OPENAI_API_KEY` | Server-only | API Key used for OpenAI models and processing voice commands. |
| `BLOB_READ_WRITE_TOKEN` | Server-only | Access token used to upload and download files via Vercel Blob store. |
| `POSTGRES_URL` | Server-only | Connection string used by Drizzle ORM to connect to the database. |
| `NEXT_PUBLIC_API_URL` | Client-facing | Root endpoint of the NestJS server (e.g. `http://localhost:5000/api`). |
| `NEXT_PUBLIC_PASSWORD_ENCRYPT` | Client-facing | Passphrase used to verify wallet encryption settings. |
| `REDIS_URL` | Server-only | Connection string used to connect to the Upstash or Redis cache server. |

---

## Pages Overview

1. **Dashboard (`/`)**: Renders the main dashboard. Shows real-time token cards (BTC, ETH, SOL, APT), price changes, dynamic charting intervals, and detailed statistics.
2. **Portfolio (`/portfolio`)**: Visualizes user assets, balance charts, yield earnings, staking details, and account histories.
3. **Login (`/login`) & Register (`/register`)**: Security screens allowing users to sign up and authenticate before connecting their wallets.
4. **AI Chatbot (`/chat/:id` / `/ai-agent` routing paths)**: Renders the chatbot terminal where users can interact with the AI trading assistant.

---

## Core Features

* **Portfolio Tracking**: Displays aggregated holding values, balance summaries, and returns on Aptos DeFi integrations.
* **Market Analytics**: Detailed real-time quotes, 24h highs/lows, trading volume, average prices, and change percentages.
* **Asset Charts**: Responsive area charts displaying historical price movements with gradients and interactive tooltips.
* **Wallet Integration**: Unified Petra, Martian, Pontem, and OKX adapters enabling one-click login and secure message signing.
* **DeFi Conversational Agent**: High-fidelity AI console allowing users to verify holdings and execute swaps with automated routing.

---

## API Integration & Proxies

### API Client
The frontend uses the fetch API wrapped in services like `AuthService` and `AccountService`. All calls include the `{ credentials: "include" }` setting to ensure cookie-based JWT tokens are passed correctly to the backend:

```typescript
const response = await fetch(`${endpoint}`, {
  ...options,
  headers: {
    "Content-Type": "application/json",
    ...options.headers,
  },
  credentials: "include", // Pass cookies
});
```

### Proxy Handling
To protect backend endpoints, requests are sent to internal Next.js API routes (`/api/...`) which forward the queries to `NEXT_PUBLIC_API_URL`.

### Resilient Fallbacks
If the backend is offline, proxy routes return mock data to keep the UI functional:

```typescript
// Fallback if the backend returns an error
if (!response.ok) {
  const mockOverview = symbols.split(",").map((symbol) => ({
    symbol,
    price: getMockPrice(symbol),
    changePercentage: (Math.random() - 0.5) * 5,
    volume: 50000000,
    timestamp: Math.floor(Date.now() / 1000),
  }));
  return NextResponse.json(mockOverview);
}
```

---

## Charts & Analytics

The charting interface is built with **Recharts**:

* **Rendering**: Renders area charts dynamically using `<ResponsiveContainer>`, `<AreaChart>`, and `<Tooltip>` components.
* **Data Flow**: SWR fetches history arrays. The chart interpolates these values, mapping the price to coordinates based on the timeframe.
* **Performance-based Coloring**: The chart color dynamically adjusts based on price changes:
  - **Positive change**: Emerald green styling (`#10b981`).
  - **Negative change**: Ruby red styling (`#ef4444`).
* **Tooltips**: Display local date strings and format asset values using `Intl.NumberFormat` compact notation.

---

## Available Scripts

Manage the Next.js client using these commands in `package.json`:

```bash
# Local Server Commands
pnpm run dev          # Start the Next.js development server on http://localhost:3000
pnpm run build        # Build the optimized production application bundles
pnpm run start        # Start the Next.js production server

# Code Quality & Formatting
pnpm run lint         # Check code quality and formatting using Biome & Ultracite
pnpm run format       # Automatically fix code formatting and lint errors

# Database Management
pnpm run db:generate  # Generate database migration files based on the Drizzle schema
pnpm run db:migrate   # Apply pending database migrations to the database
pnpm run db:studio    # Open Drizzle Studio in your browser to view database tables
pnpm run db:push      # Push schema changes directly to the database
pnpm run db:pull      # Pull schema info from the database to generate schemas
pnpm run db:check     # Check database schemas for errors
pnpm run db:up        # Upgrade database schema migration files

# Testing
pnpm run test         # Run end-to-end tests using Playwright
```

---

## Deployment

### Vercel Deployment (Recommended)
This project is pre-configured for deployment on Vercel:
1. Connect your GitHub repository to Vercel.
2. In the project settings, configure Vercel Postgres and Vercel Blob.
3. Configure the environment variables in the Vercel dashboard.
4. Vercel will build and deploy the project automatically on push.

### Docker Support
To containerize the Next.js application, add this Dockerfile:

```dockerfile
# --- BUILD STAGE ---
FROM node:22-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
RUN pnpm prune --prod

# --- PRODUCTION RUNNER ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["pnpm", "start"]
```
