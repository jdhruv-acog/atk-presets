import { join } from "node:path";
import type { StackId } from "./registry.ts";

const PROMPTS_DIR = join(import.meta.dir, "../prompts");

// Agents that don't read AGENTS.md natively get a thin wrapper that imports it.
// AGENTS.md remains the single source of truth — edit only that file.
const WRAPPERS: Record<string, string> = {
  "CLAUDE.md": "@AGENTS.md",
  "GEMINI.md": "@AGENTS.md",
};

export async function generate(stack: StackId, cwd: string): Promise<string[]> {
  const content = await Bun.file(join(PROMPTS_DIR, `${stack}.md`)).text();
  await Bun.write(join(cwd, "AGENTS.md"), content);

  for (const [file, body] of Object.entries(WRAPPERS)) {
    await Bun.write(join(cwd, file), body + "\n");
  }

  return ["AGENTS.md", ...Object.keys(WRAPPERS)];
}
