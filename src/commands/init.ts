import { Command } from "commander";
import inquirer from "inquirer";
import { readSettings, writeSettings, Settings } from "../settings";
import open from "open";

export function createInitCommand(program: Command) {
  program
    .command("init")
    .description("initializes this CLI app")
    .action(async () => {
      const { username } = await inquirer.prompt([
        {
          type: "text",
          name: "username",
          message: "Bitbucket username:",
        },
      ]);
      assert(typeof username == "string", "Username must be a string");

      const appPasswordsUrl = `https://bitbucket.org/account/user/${username}/app-passwords`;
      await open(appPasswordsUrl);

      const { password } = await inquirer.prompt([
        {
          type: "password",
          name: "password",
          message: 'App password with the "Pull Requests: Read" permission:',
        },
      ]);
      assert(typeof password == "string", "Password must be a string");

      let settings: Settings;
      try {
        const currentSettings = await readSettings();
        if (currentSettings) {
          settings = { ...currentSettings, username, password };
        } else {
          settings = { username, password };
        }
      } catch (e) {
        settings = { username, password };
      }

      await writeSettings(settings);
    });
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw Error(message);
  }
}
