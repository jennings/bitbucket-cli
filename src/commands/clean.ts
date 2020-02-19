import { Command } from "commander";
import inquirer from "inquirer";
import { getCurrentRepo } from "../bitbucket";
import { getMergedBranches, deleteBranches } from "../git";

export function createCleanCommand(program: Command) {
  program
    .command("clean [upstream]")
    .description("delete branches that have merged")
    .action(async (upstream: string | null) => {
      const repo = await getCurrentRepo();
      if (repo == null) {
        throw Error("Not in a git repository");
      }

      upstream = upstream || "origin/master";

      const mergedBranches = await getMergedBranches(upstream);
      await inquirer
        .prompt([
          {
            type: "checkbox",
            name: "branches",
            message: "Which branches to delete?",
            choices: mergedBranches,
          },
        ])
        .then(({ branches }: any) => {
          deleteBranches(branches);
        });
    });
}
