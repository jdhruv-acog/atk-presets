#!/usr/bin/env bun
import { intro, select, spinner, outro, cancel, isCancel } from "@clack/prompts";
import { Command } from "commander";
import { stacks, type StackId } from "./src/registry.ts";
import { generate } from "./src/generate.ts";

const program = new Command();

program
  .name("atk-presets")
  .description("Write AGENTS.md for Aganitha standard stacks")
  .argument("[stack]", `stack to use: ${Object.keys(stacks).join(", ")}`)
  .action(async (stackArg?: string) => {
    intro("atk-presets");

    const id: StackId =
      stackArg && stackArg in stacks ? (stackArg as StackId) : await pick();

    const s = spinner();
    s.start("Writing agent context files");
    const files = await generate(id, process.cwd());
    s.stop(files.join("  "));

    outro(`${stacks[id].label} stack ready`);
  });

program.parse();

async function pick(): Promise<StackId> {
  const result = await select({
    message: "Which stack?",
    options: Object.entries(stacks).map(([id, stack]) => ({
      value: id as StackId,
      label: stack.label,
      hint: stack.description,
    })),
  });

  if (isCancel(result)) {
    cancel("Cancelled");
    process.exit(0);
  }

  return result;
}
