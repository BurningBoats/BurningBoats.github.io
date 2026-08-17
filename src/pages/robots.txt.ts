import type { APIRoute } from 'astro';
import { SITE_URL } from '~/config/site';

export const GET: APIRoute = ({ site }) => {
  const base = site?.href ?? `${SITE_URL}/`;
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${new URL('sitemap-index.xml', base).href}`, ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
