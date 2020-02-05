import * as process from "process";
import commander from "commander";

commander
  .command("hello [name]")
  .description("display a friendly greeting")
  .action((name?: string) => {
    console.log(`Hello, ${name || "world"}!`);
  });

commander.parse(process.argv);
