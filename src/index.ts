import * as process from "process";
import { Command } from "commander";
import { createCommands } from "./commands";

const program = new Command();

program
  .option(
    "-w, --workspace <workspace>",
    "Bitbucket workspace (user/orgranization)"
  )
  .option("-r, --repo <repo_slug>", "Bitbucket repository slug");

program
  .command("snippet create <filename>")
  .description("create a snippet from a file")
  .action(async (filename: string) => {
    throw Error("not implemented");
  });

createCommands(program);

program.parseAsync(process.argv).catch((err: Error) => {
  console.log(err);
  process.exit(1);
});
