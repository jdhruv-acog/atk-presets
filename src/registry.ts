export const stacks = {
  "bun-ts": {
    label: "Bun + TypeScript",
    description: "Bun · TypeScript · pino · atk-config · atk-debug · Vercel AI SDK",
  },
  "uv-py": {
    label: "uv + Python",
    description: "uv · Python · structlog · pydantic-settings",
  },
} as const;

export type StackId = keyof typeof stacks;
