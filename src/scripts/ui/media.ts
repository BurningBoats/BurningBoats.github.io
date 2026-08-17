/**
 * Media helpers:
 *  - YouTube façade ([data-yt]) → injects the privacy-enhanced iframe on click, preconnects on hover.
 *  - Ambient <video data-ambient> → play/pause with visibility, respects reduced motion & save-data.
 *  - Pose reel ([data-reel]) → cycles frames, prev/next buttons.
 */
function preconnect(href: string) {
  if (document.head.querySelector(`link[rel="preconnect"][href="${href}"]`)) return;
  const l = document.createElement('link');
  l.rel = 'preconnect';
  l.href = href;
  document.head.appendChild(l);
}

document.addEventListener('pointerenter', (e) => {
  const el = (e.target as Element | null)?.closest?.('[data-yt]');
  if (el) { preconnect('https://www.youtube-nocookie.com'); preconnect('https://www.google.com'); }
}, true);

document.addEventListener('click', (e) => {
  const btn = (e.target as Element | null)?.closest<HTMLElement>('[data-yt-play]');
  const wrap = btn?.closest<HTMLElement>('[data-yt]');
  if (!btn || !wrap) return;
  const id = wrap.dataset.yt;
  if (!id) return;
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  iframe.title = wrap.dataset.ytTitle ?? 'Trailer';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  wrap.replaceChildren(iframe);
  wrap.dataset.ytState = 'playing';
});

function initAmbient() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  document.querySelectorAll<HTMLVideoElement>('video[data-ambient]').forEach((v) => {
    if (reduce || saveData) { v.pause(); v.removeAttribute('autoplay'); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) v.play().catch(() => {}); else v.pause(); });
    }, { threshold: 0.2 });
    io.observe(v);
    v.closest('[data-ambient-wrap]')?.querySelector<HTMLButtonElement>('[data-ambient-toggle]')?.addEventListener('click', (ev) => {
      const b = ev.currentTarget as HTMLButtonElement;
      if (v.paused) { v.play().catch(() => {}); b.dataset.state = 'playing'; } else { v.pause(); b.dataset.state = 'paused'; }
    });
  });
}

function initReels() {
  document.querySelectorAll<HTMLElement>('[data-reel]').forEach((reel) => {
    const frames = [...reel.querySelectorAll<HTMLElement>('[data-reel-frame]')];
    if (frames.length < 2) return;
    let i = 0;
    let timer: number | null = null;
    const label = reel.querySelector<HTMLElement>('[data-reel-label]');
    const show = (n: number) => {
      i = (n + frames.length) % frames.length;
      frames.forEach((f, k) => { f.hidden = k !== i; f.setAttribute('aria-hidden', String(k !== i)); });
      if (label) label.textContent = `CAM ${String(i + 1).padStart(2, '0')}/${String(frames.length).padStart(2, '0')}`;
    };
    const auto = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = () => { if (auto && timer === null) timer = window.setInterval(() => show(i + 1), 1400); };
    const stop = () => { if (timer !== null) { clearInterval(timer); timer = null; } };
    reel.querySelector('[data-reel-prev]')?.addEventListener('click', () => { stop(); show(i - 1); });
    reel.querySelector('[data-reel-next]')?.addEventListener('click', () => { stop(); show(i + 1); });
    reel.addEventListener('pointerenter', stop);
    reel.addEventListener('pointerleave', start);
    const io = new IntersectionObserver((entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())));
    io.observe(reel);
    show(0);
  });
}

document.addEventListener('astro:page-load', () => { initAmbient(); initReels(); });
export {};
