# Aganitha Standard Stack — Bun + TypeScript

This project uses the Aganitha standard Bun + TypeScript stack. Do not substitute packages.

## Stack

| Concern | Package |
|---|---|
| Runtime | Bun — TypeScript natively, no build step |
| Structured logs | pino + pino-pretty (dev only) |
| Config | @aganitha/atk-config |
| Debug tracing | @aganitha/atk-debug |
| CLI | commander |
| AI | ai (Vercel AI SDK) + @ai-sdk/openai |

---

## Private registry

`@aganitha` packages are on a private registry. If installation fails, `~/.npmrc` must include:

```
@aganitha:registry=https://npm.aganitha.ai/
//npm.aganitha.ai/:_auth=<base64-encoded-ldap-credentials>
```

Ask the team for credentials if not already configured.

---

## Conventions

Unless the codebase already has these established:

- `src/config.ts` — load and export the app config singleton
- `src/logger.ts` — create and export the shared pino logger instance

---

## @aganitha/atk-config

Internal package — do not guess the API. Read the reference before writing any config code:

`node_modules/@aganitha/atk-config/docs/llms.txt`

Typical `src/config.ts`:

```ts
import { loadConfig } from "@aganitha/atk-config";

export const config = await loadConfig({
  schema: {
    port:     { format: "port",   default: 3000,  env: "PORT" },
    logLevel: { format: ["debug", "info", "warn", "error"] as const,
                                  default: "info", env: "LOG_LEVEL" },
  },
});
```

For Commander integration see the working example at `node_modules/@aganitha/atk-config/examples/11-commander/`.

---

## @aganitha/atk-debug

Internal package — do not guess the API. Read the reference before writing any debug code:

`node_modules/@aganitha/atk-debug/docs/llms.txt`

---

## Pino

Create one shared instance in `src/logger.ts` and import it everywhere. If the codebase already has a logger, use it.

```ts
// src/logger.ts
import pino from "pino";
import { config } from "./config.ts";

export const logger = pino({
  level: config.get("logLevel"),
  transport: process.env.NODE_ENV !== "production"
    ? { target: "pino-pretty" }
    : undefined,
});
```

Use pino for structured request/system logs (always on). Use atk-debug for trace-level developer visibility (namespace-gated, off in production by default).

---

## Vercel AI SDK

```ts
import { generateText, streamText } from "ai";
import { openai } from "@ai-sdk/openai";

const { text } = await generateText({
  model: openai("gpt-4o"),
  prompt: "...",
});
```

Default to `gpt-4o` unless the task requires otherwise.

---

## Bun APIs

Prefer Bun-native APIs — do not reach for Node or third-party equivalents:

| Task | Use | Not |
|---|---|---|
| HTTP server | `Bun.serve()` | express, fastify |
| SQLite | `bun:sqlite` | better-sqlite3 |
| Postgres | `Bun.sql` | pg, postgres.js |
| Redis | `Bun.redis` | ioredis |
| File I/O | `Bun.file()` / `Bun.write()` | fs.readFile / fs.writeFile |
| Shell | `Bun.$\`cmd\`` | execa, child_process |
| WebSocket | built-in `WebSocket` | ws |
| Env vars | auto-loaded from `.env` | dotenv |
