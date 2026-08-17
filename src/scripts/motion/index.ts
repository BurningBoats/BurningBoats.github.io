/**
 * Motion runtime — one entry, driven by the ClientRouter lifecycle.
 *   astro:page-load   → boot():  tier gate, Lenis (full only), reveals, headings, parallax, embers (lazy)
 *   astro:before-swap → teardown(): dispose WebGL, kill ScrollTriggers, destroy Lenis
 * Every effect degrades: 'lite' (small/low-power devices) and 'reduced' (prefers-reduced-motion).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { applyTier, canRunEmbers, type MotionTier } from './gates';
import { initReveals } from './reveal';
import { initHeadings } from './split';
import { initParallax } from './parallax';
import { initMagnetic } from './magnetic';
import { initReadingProgress } from './progress';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let ctx: gsap.Context | null = null;
let disposeEmbers: (() => void) | null = null;
let rafHandler: ((time: number) => void) | null = null;
let failsafe: number | null = null;

function startLenis() {
  if (matchMedia('(pointer: coarse)').matches) return; // native momentum scrolling is better on touch
  lenis = new Lenis({ anchors: { offset: -72 }, lerp: 0.1, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  rafHandler = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(rafHandler);
  gsap.ticker.lagSmoothing(0);
}

async function boot() {
  const tier: MotionTier = applyTier();
  // Failsafe: if anything throws before reveals run, content must never stay hidden.
  failsafe = window.setTimeout(() => document.documentElement.setAttribute('data-motion-failed', ''), 3000);

  try {
    if (tier === 'full') startLenis();

    ctx = gsap.context(() => {
      initReveals(tier);
      initReadingProgress();
      if (tier !== 'reduced') initHeadings(tier);
      if (tier === 'full') { initParallax(); initMagnetic(); }
    });

    const canvas = document.querySelector<HTMLCanvasElement>('canvas[data-embers]');
    if (canvas && canRunEmbers(tier)) {
      const run = async () => {
        try {
          const mod = await import('../fx/embers');
          disposeEmbers = mod.mount(canvas, tier);
        } catch (err) {
          console.warn('[embers] failed to start', err);
          canvas.closest('[data-embers-wrap]')?.setAttribute('data-embers-fallback', '');
        }
      };
      if ('requestIdleCallback' in window) (window as Window & { requestIdleCallback: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback(run, { timeout: 1200 });
      else setTimeout(run, 200);
    }

    await document.fonts?.ready;
    ScrollTrigger.refresh();
    if (failsafe) { clearTimeout(failsafe); failsafe = null; }
    document.documentElement.removeAttribute('data-motion-failed');
  } catch (err) {
    console.warn('[motion] boot failed', err);
    document.documentElement.setAttribute('data-motion-failed', '');
  }
}

function teardown() {
  disposeEmbers?.();
  disposeEmbers = null;
  ctx?.revert();
  ctx = null;
  ScrollTrigger.getAll().forEach((t) => t.kill());
  if (rafHandler) { gsap.ticker.remove(rafHandler); rafHandler = null; }
  lenis?.destroy();
  lenis = null;
  if (failsafe) { clearTimeout(failsafe); failsafe = null; }
}

document.addEventListener('astro:page-load', () => { void boot(); });
document.addEventListener('astro:before-swap', teardown);
document.addEventListener('visibilitychange', () => { if (document.hidden) lenis?.stop(); else lenis?.start(); });

/** Expose for debugging + for the intro to pause scrolling. */
export const motion = {
  get lenis() { return lenis; },
  refresh: () => ScrollTrigger.refresh(),
};
