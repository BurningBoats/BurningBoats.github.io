/**
 * Rising embers (Three.js Points + custom shader). This is the ONLY module that imports `three`,
 * so it ships as a separate lazy chunk and only loads on pages with `<canvas data-embers>`.
 * Colors are read from CSS (`--accent-ember-hot` / `--accent-ember-deep`) so recoloring the token recolors the fire.
 */
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Color, NormalBlending, OrthographicCamera, Points,
  Scene, ShaderMaterial, WebGLRenderer,
} from 'three';
import type { MotionTier } from '../motion/gates';

const VERT = /* glsl */ `
  attribute float aSeed;
  attribute float aSize;
  attribute float aSpeed;
  uniform float uTime;
  uniform float uDpr;
  varying float vLife;
  varying float vSeed;
  void main() {
    float life = fract(aSeed + uTime * aSpeed);
    float y = -1.15 + life * 2.35;
    float wob = sin(uTime * 0.7 + aSeed * 6.2831) * 0.04 + sin(uTime * 1.9 + aSeed * 3.1) * 0.015;
    float x = position.x + wob + (aSeed - 0.5) * 0.06 * life;
    vLife = life;
    vSeed = aSeed;
    gl_Position = vec4(x, y, 0.0, 1.0);
    float grow = smoothstep(0.0, 0.12, life) * (1.0 - smoothstep(0.55, 1.0, life));
    gl_PointSize = aSize * uDpr * (0.55 + 0.45 * grow);
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uHot;
  uniform vec3 uDeep;
  uniform float uAlpha;
  varying float vLife;
  varying float vSeed;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float d = length(p);
    float disc = smoothstep(0.5, 0.05, d);
    float core = smoothstep(0.22, 0.0, d);
    vec3 col = mix(uHot, uDeep, smoothstep(0.1, 0.9, vLife)) + core * 0.35;
    float fade = smoothstep(0.0, 0.08, vLife) * (1.0 - smoothstep(0.5, 1.0, vLife));
    float flicker = 0.82 + 0.18 * sin(vSeed * 40.0 + vLife * 34.0);
    gl_FragColor = vec4(col, disc * fade * flicker * uAlpha);
  }
`;

function cssColor(el: Element, name: string, fallback: string): Color {
  const raw = getComputedStyle(el).getPropertyValue(name).trim();
  try { return new Color(raw || fallback); } catch { return new Color(fallback); }
}

function isLight(): boolean {
  return document.documentElement.dataset.theme === 'light';
}

export function mount(canvas: HTMLCanvasElement, tier: MotionTier): () => void {
  const wrap = (canvas.closest<HTMLElement>('[data-embers-wrap]') ?? canvas.parentElement)!;
  const w = () => Math.max(1, wrap.clientWidth || window.innerWidth);
  const h = () => Math.max(1, wrap.clientHeight || window.innerHeight);

  const isTablet = window.innerWidth < 1024;
  const count = tier === 'lite' ? 180 : isTablet ? 350 : 700;
  const dpr = Math.min(window.devicePixelRatio || 1, tier === 'lite' ? 1 : 1.5);

  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    premultipliedAlpha: false,
    powerPreference: tier === 'lite' ? 'low-power' : 'high-performance',
  });
  renderer.setPixelRatio(dpr);
  renderer.setSize(w(), h(), false);
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);
  const speeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() * 2.2 - 1.1);
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = 0;
    seeds[i] = Math.random();
    sizes[i] = 1.4 + Math.random() * 2.8;
    speeds[i] = 0.05 + Math.random() * 0.13; // full lifetimes per second
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new BufferAttribute(seeds, 1));
  geometry.setAttribute('aSize', new BufferAttribute(sizes, 1));
  geometry.setAttribute('aSpeed', new BufferAttribute(speeds, 1));

  const material = new ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uDpr: { value: dpr },
      uHot: { value: cssColor(canvas, '--accent-ember-hot', '#ffcf80') },
      uDeep: { value: cssColor(canvas, '--accent-ember-deep', '#d9641b') },
      uAlpha: { value: 0.9 },
    },
  });

  const applyTheme = () => {
    material.uniforms.uHot.value = cssColor(canvas, '--accent-ember-hot', '#ffcf80');
    material.uniforms.uDeep.value = cssColor(canvas, '--accent-ember-deep', '#d9641b');
    const light = isLight() && !wrap.closest('.theme-dark');
    material.blending = light ? NormalBlending : AdditiveBlending;
    material.uniforms.uAlpha.value = light ? 0.55 : 0.9;
    material.needsUpdate = true;
  };
  document.addEventListener('bb:themechange', applyTheme);

  const points = new Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  let raf = 0;
  let running = false;
  let visible = true;
  const start = performance.now();
  const frame = () => {
    if (!running) return;
    material.uniforms.uTime.value = (performance.now() - start) / 1000;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };
  const play = () => { if (!running && visible && !document.hidden) { running = true; raf = requestAnimationFrame(frame); } };
  const pause = () => { running = false; cancelAnimationFrame(raf); };

  const io = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    if (visible) play(); else pause();
  }, { threshold: 0 });
  io.observe(wrap);

  const onVis = () => { if (document.hidden) pause(); else play(); };
  document.addEventListener('visibilitychange', onVis);

  const ro = new ResizeObserver(() => renderer.setSize(w(), h(), false));
  ro.observe(wrap);

  wrap.setAttribute('data-embers-ready', '');
  play();

  return () => {
    pause();
    io.disconnect();
    ro.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    document.removeEventListener('bb:themechange', applyTheme);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    wrap.removeAttribute('data-embers-ready');
  };
}
