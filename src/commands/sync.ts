import { Command } from "commander";

export function createSyncCommand(program: Command) {
  program
    .command("sync")
    .description("fast-forward local tracking branches")
    .action(async () => {
      throw Error("not implemented");
    });
}
