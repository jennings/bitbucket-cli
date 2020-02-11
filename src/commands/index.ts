import { Command } from "commander";
import { createCleanCommand } from "./clean";
import { createPrCommand } from "./pr";
import { createSyncCommand } from "./sync";

export function createCommands(program: Command) {
  createCleanCommand(program);
  createPrCommand(program);
  createSyncCommand(program);
}
