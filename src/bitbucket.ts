import * as process from "process";
import * as fs from "fs";
import * as path from "path";
import { Bitbucket, APIClient } from "bitbucket";
import { getRemote } from "./git";
import { readSettings } from "./settings";

export interface Repository {
  workspace: string;
  repo_slug: string;
}

export async function createBitbucketClient(): Promise<APIClient> {
  const bitbucketConfig = await readSettings();
  if (!bitbucketConfig) {
    throw Error("Unable to read settings");
  }

  return new Bitbucket({
    baseUrl: "https://api.bitbucket.org/2.0",
    headers: {},
    options: {
      timeout: 10,
    },
    auth: {
      username: bitbucketConfig.username,
      password: bitbucketConfig.password,
    },
    notice: false,
  });
}

export async function getCurrentRepo(): Promise<Repository | null> {
  const remote = await getRemote("origin");

  const match = remote.url.match(/bitbucket\.org[:\/](\w+)\/([^\/\s]+)/);
  if (match) {
    const workspace = match[1];
    const repo_slug = match[2].replace(".git", "");
    return {
      workspace,
      repo_slug,
    };
  }

  return null;
}
