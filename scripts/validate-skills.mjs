#!/usr/bin/env node
/**
 * solstack skill validator — every skill folder must have a SKILL.md whose
 * frontmatter carries a non-empty name and description. Run in CI and locally.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS = join(ROOT, "skills");

const errors = [];
for (const group of readdirSync(SKILLS, { withFileTypes: true })) {
  if (!group.isDirectory()) continue;
  for (const skill of readdirSync(join(SKILLS, group.name), { withFileTypes: true })) {
    if (!skill.isDirectory()) continue;
    const dir = join(SKILLS, group.name, skill.name);
    const path = join(dir, "SKILL.md");
    let text;
    try { text = readFileSync(path, "utf8"); }
    catch { errors.push(`${dir}: missing SKILL.md`); continue; }
    const m = text.match(/^---\n([\s\S]*?)\n---/);
    if (!m) { errors.push(`${path}: no frontmatter block`); continue; }
    for (const field of ["name", "description"]) {
      const fm = m[1].match(new RegExp(`^${field}:\\s*(.+)$`, "m"));
      if (!fm || !fm[1].trim()) errors.push(`${path}: empty \`${field}\` in frontmatter`);
    }
  }
}

if (errors.length) {
  console.error("validation failed:\n" + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
console.log("all skills valid");
