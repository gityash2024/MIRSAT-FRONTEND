import * as XLSX from '@e965/xlsx';
import { createTemplateExcelParser } from './templateExcelImport';

export const TEMPLATE_TRANSFER_FORMAT = 'mirsat-template-transfer';
export const TEMPLATE_TRANSFER_VERSION = 1;
const MAX_TRANSFER_BYTES = 50 * 1024 * 1024;
const CHILDREN = new Set(['pages', 'sections', 'subLevels', 'sets', 'questions', 'generalQuestions']);
const COLUMNS = ['Template Key', 'Path', 'Name', 'Text', 'Description', 'Answer Type', 'Options JSON', 'Settings JSON'];
const FIELDS = { Name: 'name', Text: 'text', Description: 'description', 'Answer Type': 'answerType' };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const fail = (t, key, options) => { throw new Error(t(`templateTransfer.${key}`, options)); };

export const parseTemplateTransfer = (payload, t) => {
  if (payload?.format !== undefined && (payload.format !== TEMPLATE_TRANSFER_FORMAT
    || payload.version !== TEMPLATE_TRANSFER_VERSION)) fail(t, 'unsupportedVersion');
  const templates = Array.isArray(payload) ? payload
    : Array.isArray(payload?.templates) ? payload.templates : object(payload) && payload.name ? [payload] : [];
  if (!templates.length || templates.some(template => !object(template)
    || typeof template.name !== 'string' || !template.name.trim())) fail(t, 'invalidTemplates');
  const bundle = { format: TEMPLATE_TRANSFER_FORMAT, version: TEMPLATE_TRANSFER_VERSION, templates };
  if (new Blob([JSON.stringify(bundle)]).size > MAX_TRANSFER_BYTES) fail(t, 'fileTooLarge');
  return bundle;
};

export const createTemplateTransferWorkbook = (payload, t) => {
  const bundle = parseTemplateTransfer(payload, t);
  const rows = [COLUMNS];
  const visit = (node, templateKey, path) => {
    const settings = { ...node };
    for (const key of CHILDREN) {
      if (Array.isArray(settings[key])) settings[key] = [];
    }
    const row = [templateKey, JSON.stringify(path), node.name ?? '', node.text ?? '',
      node.description ?? '', node.answerType ?? '',
      node.options === undefined ? '' : JSON.stringify(node.options), JSON.stringify(settings)];
    if (row.some(cell => String(cell).length > 32767)) fail(t, 'excelCellTooLong');
    rows.push(row);
    for (const key of CHILDREN) {
      if (Array.isArray(node[key])) node[key].forEach((child, index) => visit(child, templateKey, [...path, key, index]));
    }
  };
  bundle.templates.forEach((template, index) => visit(template, String(index + 1), []));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    ['Format', TEMPLATE_TRANSFER_FORMAT], ['Version', TEMPLATE_TRANSFER_VERSION],
    ['Instructions', 'Each template and checklist item has its own row. Preserve Template Key, Path and Settings JSON. Name, Text, Description, Answer Type and Options JSON are editable. Import creates new copies.']
  ]), 'MIRSAT Transfer');
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet['!cols'] = [{ wch: 14 }, { wch: 38 }, { wch: 28 }, { wch: 65 }, { wch: 50 }, { wch: 18 }, { wch: 35 }, { wch: 65 }];
  sheet['!autofilter'] = { ref: `A1:H${rows.length}` };
  XLSX.utils.book_append_sheet(workbook, sheet, 'Checklists');
  return workbook;
};

