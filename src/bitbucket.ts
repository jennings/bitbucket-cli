import * as process from "process";
import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";
import { Bitbucket } from "bitbucket";

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

export async function getCurrentRepo() {
  const url = await new Promise<string>((resolve, reject) => {
    const proc = child_process.spawn("git", ["remote", "get-url", "origin"], {
      shell: true,
      stdio: "pipe"
    });
    let data = "";
    proc.stdout.on("data", read => {
      data += read;
    });
    proc.on("close", (code: number) => {
      resolve(data);
    });
  });

  const match = url.match(/bitbucket\.org[:\/](\w+)\/([^\/\s]+)/);
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
