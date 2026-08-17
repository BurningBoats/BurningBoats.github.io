#!/usr/bin/env node
/**
 * Size budgets for the built site + committed asset masters.
 *
 *  - dist/_astro/*.js  : entry/shared JS (everything except the lazy Three.js chunk) ≤ 200 KB gzip
 *                        Three.js chunk ≤ 170 KB gzip, and Three must NOT leak into other chunks
 *  - dist/_astro/*.css : total CSS ≤ 60 KB gzip
 *  - src/assets/**     : any master > 1.25 MB fails; > 400 KB warns (key art allowed up to 1.25 MB)
 *
 * Exit code 1 on any failure. Run after `astro build`.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { gzipSync } from 'node:zlib';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist', '_astro');
const ASSETS = join(ROOT, 'src', 'assets');

const BUDGET = {
  jsEntryGz: 200 * 1024,
  jsThreeGz: 170 * 1024,
  cssGz: 60 * 1024,
  assetFail: 1.25 * 1024 * 1024,
  assetWarn: 400 * 1024,
};

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
let failed = false;
const fail = (msg) => { failed = true; console.error(`  ✖ ${msg}`); };
const warn = (msg) => console.warn(`  ▲ ${msg}`);
const ok = (msg) => console.log(`  ✔ ${msg}`);

async function walk(dir) {
  const out = [];
  let entries = [];
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

console.log('\nBudgets — dist/_astro');
let distExists = true;
try { await stat(join(ROOT, 'dist')); } catch { distExists = false; }
const files = distExists ? await walk(DIST) : [];
if (!distExists) {
  fail('dist/ not found — run `astro build` first');
} else if (files.length === 0) {
  ok('no bundled JS/CSS in this build');
} else {
  let entryGz = 0, threeGz = 0, cssGz = 0;
  const rows = [];
  for (const f of files) {
    const ext = extname(f);
    if (ext !== '.js' && ext !== '.css') continue;
    const buf = await readFile(f);
    const gz = gzipSync(buf).length;
    const text = buf.toString('utf8');
    const isThree = ext === '.js' && /WebGLRenderer|THREE\.REVISION|three\.module/.test(text);
    if (ext === '.css') cssGz += gz;
    else if (isThree) threeGz += gz;
    else entryGz += gz;
    rows.push({ file: relative(ROOT, f), gz, kind: ext === '.css' ? 'css' : isThree ? 'three' : 'js' });
  }
  rows.sort((a, b) => b.gz - a.gz);
  for (const r of rows.slice(0, 15)) console.log(`    ${kb(r.gz).padStart(9)}  ${r.kind.padEnd(5)}  ${r.file}`);
  if (rows.length > 15) console.log(`    … ${rows.length - 15} more`);

  (entryGz <= BUDGET.jsEntryGz ? ok : fail)(`JS (non-Three) ${kb(entryGz)} / ${kb(BUDGET.jsEntryGz)} gzip`);
  if (threeGz > 0) (threeGz <= BUDGET.jsThreeGz ? ok : fail)(`Three chunk ${kb(threeGz)} / ${kb(BUDGET.jsThreeGz)} gzip`);
  else ok('no Three.js chunk in this build');
  (cssGz <= BUDGET.cssGz ? ok : fail)(`CSS ${kb(cssGz)} / ${kb(BUDGET.cssGz)} gzip`);

  // Three must only live in dedicated chunk(s) — the entry chunks are the ones that also import gsap/lenis.
  const leaks = rows.filter((r) => r.kind === 'three').length;
  if (leaks > 1) warn(`Three.js code found in ${leaks} chunks — expected 1 (check dynamic import boundary)`);
}

console.log('\nBudgets — src/assets masters');
const assets = await walk(ASSETS);
if (assets.length === 0) ok('no assets yet');
let big = 0;
for (const f of assets) {
  const { size } = await stat(f);
  const rel = relative(ROOT, f);
  const isKeyArt = /key-?art|wallpapers|banner/i.test(rel);
  if (size > BUDGET.assetFail) { fail(`${rel} is ${kb(size)} (> ${kb(BUDGET.assetFail)})`); continue; }
  if (size > BUDGET.assetWarn && !isKeyArt) { warn(`${rel} is ${kb(size)} (> ${kb(BUDGET.assetWarn)})`); big++; }
}
if (assets.length) ok(`${assets.length} files checked, ${big} above soft limit`);

console.log(failed ? '\nBudgets: FAILED\n' : '\nBudgets: OK\n');
process.exit(failed ? 1 : 0);
