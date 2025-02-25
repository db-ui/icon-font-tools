import { promisify } from "node:util";
import { exec } from "node:child_process";
import { rm } from "node:fs/promises";
import { IconSubsetFileMapping } from "../data.js";

const execAsync = promisify(exec);

export const runTTX = async ({
  iconsFileMapping,
  compile,
  debug,
}: {
  compile?: boolean;
  debug?: boolean;
  iconsFileMapping: IconSubsetFileMapping[];
}) => {
  try {
    await execAsync("ttx -h");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    console.warn(
      "You need to install ttx. Check https://fonttools.readthedocs.io/en/stable/index.html for more information.",
    );
  }

  try {
    const commands = iconsFileMapping.map(({ input, tmp, output }) =>
      compile
        ? ["ttx", tmp, "-o", output, "--flavor=woff2"].join(" ")
        : ["ttx", input, "-o", tmp].join(" "),
    );

    for (const command of commands) {
      const { stdout, stderr } = await execAsync(command);
      if (debug && stdout) console.log(stdout);
      if (debug && stderr) console.error(stderr);
    }

    if (compile) {
      for (const { tmp } of iconsFileMapping) {
        if (!debug) {
          await rm(tmp);
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
};
