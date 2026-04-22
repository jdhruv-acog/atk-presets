# @aganitha/atk-presets

Writes `AGENTS.md` into a project so AI coding tools know the org standard stack.

Run once per repo. Commit the result.

## Usage

```bash
# interactive — prompts for stack
bunx @aganitha/atk-presets

# explicit
bunx @aganitha/atk-presets bun-ts
bunx @aganitha/atk-presets uv-py
```

## Stacks

| ID | Stack | Prompt |
|---|---|---|
| `bun-ts` | Bun · TypeScript · pino · atk-config · atk-debug · Vercel AI SDK | [bun-ts.md](https://github.com/jdhruv-acog/atk-presets/blob/main/prompts/bun-ts.md) |
| `uv-py` | uv · Python · structlog · pydantic-settings | [uv-py.md](https://github.com/jdhruv-acog/atk-presets/blob/main/prompts/uv-py.md) |

## What gets written

| File | Agent | Role |
|---|---|---|
| `AGENTS.md` | OpenAI Codex, Cursor, others | Source of truth — all stack docs live here |
| `CLAUDE.md` | Claude Code | One line: `@AGENTS.md` — imports the source of truth |
| `GEMINI.md` | Gemini CLI | One line: `@AGENTS.md` — imports the source of truth |

`AGENTS.md` is the only file you ever edit. `CLAUDE.md` and `GEMINI.md` are thin wrappers that each contain a single `@AGENTS.md` import — the syntax each agent uses to pull in an external file at session start. This means one edit propagates everywhere.

## How it stays current

`AGENTS.md` is intentionally lightweight. It contains two things:

1. **Critical rules** — the non-obvious things an agent would get wrong: mandatory schema fields, async requirements, import patterns, naming conventions. These rarely change.

2. **Pointers to docs** — paths like `node_modules/@aganitha/atk-config/docs/guide.md`. The agent reads the actual installed docs when it needs them.

When a library ships updated docs, the agent picks them up automatically from `node_modules`. Nothing in `AGENTS.md` goes stale.

## Adding a stack

1. Add `prompts/<stack-id>.md` with the stack's AGENTS.md content
2. Add an entry to `src/registry.ts`

No other changes needed.
