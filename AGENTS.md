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

`@aganitha` packages are hosted on a private registry. If installation fails, `~/.npmrc` must include:

```
@aganitha:registry=https://npm.aganitha.ai/
//npm.aganitha.ai/:_auth=<base64-encoded-ldap-credentials>
```

Ask the team for credentials if not already configured.

---

## Conventions

Unless the codebase already has these established, follow this structure:

- `src/config.ts` — load and export the app config singleton
- `src/logger.ts` — create and export the shared pino logger instance

---

## @aganitha/atk-config

This is an internal package — do not rely on training data for its API.

- **Docs**: `node_modules/@aganitha/atk-config/README.md`
- **Full guide**: `node_modules/@aganitha/atk-config/docs/guide.md`
- **Examples**: `node_modules/@aganitha/atk-config/examples/`
- **Commander integration**: `node_modules/@aganitha/atk-config/examples/11-commander/`

Critical rules:

- Every schema leaf requires both `format` and `default` — missing either throws at load time
- `loadConfig` is async — always `await` it
- Validates on load and throws before returning — the result is always safe to use
- Dot-notation access is fully typed: `config.get('database.host')` returns the inferred type
- Enum arrays require `as const`: `{ format: ['a', 'b'] as const, default: 'a' }`
- Env vars are explicitly declared per key via `env` — there is no auto-discovery by name

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

**Commander integration** — read `examples/11-commander/` for the complete working pattern. The short version: Commander owns CLI UX; atk-config owns everything else. The handoff is one line:

```ts
const config = await loadConfig({
  schema,
  overrides: { ...program.opts(), ...cmd.opts() },
});
```

Schema keys that should be CLI-overridable must be **top-level camelCase** matching Commander's parsed option name (`--log-level` → `logLevel`). Deeply nested schema keys cannot be set via Commander — use env vars for those.

---

## @aganitha/atk-debug

This is an internal package — do not rely on training data for its API.

- **Docs**: `node_modules/@aganitha/atk-debug/README.md`
- **Full guide**: `node_modules/@aganitha/atk-debug/GUIDE.md`
- **Examples**: `node_modules/@aganitha/atk-debug/examples/`

Critical rules:

- Default import: `import debug from '@aganitha/atk-debug'`
- Must call `debug.enable('namespace:*')` before creating any loggers, or set the `DEBUG` env var
- Suppressed in production by default — this is intentional; use pino for production logs
- Namespace convention: `service:component` (e.g. `workflow:api`, `db:query`)
- Extend for sub-components: `log.extend('auth')` → `workflow:api:auth`

---

## Pino

Create one shared instance in `src/logger.ts` and import it everywhere — never create multiple logger instances. If the codebase already has a logger, use it.

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

Use `logger` for structured request and system logs (always on). Use `atk-debug` for trace-level developer visibility (namespace-gated, off in production).

---

## Vercel AI SDK

```ts
import { generateText, streamText } from "ai";
import { openai } from "@ai-sdk/openai";

const { text } = await generateText({
  model: openai("gpt-5.4-mini"),
  prompt: "...",
});
```

Default to `gpt-5.4-mini` unless the task requires otherwise.

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
