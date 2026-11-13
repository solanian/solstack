#!/usr/bin/env node
/**
 * solstack session-start hook — runs a throttled update check, then prints
 * the update notice to stdout if present (Claude Code injects SessionStart
 * hook stdout into the session context, so the agent sees the notice).
 * Fast and silent when up to date; never throws.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const NOTICE = join(ROOT, "UPDATE-NOTICE.md");

try {
  execFileSync("node", [join(ROOT, "scripts", "update-check.mjs")], {
    cwd: ROOT, stdio: "ignore", timeout: 15_000,
  });
} catch { /* offline or timeout: stay silent */ }

if (existsSync(NOTICE)) {
  console.log(readFileSync(NOTICE, "utf8"));
}
