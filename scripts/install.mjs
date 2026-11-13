#!/usr/bin/env node
/**
 * solstack installer — installs skills into each detected agent harness.
 *
 * Usage:
 *   node scripts/install.mjs --host auto          # install into every detected harness (default)
 *   node scripts/install.mjs --host claude        # one harness only: claude|codex|antigravity
 *   node scripts/install.mjs --dest /some/dir     # custom global skills dir (e.g. Antigravity)
 *   node scripts/install.mjs --link copy          # 'symlink' (default) or 'copy'
 *   node scripts/install.mjs --with-hooks         # also register a Claude Code SessionEnd hook
 */

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const args = { host: "auto", link: "symlink", withHooks: false, dest: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--host") args.host = argv[++i];
    else if (a === "--dest") args.dest = argv[++i];
    else if (a === "--link") args.link = argv[++i];
    else if (a === "--with-hooks") args.withHooks = true;
    else if (a === "--help") { usage(); process.exit(0); }
  }
  return args;
}

function usage() {
  console.log("See header comment of scripts/install.mjs");
}

function collectSkills() {
  const skillsDir = join(ROOT, "skills");
  const out = [];
  for (const group of readdirSync(skillsDir, { withFileTypes: true })) {
    if (!group.isDirectory()) continue;
    for (const skill of readdirSync(join(skillsDir, group.name), { withFileTypes: true })) {
      if (!skill.isDirectory()) continue;
      const dir = join(skillsDir, group.name, skill.name);
      if (existsSync(join(dir, "SKILL.md"))) {
        out.push({ name: `${group.name}-${skill.name}`.replace(/^meta-/, ""), dir });
      }
    }
  }
  return out;
}

const HARNESS_DIRS = {
  claude: () => join(homedir(), ".claude", "skills"),
  codex: () => join(homedir(), ".codex", "skills"),
  // Antigravity global skills path varies by version; override with --dest when needed.
  antigravity: () => join(homedir(), ".gemini", "skills"),
};

function detectAvailable(host) {
  const home = homedir();
  const found = [];
  if (host === "auto") {
    if (existsSync(join(home, ".claude"))) found.push("claude");
    if (existsSync(join(home, ".codex"))) found.push("codex");
    if (existsSync(join(home, ".gemini")) || process.env.ANTIGRAVITY_SKILLS_DIR) found.push("antigravity");
  } else {
    found.push(host);
  }
  if (args.dest && host !== "auto") return found; // dest handled below
  return found;
}

function installInto(name, destDir, mode) {
  const results = [];
  mkdirSync(destDir, { recursive: true });
  for (const skill of collectSkills()) {
    const target = join(destDir, skill.name);
    rmSync(target, { recursive: true, force: true });
    try {
      if (mode === "symlink") symlinkSync(skill.dir, target, "dir");
      else cpSync(skill.dir, target, { recursive: true });
      results.push(`  ${skill.name} -> ${target}`);
    } catch (e) {
      cpSync(skill.dir, target, { recursive: true });
      results.push(`  ${skill.name} -> ${target} (copy; symlink failed: ${e.code})`);
    }
  }
  return results;
}

function registerClaudeHook() {
  // Register a SessionEnd hook that runs update-check.mjs (opt-in, idempotent).
  const settingsPath = join(homedir(), ".claude", "settings.json");
  if (!existsSync(settingsPath)) { console.log("no ~/.claude/settings.json — hook not registered"); return; }
  const settings = JSON.parse(readFileSync(settingsPath, "utf8"));
  settings.hooks ??= {};
  settings.hooks.SessionEnd ??= [];
  const cmd = `node ${join(ROOT, "hooks", "session-end.mjs")}`;
  const matchers = settings.hooks.SessionEnd.filter((h) => h.matcher === "*");
  if (!matchers.some((h) => JSON.stringify(h.hooks).includes("session-end.mjs"))) {
    settings.hooks.SessionEnd.push({ matcher: "*", hooks: [{ type: "command", command: cmd }] });
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
    console.log(`registered SessionEnd hook in ${settingsPath}`);
  } else {
    console.log("SessionEnd hook already registered");
  }
}

const args = parseArgs(process.argv.slice(2));
const hosts = args.dest ? [args.host === "auto" ? "custom" : args.host] : detectAvailable(args.host);

if (hosts.length === 0) {
  console.log("no harness detected. Use --host claude|codex|antigravity or --dest <dir>.");
  process.exit(1);
}

for (const host of hosts) {
  const dest = args.dest ?? HARNESS_DIRS[host]?.();
  if (!dest) { console.log(`unknown host: ${host}`); continue; }
  console.log(`[${host}] installing into ${dest}`);
  for (const line of installInto(host, dest, args.link)) console.log(line);
}

if (args.withHooks) registerClaudeHook();
console.log("done.");
