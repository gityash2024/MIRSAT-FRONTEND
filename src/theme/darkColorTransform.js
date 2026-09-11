import { cssVariables } from '../config/theme';
import { DARK_PALETTE as P } from './darkPalette';

/**
 * Maps light-theme colors to dark-theme colors.
 *
 * The portal's components hardcode their light colors, and the same color is
 * often used for different jobs (white is a card background and also the text
 * on navy buttons). So every color is mapped by the role it plays:
 *   bg     - backgrounds: light surfaces turn dark, saturated fills are kept
 *   text   - foregrounds: dark text turns light until it reads on dark
 *   border - light dividers turn into subtle dark dividers
 *   shadow - dark shadows get stronger, white highlights fade out
 *
 * The most common neutrals map to the exact mobile palette; anything else
 * falls back to flipping lightness while keeping hue, so a pale green badge
 * becomes a deep green badge rather than grey.
 */

export const COLOR_ROLES = {
  BG: 'bg',
  TEXT: 'text',
  BORDER: 'border',
  SHADOW: 'shadow',
};

const NAMED_COLORS = {
  white: '#ffffff',
  black: '#000000',
  silver: '#c0c0c0',
  gray: '#808080',
  grey: '#808080',
  whitesmoke: '#f5f5f5',
  gainsboro: '#dcdcdc',
  lightgray: '#d3d3d3',
  lightgrey: '#d3d3d3',
};

// Matches every color token that can appear inside a CSS value.
export const COLOR_TOKEN_PATTERN =
  /var\(--color-[a-z0-9-]+\)|#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|rgba?\([^()]*\)|\b(?:whitesmoke|gainsboro|lightgr[ae]y|white|black|silver|gr[ae]y)\b/gi;

const NAVY_SHADES = ['#000048', '#151b4f', '#151b60', '#1a1a6e'];
const NAVY_DARK_SHADES = ['#000030', '#102a63'];

const withKeys = (keys, value) => Object.fromEntries(keys.map((key) => [key, value]));

const BACKGROUND_MAP = {
  '#ffffff': P.surface,
  ...withKeys(['#fafafa', '#fafbfc', '#f9fafb', '#f8fafc', '#f5f5f5'], P.backgroundLight),
  ...withKeys(['#f7f9fa', '#f5f7fb', '#f7fbff', '#eef5fb', '#f0f4ff', '#e5eeff', '#eef2ff', '#f5f8ff'], P.background),
  ...withKeys(['#f1f5f9', '#f3f4f6', '#f3f3f3', '#eef2f6', '#edf2f7', '#f0f0f0'], P.surfaceRaised),
  ...withKeys(['#e2e8f0', '#e2e8ed', '#e5e7eb', '#e0e0e0', '#eeeeee'], P.border),
  ...withKeys(['#cbd5e1', '#d1d5db'], P.borderLight),
  ...withKeys(NAVY_SHADES, P.navy),
  ...withKeys(NAVY_DARK_SHADES, P.navyDark),
};

const TEXT_MAP = {
  ...withKeys([
    '#000000', '#0f172a', '#111111', '#111827', '#1a1a1a', '#1a202c',
    '#1e293b', '#1f2937', '#212121', '#222222', '#2c3e50',
  ], P.textPrimary),
  ...withKeys([
    '#2d3748', '#2d4654', '#333333', '#334155', '#344054', '#374151',
    '#424242', '#444444', '#475467', '#475569', '#4a5568',
  ], P.textSecondary),
  ...withKeys([
    '#4b5563', '#555555', '#5f6b7a', '#616161', '#64748b', '#666666',
    '#667085', '#6b7280', '#718096', '#757575',
  ], P.textTertiary),
  ...withKeys([...NAVY_SHADES, ...NAVY_DARK_SHADES], P.navyText),
};

const BORDER_MAP = {
  ...withKeys([
    '#e2e8f0', '#e5e7eb', '#e0e0e0', '#e8e8e8', '#eeeeee', '#edf2f7',
    '#f1f5f9', '#f3f4f6', '#f3f3f3', '#eef2f6',
  ], P.border),
  ...withKeys(['#cbd5e1', '#d1d5db', '#dddddd', '#d0d5dd', '#bdbdbd', '#e2e8ed'], P.borderLight),
  ...withKeys([...NAVY_SHADES, ...NAVY_DARK_SHADES], P.navyBorder),
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const roundAlpha = (alpha) => Math.round(alpha * 1000) / 1000;

export function parseColor(input) {
  if (!input) return null;
  const value = String(input).trim().toLowerCase();

  if (NAMED_COLORS[value]) return parseColor(NAMED_COLORS[value]);

  if (value.startsWith('#')) {
    let hex = value.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex.split('').map((ch) => ch + ch).join('');
    }
    if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/.test(hex)) return null;
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: hex.length === 8 ? roundAlpha(parseInt(hex.slice(6, 8), 16) / 255) : 1,
    };
  }

  const fn = value.match(/^rgba?\(([^()]*)\)$/);
  if (fn) {
    const parts = fn[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const channel = (part) => (part.endsWith('%') ? parseFloat(part) * 2.55 : parseFloat(part));
    const [r, g, b] = parts.slice(0, 3).map(channel);
    const a = parts[3] === undefined
      ? 1
      : parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
    if ([r, g, b, a].some(Number.isNaN)) return null;
    return {
      r: clamp(Math.round(r), 0, 255),
      g: clamp(Math.round(g), 0, 255),
      b: clamp(Math.round(b), 0, 255),
      a: clamp(a, 0, 1),
    };
  }

  return null;
}

export function formatColor({ r, g, b, a = 1 }) {
  const alpha = roundAlpha(a);
  if (alpha >= 1) {
    return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
  }
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
}

