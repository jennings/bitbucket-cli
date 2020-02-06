import * as process from "process";
import * as child_process from "child_process";
import commander from "commander";
import inquirer from "inquirer";
import { bitbucket, getCurrentRepo } from "./bitbucket";

const program = new commander.Command();

program
  .command("checkout [pr]")
  .description("checkout a remote branch")
  .action(async (pr: string, cmd: unknown) => {
    if (pr != null) {
      console.log(pr, typeof pr);
    } else {
      const repo = await getCurrentRepo();
      if (repo == null) {
        throw Error("Not in a git repository");
      }
      const response = await bitbucket.pullrequests.list({
        ...repo,
        state: "OPEN"
      });

      const openPullRequests = response.data.values!;

      await inquirer
        .prompt([
          {
            type: "list",
            name: "pr",
            message: "Which pull request?",
            choices: openPullRequests.map(pr => ({
              name: pr.title,
              value: pr.id
            }))
          }
        ])
        .then(({ pr }: any) => {
          const pullRequest = openPullRequests.find(req => req.id === pr);
          if (pullRequest == null) {
            throw Error(`Could not find pull request: ${pr}`);
          }

          const branch = pullRequest.source && pullRequest.source.branch;
          if (branch == null || branch.name == null) {
            throw Error(
              `Pull request does not have a branchName: ${branch &&
                branch.name}`
            );
          }

          child_process.spawn("git", ["checkout", branch.name], {
            shell: true,
            stdio: "inherit"
          });
        });
    }
  });

program.parseAsync(process.argv);
