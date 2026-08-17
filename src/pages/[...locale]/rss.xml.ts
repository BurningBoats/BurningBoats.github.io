import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { SITE, SITE_URL } from '~/config/site';
import { localeStaticPaths, localeFromParam, localeMeta, localePath, useDict } from '~/i18n';
import { getNewsForLocale } from '~/lib/news';

export const getStaticPaths = localeStaticPaths;

export const GET: APIRoute = async ({ params, site }) => {
  const locale = localeFromParam(params.locale);
  const t = useDict(locale);
  const base = site?.href ?? `${SITE_URL}/`;
  const posts = await getNewsForLocale(locale);
  return rss({
    title: `${SITE.name} — ${t.nav.news}`,
    description: t.seo.news.description,
    site: base,
    customData: `<language>${localeMeta[locale].hreflang}</language>`,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.excerpt,
      pubDate: p.data.date,
      link: localePath(locale, `news/${p.slug}`),
      categories: [...p.data.tags],
    })),
  });
};
