/**
 * Single source of truth for site-wide configuration.
 *
 * Two lines control the "ember" accent and the fire/particle effects:
 *   - src/styles/tokens.css → `--accent-ember`  (recolor the accent)
 *   - SITE.effects.enabled below                (turn every fire effect off/on)
 * Everything else reads from these; nothing else needs to change.
 */

export const LOCALES = ['en', 'es', 'pt'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const SITE = {
  name: 'Burning Boats Studios',
  shortName: 'Burning Boats',
  legalName: 'Burning Boats Studios LLC',
  /** GitHub Pages host — used until the custom domain is live. */
  githubHost: 'https://burningboats.github.io',
  /**
   * Custom domain switch. Leave '' until DNS is configured; then set
   * 'burningboats.games' → the build emits dist/CNAME and every absolute URL
   * (canonical, hreflang, OG, sitemap, robots) switches to the new host.
   */
  customDomain: '',
  email: 'contact@burningboats.games',
  socials: {
    instagram: 'https://www.instagram.com/burningboatsss/',
    linkedin: 'https://www.linkedin.com/company/burning-boats-studios-llc',
    steam: 'https://store.steampowered.com/app/3879330/',
    discord: 'https://discord.gg/bxkRXGFtz7',
  },
  steamAppId: '3879330',
  discord: {
    serverId: '1332207802327765064',
    invite: 'https://discord.gg/bxkRXGFtz7',
  },
  /** Fire/particle effects. `enabled: false` removes every ember visual in one line. */
  effects: {
    enabled: true,
    embers: true,
    preloader: true,
    smoothScroll: true,
    pageTransitions: true,
  },
  /** Dark is the cinematic default; set true to follow the OS scheme when no choice is stored. */
  respectOsColorScheme: false,
} as const;

export const SITE_URL = SITE.customDomain ? `https://${SITE.customDomain}` : SITE.githubHost;
