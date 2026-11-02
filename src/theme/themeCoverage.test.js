import { describe, expect, it } from 'vitest';
import { buildInlineOverrideCss } from './inlineStyleOverrides';
import { MAINTENANCE_TONES } from './maintenancePalette';
import { contrastRatio, parseColor, toDarkColor, COLOR_ROLES, contrastingTextColor } from './darkColorTransform';

describe('theme contrast and source coverage', () => {
  it.each(['#22c55e', '#f97316', '#3b82f6', '#ef4444', '#000048'])('keeps inspector count text readable on %s', background => {
    expect(contrastRatio(parseColor(contrastingTextColor(background)), parseColor(background))).toBeGreaterThanOrEqual(4.5);
  });
  it.each(Object.entries(MAINTENANCE_TONES))('%s statistics/status text is readable in both modes', (_tone, modes) => {
    for (const pair of Object.values(modes)) {
      expect(contrastRatio(parseColor(pair.text), parseColor(pair.background))).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('generates matching dark overrides for new alert and category backgrounds', () => {
    const style = document.createElement('style');
    style.textContent = buildInlineOverrideCss();
    document.head.appendChild(style);
    const root = document.documentElement;
    root.setAttribute('data-theme', 'dark');
    try {
      for (const color of ['#e3f7ef', '#fff5df', '#f1eaff', '#fff6f3', '#f8fbff']) {
        const node = document.createElement('div');
        node.style.background = color;
        document.body.appendChild(node);
        const expected = toDarkColor(color, COLOR_ROLES.BG);
        const probe = document.createElement('div');
        probe.style.backgroundColor = expected;
        const matching = [...style.sheet.cssRules].filter(rule => rule.selectorText && node.matches(rule.selectorText));
        expect(matching.some(rule => rule.style.backgroundColor === probe.style.backgroundColor)).toBe(true);
        node.remove();
      }
    } finally {
      style.remove();
      root.removeAttribute('data-theme');
    }
  });

  it('does not mistake background-color for foreground color', () => {
    const css = buildInlineOverrideCss();
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    const root = document.documentElement;
    root.setAttribute('data-theme', 'dark');
    const node = document.createElement('div');
    node.style.backgroundColor = '#287a5a';
    document.body.appendChild(node);
    try {
      const textRules = [...style.sheet.cssRules].filter(rule => rule.style?.color);
      expect(textRules.some(rule => node.matches(rule.selectorText))).toBe(false);
    } finally {
      node.remove(); style.remove(); root.removeAttribute('data-theme');
    }
  });
});
