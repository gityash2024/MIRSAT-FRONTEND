import { describe, expect, it } from 'vitest';
import * as XLSX from '@e965/xlsx';
import en from '../locales/en.json';
import { createTemplateTransferWorkbook, parseTemplateTransfer, parseTemplateTransferWorkbook, readTemplateImportFile } from './templateTransfer';

const t = (key, options = {}) => String(key.split('.').reduce((value, part) => value?.[part], en) || key)
  .replace(/\{\{(\w+)\}\}/g, (_, key) => options[key] ?? '');
const fixture = () => ({
  format: 'mirsat-template-transfer', version: 1, templates: [{
    _id: '680000000000000000000001', name: 'Compliance — الامتثال', description: 'First line\nSecond line',
    type: 'marina_operator', status: 'active', isActive: true,
    completionCriteria: { requiredPhotos: true, requiredNotes: false, requiredSignoff: true },
    pages: [{ _id: '680000000000000000000002', name: 'Repeated name', order: 0, sections: [
      { _id: '680000000000000000000003', name: 'Repeated name', order: 0, questions: [
        { _id: '680000000000000000000004', id: 'question-a', text: 'هل يتوافق؟\nReview the full checklist.',
          description: 'Keep punctuation | and = intact', answerType: 'select', type: 'select',
          required: false, mandatory: false, isScored: true, weight: 0, weightUnit: 'percentage', includeNA: false, requirementType: 'recommended',
          options: ['Yes|No', 'A=B', 'اختيار', 'two\nlines'], scores: { 'Yes|No': 0, 'A=B': 2, 'اختيار': 1 },
          scoring: { enabled: false, max: 0, weights: { 'A=B': 0 } },
          logic: [{ question: 'question-a', condition: 'equals', value: 'A=B', action: 'show', targets: ['question-a'] }] }
      ], subLevels: [{ name: 'Nested section', order: 0, questions: [] }] },
      { name: 'Repeated name', order: 1, questions: [] }
    ] }, { name: 'Repeated name', order: 1, sections: [] }],
    sets: [{ name: 'Legacy set', description: '', generalQuestions: [{ text: 'General', answerType: 'text', required: true, isScored: false }], questions: [], subLevels: [] }],
    subLevels: [{ name: 'Legacy level', description: '', order: 0, subLevels: [{ name: 'Nested', order: 0, questions: [] }], questions: [] }],
    questions: [{ text: 'Root question', answerType: 'number', required: false, weight: 12.5, weightUnit: 'percentage' }]
  }, { name: 'Second template', description: '', status: 'draft', pages: [{ name: 'Empty page', order: 0, sections: [] }] }]
});

