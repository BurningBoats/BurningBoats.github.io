#!/usr/bin/env node
/**
 * Builds the self-hosted "Mindaro" display font from the studio's TTF.
 *
 *  source : %BBS_ASSETS_ROOT%\Mindaro\Mindaro_Typograph\Mindaro-Regular.ttf  (default root: H:\Burning Boats Studios)
 *  output : src/assets/fonts/mindaro-display.woff2   (subset: space + A–Z + a–z)
 *
 * The font is a hand-drawn Calligraphr export that only maps basic Latin letters, so it is
 * used exclusively for short uppercase words (MINDARO, biome/creature names, eyebrows) with a
 * matching `unicode-range` — every other glyph falls back to the display face.
 */
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import * as fontkit from 'fontkit';
import subsetFont from 'subset-font';

const ROOT = process.env.BBS_ASSETS_ROOT ?? 'H:\\Burning Boats Studios';
if (/[\\/]Videos([\\/]|$)/i.test(ROOT)) throw new Error('Refusing to read from the forbidden Videos folder');
const SRC = join(ROOT, 'Mindaro', 'Mindaro_Typograph', 'Mindaro-Regular.ttf');
const OUT_DIR = resolve('src/assets/fonts');
const OUT = join(OUT_DIR, 'mindaro-display.woff2');

const LATIN = ' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const ACCENTS = 'áéíóúñüçãõâêôàÁÉÍÓÚÑÜÇÃÕÂÊÔÀ¿¡0123456789.,:;!?-—\'"()&';

try { await stat(SRC); } catch { console.error(`Font source not found: ${SRC}`); process.exit(1); }

const ttf = await readFile(SRC);
const font = fontkit.create(ttf);
console.log(`Source: ${SRC}\nFamily: ${font.familyName} · glyphs: ${font.numGlyphs} · unitsPerEm: ${font.unitsPerEm}`);

const missing = (chars) => [...chars].filter((c) => !font.hasGlyphForCodePoint(c.codePointAt(0)));
const missLatin = missing(LATIN);
const missAccents = missing(ACCENTS);
console.log(`Basic Latin coverage: ${LATIN.length - missLatin.length}/${LATIN.length}${missLatin.length ? ` (missing: ${missLatin.join('')})` : ''}`);
console.log(`Accents/digits/punct : ${ACCENTS.length - missAccents.length}/${ACCENTS.length}${missAccents.length ? ` (missing: ${missAccents.join('')})` : ''}`);
if (missAccents.length) console.log('→ Accented text must never be set in this font (unicode-range restricts it to A–Z/a–z).');

const woff2 = await subsetFont(ttf, LATIN, { targetFormat: 'woff2' });
await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT, woff2);
console.log(`Written: ${OUT} (${(woff2.length / 1024).toFixed(1)} KB)`);
