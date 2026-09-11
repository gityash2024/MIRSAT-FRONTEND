import { COLOR_ROLES, replaceColors } from './darkColorTransform';

/**
 * Stylis plugin that turns every styled-component's light colors into dark
 * ones while the dark theme is on.
 *
 * App.jsx passes it to <StyleSheetManager> only in dark mode. styled-components
 * folds plugin names into its class-name hash, so dark mode renders a separate
 * set of classes and light mode keeps the exact CSS it had before.
 *
 * Rules written specifically for dark mode (`html[data-theme='dark'] & {}`)
 * are left untouched so hand-tuned overrides always win.
 */

const TEXT_PROPERTIES = new Set([
  'color',
  'fill',
  'stroke',
  'caret-color',
  '-webkit-text-fill-color',
  'text-decoration-color',
]);

const SHADOW_PROPERTIES = new Set(['box-shadow', '-webkit-box-shadow', 'text-shadow']);
const LIGHT_RIM = '0 0 0 1px rgba(255, 255, 255, 0.07)';

export function roleForProperty(property) {
  if (property.startsWith('background') || property === 'accent-color') return COLOR_ROLES.BG;
  if (TEXT_PROPERTIES.has(property)) return COLOR_ROLES.TEXT;
  if (property.startsWith('border') || property.startsWith('outline') || property.startsWith('column-rule')) {
    return COLOR_ROLES.BORDER;
  }
  if (SHADOW_PROPERTIES.has(property)) return COLOR_ROLES.SHADOW;
  return null;
}

function isInsideDarkOverride(element) {
  for (let node = element.parent; node; node = node.parent) {
    if (node.type === 'rule' && node.props.some((selector) => selector.includes('data-theme'))) {
      return true;
    }
  }
  return false;
}

export function stylisDarkPlugin(element) {
  if (element.type !== 'decl') return;

  const property = element.props;
  if (typeof property !== 'string' || property.startsWith('--')) return;

  const role = roleForProperty(property);
  if (!role || isInsideDarkOverride(element)) return;

  const value = element.children;
  let darkValue = replaceColors(value, role);

  // Decorative radial "glow" blobs read as coloured stains on black; keep only a hint.
  if (role === COLOR_ROLES.BG && /radial-gradient\(/.test(darkValue)) {
    darkValue = darkValue.replace(/rgba\(([^)]*?),\s*([0-9.]+)\)/g, (match, rgb, alpha) => (
      Number(alpha) > 0.05 ? `rgba(${rgb}, 0.05)` : match
    ));
  }

  // Shadows barely register on a black page, so cards lose their edges. A faint
  // 1px light rim gives every shadowed surface its outline back.
  if (property === 'box-shadow' && !/^\s*none\b/.test(darkValue) && !darkValue.includes(LIGHT_RIM)) {
    darkValue = `${darkValue}, ${LIGHT_RIM}`;
  }

  if (darkValue !== value) {
    element.return = `${property}:${darkValue};`;
  }
}

// styled-components requires every stylis plugin to carry a unique name.
Object.defineProperty(stylisDarkPlugin, 'name', { value: 'mirsat-dark' });

export default stylisDarkPlugin;
