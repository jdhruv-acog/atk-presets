import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { stacks, type StackId } from "../src/registry.ts";

describe("stacks", () => {
  test("every stack has a non-empty label and description", () => {
    for (const [id, stack] of Object.entries(stacks)) {
      expect(stack.label.length, `${id}: label is empty`).toBeGreaterThan(0);
      expect(stack.description.length, `${id}: description is empty`).toBeGreaterThan(0);
    }
  });

  test("every stack has a corresponding prompt file", async () => {
    for (const id of Object.keys(stacks) as StackId[]) {
      const file = Bun.file(join(import.meta.dir, "../prompts", `${id}.md`));
      expect(await file.exists(), `prompts/${id}.md is missing`).toBe(true);
    }
  });

  test("every prompt file is non-empty", async () => {
    for (const id of Object.keys(stacks) as StackId[]) {
      const file = Bun.file(join(import.meta.dir, "../prompts", `${id}.md`));
      const text = await file.text();
      expect(text.length, `prompts/${id}.md is empty`).toBeGreaterThan(0);
    }
  });
});
