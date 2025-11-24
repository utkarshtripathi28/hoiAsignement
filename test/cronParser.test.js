"use strict";

const assert = require("assert");
const {
  expandField,
  parseCronLine,
  formatCronOutput,
} = require("../cronParser");

function testExpandField() {
  assert.deepStrictEqual(expandField("*", 0, 5), [0, 1, 2, 3, 4, 5]);
  assert.deepStrictEqual(expandField("*/2", 0, 5), [0, 2, 4]);
  assert.deepStrictEqual(expandField("1-3", 0, 5), [1, 2, 3]);
  assert.deepStrictEqual(expandField("1-5/2", 0, 10), [1, 3, 5]);
  assert.deepStrictEqual(expandField("1,3,5", 0, 10), [1, 3, 5]);
  assert.deepStrictEqual(
    expandField("1,3-4,*/4", 0, 8),
    [0, 1, 3, 4, 4, 8].filter((v, i, arr) => arr.indexOf(v) === i)
  );
}

function testParseCronLineExample() {
  const cron = "*/15 0 1,15 * 1-5 /usr/bin/find";
  const parsed = parseCronLine(cron);

  assert.deepStrictEqual(parsed.minute, [0, 15, 30, 45]);
  assert.deepStrictEqual(parsed.hour, [0]);
  assert.deepStrictEqual(parsed.dayOfMonth, [1, 15]);
  assert.deepStrictEqual(parsed.month, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  assert.deepStrictEqual(parsed.dayOfWeek, [1, 2, 3, 4, 5]);
  assert.strictEqual(parsed.command, "/usr/bin/find");

  const output = formatCronOutput(parsed);
  const expected =
    "minute        0 15 30 45\n" +
    "hour          0\n" +
    "day of month  1 15\n" +
    "month         1 2 3 4 5 6 7 8 9 10 11 12\n" +
    "day of week   1 2 3 4 5\n" +
    "command       /usr/bin/find";

  assert.strictEqual(output, expected);
}

function testInvalidExpressions() {
  assert.throws(() => expandField("100", 0, 59), /out of range/);
  assert.throws(() => expandField("1--5", 0, 59));
  assert.throws(() => expandField("*/0", 0, 59));
  assert.throws(() => parseCronLine("*/15 0 1,15 *"));
  assert.throws(
    () => parseCronLine("*/15 0 1,15 * 1-5")
  );
}

function run() {
  console.log("Running tests...");

  testExpandField();
  console.log("✓ expandField tests passed");

  testParseCronLineExample();
  console.log("✓ parseCronLine + formatCronOutput example test passed");

  testInvalidExpressions();
  console.log("✓ invalid expression tests passed");

  console.log("All tests passed!");
}

run();
