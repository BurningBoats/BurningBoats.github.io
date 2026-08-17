/** Header behaviour: shrink on scroll, hide on scroll-down, mobile drawer with focus trap. */
const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

let lastY = 0;
let ticking = false;
let isOpen = false;
let lastFocus: HTMLElement | null = null;

const header = () => document.querySelector<HTMLElement>('[data-nav]');
const drawer = () => document.querySelector<HTMLElement>('[data-nav-drawer]');
const toggle = () => document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
const inertTargets = () => document.querySelectorAll<HTMLElement>('[data-main], [data-footer]');

function onScroll() {
  const h = header();
  if (!h) return;
  const y = window.scrollY;
  h.classList.toggle('is-scrolled', y > 24);
  if (!isOpen) {
    if (y > 240 && y > lastY + 6) h.classList.add('is-hidden');
    else if (y < lastY - 6 || y < 120) h.classList.remove('is-hidden');
  }
  lastY = y;
  ticking = false;
}
window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

function setOpen(next: boolean) {
  const d = drawer(); const t = toggle(); const h = header();
  if (!d || !t) return;
  isOpen = next;
  d.hidden = !next;
  t.setAttribute('aria-expanded', String(next));
  const label = next ? t.dataset.labelClose : t.dataset.labelOpen;
  if (label) t.setAttribute('aria-label', label);
  h?.classList.toggle('is-open', next);
  document.documentElement.style.overflow = next ? 'hidden' : '';
  inertTargets().forEach((el) => { if (next) el.setAttribute('inert', ''); else el.removeAttribute('inert'); });
  if (next) {
    lastFocus = document.activeElement as HTMLElement | null;
    const panel = d.querySelector<HTMLElement>('[role="dialog"]');
    (panel?.querySelector<HTMLElement>(FOCUSABLE) ?? panel)?.focus({ preventScroll: true });
  } else {
    lastFocus?.focus({ preventScroll: true });
    lastFocus = null;
  }
}

document.addEventListener('click', (e) => {
  const target = e.target as Element | null;
  if (!target) return;
  if (target.closest('[data-nav-toggle]')) { setOpen(!isOpen); return; }
  if (target.closest('[data-nav-close]')) { setOpen(false); return; }
  if (isOpen && target.closest('[data-nav-drawer] a')) setOpen(false);
});

document.addEventListener('keydown', (e) => {
  if (!isOpen) return;
  if (e.key === 'Escape') { e.preventDefault(); setOpen(false); return; }
  if (e.key !== 'Tab') return;
  const d = drawer(); if (!d) return;
  const nodes = [...d.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null);
  if (nodes.length === 0) return;
  const first = nodes[0], last = nodes[nodes.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

// Close the drawer above the desktop breakpoint and reset state on navigation.
matchMedia('(min-width: 64rem)').addEventListener('change', (m) => { if (m.matches && isOpen) setOpen(false); });
document.addEventListener('astro:before-swap', () => { if (isOpen) setOpen(false); });
document.addEventListener('astro:page-load', () => { isOpen = false; lastY = window.scrollY; onScroll(); });

// Copy-to-clipboard buttons ([data-copy]).
document.addEventListener('click', async (e) => {
  const btn = (e.target as Element | null)?.closest<HTMLElement>('[data-copy]');
  if (!btn) return;
  const text = btn.dataset.copy ?? '';
  try {
    await navigator.clipboard.writeText(text);
    const prev = btn.getAttribute('aria-label') ?? '';
    btn.dataset.state = 'copied';
    if (btn.dataset.copiedLabel) btn.setAttribute('aria-label', btn.dataset.copiedLabel);
    setTimeout(() => { delete btn.dataset.state; btn.setAttribute('aria-label', prev); }, 1600);
  } catch { /* clipboard blocked */ }
});

export {};