const hexKey = (color) => formatColor({ ...color, a: 1 });

function rgbToHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return { h: h * 60, s, l };
}

function hslToRgb(h, s, l) {
  const sat = clamp(s, 0, 1);
  const light = clamp(l, 0, 1);
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;
  let rgb;
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  const [r, g, b] = rgb.map((v) => Math.round((v + m) * 255));
  return { r, g, b };
}

function relativeLuminance({ r, g, b }) {
  const channel = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(first, second) {
  const [light, dark] = [relativeLuminance(first), relativeLuminance(second)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

const SURFACE = parseColor(P.surface);
const fromPalette = (hex, alpha) => ({ ...parseColor(hex), a: alpha });
const isWhiteish = ({ r, g, b }) => Math.min(r, g, b) >= 235;
const isBlackish = (color) => rgbToHsl(color).l < 0.2;
const isNavy = ({ h, s, l }) => h >= 215 && h <= 255 && s >= 0.35 && l <= 0.25;

function mapBackground(color) {
  // Faint white overlays are highlights (hover, glass on navy) and work on dark too.
  if (isWhiteish(color) && color.a <= 0.35) return null;
  // Faint black tints are hover states; on dark they need to lighten instead.
  if (color.a < 0.2 && isBlackish(color)) return { r: 255, g: 255, b: 255, a: color.a };

  const explicit = BACKGROUND_MAP[hexKey(color)];
  if (explicit) return fromPalette(explicit, color.a);

  const hsl = rgbToHsl(color);
  if (isNavy(hsl)) return fromPalette(P.navy, color.a);

  // Saturated fills (buttons, badges with white text) keep their color.
  const threshold = hsl.s > 0.6 ? 0.7 : 0.6;
  if (hsl.l <= threshold) return null;
  // Near-white tints are page/card washes: keep them close to neutral so a
  // "pale blue" page does not become a navy one. Deeper tints are badges and
  // keep their hue.
  if (hsl.l >= 0.9) return { ...hslToRgb(hsl.h, hsl.s * 0.3, 0.075), a: color.a };
  return { ...hslToRgb(hsl.h, hsl.s * 0.75, 0.06 + (1 - hsl.l) * 0.6), a: color.a };
}

function mapText(color) {
  const explicit = TEXT_MAP[hexKey(color)];
  if (explicit) return fromPalette(explicit, color.a);

  if (color.a < 1 && isBlackish(color)) {
    return { r: 255, g: 255, b: 255, a: Math.max(color.a, 0.6) };
  }
  if (contrastRatio(color, SURFACE) >= 4.5) return null;

  const { h, s, l } = rgbToHsl(color);
  if (s < 0.15) {
    const grey = l < 0.25 ? P.textPrimary : l < 0.42 ? P.textSecondary : P.textTertiary;
    return fromPalette(grey, color.a);
  }

  // Lighten the same hue until it reads on the dark surface.
  let lightened = hslToRgb(h, s, Math.max(l, 0.5));
  for (let lightness = Math.max(l, 0.5); lightness <= 0.95; lightness += 0.03) {
    lightened = hslToRgb(h, s, lightness);
    if (contrastRatio(lightened, SURFACE) >= 4.5) break;
  }
  return { ...lightened, a: color.a };
}

function mapBorder(color) {
  if (isWhiteish(color) && color.a <= 0.35) return null;
  if (color.a < 0.3 && isBlackish(color)) return { r: 255, g: 255, b: 255, a: color.a };

  const explicit = BORDER_MAP[hexKey(color)];
  if (explicit) return fromPalette(explicit, color.a);

  const hsl = rgbToHsl(color);
  if (isNavy(hsl)) return fromPalette(P.navyBorder, color.a);
  if (hsl.l > 0.6) {
    return { ...hslToRgb(hsl.h, hsl.s * 0.8, 0.12 + (1 - hsl.l) * 0.5), a: color.a };
  }
  // Near-black borders would vanish on a black page.
  if (hsl.l < 0.16) return { ...hslToRgb(hsl.h, hsl.s, 0.3), a: color.a };
  return null;
}

function mapShadow(color) {
  const { l } = rgbToHsl(color);
  if (l > 0.7) return { ...color, a: roundAlpha(color.a * 0.12) };
  if (l < 0.35) return { r: 0, g: 0, b: 0, a: Math.min(0.6, roundAlpha(color.a * 2.2)) };
  return null;
}

const MAPPERS = {
  [COLOR_ROLES.BG]: mapBackground,
  [COLOR_ROLES.TEXT]: mapText,
  [COLOR_ROLES.BORDER]: mapBorder,
  [COLOR_ROLES.SHADOW]: mapShadow,
};

const sameColor = (x, y) => x.r === y.r && x.g === y.g && x.b === y.b && roundAlpha(x.a) === roundAlpha(y.a);

/**
 * Returns the dark-theme replacement for one color token, or the token itself
 * when it already works on dark. Brand variables (var(--color-*)) resolve to
 * their light value first; unknown variables are left alone.
 */
export function toDarkColor(token, role) {
  const mapper = MAPPERS[role];
  if (!mapper || !token) return token;

  const resolved = /^var\(/i.test(token) ? cssVariables[token.slice(4, -1).trim()] : token;
  const color = parseColor(resolved);
  if (!color) return token;

  const mapped = mapper(color);
  if (!mapped || sameColor(mapped, color)) return token;
  return formatColor(mapped);
}

/** Rewrites every color inside a CSS value (gradients, shadows, borders). */
export function replaceColors(value, role) {
  if (!value || !MAPPERS[role]) return value;
  return value.replace(COLOR_TOKEN_PATTERN, (token) => toDarkColor(token, role));
}
