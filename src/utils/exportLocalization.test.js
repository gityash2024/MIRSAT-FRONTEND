import { describe, expect, it } from 'vitest';
import { formatPdfText, repairMojibake } from './exportLocalization';

describe('PDF export text normalization', () => {
  it('repairs legacy UTF-8-as-Latin-1 values before export', () => {
    expect(repairMojibake('Ù…Ø±Ø­Ø¨Ø§')).toBe('مرحبا');
  });

  it('keeps valid English and Arabic values readable', () => {
    expect(formatPdfText('SRSA Compliance', 'en')).toBe('SRSA Compliance');
    expect(formatPdfText('مرحبا', 'ar')).toContain('ﻣ');
  });
});
