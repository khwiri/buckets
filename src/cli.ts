import { Command } from "commander";
import { test } from "./commands/test.js";
import { startTui } from "./ui/app.js";

export async function run(argv: readonly string[]): Promise<string | undefined> {
  let output: string | undefined;
  const program = new Command();
  program.name("buckets").description("Buckets").exitOverride();

  program
    .command("test")
    .description("Test command")
    .argument("[value]", "value to print")
    .action((value?: string) => {
      output = test(value);
    });

  program
    .command("tui")
    .description("Open TUI")
    .action(async () => {
      await startTui();
    });

  await program.parseAsync(argv, { from: "user" });
  return output;
}
