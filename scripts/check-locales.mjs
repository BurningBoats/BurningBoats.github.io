#!/usr/bin/env node
/**
 * Post-build locale/SEO checklist over dist/: <html lang>, <title>, canonical, hreflang count,
 * unfilled {placeholders}, stray "undefined". Exit 1 on any issue.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const pages = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f === 'index.html' || f === '404.html') pages.push(p);
  }
})('dist');

let issues = 0;
for (const p of pages) {
  const h = readFileSync(p, 'utf8');
  const rel = p.replace(/\\/g, '/').replace(/^dist/, '');
  const lang = (h.match(/<html[^>]*lang="([^"]+)"/) || [])[1];
  const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1];
  const hreflang = (h.match(/hreflang="/g) || []).length;
  // placeholders inside rendered text (data-* attribute templates for JS are fine)
  const leaks = h.match(/>[^<]*\{(count|year|min|lang|mode|email)\}[^<]*</g) || [];
  const canonical = (h.match(/rel="canonical" href="([^"]+)"/) || [])[1];
  const is404 = rel.endsWith('404.html');
  const expLang = rel.startsWith('/es/') ? 'es' : rel.startsWith('/pt/') ? 'pt' : 'en';
  const bad = [];
  if (lang !== expLang && !is404) bad.push(`lang=${lang}`);
  if (!title) bad.push('no title');
  if (hreflang < 3 && !is404) bad.push(`hreflang=${hreflang}`);
  if (leaks.length) bad.push(`leaks:${leaks.join(',')}`);
  if (!canonical) bad.push('no canonical');
  if (/>undefined</.test(h) || /"undefined"/.test(h)) bad.push('contains undefined');
  if (bad.length) { issues++; console.log('✖', rel, bad.join(' | ')); }
}
console.log(`${pages.length} pages checked, ${issues} with issues`);
process.exit(issues ? 1 : 0);
