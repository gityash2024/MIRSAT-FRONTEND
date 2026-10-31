import { describe, expect, it } from 'vitest';
import { getQuestionWeight, getQuestionWeightPercentage, getQuestionScore, calculateSectionScore } from './inspectionScoring';
import { calculateReportScoreSummary } from '../services/pdfGenerator';
import { parseTemplateTransferWorkbook } from './templateTransfer';
import * as XLSX from '@e965/xlsx';

const base = { _id: 'q', answerType: 'compliance', isScored: true, required: true,
  weightUnit: 'percentage', weight: 20, scores: { full_compliance: 5, partial_compliance: 2.5, non_compliance: 0 } };

describe('percentage question weights', () => {
  it.each([[20, 0.2, 0.5, 1], [12.5, 0.125, 0.3125, 0.625], [100, 1, 2.5, 5], [0, 0, 0, 0], [0.01, 0.0001, 0.00025, 0.0005]])(
    '%s percent scales earned and possible points by %s', (weight, factor, achieved, total) => {
      const question = { ...base, weight };
      expect(getQuestionWeight(question)).toBe(factor);
      expect(getQuestionWeightPercentage(question)).toBe(weight);
      expect(getQuestionScore(question, 'partial_compliance')).toEqual({ achieved, total });
      expect(calculateReportScoreSummary([{ id: 'q', question }], { q: 'partial_compliance' }))
        .toEqual({ achieved, total, percentage: total ? 50 : 0 });
    });

  it('applies relative weights across a section and preserves No/N/A exclusions', () => {
    const questions = [{ ...base, _id: 'a', weight: 20 }, { ...base, _id: 'b', weight: 80 },
      { ...base, _id: 'no', isScored: false }, { ...base, _id: 'na', weight: 99 }];
    expect(calculateSectionScore({ questions }, { a: 'full_compliance', b: 'non_compliance', no: 'full_compliance', na: 'N/A' }))
      .toEqual({ achieved: 1, total: 5, percentage: 20 });
  });

  it('displays legacy weights as equivalent percentages without mutating their historical scores', () => {
    const legacy = { ...base, weight: 1, weightUnit: undefined };
    expect(getQuestionWeightPercentage(legacy)).toBe(100);
    expect(getQuestionScore(legacy, 'full_compliance')).toEqual({ achieved: 5, total: 5 });
    expect(getQuestionWeightPercentage({ ...legacy, weight: 2 })).toBe(200);
    expect(getQuestionWeightPercentage({ ...legacy, isScored: undefined, weight: 0 })).toBe(0);
    expect(getQuestionScore({ ...legacy, weight: 20 }, 'full_compliance').total).toBe(100);
    expect(getQuestionScore({ ...base, weight: undefined }, 'full_compliance').total).toBe(5);
  });

  it.each(['Template Import', 'Pages and Questions'])('imports Weight (%%) from the %s authoring layout', sheet => {
    const workbook = XLSX.utils.book_new();
    const header = ['Page Name', 'Section Name', 'Question Text', 'Answer Type', 'Weight (%)'];
    const row = ['Page', 'Section', 'Question', 'yesno', 12.5];
    if (sheet === 'Template Import') { header.unshift('Template Name'); row.unshift('Checklist'); }
    else XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['Field', 'Value'], ['Template Name', 'Checklist']]), 'Basic Info');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([header, row]), sheet);
    const question = parseTemplateTransferWorkbook(workbook, key => key).templates[0].pages[0].sections[0].questions[0];
    expect(question).toMatchObject({ weight: 12.5, weightUnit: 'percentage' });
  });
});
