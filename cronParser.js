// cronParser.js
"use strict";

function expandField(expr, min, max) {
  if (typeof expr !== "string" || !expr.trim()) {
    throw new Error(`Invalid expression: "${expr}"`);
  }

  const tokens = expr.split(",");
  const resultSet = new Set();

  for (const rawToken of tokens) {
    const token = rawToken.trim();
    if (!token) continue;

    const values = expandToken(token, min, max);
    for (const v of values) {
      resultSet.add(v);
    }
  }

  return Array.from(resultSet).sort((a, b) => a - b);
}

function expandToken(token, min, max) {
  const [rangePart, stepPart] = token.split("/");
  let step = 1;

  if (stepPart !== undefined) {
    step = parseInt(stepPart, 10);
    if (Number.isNaN(step) || step <= 0) {
      throw new Error(`Invalid step "${stepPart}" in token "${token}"`);
    }
  }

  let start, end;

  if (rangePart === "*") {
    start = min;
    end = max;
  } else if (rangePart.includes("-")) {
    const [startStr, endStr] = rangePart.split("-");
    start = parseInt(startStr, 10);
    end = parseInt(endStr, 10);

    if ([start, end].some((v) => Number.isNaN(v))) {
      throw new Error(`Invalid range "${rangePart}" in token "${token}"`);
    }
    if (start > end) {
      throw new Error(
        `Range start greater than end in token "${token}" (${start} > ${end})`
      );
    }
  } else {
    // single value
    const value = parseInt(rangePart, 10);
    if (Number.isNaN(value)) {
      throw new Error(`Invalid value "${rangePart}" in token "${token}"`);
    }
    start = value;
    end = value;
  }

  if (start < min || end > max) {
    throw new Error(
      `Value out of range in token "${token}" (must be between ${min} and ${max})`
    );
  }

  const result = [];
  for (let v = start; v <= end; v += step) {
    result.push(v);
  }

  return result;
}

/**
 * Parse a full cron line: five time fields + command string.
 *
 * @param {string} cronLine - the full cron string
 * @returns {{
 *   minute: number[],
 *   hour: number[],
 *   dayOfMonth: number[],
 *   month: number[],
 *   dayOfWeek: number[],
 *   command: string
 * }}
 */
function parseCronLine(cronLine) {
  if (typeof cronLine !== "string") {
    throw new Error("Cron line must be a string");
  }

  const parts = cronLine.trim().split(/\s+/);

  if (parts.length < 6) {
    throw new Error(
      "Cron line must have at least 6 parts: 5 time fields + command"
    );
  }

  const [minuteExpr, hourExpr, domExpr, monthExpr, dowExpr, ...commandParts] =
    parts;

  const command = commandParts.join(" ");
  if (!command) {
    throw new Error("Command part is missing from the cron line");
  }

  return {
    minute: expandField(minuteExpr, 0, 59),
    hour: expandField(hourExpr, 0, 23),
    dayOfMonth: expandField(domExpr, 1, 31),
    month: expandField(monthExpr, 1, 12),
    // Here we assume numeric day-of-week 0-6, but expression like "1-5"
    // (Mon-Fri) from the assignment example is fully supported.
    dayOfWeek: expandField(dowExpr, 0, 6),
    command,
  };
}

/**
 * Format the parsed cron into the required table output.
 *
 * Field name takes first 14 columns, followed by space-separated values.
 *
 * @param {ReturnType<typeof parseCronLine>} parsed
 * @returns {string} formatted multi-line output
 */
function formatCronOutput(parsed) {
  const COL_WIDTH = 14;

  const lines = [];

  const pushLine = (label, values) => {
    const paddedLabel = label.padEnd(COL_WIDTH, " ");
    const valueStr = Array.isArray(values) ? values.join(" ") : String(values);
    lines.push(`${paddedLabel}${valueStr}`);
  };

  pushLine("minute", parsed.minute);
  pushLine("hour", parsed.hour);
  pushLine("day of month", parsed.dayOfMonth);
  pushLine("month", parsed.month);
  pushLine("day of week", parsed.dayOfWeek);
  pushLine("command", parsed.command);

  return lines.join("\n");
}

module.exports = {
  expandField,
  parseCronLine,
  formatCronOutput,
};
