import { spawn } from "child_process";

export interface Remote {
  name: string;
  url: string;
}

export async function getRemote(name: string): Promise<Remote> {
  return await new Promise((resolve, reject) => {
    const proc = spawn("git", ["remote", "get-url", name], {
      shell: true,
      stdio: "pipe"
    });
    let url = "";
    proc.stdout.on("data", read => {
      url += read;
    });
    proc.on("close", (code: number | null, signal: string | null) => {
      if (code === 0) {
        resolve({ name, url });
      } else {
        reject(
          new Error(`git-remote exited with code ${code} and signal ${signal}`)
        );
      }
    });
  });
}
