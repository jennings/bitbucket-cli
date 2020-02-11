import { spawn } from "child_process";

export interface Remote {
  name: string;
  url: string;
}

export async function getRemote(name: string): Promise<Remote> {
  const url = await spawnAndReturnStdout(["remote", "get-url", name]);
  return { name, url };
}

interface Branch {
  name: string;
}

export async function getMergedBranches(branch: string): Promise<Branch[]> {
  const branches = await spawnAndReturnStdout(["branch", "--merged", branch]);
  return branches
    .trim()
    .split("\n")
    .map(name => ({ name: name.trim() }))
    .filter(
      // ignore checked-out branches
      branch => !branch.name.startsWith("* ") && !branch.name.startsWith("+ ")
    );
}

export async function deleteBranches(branches: string[]): Promise<void> {
  await spawnAndReturnStdout(["branch", "-d", ...branches]);
}

async function spawnAndReturnStdout(args: string[]): Promise<string> {
  return await new Promise((resolve, reject) => {
    const proc = spawn("git", args, {
      shell: true,
      stdio: "pipe"
    });
    let data = "";
    proc.stdout.on("data", read => {
      data += read;
    });
    proc.on("close", (code: number | null, signal: string | null) => {
      if (code === 0) {
        resolve(data);
      } else {
        reject(
          new Error(
            `git-${args[0]} exited with code ${code} and signal ${signal}`
          )
        );
      }
    });
  });
}