describe('portable template files', () => {
  it('round trips every checklist field through an actual Excel file', () => {
    const source = fixture();
    const workbook = createTemplateTransferWorkbook(source, t);
    const bytes = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    const read = XLSX.read(bytes, { type: 'array' });
    expect(parseTemplateTransferWorkbook(read, t)).toEqual(source);
  });

  it('round trips JSON and accepts legacy single objects and arrays', () => {
    const source = fixture();
    expect(parseTemplateTransfer(JSON.parse(JSON.stringify(source)), t)).toEqual(source);
    expect(parseTemplateTransfer(source.templates[0], t).templates).toEqual([source.templates[0]]);
    expect(parseTemplateTransfer(source.templates, t).templates).toEqual(source.templates);
  });

  it('treats visible Excel text and answer-option columns as editable data', () => {
    const workbook = createTemplateTransferWorkbook(fixture(), t);
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets.Checklists, { header: 1, defval: '' });
    const index = rows.findIndex(row => row[3].includes('هل يتوافق'));
    rows[index][3] = 'Edited question';
    rows[index][6] = JSON.stringify(['New | option', 'New = option']);
    workbook.Sheets.Checklists = XLSX.utils.aoa_to_sheet(rows);
    const question = parseTemplateTransferWorkbook(workbook, t).templates[0].pages[0].sections[0].questions[0];
    expect(question.text).toBe('Edited question');
    expect(question.options).toEqual(['New | option', 'New = option']);
    expect(question.required).toBe(false);
    expect(question.weight).toBe(0);
  });

  it('supports both existing authoring workbook layouts from the add form', () => {
    const flat = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(flat, XLSX.utils.aoa_to_sheet([
      ['Template Name', 'Page Name', 'Section Name', 'Question Text', 'Required', 'Weight'],
      ['Legacy workbook', 'Page', 'Section', 'Question', 'FALSE', '0']
    ]), 'Template Import');
    const parsed = parseTemplateTransferWorkbook(flat, t).templates[0];
    expect(parsed.pages[0].sections[0].questions[0]).toMatchObject({ text: 'Question', required: false, weight: 0 });
    const tabbed = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(tabbed, XLSX.utils.aoa_to_sheet([
      ['Field', 'Value'], ['Template Name', 'Tabbed workbook']
    ]), 'Basic Info');
    XLSX.utils.book_append_sheet(tabbed, XLSX.utils.aoa_to_sheet([
      ['Page Name', 'Section Name', 'Question Text', 'Answer Type', 'Include N/A', 'Score Yes', 'Score No'],
      ['Page', 'Section', 'Question', 'yes_no', 'FALSE', '2', '0']
    ]), 'Pages and Questions');
    expect(parseTemplateTransferWorkbook(tabbed, t).templates[0].pages[0].sections[0].questions[0])
      .toMatchObject({ options: ['Yes', 'No'], scores: { Yes: 2, No: 0 }, includeNA: false });
  });

  it('rejects unsupported versions, empty bundles and malformed JSON', async () => {
    expect(() => parseTemplateTransfer({ ...fixture(), version: 99 }, t)).toThrow('Unsupported');
    expect(() => parseTemplateTransfer({ templates: [] }, t)).toThrow('at least one');
    await expect(readTemplateImportFile({ name: 'broken.json', size: 2, text: async () => '{!' }, 'json', t)).rejects.toThrow('valid JSON');
  });

  it('rejects wrong formats, empty files and oversized uploads before reading them', async () => {
    await expect(readTemplateImportFile({ name: 'wrong.csv', size: 5 }, 'xlsx', t)).rejects.toThrow('Choose a Excel');
    await expect(readTemplateImportFile({ name: 'empty.json', size: 0 }, 'json', t)).rejects.toThrow('empty');
    await expect(readTemplateImportFile({ name: 'large.json', size: 50 * 1024 * 1024 + 1 }, 'json', t)).rejects.toThrow('50 MB');
  });

  it.each(['duplicate', 'missing-parent', 'prototype', 'bad-options', 'missing-row'])(
    'rejects %s workbook corruption without silently dropping questions', corruption => {
      const workbook = createTemplateTransferWorkbook(fixture(), t);
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets.Checklists, { header: 1, defval: '' });
      const index = rows.findIndex(row => row[3].includes('هل يتوافق'));
      if (corruption === 'duplicate') rows.push([...rows[index]]);
      if (corruption === 'missing-parent') rows.splice(rows.findIndex(row => row[1] === '["pages",0,"sections",0]'), 1);
      if (corruption === 'prototype') rows[index][1] = '["__proto__",0]';
      if (corruption === 'bad-options') rows[index][6] = '{}';
      if (corruption === 'missing-row') rows.splice(rows.findIndex(row => row[1] === '["pages",0]'), 1);
      workbook.Sheets.Checklists = XLSX.utils.aoa_to_sheet(rows);
      expect(() => parseTemplateTransferWorkbook(workbook, t)).toThrow();
      expect({}.polluted).toBeUndefined();
    }
  );

  it('fails clearly instead of truncating fields past Excel’s cell limit', () => {
    const source = fixture();
    source.templates[0].description = 'x'.repeat(32768);
    expect(() => createTemplateTransferWorkbook(source, t)).toThrow('Export as JSON');
    expect(parseTemplateTransfer(JSON.parse(JSON.stringify(source)), t)).toEqual(source);
  });

  it('exports formula-like names as literal strings', () => {
    const source = fixture();
    source.templates[0].name = '=HYPERLINK("https://example.invalid")';
    const sheet = createTemplateTransferWorkbook(source, t).Sheets.Checklists;
    expect(sheet.C2.t).toBe('s');
    expect(sheet.C2.f).toBeUndefined();
  });
});
