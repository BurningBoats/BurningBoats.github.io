/** JSON-LD builders (schema.org). Kept small and factual — no offers/dates until confirmed. */
import { SITE, SITE_URL } from '~/config/site';
import { MINDARO } from '~/data/mindaro';
import { localeMeta, type Locale } from '~/i18n';

const abs = (path: string) => new URL(path, SITE_URL).href;

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: `${SITE_URL}/`,
    logo: abs('/favicons/icon-512.png'),
    email: SITE.email,
    sameAs: [SITE.socials.instagram, SITE.socials.linkedin, SITE.socials.steam, SITE.socials.discord],
    address: { '@type': 'PostalAddress', addressCountry: 'MX' },
  };
}

export function videoGameLd(locale: Locale, description: string, url: string, image: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: MINDARO.name,
    url,
    image: abs(image),
    description,
    inLanguage: localeMeta[locale].hreflang,
    genre: ['Action', 'Horror', 'Co-op'],
    gamePlatform: 'PC',
    applicationCategory: 'Game',
    operatingSystem: 'Windows',
    playMode: ['CoOp', 'SinglePlayer'],
    numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 6 },
    author: { '@id': `${SITE_URL}/#organization` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    sameAs: [MINDARO.steam.url],
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.url) })),
  };
}

export function blogPostingLd(opts: { locale: Locale; title: string; description: string; url: string; image?: string; datePublished: Date; dateModified?: Date; author?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: opts.title,
    description: opts.description,
    url: abs(opts.url),
    mainEntityOfPage: abs(opts.url),
    image: opts.image ? abs(opts.image) : undefined,
    datePublished: opts.datePublished.toISOString(),
    dateModified: (opts.dateModified ?? opts.datePublished).toISOString(),
    inLanguage: localeMeta[opts.locale].hreflang,
    author: opts.author ? { '@type': 'Person', name: opts.author } : { '@id': `${SITE_URL}/#organization` },
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}
