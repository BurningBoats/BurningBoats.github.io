import { getCollection, type CollectionEntry } from 'astro:content';
import { DEFAULT_LOCALE, LOCALES, localePath, type Locale } from '~/i18n';

export type NewsEntry = CollectionEntry<'news'> & { slug: string };

const slugOf = (entry: CollectionEntry<'news'>) => entry.id.split('/').pop()!;
const isPublished = (entry: CollectionEntry<'news'>) => !entry.data.draft && (import.meta.env.DEV || entry.data.date <= new Date());

/** Published posts for a locale, newest first. Posts missing in the locale fall back to English. */
export async function getNewsForLocale(locale: Locale): Promise<NewsEntry[]> {
  const all = (await getCollection('news')).filter(isPublished);
  const byKey = new Map<string, NewsEntry>();
  for (const e of all) if (e.data.lang === DEFAULT_LOCALE) byKey.set(e.data.translationOf, { ...e, slug: slugOf(e) });
  for (const e of all) if (e.data.lang === locale) byKey.set(e.data.translationOf, { ...e, slug: slugOf(e) });
  return [...byKey.values()].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Sibling URLs of a post in every locale where a translation exists (for hreflang + the switcher). */
export async function newsAlternates(translationOf: string): Promise<Partial<Record<Locale, string>>> {
  const all = (await getCollection('news')).filter(isPublished);
  const out: Partial<Record<Locale, string>> = {};
  for (const l of LOCALES) {
    const e = all.find((x) => x.data.translationOf === translationOf && x.data.lang === l);
    if (e) out[l] = localePath(l, `news/${slugOf(e)}`);
  }
  return out;
}

export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
