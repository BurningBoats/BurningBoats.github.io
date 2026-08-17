import { LOCALES, DEFAULT_LOCALE, type Locale } from '~/config/site';
import { en } from './en';
import { es } from './es';
import { pt } from './pt';

export { LOCALES, DEFAULT_LOCALE };
export type { Locale };

/** `en` is the schema; `es`/`pt` must satisfy it (see their `satisfies Dictionary`). */
export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, es, pt };

export const localeMeta = {
  en: { label: 'English', short: 'EN', hreflang: 'en', og: 'en_US', intl: 'en-US' },
  es: { label: 'Español', short: 'ES', hreflang: 'es', og: 'es_MX', intl: 'es-MX' },
  pt: { label: 'Português', short: 'PT', hreflang: 'pt-BR', og: 'pt_BR', intl: 'pt-BR' },
} as const satisfies Record<Locale, { label: string; short: string; hreflang: string; og: string; intl: string }>;

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Typed dictionary for a locale. Usage: `const t = useDict(locale); t.nav.home` */
export function useDict(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

/** `fmt('Switch to {mode} mode', { mode: 'light' })` */
export function fmt(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** Static paths for `src/pages/[...locale]/*.astro` — EN is unprefixed. */
export function localeStaticPaths() {
  return LOCALES.map((locale) => ({
    params: { locale: locale === DEFAULT_LOCALE ? undefined : locale },
    props: { locale },
  }));
}

/** Resolve the locale from the `[...locale]` param (undefined → default). */
export function localeFromParam(param: string | undefined): Locale {
  return isLocale(param) ? param : DEFAULT_LOCALE;
}

/** Build a site-relative URL for a locale: localePath('es', 'mindaro') → '/es/mindaro/' */
export function localePath(locale: Locale, path = ''): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  const url = `${prefix}/${clean}`.replace(/\/{2,}/g, '/');
  return url.endsWith('/') ? url : `${url}/`;
}

/** '/es/news/hola/' → { locale: 'es', rest: 'news/hola/' } */
export function stripLocale(pathname: string): { locale: Locale; rest: string } {
  const m = pathname.match(/^\/([a-z]{2})(\/|$)/);
  if (m && isLocale(m[1]) && m[1] !== DEFAULT_LOCALE) {
    return { locale: m[1], rest: pathname.slice(m[0].length) };
  }
  return { locale: DEFAULT_LOCALE, rest: pathname.replace(/^\/+/, '') };
}

/** Sibling URLs of the same route in every locale (used by hreflang + the switcher). */
export function localeAlternates(rest: string, overrides: Partial<Record<Locale, string>> = {}): Record<Locale, string> {
  return Object.fromEntries(LOCALES.map((l) => [l, overrides[l] ?? localePath(l, rest)])) as Record<Locale, string>;
}

/** Content dates are date-only (parsed as UTC midnight) → format in UTC so the day never shifts. */
export function formatDate(date: Date, locale: Locale, opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }): string {
  return new Intl.DateTimeFormat(localeMeta[locale].intl, { timeZone: 'UTC', ...opts }).format(date);
}
