#!/usr/bin/env node
/**
 * solstack update-check — compares this working copy against the remote and
 * writes UPDATE-NOTICE.md when behind. Throttled to once per hour unless --force.
 *
 * Usage:
 *   node scripts/update-check.mjs            # throttled (1/hour)
 *   node scripts/update-check.mjs --force    # always run
 *   node scripts/update-check.mjs --status   # print current notice, if any
 *
 * Exit code is always 0 (this runs inside session hooks; failures must be silent).
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const NOTICE = join(ROOT, "UPDATE-NOTICE.md");
const STATE = join(ROOT, ".update-check-state.json");
const THROTTLE_MS = 60 * 60 * 1000;

const argv = process.argv.slice(2);
const force = argv.includes("--force");
const statusOnly = argv.includes("--status");

function git(...cmd) {
  try { return execFileSync("git", cmd, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); }
  catch { return null; }
}

function throttled() {
  try {
    const { last } = JSON.parse(readFileSync(STATE, "utf8"));
    if (Date.now() - last < THROTTLE_MS) return true;
  } catch { /* no state yet */ }
  return false;
}

function stamp() {
  try { writeFileSync(STATE, JSON.stringify({ last: Date.now() })); } catch { /* ok */ }
}

if (statusOnly) {
  if (existsSync(NOTICE)) process.stdout.write(readFileSync(NOTICE, "utf8"));
  process.exit(0);
}

if (!force && throttled()) process.exit(0);
if (!git("rev-parse", "--is-inside-work-tree")) process.exit(0); // not a git checkout

stamp();

const branch = git("rev-parse", "--abbrev-ref", "HEAD") ?? "main";
if (git("fetch", "--quiet", "origin") === null && !existsSync(join(ROOT, ".git", "FETCH_HEAD"))) {
  process.exit(0); // offline; stay silent
}

const localHead = git("rev-parse", "HEAD");
const remoteHead = git("rev-parse", `origin/${branch}`);
if (!localHead || !remoteHead || localHead === remoteHead) {
  rmSync(NOTICE, { force: true });
  process.exit(0);
}

const localVersion = readFileSync(join(ROOT, "ledger", "VERSION"), "utf8").trim();
const remoteVersion = git("show", `origin/${branch}:ledger/VERSION`) ?? "?";
const log = git("log", "--oneline", `${localHead}..${remoteHead}`) ?? "";
const commits = log ? log.split("\n") : [];
const localCommits = git("log", "--oneline", `${remoteHead}..${localHead}`) ?? "";

const lines = [
  "# ⬆ solstack 업데이트 알림",
  "",
  `이 작업지는 원격보다 **${commits.length}개 커밋** 뒤처져 있습니다.`,
  `- 로컬 버전: ${localVersion}`,
  `- 원격 버전: ${remoteVersion.trim()}`,
  "",
  "## 새 커밋",
  ...commits.map((c) => `- ${c}`),
  "",
  localCommits
    ? `> ⚠ 로컬 전용 커밋이 있습니다. \`upgrade\` 스킬은 먼저 push 후 pull합니다.\n>\n> ${localCommits.split("\n").join("\n> ")}\n`
    : "",
  "반영하려면 에이전트에게: \"solstack 업그레이드 해줘\" (upgrade 스킬이 확인 후 pull합니다)",
];

writeFileSync(NOTICE, lines.filter((l) => l !== "").join("\n") + "\n");
console.log(`update available: ${commits.length} commit(s) behind. See UPDATE-NOTICE.md`);
