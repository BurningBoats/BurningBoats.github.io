#!/usr/bin/env node
/**
 * Asset import pipeline — reads the studio's source assets (outside the repo) and writes
 * optimized masters into src/assets/ and public/. Raw originals are NEVER committed.
 *
 *   node scripts/import-assets.mjs [--only=brand,team,...] [--force] [--dry-run] [--strict] [--verbose]
 *
 * Groups: brand · mindaro · team · pioneer · creatures · concept · stills · og · gifs · press
 * Sources: fs (H:\Burning Boats Studios by default), git (git show <ref>:<path>), pptx (zip entries).
 * The Videos folder under the assets root is forbidden and guarded against.
 */
import { mkdir, readFile, writeFile, stat, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve, dirname, basename } from 'node:path';
import sharp from 'sharp';
import { optimize as svgoOptimize } from 'svgo';
import pngToIco from 'png-to-ico';
import AdmZip from 'adm-zip';
import { ZipArchive } from 'archiver';
import { createWriteStream } from 'node:fs';
import ffmpegPath from 'ffmpeg-static';
import pc from 'picocolors';

// ---------------------------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------------------------
const ROOT = resolve('.');
const SRC_ROOT = process.env.BBS_ASSETS_ROOT ?? 'H:\\Burning Boats Studios';
const args = new Set(process.argv.slice(2));
const flag = (n) => args.has(`--${n}`);
const only = [...args].find((a) => a.startsWith('--only='))?.slice(7).split(',').map((s) => s.trim()).filter(Boolean) ?? null;
const FORCE = flag('force'), DRY = flag('dry-run'), STRICT = flag('strict'), VERBOSE = flag('verbose');

const ZIP_DATE = new Date('2026-01-01T00:00:00Z'); // deterministic ZIPs → stable git blobs
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const rows = [];
let failures = 0;

function guard(p) {
  if (/[\\/]Videos([\\/]|$)/i.test(p)) throw new Error(`Forbidden path (Videos folder): ${p}`);
  return p;
}
const src = (...parts) => guard(join(SRC_ROOT, ...parts));

async function exists(p) { try { await access(p); return true; } catch { return false; } }

async function emit(outRel, buffer, budgetKB, note = '') {
  // Press group folders are staged outside the repo (only ZIPs + logos are committed).
  if (/^public\/press\/(key-art|screenshots|concept-art|characters|team)\//.test(outRel)) outRel = outRel.replace(/^public\/press\//, '.cache/press/');
  const out = resolve(ROOT, outRel);
  const bytes = buffer.length;
  const over = budgetKB && bytes > budgetKB * 1024;
  rows.push({ out: outRel, bytes, budgetKB, over, note });
  if (over) { failures++; }
  if (!DRY) {
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, buffer);
  }
  return bytes;
}

async function skipIfFresh(outRel) {
  if (FORCE) return false;
  const p = resolve(ROOT, outRel);
  if (!(await exists(p))) return false;
  rows.push({ out: outRel, bytes: (await stat(p)).size, budgetKB: null, over: false, note: 'kept' });
  return true;
}

function gitShow(ref, path) {
  return execFileSync('git', ['show', `${ref}:${path}`], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });
}

/** Crop to W×H around a focal point (fx, fy in 0..1) then resize. */
async function focalCrop(input, W, H, fx = 0.5, fy = 0.5) {
  const img = sharp(input);
  const { width, height } = await img.metadata();
  const targetAspect = W / H;
  let cw = width, ch = Math.round(width / targetAspect);
  if (ch > height) { ch = height; cw = Math.round(height * targetAspect); }
  const left = Math.min(Math.max(Math.round(fx * width - cw / 2), 0), width - cw);
  const top = Math.min(Math.max(Math.round(fy * height - ch / 2), 0), height - ch);
  return img.extract({ left, top, width: cw, height: ch }).resize(W, H, { fit: 'fill' });
}

const svgo = (svg, prefix) =>
  svgoOptimize(svg, {
    multipass: true,
    plugins: [
      { name: 'preset-default', params: { overrides: { removeViewBox: false, cleanupIds: false } } },
      { name: 'prefixIds', params: { prefix, delim: '-' } },
      'removeDimensions',
    ],
  }).data;

