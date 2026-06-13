import { CommanderError } from "commander";
import { run } from "./cli.js";

run(process.argv.slice(2))
  .then((output) => {
    if (output !== undefined) {
      console.log(output);
    }
  })
  .catch((error: unknown) => {
    if (error instanceof CommanderError) {
      process.exit(error.exitCode);
    }

    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exit(1);
  });
