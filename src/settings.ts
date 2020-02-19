import { readFile, writeFile } from "fs";
import { join } from "path";
import { env } from "process";

export interface Settings {
  username: string;
  password: string;
}

function getSettingsPath() {
  return join(
    env.HOME || env.HOMEPATH || env.USERPROFILE || ".",
    ".bitbucketrc"
  );
}
export async function readSettings(): Promise<Settings | null> {
  const configPath = getSettingsPath();
  const serialized = await new Promise<Buffer>((resolve, reject) => {
    readFile(configPath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
  return JSON.parse(serialized.toString());
}

export function writeSettings(settings: Settings): Promise<void> {
  const configPath = getSettingsPath();
  const serialized = JSON.stringify(settings, undefined, 2);
  return new Promise((resolve, reject) => {
    writeFile(configPath, serialized, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
