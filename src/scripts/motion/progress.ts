/** Reading progress bar for long-form pages ([data-reading-progress] inside <article>). */
import { gsap } from 'gsap';

export function initReadingProgress() {
  const bar = document.querySelector<HTMLElement>('[data-reading-progress]');
  const article = bar?.closest('article') ?? document.querySelector('article');
  if (!bar || !article) return;
  gsap.fromTo(bar, { scaleX: 0 }, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { trigger: article, start: 'top top', end: 'bottom bottom', scrub: 0.2 },
  });
}
