## Features

- Supports:
- `*` (wildcard)
- Ranges: `1-5`
- Steps: `*/15`, `1-10/2`
- Lists: `1,2,5-10,*/20`
- Valid ranges:
- Minute: `0-59`
- Hour: `0-23`
- Day of month: `1-31`
- Month: `1-12`
- Day of week: `0-6` (example `1-5` = Monday to Friday)
- Outputs in the required table format:
- Field name in first 14 columns
- Space-separated expanded values after that
- Graceful error messages for invalid input

## Installation

git clone <this-repo-url>
cd cron-expression-parser
npm install # (no dependencies, but prepares the project)
