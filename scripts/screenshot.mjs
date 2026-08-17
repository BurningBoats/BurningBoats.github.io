#!/usr/bin/env node
/**
 * Headless screenshots for visual QA (uses the locally installed Edge/Chrome via puppeteer-core).
 *   node scripts/screenshot.mjs --base=http://127.0.0.1:4321 --out=<dir> [--paths=/,/es/mindaro/] [--width=1440] [--full] [--theme=light] [--mobile] [--motion=off]
 * Writes <out>/<slug>.png and prints console errors per page.
 */
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import puppeteer from 'puppeteer-core';

const arg = (n, d) => (process.argv.find((a) => a.startsWith(`--${n}=`)) ?? `--${n}=${d}`).split('=').slice(1).join('=');
const has = (n) => process.argv.includes(`--${n}`);
const BASE = arg('base', 'http://127.0.0.1:4321');
const OUT = resolve(arg('out', './.cache/shots'));
const PATHS = arg('paths', '/,/mindaro/,/team/,/press/,/news/,/careers/,/404/').split(',').filter(Boolean);
const WIDTH = Number(arg('width', has('mobile') ? 390 : 1440));
const HEIGHT = Number(arg('height', has('mobile') ? 844 : 900));
const THEME = arg('theme', 'dark');
const FULL = has('full');
const MOTION_OFF = arg('motion', 'on') === 'off';
const INTRO = has('intro');            // do not pre-mark the intro as seen
const DELAY = Number(arg('delay', 0));  // ms to wait after load before shooting (skips the scroll pass)

const candidates = [
  process.env.BROWSER_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);
const executablePath = candidates.find((p) => existsSync(p));
if (!executablePath) { console.error('No Chrome/Edge found. Set BROWSER_PATH.'); process.exit(1); }

await mkdir(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-first-run', '--no-default-browser-check', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, isMobile: has('mobile'), hasTouch: has('mobile') });
  if (MOTION_OFF) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.evaluateOnNewDocument((theme, intro) => { try { localStorage.setItem('bb.theme', theme); if (!intro) sessionStorage.setItem('bb.intro', '1'); } catch {} }, THEME, INTRO);
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => { if (!/favicon|widget\.json/.test(r.url())) errors.push(`requestfailed: ${r.url()} ${r.failure()?.errorText ?? ''}`); });

  for (const path of PATHS) {
    errors.length = 0;
    const url = new URL(path, BASE).href;
    const slug = (path.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home') + (THEME === 'light' ? '-light' : '') + (has('mobile') ? '-mobile' : '');
    const res = await page.goto(url, { waitUntil: DELAY ? 'domcontentloaded' : 'networkidle0', timeout: 60000 });
    if (DELAY) { await new Promise((r) => setTimeout(r, DELAY)); }
    else await page.evaluate(async () => {
      await (document.fonts?.ready ?? Promise.resolve());
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y < h; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 900));
    });
    await page.screenshot({ path: join(OUT, `${slug}.png`), fullPage: FULL });
    console.log(`${res?.status()} ${url} → ${slug}.png${errors.length ? `\n   ${errors.join('\n   ')}` : ''}`);
  }
} finally {
  await browser.close();
}
