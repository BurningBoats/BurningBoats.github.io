/** Logo intro: mark as seen for the session, allow skipping, clean up when the CSS animation ends. */
function setup() {
  const intro = document.querySelector<HTMLElement>('[data-intro-overlay]');
  if (!intro) return;
  const seen = document.documentElement.dataset.intro === 'seen';
  const mobile = !matchMedia('(min-width: 768px)').matches; // desktop-only (see Intro.astro)
  if (seen || mobile) { intro.remove(); return; }
  try { sessionStorage.setItem('bb.intro', '1'); } catch { /* ignore */ }
  document.documentElement.dataset.intro = 'playing';

  const finish = () => {
    intro.classList.add('is-done');
    document.documentElement.dataset.intro = 'seen';
    intro.remove();
    document.removeEventListener('keydown', skip);
    document.removeEventListener('pointerdown', skip);
  };
  const skip = () => { intro.classList.add('is-skipped'); };
  intro.addEventListener('animationend', (e) => { if (e.target === intro) finish(); });
  document.addEventListener('keydown', skip, { once: true });
  document.addEventListener('pointerdown', skip, { once: true });
  // Safety net: never trap the page.
  setTimeout(() => { if (document.body.contains(intro)) finish(); }, 2500);
}

document.addEventListener('astro:page-load', setup);
export {};
