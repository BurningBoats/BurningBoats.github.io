/** Discord façade: fetch public widget counts when in view; load the iframe only on demand. */
const seen = new WeakSet<HTMLElement>();

async function hydrate(card: HTMLElement) {
  if (seen.has(card)) return;
  seen.add(card);
  const id = card.dataset.server;
  const text = card.querySelector<HTMLElement>('[data-discord-count-text]');
  if (!id || !text) return;
  try {
    const res = await fetch(`https://discord.com/api/guilds/${id}/widget.json`, { mode: 'cors' });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as { presence_count?: number };
    const n = data.presence_count ?? 0;
    text.textContent = (card.dataset.onlineLabel ?? '{count} online').replace('{count}', String(n));
    card.dataset.discordState = 'ok';
  } catch {
    text.textContent = 'discord.gg/' + (card.querySelector<HTMLAnchorElement>('a[href*="discord.gg"]')?.href.split('/').pop() ?? '');
    card.dataset.discordState = 'error';
  }
}

function init() {
  const cards = document.querySelectorAll<HTMLElement>('[data-discord]');
  if (cards.length === 0) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { void hydrate(e.target as HTMLElement); io.unobserve(e.target); } });
  }, { rootMargin: '200px' });
  cards.forEach((c) => io.observe(c));
}

document.addEventListener('click', (e) => {
  const btn = (e.target as Element | null)?.closest<HTMLElement>('[data-discord-toggle]');
  if (!btn) return;
  const card = btn.closest<HTMLElement>('[data-discord]');
  const frame = card?.querySelector<HTMLElement>('[data-discord-frame]');
  const iframe = frame?.querySelector<HTMLIFrameElement>('iframe');
  if (!frame || !iframe) return;
  if (frame.hidden) {
    if (!iframe.src && iframe.dataset.src) iframe.src = iframe.dataset.src;
    frame.hidden = false;
    btn.hidden = true;
  }
});

document.addEventListener('astro:page-load', init);
export {};
