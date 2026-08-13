import { describe, expect, it } from 'vitest';
import { filterAssetsForTemplateType, getTemplateAssetType } from './taskAssetFiltering';

describe('task asset filtering', () => {
  const assets = [
    { id: 'asset-yacht', type: 'Yacht' },
    { id: 'asset-marina', type: 'Marina Operator' },
  ];

  it('returns no platform assets when the template has no type', () => {
    expect(getTemplateAssetType({ type: '   ' })).toBe('');
    expect(filterAssetsForTemplateType(assets, '')).toEqual([]);
  });

  it('only returns assets matching the selected template type', () => {
    expect(filterAssetsForTemplateType(assets, ' yacht ')).toEqual([
      { id: 'asset-yacht', type: 'Yacht' },
    ]);
  });
});
