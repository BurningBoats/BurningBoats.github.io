/** Scroll reveals for [data-reveal-item] (batched, once). CSS sets the hidden initial state per tier. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MotionTier } from './gates';

export function initReveals(tier: MotionTier) {
  const items = gsap.utils.toArray<HTMLElement>('[data-reveal-item]');
  if (items.length === 0) return;

  if (tier === 'reduced') {
    ScrollTrigger.batch(items, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, duration: 0.2, ease: 'none', overwrite: true }),
    });
    revealAboveFold(items, 0.2);
    return;
  }

  const y = tier === 'lite' ? 16 : 24;
  ScrollTrigger.batch(items, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06, overwrite: true, clearProps: 'transform' }),
  });
  revealAboveFold(items, 0.7, y);
}

/** Items already inside the viewport at load reveal immediately (ScrollTrigger.batch handles the rest). */
function revealAboveFold(items: HTMLElement[], duration: number, _y = 0) {
  const vh = window.innerHeight;
  const visible = items.filter((el) => el.getBoundingClientRect().top < vh * 0.88);
  if (visible.length) gsap.to(visible, { autoAlpha: 1, y: 0, duration, ease: 'power3.out', stagger: 0.06, overwrite: true, clearProps: 'transform' });
}
