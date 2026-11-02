// @vitest-environment node
import { expect, it } from 'vitest';
import { collectInlineColors } from '../../scripts/generate-inline-colors.mjs';
import { INLINE_STYLE_COLORS } from './inlineColorList';

it('covers inline source colors, including values held in conditional maps', () => {
  for (const [role, colors] of Object.entries(collectInlineColors())) {
    expect(colors.filter(color => !INLINE_STYLE_COLORS[role].includes(color)), `Run npm run theme:colors for ${role}`).toEqual([]);
  }
});
