import { Command } from "commander";
import { createCleanCommand } from "./clean";
import { createInitCommand } from "./init";
import { createPrCommand } from "./pr";
import { createSyncCommand } from "./sync";

export function createCommands(program: Command) {
  createCleanCommand(program);
  createInitCommand(program);
  createPrCommand(program);
  createSyncCommand(program);
}
