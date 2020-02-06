import { Command } from "commander";
import { createPrCommand } from "./pr";
import { createSyncCommand } from "./sync";

export function createCommands(program: Command) {
  createPrCommand(program);
  createSyncCommand(program);
}
