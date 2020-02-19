import { spawn } from "child_process";
import { Command } from "commander";
import inquirer from "inquirer";
import {
  createBitbucketClient,
  getCurrentRepo,
  Repository,
} from "../bitbucket";
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

      const id = (pr_number && parseInt(pr_number)) || null;
      const pullRequest = await getPullRequestByIdOrSelection(repo, id);
      checkoutPullRequest(pullRequest);
    });
}

async function getPullRequestByIdOrSelection(
  repo: Repository,
  id: number | null
): Promise<Schema.Pullrequest> {
  if (id != null) {
    return await getPullRequestbyId(repo, id);
  }

  const openPullRequests = await getPullRequestsByState(repo, "OPEN");
  const { pr } = await inquirer.prompt([
    {
      type: "list",
      name: "pr",
      message: "Which pull request?",
      choices: openPullRequests.map(pr => ({
        name: pr.title,
        value: pr,
      })),
    },
  ]);
  return pr;
}

async function getPullRequestbyId(
  repo: Repository,
  id: number
): Promise<Schema.Pullrequest> {
  const bitbucket = await createBitbucketClient();
  const response = await bitbucket.pullrequests.get({
    ...repo,
    pull_request_id: id,
  });
  return response.data;
}

type PullRequestState = "OPEN" | "MERGED" | "SUPERSEDED" | "DECLINED";

async function getPullRequestsByState(
  repo: Repository,
  state: PullRequestState
): Promise<Schema.Pullrequest[]> {
  const bitbucket = await createBitbucketClient();
  const response = await bitbucket.pullrequests.list({
    ...repo,
    state,
  });

  return response.data.values!;
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
    stdio: "inherit",
  });
}
