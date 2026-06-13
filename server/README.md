# Tasmil Finance Backend Service

A production-grade, highly optimized NestJS backend service powering the **Tasmil Finance Dashboard**—a decentralized finance (DeFi) platform offering smart routing, portfolio tracking, token swapping, and voice-assisted intent execution on the **Aptos blockchain**.

The service integrates real-time and historical financial market data via Financial Modeling Prep (FMP) APIs, provides signature-based Web3 authentication, manages securely encrypted Aptos client wallets in a PostgreSQL-backed Supabase vault, and implements a resilient caching system using Redis to guarantee high throughput, strict rate-limiting compliance, and instant responsiveness.

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
  - [Running in Development](#running-in-development)
  - [Running in Production](#running-in-production)
  - [Docker Configuration](#docker-configuration)
- [Environment Variables](#environment-variables)
- [API Modules](#api-modules)
- [Caching Strategy](#caching-strategy)
- [Database & Cryptography Layer](#database--cryptography-layer)
- [Available Scripts](#available-scripts)
- [Deployment Workflow](#deployment-workflow)

---

## Project Overview

Tasmil Finance Backend serves as the bridge between decentralized blockchain protocols, external financial index providers, and the web client.

* **Business Purpose**: Provide a secure, lightning-fast dashboard that tracks crypto and equity market indices, resolves blockchain transaction errors, generates and manages hot wallets for instant transactions, and processes natural language user intents.
* **External API Integration**: Integrates with the Financial Modeling Prep (FMP) API to deliver live stock/crypto ticker prices, historical charting data, and performance comparisons. It handles external requests via a strict queuing mechanism to guarantee compliance with API limits.
* **PostgreSQL (Supabase)**: Serves as the primary persistence layer, specifically leveraging PostgreSQL RPC function procedures to store and retrieve encrypted client wallet credentials without exposing critical keys to the database logs or schema.
* **Redis Caching**: Intercepts queries to external market data APIs, storing quotes and price history with dynamic Time-To-Live (TTL) strategies. This reduces external network overhead, bypasses API rate limits, and lowers response times to sub-10ms.
* **Frontend Interaction**: Authenticates sessions using Ed25519 wallet signatures. If signature checks succeed, it issues stateless JWT tokens packaged inside secure, `HttpOnly`, and `SameSite` cookies to prevent Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF).

---

## Tech Stack

The backend uses a modern, TypeScript-based technology stack selected for security, high throughput, and developer ergonomics:

* **Framework**: NestJS (v11) - modular structure, dependency injection, and clean separation of concerns.
* **Language**: TypeScript (v5.7) - strong typing for robust, self-documenting code.
* **Database & Persistence**: PostgreSQL (via Supabase v2 SDK) - database access relies on a secure SQL function RPC abstraction rather than standard ORMs like Prisma/TypeORM, providing tighter control over queries and secret handling.
* **In-Memory Store**: Redis (via `redis` v5, `keyv` v5, `@keyv/redis` and NestJS `@nestjs/cache-manager` v3) - key-value store utilized for multi-instance distributed caching.
* **API Documentation**: Swagger (via `@nestjs/swagger` & `swagger-ui-express`) - available at `/api/docs` in development.
* **Process Manager**: PM2 (configured via `ecosystem.config.js`) - cluster-mode multi-process runner with auto-restart policies.
* **Web3 & Blockchain**: 
  - `@aptos-labs/ts-sdk` - Aptos Network client for address verification and transactions.
  - `@merkletrade/ts-sdk` & `@pontem/liquidswap-sdk` - integrations with liquid pools and leverage trade routers.
  - `@pythnetwork/pyth-aptos-js` - oracle-based price verification.
* **AI & LLM Integration**: `@langchain/core` & `@langchain/openai` - frameworks used for processing voice-guided inputs and interpreting user transaction intents.
* **Cryptography**: `node-forge` - symmetric encryption (AES-256-CBC) and password-based key derivation (PBKDF2).

---

## System Architecture

The service uses NestJS modular architecture. Global guards, pipes, and middlewares intercept incoming requests before delegating them to feature controllers, services, and external client adaptors.

### Architecture Diagram

```
                              ┌──────────────────┐
                              │    Web Client    │
                              └──────────────────┘
                                       │
                         HTTP Requests │ Credentials Cookie
                                       ▼
                     ┌────────────────────────────────────┐
                     │            NestJS API              │
                     │  (Global Route Throttler Guard)    │
                     │  (Global Cookie-based JWT Guard)   │
                     │  (Global DTO Validation Pipe)      │
                     └────────────────────────────────────┘
                                │              │
           Read/Write Secrets   │              │ Read/Write Cache
                                ▼              ▼
            ┌───────────────────────┐      ┌─────────────────────────┐
            │   Supabase Client     │      │   Redis Cache Service   │
            │   (PostgreSQL RPC)    │      │   (Keyv Cache Manager)  │
            └───────────────────────┘      └─────────────────────────┘
                        │                              │
         Saves/Loads    │                              │ [Cache Miss]
         Encrypted      ▼                              ▼
         Aptos Keys ┌───────────────┐      ┌─────────────────────────┐
                    │Supabase Vault │      │    FmpApiService Queue  │
                    └───────────────┘      │(250 req/min Throttler)  │
                                           └─────────────────────────┘
                                                       │
                                        Outgoing HTTP  │ (Exponential Backoff)
                                                       ▼
                                           ┌─────────────────────────┐
                                           │ Financial Modeling Prep │
                                           │        (FMP) API        │
                                           └─────────────────────────┘
```

### Architectural Pillars

1. **Modular Architecture**: Application concerns are isolated into independent, self-contained modules (`RedisModule`, `AuthModule`, `AccountsModule`, `DashboardModule`). Each manages its own controllers and dependency-injected services.
2. **Controllers**: Pure routing layers. They consume incoming payloads, delegate logic validation, configure HTTP-only cookies, and respond with unified JSON shapes.
3. **Services**: Contain business-specific algorithms. For example, `DashboardService` coordinates market calculations, while `FmpApiService` throttles rate limits.
4. **Repositories / Data Layer**: Abstracted by custom database connectors. The `VaultSupabase` class manages raw SQL RPC procedure executes (`insert_secret`, `read_secret`) to isolate access logic.
5. **DTO Validation**: Every endpoint payload maps to a typed Data Transfer Object (DTO) class. NestJS's global `ValidationPipe` intercepts requests and enforces validation constraints (using `class-validator`) before execution.
6. **External API Integration**: Bounded by a rate-limiting queue processor inside `FmpApiService`. The queue prevents HTTP status `429` errors by scheduling requests within FMP's 250 requests/minute limit, supported by exponential backoff auto-retries.
7. **Caching Layer**: Configured globally using `@nestjs/cache-manager` and `keyv`. The `RedisCacheService` abstracts caching, automatically serializing and deserializing payloads.

---

## Folder Structure

Below is the repository structure of the `/server` workspace:

```text
server/
├── .cursorrules           # IDE-specific system instructions and rules
├── .editorconfig          # Consistent coding styles across IDEs
├── .env                   # Configuration file containing secrets & settings (FMP, Supabase, Redis, JWT)
├── .gitignore             # Excluded files from version control
├── .husky/                # Git commit hooks for linting and code formatting
├── .prettierrc            # Code formatter preferences
├── ecosystem.config.js    # PM2 Process Manager deployment & clustering configuration
├── eslint.config.mjs      # Linter configurations for code syntax quality
├── nest-cli.json          # NestJS CLI build and workspace settings
├── package.json           # Node.js dependencies and lifecycle scripts
├── pnpm-lock.yaml         # Pnpm dependency lock file
├── tsconfig.json          # TypeScript compiler configuration
├── tsconfig.build.json    # TS build compiler overrides for production output
├── uploads/               # Local folder for file attachments and uploads
│
├── src/                   # Application source files
│   ├── main.ts            # Entrypoint file. Configures CORS, prefix, cookieParser, validations, and Swagger
│   ├── app.controller.ts  # Root level controller exposing application ping/health check
│   ├── app.service.ts     # Root level service delivering system uptime and status
│   ├── app.module.ts      # Root module connecting Config, Throttler, Redis, Auth, and feature modules
│   │
│   ├── dashboard/         # Dashboard Module (market data computations, charting, comparisons)
│   │   ├── api/           # Gateway adapters for external platforms
│   │   │   ├── fmp.ts     # FMP Client (request batching, rate-limiting queue, and retry policies)
│   │   ├── interface/     # Typing definitions and response structures
│   │   ├── service/       # Business services aggregating market indexes and cache checks
│   │   ├── utils/         # Date calculations and interval converters
│   │   ├── dashboard.controller.ts # REST controller for market overview, history, and comparison queries
│   │   └── dashboard.module.ts     # Binds services, controller, and cache providers
│   │
│   ├── redis/             # Caching Infrastructure Module
│   │   ├── connection/    # Socket configuration, reconnect strategies, and validations
│   │   ├── services/      # Cache abstraction wrapper (del, get, set, verify)
│   │   └── redis.module.ts# Global DynamicModule configuring Async CacheModule with Keyv-Redis
│   │
│   ├── supabase/          # Supabase Database Module
│   │   ├── client.ts      # Connects and validates Supabase credentials
│   │   ├── vault.ts       # Database secret management utilizing Supabase RPC functions (insert_secret, read_secret)
│   │   └── index.ts       # Module entry point exports
│   │
│   ├── utils/             # Cross-cutting system helpers
│   │   ├── decrypt.ts     # Symmetric decryption helper (PBKDF2 + AES-256-CBC)
│   │   ├── encrypt.ts     # Symmetric encryption helper (PBKDF2 + AES-256-CBC)
│   │   ├── token.ts       # Registry of supported Aptos Tokens, pool addresses, and decimals
│   │   ├── aptosAgent.ts  # Bootstraps an Aptos Client instance with user's decrypted credentials
│   │   ├── contract-error-handler.ts # Resolves and formatting smart contract failure trace logs
│   │   ├── function.ts    # Miscellaneous helper calculations
│   │   └── input.ts       # Validation DTO classes (e.g., GenerateWalletDto)
│   │
│   └── wallet/            # Web3 Wallet Module
│       ├── guard/         # Authentication layer (Signature verification, JWT creation)
│       │   ├── service/   # AuthService validating Ed25519 signatures and nonces
│       │   ├── auth.controller.ts # Nonce request, sign verify, and logout endpoints
│       │   ├── auth.module.ts     # Binds JWT, Passport, and AuthService
│       │   └── jwt-auth.guard.ts  # Middleware validating HttpOnly cookie-based tokens
│       ├── entities/      # Request and response structures for cryptography logic
│       ├── accounts.controller.ts  # Accounts routes (checking user existence, generating wallets)
│       ├── accounts.module.ts      # Encapsulates accounts imports
│       └── accounts.ts    # Accounts logic (Aptos address creation and local DB encryption wrappers)
│
└── test/                  # Automated integration/E2E test files
    ├── app.e2e-spec.ts    # E2E health check tests
    └── jest-e2e.json      # Jest settings configuration for E2E tests
```

---

## Getting Started

### Prerequisites

Ensure you have the following software installed on your local environment:
* **Node.js**: Version `>= 22.x`
* **Package Manager**: `pnpm` (highly recommended, as the project uses workspace locking)
* **Redis Server**: Local instance or remote URL (running on port `6379`)
* **Supabase Project**: Set up a Supabase account with an enabled database

### Installation

Clone the repository and run the installation script from the `/server` directory:

```bash
cd server
pnpm install
```

### Environment Setup

Create an environment configuration file in the root of the `/server` folder:

```bash
cp .env.example .env
```

Open `.env` and configure the values. Ensure you fill in `PASSWORD_ENCRYPT`, `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_ROLE_KEY`, and `FMP_KEY`.

### Running in Development

Start the NestJS application in development watch mode. The server listens for changes and hot-reloads automatically:

```bash
pnpm run start:dev
```

Once running, you can access the interactive Swagger API documentation at `http://localhost:5000/api/docs`.

### Running in Production

To build and execute the optimized compilation artifact:

1. **Compile TypeScript**:
   ```bash
   pnpm run build
   ```
2. **Execute Locally**:
   ```bash
   pnpm run start:prod
   ```
3. **Run using PM2 Process Clustering**:
   ```bash
   pnpm run pm2:start:prod
   ```

---

### Docker Configuration

To run the NestJS server and Redis in a fully containerized environment, use the configurations below.

#### 1. Dockerfile
Create a file named `Dockerfile` in the `/server` directory:

```dockerfile
# --- BUILD STAGE ---
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency configuration files
COPY package.json pnpm-lock.yaml ./

# Install development dependencies
RUN pnpm install --frozen-lockfile

# Copy application source files
COPY . .

# Compile NestJS typescript files to javascript
RUN pnpm run build

# Remove development packages, keep only production ones
RUN pnpm prune --prod

# --- PRODUCTION STAGE ---
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copy built files and production dependencies from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json

EXPOSE 5000

CMD ["node", "dist/main"]
```

#### 2. Docker Compose Configuration
Create a file named `docker-compose.yml` in the `/server` directory:

```yaml
version: '3.8'

services:
  tasmil-server:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: tasmil-finance-server
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - REDIS_HOST=tasmil-redis
      - REDIS_PORT=6379
      - PASSWORD_ENCRYPT=${PASSWORD_ENCRYPT}
      - JWT_SECRET=${JWT_SECRET}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ROLE_KEY=${SUPABASE_ROLE_KEY}
      - FMP_KEY=${FMP_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - tasmil-redis
    restart: always

  tasmil-redis:
    image: redis:7-alpine
    container_name: tasmil-finance-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    restart: always

volumes:
  redis-data:
```

#### 3. Execution
Launch the multi-container system in detached mode:

```bash
docker compose up -d --build
```

---

## Environment Variables

The server uses the following environment variables, configured in your `.env` file:

| Variable | Type / Default | Description |
| :--- | :--- | :--- |
| `PORT` | `number` (Default: `5000`) | The HTTP port the NestJS server will listen on. |
| `NODE_ENV` | `string` (`development` / `production`) | Running environment. Determines whether cookie delivery requires HTTPS (`secure: true`). |
| `PASSWORD_ENCRYPT` | `string` (Required) | Key passphrase used by `node-forge` to derive the AES symmetric cipher for client private key encryption. |
| `JWT_SECRET` | `string` (Required) | Signing secret key used to issue and authenticate client-side JWT cookies. |
| `OPENAI_API_KEY` | `string` (Optional) | API Token for OpenAI. Required to interpret user voice prompts and trade intent logic. |
| `SUPABASE_URL` | `string` (Required) | Endpoint URL of your Supabase database instance. |
| `SUPABASE_ROLE_KEY` | `string` (Required) | Service role API key for your Supabase project (used to execute DB vault procedures). |
| `FMP_KEY` | `string` (Required) | API developer token from Financial Modeling Prep. |
| `REDIS_HOST` | `string` (Default: `localhost`) | Host address of your Redis server. |
| `REDIS_PORT` | `number` (Default: `6379`) | Port number of your Redis server. |
| `REDIS_USERNAME` | `string` (Optional) | Redis username for authenticated connections. |
| `REDIS_PASSWORD` | `string` (Optional) | Redis password for authenticated connections. |
| `REDIS_DEFAULT_TTL` | `number` (Default: `300`) | Fallback cache duration in seconds. |
| `REDIS_MAX_ITEMS` | `number` (Default: `100`) | Max items stored in the internal CacheManager map. |
| `TWITTER_BEARER_TOKEN` | `string` (Optional) | Access token for Twitter API integrations. |
| `KYBER_API_URL` | `string` (Optional) | Endpoint URL for KyberSwap route aggregator API queries. |
| `KYBER_AGGREGATOR_CLIENT_ID`| `string` (Optional) | Source client identifier for KyberSwap trades. |
| `COINKETGO_API_URL` | `string` (Optional) | Endpoint URL for CoinGecko API integration. |
| `COINKETGO_API_KEY` | `string` (Optional) | API Token for CoinGecko. |
| `MONGODB_URI` | `string` (Optional) | Optional MongoDB fallback database URI string. |

---

## API Modules

### 1. Authentication Module (`AuthModule`)
Manages signature-based, passwordless Web3 authentication.
* **Flow**:
  1. Client sends their public address to `GET /api/auth/get-nonce`.
  2. The server generates a random cryptographically secure hex nonce, stores it in Redis with a 3-minute TTL, and returns it to the client.
  3. The client signs the nonce using their wallet's private key.
  4. Client posts the signature and message details to `POST /api/auth/verify-signature`.
  5. The server retrieves the nonce, validates the signature via Ed25519 cryptography, and issues an HTTP-only JWT cookie (`tasmil-token`).
* **Endpoints**: Nonce requests, signature validation, and secure logouts.

### 2. Market Data Module (`DashboardModule`)
Optimized data provider for crypto and equity metrics.
* **Integrations**: Connects to the FMP API to fetch current market status, price tickers, and comparisons.
* **Optimization**: Uses asynchronous queue structures to prevent API rate limit violations.
* **Endpoints**: Fetches market overview, historical charts, trending assets, and symbol comparisons.

### 3. Accounts / Wallet Module (`AccountsModule`)
Creates and manages hot wallets on the Aptos Mainnet.
* **Flow**:
  1. The client requests wallet verification or generation.
  2. If the user doesn't have an account, the server generates a new Aptos wallet (public key, private key, account address).
  3. The server derives a secure key from the `PASSWORD_ENCRYPT` env variable using PBKDF2 (10,000 iterations), encrypts the private key with AES-CBC, and stores the encrypted payload in the Supabase vault.
  4. Subsequent requests read the ciphertext from the vault and decrypt it on-the-fly to execute blockchain operations.
* **Endpoints**: Verification checks and wallet generation.

---

## Caching Strategy

To ensure high availability and bypass FMP's API limit of 250 requests per minute, the backend implements a caching layer powered by Redis:

* **Caching Layer**: Direct FMP requests are intercepted. If the requested data is in the cache, the server returns the cached values instantly, bypassing external network overhead.
* **Dynamic Time-To-Live (TTL)**:
  * **Real-time Price Quotes**: Cached for **30 seconds** to keep prices accurate.
  * **Market Overviews**: Cached for **1 minute** to capture short-term shifts.
  * **1-Day Historical Price Charts**: Cached for **5 minutes** (300 seconds).
  * **1-Week Historical Price Charts**: Cached for **10 minutes** (600 seconds).
  * **Longer Historical Charts (1M to 1Y)**: Cached for **30 minutes** (1800 seconds).
  * **Trending Lists / Comparisons**: Cached for **5 minutes** (300 seconds).
* **Multi-Instance Cluster Coordination**: Storing the cache in Redis allows multiple clustered instances (e.g., PM2's 4 workers) to share the cache, preventing redundant API calls.
* **Fallback Strategy**: If the Redis client goes offline:
  1. The server logs the connection failure.
  2. The system bypasses the cache, sending requests directly to the FMP API.
  3. The FmpApiService queue regulates the throughput to prevent rate limits.

---

## Database & Cryptography Layer

Database security is optimized to protect client wallets:

### Database Storage
The backend uses PostgreSQL hosted on Supabase. To secure private keys, the server does not use typical ORM tables. Instead, it interacts with the database through remote procedure calls (RPC):
* `insert_secret(secret_name, secret_value)`: Stores the encrypted wallet secret.
* `read_secret(secret_name)`: Retrieves the encrypted secret using the client's wallet address.

### Cryptographic Security Flow
Private keys are never stored in plaintext. The encryption process works as follows:

```
[Generate Wallet] ──► Private Key (Plaintext)
                             │
                             ▼
[PBKDF2 Derivation] ──► 10,000 Iterations + Salt + PASSWORD_ENCRYPT
                             │
                             ▼
                      Derived 32-byte Key
                             │
                             ▼
[AES-CBC Encryption] ◄─ Derived Key + 16-byte IV
                             │
                             ▼
                       Ciphertext (Base64)
                             │
                             ▼
[Supabase RPC] ──► insert_secret(Address, JSONString(Ciphertext, Salt, IV))
```

This security mechanism ensures that even with direct database access, a compromised database will only reveal encrypted payloads. Decrypting the keys requires the server's unique `PASSWORD_ENCRYPT` key.

---

## Available Scripts

Manage the server using these commands defined in `package.json`:

```bash
# Compilation & Execution
pnpm run build            # Compile TypeScript code into production ready JavaScript in /dist
pnpm run start            # Start the NestJS application directly
pnpm run start:dev        # Start the application in hot-reload watch mode (dev)
pnpm run start:debug      # Start the application with V8 inspector debugging active
pnpm run start:prod       # Execute the compiled files from /dist/main

# Process Clustering (PM2)
pnpm run pm2:start        # Start the server with clustering under PM2
pnpm run pm2:start:prod   # Start PM2 processes with production environment overrides
pnpm run pm2:stop         # Stop all active tasmil-finance-server processes
pnpm run pm2:restart      # Perform a hard restart on tasmil-finance-server processes
pnpm run pm2:reload       # Perform a zero-downtime hot reload on PM2 instances
pnpm run pm2:delete       # Remove tasmil-finance-server from the PM2 registry
pnpm run pm2:logs         # Stream PM2 output and error logs in real-time
pnpm run pm2:monit        # Open the terminal-based CPU/Memory monitor for PM2
pnpm run pm2:status       # List all active PM2 processes and their stats
pnpm run pm2:save         # Freeze the active PM2 process list for auto-boot recovery
pnpm run pm2:resurrect    # Restore the PM2 process list saved by the save command

# Code Quality & Format
pnpm run format           # Automatically format all TypeScript files using Prettier
pnpm run lint             # Scan source files using ESLint and fix formatting issues

# Testing
pnpm run test             # Run Jest unit tests
pnpm run test:watch       # Run Jest unit tests in watch mode
pnpm run test:cov         # Run tests and output coverage reports to /coverage
pnpm run test:debug       # Run tests with node-inspector debugger enabled
pnpm run test:e2e         # Execute integration and E2E tests configured in the test folder
```

---

## Deployment Workflow

The service supports two primary deployment pathways:

### 1. Clustered PM2 Deployment (Zero-Downtime)
The system is configured to scale across 4 CPU cores using PM2 clustering:
* **Ecosystem Configuration**: Defined in `ecosystem.config.js`. Under cluster mode, PM2 manages load balancing and distributes incoming requests across the workers.
* **Auto-restart Policies**:
  * **Memory Ceiling**: Restarts a worker if memory usage exceeds `1GB` (`max_memory_restart: '1G'`).
  * **Cron Restart**: Automatically restarts instances daily at 2:00 AM (`cron_restart: '0 2 * * *'`) to clean memory leaks.
* **Git-based Deployment Pipeline**:
  Deploy changes directly to your production server by running:
  ```bash
  pm2 deploy production
  ```
  This command logs into the remote server, pulls the latest code from GitHub, installs production dependencies, compiles the code, and reloads the PM2 instances with zero downtime.

### 2. Containerized Docker Deployment
For deployments using Docker, Kubernetes, or cloud platforms:
1. Ensure your production environment file is configured on the host server.
2. Build and run the service using Docker Compose:
   ```bash
   docker compose up -d --build
   ```
This command starts a Redis container to handle caching and launches the NestJS service. The NestJS container connects to Redis internally using Docker's bridge network.