// ---------------------------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------------------------
const groups = {
  /** Studio mark (ORIGINAL colors, never recolored): favicons, app icons, cleaned mark for press */
  async brand() {
    // Cleaned mark with CSS-variable fills (defaults = original colors) lives at src/assets/brand/bbs-mark.svg.
    const markSvg = await readFile(resolve(ROOT, 'src/assets/brand/bbs-mark.svg'), 'utf8');
    const brandColors = markSvg
      .replace(/var\(--logo-navy, #10212e\)/g, '#10212e')
      .replace(/var\(--logo-ink, #020202\)/g, '#020202')
      .replace(/var\(--logo-paper, #fffaf1\)/g, '#fffaf1')
      .replace(/var\(--logo-shade, #8a8a8a\)/g, '#8a8a8a');
    const CREAM = '#fffaf1';

    // Trim the mark's own whitespace: render, measure the alpha bbox, and use it as the crop.
    const fullVb = (markSvg.match(/viewBox="([^"]+)"/) || [])[1]?.split(/\s+/).map(Number) ?? [0, 0, 2484, 2484];
    const probe = await sharp(Buffer.from(brandColors), { density: 72 }).resize(1242, 1242).png().toBuffer();
    const { info } = await sharp(probe).trim({ threshold: 5 }).toBuffer({ resolveWithObject: true });
    const bbox = { left: -info.trimOffsetLeft, top: -info.trimOffsetTop, width: info.width, height: info.height };
    const scale = fullVb[2] / 1242;
    const vb = { x: fullVb[0] + bbox.left * scale, y: fullVb[1] + bbox.top * scale, w: bbox.width * scale, h: bbox.height * scale };
    const size = Math.max(vb.w, vb.h) * 1.18; // square canvas with breathing room
    const vx = vb.x - (size - vb.w) / 2, vy = vb.y - (size - vb.h) / 2;
    const inner = (svgStr) => svgStr.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

    // Tight-viewBox component source (keeps the CSS variables) — what LogoMark.astro inlines.
    const pad = Math.max(vb.w, vb.h) * 0.04;
    const tightSize = Math.max(vb.w, vb.h) + pad * 2;
    const tx = vb.x - (tightSize - vb.w) / 2, ty = vb.y - (tightSize - vb.h) / 2;
    if (Math.abs(fullVb[2] - tightSize) > 1) {
      const tight = markSvg.replace(/viewBox="[^"]+"/, `viewBox="${tx.toFixed(0)} ${ty.toFixed(0)} ${tightSize.toFixed(0)} ${tightSize.toFixed(0)}"`);
      await emit('src/assets/brand/bbs-mark.svg', Buffer.from(tight), 24, 'tight viewBox');
    }

    // Favicon / app icons: original artwork on a cream rounded tile (like Logo3.png).
    const favSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx.toFixed(0)} ${vy.toFixed(0)} ${size.toFixed(0)} ${size.toFixed(0)}"><rect x="${vx.toFixed(0)}" y="${vy.toFixed(0)}" width="${size.toFixed(0)}" height="${size.toFixed(0)}" rx="${(size * 0.22).toFixed(0)}" fill="${CREAM}"/>${inner(brandColors)}</svg>`;
    await emit('public/favicon.svg', Buffer.from(svgo(favSvg, 'fav')), 24);

    const rasterize = (svgStr, px) => sharp(Buffer.from(svgStr), { density: 300 }).resize(px, px).png({ compressionLevel: 9, palette: true });
    for (const [px, out] of [[512, 'public/favicons/icon-512.png'], [192, 'public/favicons/icon-192.png'], [180, 'public/apple-touch-icon.png']]) {
      await emit(out, await rasterize(favSvg, px).toBuffer(), px >= 512 ? 60 : 20);
    }
    // Maskable: same art, extra safe zone (icon occupies the inner 80%).
    const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${(vx - size * 0.15).toFixed(0)} ${(vy - size * 0.15).toFixed(0)} ${(size * 1.3).toFixed(0)} ${(size * 1.3).toFixed(0)}"><rect x="${(vx - size * 0.2).toFixed(0)}" y="${(vy - size * 0.2).toFixed(0)}" width="${(size * 1.4).toFixed(0)}" height="${(size * 1.4).toFixed(0)}" fill="${CREAM}"/>${inner(brandColors)}</svg>`;
    for (const [px, out] of [[512, 'public/favicons/maskable-512.png'], [192, 'public/favicons/maskable-192.png']]) {
      await emit(out, await rasterize(maskSvg, px).toBuffer(), px >= 512 ? 60 : 20);
    }
    const icoPngs = await Promise.all([16, 32, 48].map((px) => sharp(Buffer.from(favSvg), { density: 300 }).resize(px, px).png().toBuffer()));
    await emit('public/favicon.ico', await pngToIco(icoPngs), 20);

    // Press: original mark — SVG, transparent PNG, and on a cream tile.
    const markCropSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.x.toFixed(0)} ${vb.y.toFixed(0)} ${vb.w.toFixed(0)} ${vb.h.toFixed(0)}">${inner(brandColors)}</svg>`;
    await emit('public/press/logos/bbs-mark.svg', Buffer.from(svgo(markCropSvg, 'bbs')), 20);
    await emit('public/press/logos/bbs-mark-2048.png', await sharp(Buffer.from(markCropSvg), { density: 300 }).resize({ width: 2048 }).png().toBuffer(), 400);
    await emit('public/press/logos/bbs-mark-on-cream-2048.png', await sharp(Buffer.from(markCropSvg), { density: 300 }).resize({ width: 1800 }).extend({ top: 124, bottom: 124, left: 124, right: 124, background: CREAM }).flatten({ background: CREAM }).png().toBuffer(), 400);

    // Legacy horizontal wordmark (Next.js branch) → cleaned SVG for press.
    try {
      const legacy = gitShow('origin/gh-pages', 'logo.svg').toString('utf8');
      await emit('public/press/logos/bbs-wordmark-legacy.svg', Buffer.from(svgo(legacy, 'wm')), 40, 'from gh-pages');
    } catch (e) { rows.push({ out: 'public/press/logos/bbs-wordmark-legacy.svg', bytes: 0, budgetKB: null, over: false, note: `skipped: ${e.message.split('\n')[0]}` }); }
  },

  /** Game icon (SVG, matte removed), wordmark PNG, key-art crops, poster */
  async mindaro() {
    let icon = await readFile(src('Mindaro', 'Mindaro_Logos', 'icon.svg'), 'utf8');
    icon = icon.replace(/<path class="cls-3"[^>]*\/>/, ''); // white background matte
    const iconClean = svgo(icon, 'mi');
    await emit('src/assets/mindaro/mindaro-icon.svg', Buffer.from(iconClean), 40);
    await emit('public/press/logos/mindaro-icon.svg', Buffer.from(iconClean), 40);
    await emit('public/press/logos/mindaro-icon-1024.png', await sharp(Buffer.from(iconClean), { density: 150 }).resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(), 200);

    const wm = sharp(src('Mindaro', 'Mindaro_Logos', 'MindaroFont3.png')).trim();
    await emit('src/assets/mindaro/mindaro-wordmark.png', await wm.clone().png({ palette: true, compressionLevel: 9 }).toBuffer(), 40);
    await emit('public/press/logos/mindaro-wordmark.png', await wm.clone().png({ compressionLevel: 9 }).toBuffer(), 60);

    const artNoTitle = src('Mindaro', 'Mindaro_Images', 'Wallpapers', 'CapsulePColoramarillo3.png');
    const artTitle = src('Mindaro', 'Mindaro_Images', 'Wallpapers', 'Capsule_W_Title.png');
    const F = { x: 0.5, y: 0.6 }; // pioneers
    await emit('src/assets/mindaro/keyart-wide.webp', await (await focalCrop(artNoTitle, 2400, 1000, F.x, F.y)).webp({ quality: 88, effort: 6 }).toBuffer(), 900);
    await emit('src/assets/mindaro/keyart-tablet.webp', await (await focalCrop(artNoTitle, 1600, 1000, F.x, F.y)).webp({ quality: 88, effort: 6 }).toBuffer(), 700);
    await emit('src/assets/mindaro/keyart-mobile.webp', await (await focalCrop(artNoTitle, 900, 1200, 0.5, 0.58)).webp({ quality: 86, effort: 6 }).toBuffer(), 500);
    await emit('src/assets/mindaro/keyart-full.webp', await sharp(artNoTitle).resize({ width: 2400 }).webp({ quality: 88, effort: 6 }).toBuffer(), 900, 'no title, full frame');
    await emit('src/assets/mindaro/keyart-title.webp', await sharp(artTitle).resize({ width: 1920 }).webp({ quality: 86, effort: 6 }).toBuffer(), 700, 'with title (covers)');
    await emit('src/assets/mindaro/keyart-poster.jpg', await sharp(artNoTitle).resize({ width: 1600 }).jpeg({ quality: 78, mozjpeg: true }).toBuffer(), 200);
    // Press full-res JPGs
    await emit('public/press/key-art/mindaro-key-art-title.jpg', await sharp(artTitle).resize({ width: 3200 }).jpeg({ quality: 90, mozjpeg: true }).toBuffer(), 2200);
    await emit('public/press/key-art/mindaro-key-art.jpg', await sharp(artNoTitle).resize({ width: 3200 }).jpeg({ quality: 90, mozjpeg: true }).toBuffer(), 2200);
    for (const [file, out] of [['Banner.jpg', 'mindaro-banner.jpg'], ['Wallpaper2.png', 'mindaro-wallpaper-a.jpg'], ['WallpaperPhotoshop.png', 'mindaro-wallpaper-b.jpg'], ['Mindaro wallcolor.jpg', 'mindaro-wallpaper-c.jpg']]) {
      const p = src('Mindaro', 'Mindaro_Images', 'Wallpapers', file);
      if (await exists(p)) await emit(`public/press/key-art/${out}`, await sharp(p).resize({ width: 2560, withoutEnlargement: true }).jpeg({ quality: 88, mozjpeg: true }).toBuffer(), 1800);
    }
    // Section background (darker, softer)
    await emit('src/assets/mindaro/bg-cave.webp', await sharp(src('Mindaro', 'Mindaro_Images', 'Wallpapers', 'Wallpaper2.png')).resize({ width: 1920 }).modulate({ brightness: 0.85, saturation: 0.9 }).webp({ quality: 80, effort: 6 }).toBuffer(), 500);
  },

  /** 12 team avatars → 960² WebP + press JPGs. Keys match `id` in src/content/team.json. */
  async team() {
    const members = [
      ['henry', 'Henry2.jpg'], ['venecia', 'Venecia.jpg'], ['paul', 'Paul2.jpg'], ['octavio', 'Octavio.jpg'], ['mata', 'Mata.jpg'],
      ['david', 'David.png'], ['roberto', 'Roberto.jpg'], ['keith', 'Keith.jpg'],
      ['santiago-vaca', 'mindaro_leon.jpg'], ['sofia', 'Andy.jpg'], ['santiago-perez', 'Andres.jpg'], ['juan-pablo', 'Gabriel.jpg'],
    ];
    for (const [id, file] of members) {
      const p = src('Mindaro', 'Mindaro_Images', 'TeamPictures', file);
      const base = sharp(p).resize(960, 960, { fit: 'cover', position: 'centre' });
      await emit(`src/assets/team/${id}.webp`, await base.clone().webp({ quality: 84, effort: 6 }).toBuffer(), 140);
      await emit(`public/press/team/${id}.jpg`, await base.clone().jpeg({ quality: 88, mozjpeg: true }).toBuffer(), 220);
    }
  },

  /** Pioneer hero cutout + 9 poses */
  async pioneer() {
    const hero = sharp(src('Mindaro', 'Mindaro_Images', 'Pioneer', 'PioneerV2.png')).trim();
    await emit('src/assets/pioneer/pioneer-hero.webp', await hero.clone().resize({ height: 1200 }).webp({ quality: 84, effort: 6, alphaQuality: 90 }).toBuffer(), 260);
    await emit('public/press/characters/pioneer.png', await sharp(src('Mindaro', 'Mindaro_Images', 'Pioneer', 'PioneerV2.png')).trim().resize({ height: 2000 }).png({ compressionLevel: 9 }).toBuffer(), 1000);
    for (let i = 1; i <= 9; i++) {
      const p = src('Mindaro', 'Mindaro_Images', 'Pioneer', `Sprite-000${i}.png`);
      if (!(await exists(p))) continue;
      await emit(`src/assets/pioneer/pose-0${i}.webp`, await sharp(p).flatten({ background: '#fffaf1' }).resize(696, 464, { fit: 'inside' }).webp({ quality: 82, effort: 6 }).toBuffer(), 70);
    }
    for (const [file, out] of [['Pioneer Pointing.png', 'pointing'], ['Pioneer Dead.png', 'dead'], ['Pioneer giving up.png', 'giving-up'], ['Pioneer with Bungus.png', 'with-bungus'], ['Pioneer Selfie Character.png', 'selfie'], ['Pioneer Sitting Down.png', 'sitting']]) {
      const p = src('Mindaro', 'Mindaro_Images', 'Pioneer', file);
      if (!(await exists(p))) continue;
      const meta = await sharp(p).metadata();
      const pipe = sharp(p).trim().resize({ width: Math.min(1000, meta.width), withoutEnlargement: true });
      await emit(`src/assets/pioneer/${out}.webp`, await pipe.webp({ quality: 82, effort: 6, alphaQuality: 90 }).toBuffer(), 160);
    }
  },

  /** Creatures + emotes */
  async creatures() {
    const L = (f) => src('Mindaro', 'Mindaro_Images', 'Creatures', 'LushLayer', f);
    const items = [['Denator.png', 'denator', 1600], ['Vorkula.png', 'vorkula', 1200], ['Hirustagua2.jpg', 'hirustagua', 1600]];
    for (const [file, out, w] of items) {
      const p = L(file);
      if (!(await exists(p))) { rows.push({ out, bytes: 0, budgetKB: null, over: false, note: 'missing source' }); continue; }
      const meta = await sharp(p).metadata();
      const pipe = sharp(p).trim().resize({ width: Math.min(w, meta.width), withoutEnlargement: true });
      await emit(`src/assets/creatures/${out}.webp`, await pipe.clone().webp({ quality: 82, effort: 6, alphaQuality: 90 }).toBuffer(), 320);
      if (meta.hasAlpha) await emit(`public/press/characters/${out}.png`, await sharp(p).trim().resize({ width: Math.min(2000, meta.width), withoutEnlargement: true }).png({ compressionLevel: 9 }).toBuffer(), 1400);
      else await emit(`public/press/characters/${out}.jpg`, await sharp(p).resize({ width: Math.min(2000, meta.width), withoutEnlargement: true }).jpeg({ quality: 88, mozjpeg: true }).toBuffer(), 900);
    }
    // Bungus: pick the smallest of the three masters
    for (const cand of ['Bungus.png', 'Bungus2.png', 'Bungus3.png', 'bungus.png']) {
      const p = L(cand);
      if (await exists(p)) {
        await emit('src/assets/creatures/bungus.webp', await sharp(p).trim().resize({ height: 1200 }).webp({ quality: 82, effort: 6, alphaQuality: 90 }).toBuffer(), 220);
        await emit('public/press/characters/bungus.png', await sharp(p).trim().resize({ height: 2000 }).png({ compressionLevel: 9 }).toBuffer(), 1200);
        break;
      }
    }
    // Emotes (128²) — copy as PNG
    const emoteDir = L('bungus');
    if (await exists(emoteDir)) {
      const { readdir } = await import('node:fs/promises');
      for (const f of (await readdir(emoteDir)).filter((f) => /\.png$/i.test(f))) {
        await emit(`src/assets/creatures/emotes/${f.toLowerCase()}`, await sharp(join(emoteDir, f)).png({ palette: true, compressionLevel: 9 }).toBuffer(), 30);
      }
    }
  },

  /** Concept sketches */
  async concept() {
    const S = (f) => src('Mindaro', 'Mindaro_Images', 'Sketches', f);
    const items = [['WadookV1.png', 'wadook'], ['Denator.png', 'denator-sketch'], ['ColossalCreature.png', 'colossal'], ['Vorkula.png', 'vorkula-sketch'], ['Pustaran.png', 'pustaran'], ['Pod_V1.png', 'pod']];
    for (const [file, out] of items) {
      const p = S(file);
      if (!(await exists(p))) continue;
      const meta = await sharp(p).metadata();
      await emit(`src/assets/concept/${out}.webp`, await sharp(p).resize({ width: Math.min(1200, meta.width), withoutEnlargement: true }).webp({ quality: 74, effort: 6 }).toBuffer(), 320);
      await emit(`public/press/concept-art/${out}.jpg`, await sharp(p).flatten({ background: '#ffffff' }).resize({ width: Math.min(2000, meta.width), withoutEnlargement: true }).jpeg({ quality: 88, mozjpeg: true }).toBuffer(), 900);
    }
  },

  /** In-game stills (Persecution + two from the legacy Jekyll branch) */
  async stills() {
    const per = src('Mindaro', 'Mindaro_Images', 'Pioneer', 'Persecution.png');
    await emit('src/assets/stills/persecution.webp', await sharp(per).trim().resize({ width: 1600 }).webp({ quality: 82, effort: 6, alphaQuality: 90 }).toBuffer(), 320);
    await emit('public/press/screenshots/persecution.png', await sharp(per).trim().png({ compressionLevel: 9 }).toBuffer(), 2000);
    for (const [path, out] of [['assets/img/DenatorChasing.png', 'denator-chasing'], ['assets/img/HoldBloony.png', 'hold-bloony']]) {
      try {
        const buf = gitShow('origin/new-pages', path);
        const meta = await sharp(buf).metadata();
        await emit(`src/assets/stills/${out}.webp`, await sharp(buf).resize({ width: Math.min(1600, meta.width), withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toBuffer(), 320, 'from new-pages');
        await emit(`public/press/screenshots/${out}.png`, await sharp(buf).png({ compressionLevel: 9 }).toBuffer(), 2000, 'from new-pages');
      } catch (e) { rows.push({ out, bytes: 0, budgetKB: null, over: false, note: `skipped: ${e.message.split('\n')[0]}` }); }
    }
  },

  /** Social images 1200×630 */
  async og() {
    const artTitle = src('Mindaro', 'Mindaro_Images', 'Wallpapers', 'Capsule_W_Title.png');
    const artNoTitle = src('Mindaro', 'Mindaro_Images', 'Wallpapers', 'CapsulePColoramarillo3.png');
    await emit('public/og/mindaro.jpg', await (await focalCrop(artTitle, 1200, 630, 0.5, 0.5)).jpeg({ quality: 84, mozjpeg: true }).toBuffer(), 220);
    // Studio card: dark navy field left with the mark + key art right
    const right = await (await focalCrop(artNoTitle, 700, 630, 0.5, 0.55)).toBuffer();
    // Original mark colors on a cream rounded tile (the navy flame needs a light tile on the navy card).
    const markSvg = (await readFile(resolve(ROOT, 'src/assets/brand/bbs-mark.svg'), 'utf8'))
      .replace(/var\(--logo-navy, #10212e\)/g, '#10212e').replace(/var\(--logo-ink, #020202\)/g, '#020202')
      .replace(/var\(--logo-paper, #fffaf1\)/g, '#fffaf1').replace(/var\(--logo-shade, #8a8a8a\)/g, '#8a8a8a');
    const tile = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360"><rect width="360" height="360" rx="80" fill="#fffaf1"/></svg>');
    const markArt = await sharp(Buffer.from(markSvg), { density: 150 }).resize(300, 300).png().toBuffer();
    const mark = await sharp(tile).composite([{ input: markArt, left: 30, top: 30 }]).png().toBuffer();
    const gradient = Buffer.from(`<svg width="1200" height="630"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0.35" stop-color="#0e1b24"/><stop offset="0.6" stop-color="#0e1b24" stop-opacity="0.35"/><stop offset="1" stop-color="#0e1b24" stop-opacity="0"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/></svg>`);
    const og = await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#0e1b24' } })
      .composite([{ input: right, left: 500, top: 0 }, { input: gradient, left: 0, top: 0 }, { input: mark, left: 90, top: 135 }])
      .jpeg({ quality: 84, mozjpeg: true }).toBuffer();
    await emit('public/og/site.jpg', og, 220);
  },

  /** Gameplay GIFs inside the SuperNova25 pitch deck → WebM/MP4 + poster */
  async gifs() {
    const pptx = src('Mindaro', 'Mindaro_Pitches', 'SuperNova25_PitchDeck_BBS.pptx');
    if (!(await exists(pptx))) { rows.push({ out: 'gifs', bytes: 0, budgetKB: null, over: false, note: 'pptx not found' }); return; }
    if (!ffmpegPath) { rows.push({ out: 'gifs', bytes: 0, budgetKB: null, over: false, note: 'ffmpeg-static unavailable' }); return; }
    const zip = new AdmZip(pptx);
    const gifs = zip.getEntries().filter((e) => /^ppt\/media\/image\d+\.gif$/i.test(e.entryName)).sort((a, b) => b.header.size - a.header.size).slice(0, 4);
    const tmp = resolve(ROOT, '.cache/gifs');
    await mkdir(tmp, { recursive: true });
    let n = 0;
    for (const e of gifs) {
      n++;
      const gifPath = join(tmp, `gameplay-0${n}.gif`);
      await writeFile(gifPath, e.getData());
      const webm = join(tmp, `gameplay-0${n}.webm`), mp4 = join(tmp, `gameplay-0${n}.mp4`), poster = join(tmp, `gameplay-0${n}.png`);
      const vf = 'crop=iw-8:ih-8:4:4,scale=min(1280\\,iw):-2:flags=lanczos,fps=15';
      execFileSync(ffmpegPath, ['-y', '-i', gifPath, '-an', '-vf', vf, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '36', '-row-mt', '1', '-pix_fmt', 'yuv420p', webm], { stdio: VERBOSE ? 'inherit' : 'ignore' });
      execFileSync(ffmpegPath, ['-y', '-i', gifPath, '-an', '-vf', `${vf},pad=ceil(iw/2)*2:ceil(ih/2)*2`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4], { stdio: VERBOSE ? 'inherit' : 'ignore' });
      execFileSync(ffmpegPath, ['-y', '-i', gifPath, '-frames:v', '1', '-vf', 'crop=iw-8:ih-8:4:4,scale=min(1280\\,iw):-2', poster], { stdio: VERBOSE ? 'inherit' : 'ignore' });
      await emit(`public/video/gameplay-0${n}.webm`, await readFile(webm), 2200, `from ${e.entryName}`);
      await emit(`public/video/gameplay-0${n}.mp4`, await readFile(mp4), 2800, `from ${e.entryName}`);
      await emit(`src/assets/stills/gameplay-0${n}-poster.webp`, await sharp(poster).webp({ quality: 80 }).toBuffer(), 150);
    }
  },

  /**
   * Press kit ZIPs + src/data/press-assets.json (run last).
   * Group folders are staged in .cache/press/<group> (not committed); only the ZIPs, the loose
   * logos and small WebP previews (src/assets/press/) are kept in the repo.
   */
  async press() {
    const { readdir } = await import('node:fs/promises');
    const stageDir = resolve(ROOT, '.cache/press');
    const logosDir = resolve(ROOT, 'public/press/logos');
    if (!existsSync(stageDir) && !existsSync(logosDir)) { rows.push({ out: 'press', bytes: 0, budgetKB: null, over: false, note: 'run other groups first' }); return; }
    const factsheet = await readFile(resolve(ROOT, 'scripts/press/factsheet.md'), 'utf8').catch(() => '# Mindaro — Fact sheet\n');
    await emit('public/press/factsheet.md', Buffer.from(factsheet), 40);
    const groupsMap = { logos: 'logos', 'key-art': 'key-art', screenshots: 'screenshots', 'concept-art': 'concept-art', characters: 'characters', team: 'team' };
    const dirOf = (g) => (g === 'logos' ? logosDir : resolve(stageDir, g));
    const zipDirs = async (dirs, outRel) => {
      if (DRY) { rows.push({ out: outRel, bytes: 0, budgetKB: null, over: false, note: 'dry-run' }); return 0; }
      const out = resolve(ROOT, outRel);
      await mkdir(dirname(out), { recursive: true });
      await new Promise((res, rej) => {
        const output = createWriteStream(out);
        const archive = new ZipArchive({ zlib: { level: 6 } });
        output.on('close', res); archive.on('error', rej);
        archive.pipe(output);
        for (const d of dirs) if (existsSync(dirOf(d))) archive.directory(dirOf(d), d, { date: ZIP_DATE });
        archive.append(factsheet, { name: 'factsheet.md', date: ZIP_DATE });
        archive.finalize();
      });
      const bytes = (await stat(out)).size;
      rows.push({ out: outRel, bytes, budgetKB: null, over: false, note: 'zip' });
      return bytes;
    };
    const assets = [];
    let order = 0;
    const L = (en, es, pt) => ({ en, es, pt });
    // (no all-in-one bundle: per-group ZIPs only, keeps the repo lean)
    const titles = {
      logos: L('Logos (Burning Boats + Mindaro)', 'Logos (Burning Boats + Mindaro)', 'Logos (Burning Boats + Mindaro)'),
      'key-art': L('Key art & wallpapers', 'Arte clave y wallpapers', 'Key art e wallpapers'),
      screenshots: L('Screenshots (work in progress)', 'Capturas (en desarrollo)', 'Capturas (em desenvolvimento)'),
      'concept-art': L('Concept art', 'Arte conceptual', 'Arte conceitual'),
      characters: L('Characters & creatures', 'Personajes y criaturas', 'Personagens e criaturas'),
      team: L('Team portraits', 'Retratos del equipo', 'Retratos da equipe'),
    };
    const previewPick = { logos: 'bbs-mark-on-cream-2048.png', 'key-art': 'mindaro-key-art-title.jpg', screenshots: 'denator-chasing.png', 'concept-art': 'wadook.jpg', characters: 'pioneer.png', team: 'venecia.jpg' };
    for (const [dir, group] of Object.entries(groupsMap)) {
      if (!existsSync(dirOf(dir))) continue;
      const bytes = await zipDirs([dir], `public/press/${dir}.zip`);
      const files = (await readdir(dirOf(dir))).filter((f) => !f.startsWith('.'));
      const pick = files.includes(previewPick[dir]) ? previewPick[dir] : files.find((f) => /\.(png|jpg)$/i.test(f));
      let preview;
      if (pick) {
        const buf = await sharp(join(dirOf(dir), pick)).flatten({ background: dir === 'logos' ? '#fffaf1' : '#10212e' }).resize({ width: 800, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
        await emit(`src/assets/press/${dir}.webp`, buf, 120);
        preview = dir;
      }
      assets.push({ id: dir, group, title: titles[dir], href: `/press/${dir}.zip`, bytes, order: order++, preview, description: L(`${files.length} files`, `${files.length} archivos`, `${files.length} arquivos`) });
    }
    assets.push({ id: 'factsheet', group: 'docs', title: L('Fact sheet (Markdown)', 'Ficha técnica (Markdown)', 'Ficha técnica (Markdown)'), href: '/press/factsheet.md', bytes: Buffer.byteLength(factsheet), order: order++ });
    await emit('src/data/press-assets.json', Buffer.from(JSON.stringify(assets, null, 2) + '\n'), 40);
  },
};

// ---------------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------------
const order = ['brand', 'mindaro', 'team', 'pioneer', 'creatures', 'concept', 'stills', 'og', 'gifs', 'press'];
const selected = only ? order.filter((g) => only.includes(g)) : order;
if (only) for (const g of only) if (!order.includes(g)) console.warn(pc.yellow(`unknown group: ${g}`));

console.log(pc.bold(`\nimport-assets — root: ${SRC_ROOT}${DRY ? ' (dry-run)' : ''}${FORCE ? ' (force)' : ''}`));
if (!existsSync(SRC_ROOT)) { console.error(pc.red(`Assets root not found: ${SRC_ROOT} (set BBS_ASSETS_ROOT)`)); process.exit(1); }

for (const g of selected) {
  process.stdout.write(pc.cyan(`\n▶ ${g}\n`));
  try { await groups[g](); } catch (e) { failures++; console.error(pc.red(`  ✖ ${g}: ${e.message}`)); if (VERBOSE) console.error(e); }
}

console.log('\n' + pc.bold('Outputs'));
for (const r of rows) {
  const status = r.over ? pc.red('OVER') : r.note === 'kept' ? pc.dim('kept') : pc.green('ok');
  console.log(`  ${status.padEnd(14)} ${kb(r.bytes).padStart(10)}${r.budgetKB ? pc.dim(` / ${r.budgetKB} KB`) : ''}  ${r.out}${r.note && r.note !== 'kept' ? pc.dim(`  (${r.note})`) : ''}`);
}
const total = rows.reduce((a, r) => a + r.bytes, 0);
console.log(`\n${rows.length} outputs · ${kb(total)} total${failures ? pc.red(` · ${failures} problem(s)`) : ''}\n`);
process.exit(STRICT && failures ? 1 : 0);
