import { COLOR_ROLES, toDarkColor } from './darkColorTransform';
import { INLINE_STYLE_COLORS, SVG_ATTRIBUTE_COLORS } from './inlineColorList';

/**
 * Builds the dark-theme stylesheet for inline styles.
 *
 * React writes `style={{ background: '#fff' }}` into the DOM through the CSSOM,
 * and the browser stores it in the style attribute in its own canonical form
 * (e.g. `background: rgb(255, 255, 255)`). Attribute-substring selectors
 * scoped to html[data-theme='dark'] with !important can then override those
 * inline colors without touching any component. The canonical text is read
 * back from a probe element, so it always matches what React produced.
 */

const SCOPE = "html[data-theme='dark']";
const BORDER_SIDES = ['border', 'border-top', 'border-right', 'border-bottom', 'border-left'];
const BORDER_WIDTHS = ['1px', '2px'];
const BORDER_STYLES = ['solid', 'dashed'];

function serialize(probe, property, value) {
  probe.removeAttribute('style');
  probe.style.setProperty(property, value);
  return (probe.getAttribute('style') || '').trim().replace(/;$/, '');
}

const quote = (text) => `"${text.replace(/"/g, '\\"')}"`;

export function buildInlineOverrideCss(doc = document) {
  const probe = doc.createElement('div');
  const rules = [];

  const addRule = (selectors, declaration) => {
    const unique = [...new Set(selectors.filter(Boolean))];
    if (!unique.length) return;
    rules.push(`${unique.map((selector) => `${SCOPE} ${selector}`).join(',\n')} { ${declaration} !important; }`);
  };

  for (const color of INLINE_STYLE_COLORS.bg) {
    const dark = toDarkColor(color, COLOR_ROLES.BG);
    if (dark === color) continue;
    const selectors = ['background', 'background-color']
      .map((property) => serialize(probe, property, color))
      .filter(Boolean)
      .map((text) => `[style*=${quote(text)}]`);
    addRule(selectors, `background-color: ${dark}`);
  }

  for (const color of INLINE_STYLE_COLORS.text) {
    const dark = toDarkColor(color, COLOR_ROLES.TEXT);
    if (dark === color) continue;
    const text = serialize(probe, 'color', color);
    if (!text) continue;
    // Anchored so `background-color:` / `border-color:` never match.
    addRule([`[style^=${quote(text)}]`, `[style*=${quote(` ${text}`)}]`], `color: ${dark}`);
  }

  for (const color of INLINE_STYLE_COLORS.border) {
    const dark = toDarkColor(color, COLOR_ROLES.BORDER);
    if (dark === color) continue;
    for (const side of BORDER_SIDES) {
      const colorProperty = `${side}-color`;
      const selectors = [serialize(probe, colorProperty, color)];
      for (const width of BORDER_WIDTHS) {
        for (const style of BORDER_STYLES) {
          selectors.push(serialize(probe, side, `${width} ${style} ${color}`));
        }
      }
      addRule(
        selectors.filter(Boolean).map((text) => `[style*=${quote(text)}]`),
        `${colorProperty}: ${dark}`,
      );
    }
  }

  // Icon and chart colors arrive as SVG presentation attributes, which any
  // CSS rule outranks, so no !important is needed here.
  for (const attribute of ['stroke', 'fill']) {
    for (const color of SVG_ATTRIBUTE_COLORS[attribute]) {
      let dark = toDarkColor(color, COLOR_ROLES.TEXT);
      // Light strokes are chart grid lines / dividers rather than text.
      if (dark === color) dark = toDarkColor(color, COLOR_ROLES.BORDER);
      if (dark === color) continue;
      rules.push(`${SCOPE} [${attribute}=${quote(color)} i] { ${attribute}: ${dark}; }`);
    }
  }

  return rules.join('\n');
}
