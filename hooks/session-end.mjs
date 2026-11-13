#!/usr/bin/env node
/** solstack session-end hook — runs a throttled update check so the next
 *  session starts with a fresh notice. Silent by design; never throws. */
import { spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const child = spawn("node", [join(ROOT, "scripts", "update-check.mjs")], {
  cwd: ROOT, stdio: "ignore", detached: true,
});
child.unref();