export const parseTemplateTransferWorkbook = (workbook, t) => {
  if (!workbook.Sheets['MIRSAT Transfer']) {
    // The same authoring workbook formats supported by the existing add form.
    return parseTemplateTransfer(createTemplateExcelParser(t).convertExcelWorkbookToTemplate(workbook), t);
  }
  const metadata = XLSX.utils.sheet_to_json(workbook.Sheets['MIRSAT Transfer'], { header: 1 });
  if (metadata[0]?.[1] !== TEMPLATE_TRANSFER_FORMAT || Number(metadata[1]?.[1]) !== TEMPLATE_TRANSFER_VERSION) {
    fail(t, 'unsupportedVersion');
  }
  const sheet = workbook.Sheets.Checklists;
  if (!sheet) fail(t, 'invalidWorkbook');
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true });
  if (!COLUMNS.every((column, index) => rawRows[0]?.[index] === column)) fail(t, 'invalidWorkbook');
  const roots = new Map();
  const paths = new Set();
  const rows = rawRows.slice(1).filter(row => row.some(cell => cell !== '')).map((row, index) => {
    try {
      const templateKey = String(row[0]);
      const path = JSON.parse(String(row[1]));
      const node = JSON.parse(String(row[7]));
      if (!templateKey || !Array.isArray(path) || path.length % 2 || path.length > 128 || !object(node)) throw new Error();
      path.forEach((part, partIndex) => {
        if (partIndex % 2 === 0 ? !CHILDREN.has(part) : !Number.isInteger(part) || part < 0 || part > 10000) throw new Error();
      });
      const pathKey = `${templateKey}:${JSON.stringify(path)}`;
      if (paths.has(pathKey)) throw new Error();
      paths.add(pathKey);
      for (const [column, field] of Object.entries(FIELDS)) {
        const value = String(row[COLUMNS.indexOf(column)] ?? '');
        if (Object.hasOwn(node, field) || value !== '') node[field] = value;
      }
      if (Object.hasOwn(node, 'options') || row[6] !== '') {
        node.options = row[6] === '' ? [] : JSON.parse(String(row[6]));
        if (!Array.isArray(node.options) || node.options.some(option => typeof option !== 'string')) throw new Error();
      }
      for (const key of CHILDREN) {
        if (node[key] !== undefined && (!Array.isArray(node[key]) || node[key].length)) throw new Error();
      }
      return { templateKey, path, node };
    } catch {
      fail(t, 'invalidWorkbookRow', { row: index + 2 });
    }
  }).sort((a, b) => a.path.length - b.path.length);
  for (const { templateKey, path, node } of rows) {
    if (!path.length) {
      if (roots.has(templateKey)) fail(t, 'invalidWorkbook');
      roots.set(templateKey, node);
      continue;
    }
    let parent = roots.get(templateKey);
    for (let index = 0; index < path.length - 2; index += 2) parent = parent?.[path[index]]?.[path[index + 1]];
    const key = path[path.length - 2];
    const index = path[path.length - 1];
    if (!parent || !Array.isArray(parent[key]) || parent[key][index] !== undefined) fail(t, 'invalidWorkbook');
    parent[key][index] = node;
  }
  const verify = node => {
    for (const key of CHILDREN) {
      if (Array.isArray(node[key])) {
        for (let index = 0; index < node[key].length; index += 1) {
          if (!object(node[key][index])) fail(t, 'invalidWorkbook');
          verify(node[key][index]);
        }
      }
    }
  };
  roots.forEach(verify);
  return parseTemplateTransfer({ templates: [...roots.values()] }, t);
};

export const readTemplateImportFile = async (file, format, t) => {
  const validExtension = format === 'json' ? /\.json$/i : /\.xlsx?$/i;
  if (!validExtension.test(file.name)) fail(t, 'wrongFileType', { format: format === 'json' ? 'JSON' : 'Excel' });
  if (!file.size) fail(t, 'emptyFile');
  if (file.size > MAX_TRANSFER_BYTES) fail(t, 'fileTooLarge');
  if (format === 'json') {
    let parsed;
    try { parsed = JSON.parse((await file.text()).replace(/^\uFEFF/, '')); }
    catch { fail(t, 'malformedJson'); }
    return parseTemplateTransfer(parsed, t);
  }
  let workbook;
  try { workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' }); }
  catch { fail(t, 'invalidWorkbook'); }
  return parseTemplateTransferWorkbook(workbook, t);
};

export const downloadTemplateTransfer = (payload, format, fileName, t) => {
  const bundle = parseTemplateTransfer(payload, t);
  const content = format === 'json' ? JSON.stringify(bundle, null, 2)
    : XLSX.write(createTemplateTransferWorkbook(bundle, t), { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([content], { type: format === 'json' ? 'application/json'
    : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.${format === 'json' ? 'json' : 'xlsx'}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
