import { spawn } from "child_process";
import { Command } from "commander";
import inquirer from "inquirer";
import {
  createBitbucketClient,
  getCurrentRepo,
  Repository,
} from "../bitbucket";
import { Schema } from "bitbucket";
import open from "open";

export function createPrCommand(program: Command) {
  program
    .command("pr:status [id]")
    .alias("pr")
    .description("view the status of a pull request")
    .action(async (id: string | null) => {
      const repo = await getCurrentRepo();
      if (repo == null) {
        throw Error("Not in a git repository");
      }

      const pr_id = (id && parseInt(id)) || null;
      const pullRequest = await getPullRequestByIdOrSelection(repo, pr_id);
      console.log(`Title:        ${pullRequest.title}`);
      console.log(`State:        ${pullRequest.state}`);
      console.log(`Branch:       ${pullRequest.source?.branch?.name}`);
      console.log(`Description:  ${pullRequest.description}`);

      const { action } = await inquirer.prompt([
        {
          type: "list",
          name: "action",
          message: "What next?",
          choices: [
            {
              name: "Check out branch",
              value: "checkout",
            },
            {
              name: "Open in browser",
              value: "open",
            },
          ],
        },
      ]);

      switch (action) {
        case "checkout":
          checkoutPullRequest(pullRequest);
          break;

        case "open":
          openPullRequestInBrowser(pullRequest);
          break;
      }
    });

  program
    .command("pr:checkout [id]")
    .description("checkout a pull request branch")
    .action(async (id: string | null) => {
      const repo = await getCurrentRepo();
      if (repo == null) {
        throw Error("Not in a git repository");
      }

      const pr_id = (id && parseInt(id)) || null;
      const pullRequest = await getPullRequestByIdOrSelection(repo, pr_id);
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

function openPullRequestInBrowser(pullRequest: Schema.Pullrequest): void {
  const url = pullRequest.links?.html?.href;
  if (url) {
    console.log("Opening URL:", url);
    open(url);
  } else {
    console.log("Pull request object is missing URL");
  }
}
