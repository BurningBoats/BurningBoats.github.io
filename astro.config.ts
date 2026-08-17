import { writeFile } from 'node:fs/promises';
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import type { AstroIntegration } from 'astro';
import { SITE, SITE_URL, LOCALES, DEFAULT_LOCALE } from './src/config/site';

/** Writes dist/CNAME only when SITE.customDomain is set (see src/config/site.ts). */
const cnameIntegration = (): AstroIntegration => ({
  name: 'bbs:cname',
  hooks: {
    'astro:build:done': async ({ dir, logger }) => {
      if (!SITE.customDomain) return;
      await writeFile(new URL('CNAME', dir), `${SITE.customDomain}\n`);
      logger.info(`CNAME written for ${SITE.customDomain}`);
    },
  },
});

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  // Astro 7 defaults to 'jsx' which strips whitespace between inline elements — unsafe for split-text/inline links.
  compressHTML: true,
  cacheDir: './.cache/astro',
  i18n: {
    defaultLocale: DEFAULT_LOCALE,
    locales: [...LOCALES],
    routing: { prefixDefaultLocale: false },
  },
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
  // Self-hosted at build time (no runtime requests to Google). Families map to --ff-* → tokens.css.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Bricolage Grotesque',
      cssVariable: '--ff-display',
      weights: ['200 800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Instrument Sans',
      cssVariable: '--ff-body',
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'JetBrains Mono',
      cssVariable: '--ff-mono',
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'Menlo', 'Consolas', 'monospace'],
    },
    {
      // Studio's hand-drawn face (Calligraphr). Only A–Z/a–z exist → restricted with unicode-range.
      provider: fontProviders.local(),
      name: 'Mindaro',
      cssVariable: '--ff-mindaro',
      fallbacks: ['Bricolage Grotesque', 'ui-sans-serif', 'sans-serif'],
      unicodeRange: ['U+0020', 'U+0041-005A', 'U+0061-007A'],
      options: {
        variants: [{ weight: 400, style: 'normal', src: ['./src/assets/fonts/mindaro-display.woff2'] }],
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: DEFAULT_LOCALE,
        locales: { en: 'en', es: 'es', pt: 'pt-BR' },
      },
      filter: (page) => !/\/404\/?$/.test(page),
    }),
    cnameIntegration(),
  ],
});
