import * as process from "process";
import commander from "commander";
import inquirer from "inquirer";

commander
  .command("checkout [pr]")
  .description("checkout a remote branch")
  .action(async (pr: string, cmd: unknown) => {
    if (pr != null) {
      console.log(pr, typeof pr);
    } else {
      await inquirer
        .prompt([
          {
            type: "list",
            name: "pr",
            message: "Which pull request?",
            choices: [
              {
                value: 123,
                name: "Foo"
              },
              {
                value: 456,
                name: "Bar"
              }
            ]
          }
        ])
        .then((answers: { pr: number }) => {
          console.log("pr", answers.pr);
        });
    }
  });

commander.parseAsync(process.argv);
