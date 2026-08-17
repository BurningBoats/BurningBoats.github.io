/** Motion tier detection: 'full' | 'lite' | 'reduced' (also mirrored on <html data-motion>). */
export type MotionTier = 'full' | 'lite' | 'reduced';

interface NavigatorExtra extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
}

export function prefersReducedMotion(): boolean {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function effectsOn(): boolean {
  return document.documentElement.dataset.effects === 'on';
}

export function detectTier(): MotionTier {
  if (prefersReducedMotion()) return 'reduced';
  const nav = navigator as NavigatorExtra;
  const coarseSmall = matchMedia('(pointer: coarse)').matches && window.innerWidth < 768;
  const lowCpu = (nav.hardwareConcurrency ?? 8) <= 4;
  const lowMem = (nav.deviceMemory ?? 8) <= 4;
  const saveData = nav.connection?.saveData === true;
  const slowNet = /(^|-)2g$/.test(nav.connection?.effectiveType ?? '');
  return coarseSmall || lowCpu || lowMem || saveData || slowNet ? 'lite' : 'full';
}

export function applyTier(): MotionTier {
  const tier = detectTier();
  document.documentElement.dataset.motion = tier;
  return tier;
}

/** True when the WebGL ember canvas may run (effects on, full tier, WebGL2 available). */
export function canRunEmbers(tier: MotionTier): boolean {
  if (!effectsOn() || tier === 'reduced') return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
