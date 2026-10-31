import { describe, expect, it } from 'vitest';
import { getConfiguredComplianceFlag, isComplianceOptionFlagged } from './complianceFlags';
import { getQuestionScore } from './inspectionScoring';
import { createTemplateTransferWorkbook, parseTemplateTransferWorkbook } from './templateTransfer';
import * as XLSX from '@e965/xlsx';

const options = ['Full compliance', 'Partial compliance', 'Non-compliant', 'Not applicable'];
const responses = ['full_compliance', 'partial_compliance', 'non_compliance', 'not_applicable'];
const scores = { 'Full compliance': 2, 'Partial compliance': 1, 'Non-compliant': 0, 'Not applicable': 0 };

describe('independent compliance flags', () => {
  it.each(Array.from({ length: 16 }, (_, mask) => mask))('preserves checkbox combination %s through JSON and Excel', mask => {
    const flaggedOptions = Object.fromEntries(options.map((option, i) => [option, Boolean(mask & (1 << i))]));
    const question = { text: 'Check', answerType: 'compliance', isScored: false, required: false, scores, options, flaggedOptions };
    const bundle = { format: 'mirsat-template-transfer', version: 1, templates: [{ name: 'Flags', pages: [{ name: 'Page', sections: [{ name: 'Section', questions: [question] }] }] }] };
    const workbook = XLSX.read(XLSX.write(createTemplateTransferWorkbook(bundle, key => key), { type: 'array', bookType: 'xlsx' }), { type: 'array' });
    const restored = parseTemplateTransferWorkbook(workbook, key => key).templates[0].pages[0].sections[0].questions[0];
    expect(restored).toEqual(JSON.parse(JSON.stringify(question)));
    responses.forEach((response, i) => expect(getConfiguredComplianceFlag(restored, response)).toBe(Boolean(mask & (1 << i))));
    expect(restored.scores).toEqual(scores);
    expect(getQuestionScore(restored, 'full_compliance')).toEqual({ total: 0, achieved: 0 });
  });

  it('keeps legacy defaults but treats an explicit empty map as none selected', () => {
    const legacy = { answerType: 'compliance' };
    expect(isComplianceOptionFlagged(legacy, 'Non-compliant')).toBe(true);
    expect(isComplianceOptionFlagged(legacy, 'Partial compliance')).toBe(false);
    expect(getConfiguredComplianceFlag(legacy, 'Non-compliant')).toBeUndefined();
    expect(getConfiguredComplianceFlag({ ...legacy, flaggedOptions: {} }, 'Non-compliant')).toBe(false);
  });

  it('matches localized options and saved response objects without affecting other answer types', () => {
    const question = { answerType: 'compliance', flaggedOptions: { 'جزئي': true, 'غير متوافق': false, 'غير متاح': true } };
    expect(getConfiguredComplianceFlag(question, { value: 'partial_compliance' })).toBe(true);
    expect(getConfiguredComplianceFlag(question, 'Non-compliant')).toBe(false);
    expect(getConfiguredComplianceFlag(question, 'N/A')).toBe(true);
    expect(getConfiguredComplianceFlag({ ...question, answerType: 'select' }, 'partial_compliance')).toBeUndefined();
  });
});
