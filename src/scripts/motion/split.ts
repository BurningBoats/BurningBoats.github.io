/** Split-text reveals for [data-split] headings (words slide up behind a line mask). */
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import type { MotionTier } from './gates';

gsap.registerPlugin(SplitText);

export function initHeadings(tier: MotionTier) {
  const targets = gsap.utils.toArray<HTMLElement>('[data-split]');
  // On lite devices only the hero headline splits; section titles use the plain reveal.
  const selected = tier === 'lite' ? targets.filter((el) => el.dataset.split === 'hero') : targets;
  // While the logo intro plays (Home, first visit) the hero headline waits for the curtain to lift.
  const introPlaying = document.documentElement.dataset.intro === 'playing';
  selected.forEach((el) => {
    const isHero = el.dataset.split === 'hero';
    const delay = Number(el.dataset.splitDelay ?? 0) + (isHero && introPlaying ? 1.0 : 0);
    const trigger = isHero ? null : el;
    SplitText.create(el, {
      type: 'lines,words',
      mask: 'lines',
      autoSplit: true,
      aria: 'auto',
      linesClass: 'split-line',
      wordsClass: 'split-word',
      onSplit(self) {
        const tween = gsap.from(self.words, {
          yPercent: 110,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.04,
          delay,
          ...(trigger ? { scrollTrigger: { trigger, start: 'top 85%', once: true } } : {}),
        });
        return tween;
      },
    });
    el.dataset.splitReady = '';
  });
}
