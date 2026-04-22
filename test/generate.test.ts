import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generate } from "../src/generate.ts";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "atk-presets-"));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("generate", () => {
  test("writes AGENTS.md for bun-ts", async () => {
    await generate("bun-ts", dir);
    const text = await Bun.file(join(dir, "AGENTS.md")).text();
    expect(text).toContain("@aganitha/atk-config");
    expect(text).toContain("@aganitha/atk-debug");
    expect(text).toContain("pino");
  });

  test("writes AGENTS.md for uv-py", async () => {
    await generate("uv-py", dir);
    const text = await Bun.file(join(dir, "AGENTS.md")).text();
    expect(text).toContain("uv");
    expect(text).toContain("structlog");
    expect(text).toContain("pydantic-settings");
  });

  test("AGENTS.md content differs between stacks", async () => {
    await generate("bun-ts", dir);
    const bunTs = await Bun.file(join(dir, "AGENTS.md")).text();

    await generate("uv-py", dir);
    const uvPy = await Bun.file(join(dir, "AGENTS.md")).text();

    expect(bunTs).not.toBe(uvPy);
  });

  test("writes CLAUDE.md importing AGENTS.md", async () => {
    await generate("bun-ts", dir);
    const text = await Bun.file(join(dir, "CLAUDE.md")).text();
    expect(text.trim()).toBe("@AGENTS.md");
  });

  test("writes GEMINI.md importing AGENTS.md", async () => {
    await generate("bun-ts", dir);
    const text = await Bun.file(join(dir, "GEMINI.md")).text();
    expect(text.trim()).toBe("@AGENTS.md");
  });

  test("returns all written filenames", async () => {
    const files = await generate("bun-ts", dir);
    expect(files).toContain("AGENTS.md");
    expect(files).toContain("CLAUDE.md");
    expect(files).toContain("GEMINI.md");
    expect(files).toHaveLength(3);
  });

  test("is idempotent — safe to run twice", async () => {
    await generate("bun-ts", dir);
    await generate("bun-ts", dir);
    const text = await Bun.file(join(dir, "AGENTS.md")).text();
    expect(text).toContain("@aganitha/atk-config");
  });
});
