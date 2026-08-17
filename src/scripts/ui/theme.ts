/** Light/dark theme toggle. The head inline script applies the stored choice pre-paint; this syncs buttons and handles clicks. */
const KEY = 'bb.theme';
type Theme = 'light' | 'dark';

const root = () => document.documentElement;
const current = (): Theme => (root().dataset.theme === 'light' ? 'light' : 'dark');

function syncButtons(theme: Theme = current()) {
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) => {
    btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    const label = theme === 'light' ? btn.dataset.labelDark : btn.dataset.labelLight;
    if (label) { btn.setAttribute('aria-label', label); btn.title = label; }
  });
  const meta = document.querySelector('meta[data-theme-color]');
  meta?.setAttribute('content', theme === 'light' ? '#fffaf1' : '#0e1b24');
}

export function setTheme(theme: Theme) {
  root().dataset.theme = theme;
  try { localStorage.setItem(KEY, theme); } catch { /* private mode */ }
  syncButtons(theme);
  document.dispatchEvent(new CustomEvent('bb:themechange', { detail: { theme } }));
}

document.addEventListener('click', (e) => {
  const btn = (e.target as Element | null)?.closest<HTMLElement>('[data-theme-toggle]');
  if (!btn) return;
  const next: Theme = current() === 'light' ? 'dark' : 'light';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
  if (!reduce && typeof doc.startViewTransition === 'function') doc.startViewTransition(() => setTheme(next));
  else setTheme(next);
});

document.addEventListener('astro:page-load', () => syncButtons());
document.addEventListener('astro:after-swap', () => syncButtons());
