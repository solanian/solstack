#!/usr/bin/env node
/**
 * solstack installer — installs skills into each detected agent harness.
 *
 * Usage:
 *   node scripts/install.mjs --host auto          # install into every detected harness (default)
 *   node scripts/install.mjs --host claude        # one harness only: claude|codex|opencode|antigravity
 *   node scripts/install.mjs --dest /some/dir     # custom global skills dir (e.g. Antigravity)
 *   node scripts/install.mjs --link copy          # 'symlink' (default) or 'copy'
 *   node scripts/install.mjs --with-hooks         # register Claude Code SessionStart/End hooks
 *   node scripts/install.mjs --with-rules         # append gate rules pointer to global memory files
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
    else if (a === "--with-rules") args.withRules = true;
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
  // OpenCode also reads ~/.claude/skills as a compatibility source, so an
  // install for claude already shows up in OpenCode; this is the native path.
  opencode: () => join(homedir(), ".config", "opencode", "skills"),
  // Antigravity global skills path varies by version; override with --dest when needed.
  antigravity: () => join(homedir(), ".gemini", "skills"),
};

function detectAvailable(host) {
  const home = homedir();
  const found = [];
  if (host === "auto") {
    if (existsSync(join(home, ".claude"))) found.push("claude");
    if (existsSync(join(home, ".codex"))) found.push("codex");
    if (existsSync(join(home, ".config", "opencode"))) found.push("opencode");
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

function registerClaudeHooks() {
  // Register SessionStart + SessionEnd hooks (opt-in, idempotent).
  const settingsPath = join(homedir(), ".claude", "settings.json");
  if (!existsSync(settingsPath)) { console.log("no ~/.claude/settings.json — hooks not registered"); return; }
  const settings = JSON.parse(readFileSync(settingsPath, "utf8"));
  settings.hooks ??= {};
  for (const { event, script } of [
    { event: "SessionStart", script: "session-start.mjs" },
    { event: "SessionEnd", script: "session-end.mjs" },
  ]) {
    settings.hooks[event] ??= [];
    const cmd = `node ${join(ROOT, "hooks", script)}`;
    if (!settings.hooks[event].some((h) => JSON.stringify(h.hooks).includes(script))) {
      settings.hooks[event].push({ matcher: "*", hooks: [{ type: "command", command: cmd }] });
      console.log(`registered ${event} hook in ${settingsPath}`);
    } else {
      console.log(`${event} hook already registered`);
    }
  }
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
}

function registerRules() {
  // Append a one-screen rules pointer so the gates are visible in every
  // project, not just inside the solstack repo.
  const pointer = [
    "",
    "<!-- solstack-rules:v1 -->",
    "## solstack 규칙 (전역)",
    "",
    `- 게이트: ${join(ROOT, "AGENTS.md")} 를 따른다. skills/ 직접 수정 금지;`,
    "  모든 변경은 harvest → review-pending 컨펌 경유로만 반영한다.",
    "- 세션 시작 시 UPDATE-NOTICE.md 알림이 보이면 사용자에게 알리고,",
    "  컨펌 후 upgrade 스킬로 pull한다.",
    "",
  ].join("\n");
  for (const file of [
    join(homedir(), ".claude", "CLAUDE.md"),
    join(homedir(), ".codex", "AGENTS.md"),
  ]) {
    if (!existsSync(dirname(file))) continue;
    let text = "";
    try { text = readFileSync(file, "utf8"); } catch { /* new file */ }
    if (text.includes("<!-- solstack-rules")) { console.log(`rules already present in ${file}`); continue; }
    writeFileSync(file, text.replace(/\n*$/, "\n") + pointer);
    console.log(`rules pointer appended to ${file}`);
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

if (args.withHooks) registerClaudeHooks();
if (args.withRules) registerRules();
console.log("done.");
