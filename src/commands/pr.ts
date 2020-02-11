import { spawn } from "child_process";
import { Command } from "commander";
import inquirer from "inquirer";
import { bitbucket, getCurrentRepo } from "../bitbucket";
import { Schema } from "bitbucket";

export function createPrCommand(program: Command) {
  program
    .command("pr:checkout [pr_number]")
    .alias("pr")
    .description("checkout a pull request branch")
    .action(async (pr_number: string | null) => {
      const repo = await getCurrentRepo();
      if (repo == null) {
        throw Error("Not in a git repository");
      }

      if (pr_number != null) {
        const response = await bitbucket.pullrequests.get({
          ...repo,
          pull_request_id: parseInt(pr_number)
        });
        checkoutPullRequest(response.data);
      } else {
        const response = await bitbucket.pullrequests.list({
          ...repo,
          state: "OPEN"
        });

        const openPullRequests = response.data.values!;

        await inquirer
          .prompt([
            {
              type: "list",
              name: "pr_id",
              message: "Which pull request?",
              choices: openPullRequests.map(pr => ({
                name: pr.title,
                value: pr.id
              }))
            }
          ])
          .then(({ pr_id }: any) => {
            const pullRequest = openPullRequests.find(p => p.id === pr_id);
            if (pullRequest == null) {
              throw Error(`Could not find pull request: ${pr_id}`);
            }

            checkoutPullRequest(pullRequest);
          });
      }

      function checkoutPullRequest(pullRequest: Schema.Pullrequest): void {
        const branch = pullRequest.source && pullRequest.source.branch;
        if (branch == null || branch.name == null) {
          throw Error(
            `Pull request does not have a branchName: ${branch && branch.name}`
          );
        }

        spawn("git", ["checkout", branch.name], {
          shell: true,
          stdio: "inherit"
        });
      }
    });
}
