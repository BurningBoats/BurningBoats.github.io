/** Scroll-scrubbed parallax for [data-parallax] layers (desktop + hover devices only). */
import { gsap } from 'gsap';

export function initParallax() {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 768px) and (hover: hover) and (prefers-reduced-motion: no-preference)', () => {
    gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
      const depth = Number(el.dataset.parallax || 12); // yPercent travelled across the section
      const trigger = el.closest<HTMLElement>('[data-parallax-root]') ?? el.parentElement ?? el;
      gsap.to(el, {
        yPercent: depth,
        ease: 'none',
        scrollTrigger: { trigger, start: 'top top', end: 'bottom top', scrub: true },
      });
    });
    // Ken Burns settle on hero art
    gsap.utils.toArray<HTMLElement>('[data-settle]').forEach((el) => {
      gsap.fromTo(el, { scale: 1.06 }, { scale: 1, duration: 1.6, ease: 'power2.out', clearProps: 'scale' });
    });
  });
}
