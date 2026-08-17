/** Magnetic hover for [data-magnetic] buttons (pointer devices only). */
import { gsap } from 'gsap';

export function initMagnetic() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  gsap.utils.toArray<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = 0.3;
    const radius = 80;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) > radius + Math.max(r.width, r.height) / 2) return;
      xTo(dx * strength);
      yTo(dy * strength);
    };
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.6)' });
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
  });
}
