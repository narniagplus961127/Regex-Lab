import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
const files = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean);
const bad = [];
for (const file of files) {
  const bytes = readFileSync(file);
  if (bytes.includes(0)) continue;
  const content = bytes.toString("utf8");
  if (/(?<!\r)\n/.test(content) || /\r(?!\n)/.test(content)) {
    if (process.argv.includes("--write"))
      writeFileSync(file, content.replace(/\r\n|\r|\n/g, "\r\n"));
    else bad.push(file);
  }
}
if (bad.length) {
  console.error("CRLF required:\n" + bad.join("\n"));
  process.exitCode = 1;
} else console.log("Authored text files use CRLF.");
