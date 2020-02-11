import * as process from "process";
import * as fs from "fs";
import * as path from "path";
import { Bitbucket } from "bitbucket";
import { getRemote } from "./git";

const configPath = path.join(
  process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE || ".",
  ".bitbucketrc"
);
const file = fs.readFileSync(configPath);
const bitbucketConfig: any = JSON.parse(file.toString());

export const bitbucket = new Bitbucket({
  baseUrl: "https://api.bitbucket.org/2.0",
  headers: {},
  options: {
    timeout: 10
  },
  auth: {
    username: bitbucketConfig.username,
    password: bitbucketConfig.password
  }
});

interface BitbucketRepository {
  workspace: string;
  repo_slug: string;
}

export async function getCurrentRepo(): Promise<BitbucketRepository | null> {
  const remote = await getRemote("origin");

  const match = remote.url.match(/bitbucket\.org[:\/](\w+)\/([^\/\s]+)/);
  if (match) {
    const workspace = match[1];
    const repo_slug = match[2].replace(".git", "");
    return {
      workspace,
      repo_slug
    };
  }

  return null;
}
