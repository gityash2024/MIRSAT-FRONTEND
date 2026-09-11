import { describe, expect, it } from 'vitest';
import { compile, middleware, serialize, stringify } from 'stylis';
import {
  COLOR_ROLES,
  contrastRatio,
  parseColor,
  replaceColors,
  toDarkColor,
} from './darkColorTransform';
import { stylisDarkPlugin } from './stylisDarkPlugin';
import { DARK_PALETTE as P } from './darkPalette';

const { BG, TEXT, BORDER, SHADOW } = COLOR_ROLES;
const SURFACE = parseColor(P.surface);

describe('toDarkColor', () => {
  it('turns light surfaces into the mobile dark surfaces', () => {
    expect(toDarkColor('#fff', BG)).toBe(P.surface);
    expect(toDarkColor('white', BG)).toBe(P.surface);
    expect(toDarkColor('#f8fafc', BG)).toBe(P.backgroundLight);
    expect(toDarkColor('var(--color-offwhite)', BG)).toBe(P.background);
  });

  it('keeps white text and faint white overlays', () => {
    expect(toDarkColor('white', TEXT)).toBe('white');
    expect(toDarkColor('#fff', TEXT)).toBe('#fff');
    expect(toDarkColor('rgba(255, 255, 255, 0.2)', BG)).toBe('rgba(255, 255, 255, 0.2)');
  });

  it('keeps the alpha of translucent surfaces', () => {
    expect(toDarkColor('rgba(255, 255, 255, 0.9)', BG)).toBe('rgba(23, 23, 23, 0.9)');
  });

  it('brightens brand navy by role', () => {
    expect(toDarkColor('#000048', BG)).toBe(P.navy);
    expect(toDarkColor('var(--color-navy)', BG)).toBe(P.navy);
    expect(toDarkColor('var(--color-navy)', TEXT)).toBe(P.navyText);
    expect(toDarkColor('var(--color-navy)', BORDER)).toBe(P.navyBorder);
  });

  it('maps neutral text and dividers to the palette', () => {
    expect(toDarkColor('#64748b', TEXT)).toBe(P.textTertiary);
    expect(toDarkColor('#1a202c', TEXT)).toBe(P.textPrimary);
    expect(toDarkColor('#e2e8f0', BORDER)).toBe(P.border);
  });

  it('keeps saturated fills that carry white text', () => {
    expect(toDarkColor('#3b82f6', BG)).toBe('#3b82f6');
    expect(toDarkColor('#16a34a', BG)).toBe('#16a34a');
  });

  it('keeps pale page washes near-neutral instead of turning them navy', () => {
    for (const tint of ['#f0f4ff', '#e5eeff', '#eef6ff']) {
      const { r, g, b } = parseColor(toDarkColor(tint, BG));
      expect(Math.max(r, g, b)).toBeLessThan(30);
      expect(Math.max(r, g, b) - Math.min(r, g, b)).toBeLessThanOrEqual(14);
    }
  });

  it('keeps the hue of tinted badges', () => {
    const badge = parseColor(toDarkColor('#dcfce7', BG));
    expect(badge.g).toBeGreaterThan(badge.r);
    expect(badge.g).toBeGreaterThan(badge.b);
    expect(contrastRatio(badge, parseColor('#000000'))).toBeLessThan(2);

    const badgeText = parseColor(toDarkColor('#166534', TEXT));
    expect(badgeText.g).toBeGreaterThan(badgeText.r);
    expect(contrastRatio(badgeText, SURFACE)).toBeGreaterThanOrEqual(4.5);
  });

  it('makes every mapped text color readable on the dark surface', () => {
    for (const color of ['#dc2626', '#0369a1', '#92400e', '#4338ca', '#333', '#475569']) {
      expect(contrastRatio(parseColor(toDarkColor(color, TEXT)), SURFACE)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('deepens dark shadows and fades white highlights', () => {
    expect(toDarkColor('rgba(0, 0, 0, 0.1)', SHADOW)).toBe('rgba(0, 0, 0, 0.22)');
    expect(toDarkColor('rgba(255, 255, 255, 0.7)', SHADOW)).toBe('rgba(255, 255, 255, 0.084)');
  });

  it('leaves unknown tokens alone', () => {
    expect(toDarkColor('transparent', BG)).toBe('transparent');
    expect(toDarkColor('var(--voice-level)', BG)).toBe('var(--voice-level)');
    expect(toDarkColor('#fff', 'unknown-role')).toBe('#fff');
  });
});

describe('replaceColors', () => {
  it('rewrites every stop of a gradient', () => {
    expect(replaceColors('linear-gradient(180deg, #f7fbff 0%, #f8fafc 100%)', BG))
      .toBe(`linear-gradient(180deg, ${P.background} 0%, ${P.backgroundLight} 100%)`);
  });

  it('rewrites the color inside a border shorthand only', () => {
    expect(replaceColors('1px solid #e2e8f0', BORDER)).toBe(`1px solid ${P.border}`);
  });
});

describe('stylisDarkPlugin', () => {
  const render = (css) => serialize(compile(css), middleware([stylisDarkPlugin, stringify]));

  it('is named, as styled-components requires', () => {
    expect(stylisDarkPlugin.name).toBe('mirsat-dark');
  });

  it('rewrites colors by property role', () => {
    const out = render('.a{background:#fff;color:#333;border:1px solid #e2e8f0;padding:4px;}');
    expect(out).toBe(`.a{background:${P.surface};color:${P.textSecondary};border:1px solid ${P.border};padding:4px;}`);
  });

  it('reaches nested selectors and media queries', () => {
    const out = render('.a{svg{color:#64748b;} @media (max-width:10px){background:#f8fafc;}}');
    expect(out).toContain(`.a svg{color:${P.textTertiary};}`);
    expect(out).toContain(`@media (max-width:10px){.a{background:${P.backgroundLight};}}`);
  });

  it('adds a light rim to shadows and tones down radial glows', () => {
    const out = render('.a{box-shadow:0 4px 12px rgba(0, 0, 0, 0.1);background:radial-gradient(circle at 10% 10%, rgba(55, 136, 216, 0.18), transparent 30%);}');
    expect(out).toContain('0 0 0 1px rgba(255, 255, 255, 0.07)');
    expect(out).toContain('rgba(55, 136, 216, 0.05)');
    expect(render('.b{box-shadow:none;}')).toBe('.b{box-shadow:none;}');
  });

  it('leaves hand-written dark overrides untouched', () => {
    const out = render(".a{html[data-theme='dark'] &{background:#ffffff;}}");
    expect(out).toContain('background:#ffffff;');
  });
});
