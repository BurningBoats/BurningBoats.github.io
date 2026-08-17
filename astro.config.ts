import { writeFile } from 'node:fs/promises';
import { defineConfig } from 'astro/config';
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
