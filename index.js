"use strict";

const { parseCronLine, formatCronOutput } = require("./cronParser");


function main() {
  const [, , ...args] = process.argv;

  if (args.length === 0) {
    console.error(
      "Usage: node index.js \"<cron expression>\"\n" +
        'Example: node index.js "*/15 0 1,15 * 1-5 /usr/bin/find"'
    );
    process.exit(1);
  }

  const cronLine = args.join(" ");

  try {
    const parsed = parseCronLine(cronLine);
    const output = formatCronOutput(parsed);
    console.log(output);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
