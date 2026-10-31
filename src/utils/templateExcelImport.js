import * as XLSX from '@e965/xlsx';

const TEMPLATE_IMPORT_EXCEL_SHEET_NAME = 'Template Import';

const TEMPLATE_IMPORT_EXCEL_BASIC_INFO_SHEET_NAME = 'Basic Info';

const TEMPLATE_IMPORT_EXCEL_PAGES_QUESTIONS_SHEET_NAME = 'Pages and Questions';

const REQUIRED_TEMPLATE_IMPORT_EXCEL_PAGES_QUESTIONS_COLUMNS = [
  'Page Name',
  'Section Name',
  'Question Text'
];

const REQUIRED_TEMPLATE_IMPORT_EXCEL_COLUMNS = [
  'Template Name',
  'Page Name',
  'Section Name',
  'Question Text'
];

const TEMPLATE_IMPORT_STATUS_VALUES = ['active', 'inactive', 'draft', 'archived'];

const TEMPLATE_IMPORT_REQUIREMENT_TYPE_VALUES = ['mandatory', 'recommended'];

const TEMPLATE_IMPORT_ANSWER_TYPE_VALUES = [
  'text',
  'textarea',
  'number',
  'date',
  'yesno',
  'yes_no',
  'select',
  'multiple_choice',
  'multiple',
  'checkbox',
  'compliance',
  'signature',
  'media',
  'file'
];

const TEMPLATE_IMPORT_ANSWER_TYPE_ALIASES = {
  'yes/no': 'yesno',
  'yes no': 'yesno',
  'yes-no': 'yesno',
  'multiple choice': 'multiple_choice',
  'multiple-choice': 'multiple_choice',
  'text area': 'textarea',
  'file upload': 'file',
  'media upload': 'media'
};

const TEMPLATE_IMPORT_BOOLEAN_TRUE_VALUES = new Set(['true', 'yes', 'y', '1']);

const TEMPLATE_IMPORT_BOOLEAN_FALSE_VALUES = new Set(['false', 'no', 'n', '0']);

const TEMPLATE_IMPORT_SCORE_COLUMNS = {
  'Score Yes': 'Yes',
  'Score No': 'No',
  'Score N/A': 'N/A',
  'Score Full Compliance': 'Full compliance',
  'Score Partial Compliance': 'Partial compliance',
  'Score Non-Compliant': 'Non-compliant',
  'Score Not Applicable': 'Not applicable'
};

const TEMPLATE_IMPORT_DEFAULT_OPTIONS = {
  yesno: ['Yes', 'No', 'N/A'],
  yes_no: ['Yes', 'No', 'N/A'],
  compliance: ['Full compliance', 'Partial compliance', 'Non-compliant', 'Not applicable']
};

const normalizeTemplateImportExcelHeader = (value) => (
  String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase()
);

const toTemplateImportExcelCellString = (value) => {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
};

// Shared by the template list and the existing add/edit form.
export const createTemplateExcelParser = (t) => {
  const getExcelCellValue = (row, headerMap, columnName) => {
    const columnIndex = headerMap.get(normalizeTemplateImportExcelHeader(columnName));
    if (columnIndex === undefined) return '';
    return toTemplateImportExcelCellString(row[columnIndex]);
  };

  const buildExcelRowError = (rowNumber, columnName, key, params = {}) => (
    t(key, { row: rowNumber, column: columnName, ...params })
  );

  const throwExcelValidationErrors = (errors) => {
    const visibleErrors = errors.slice(0, 5).join(' ');
    const remainingCount = errors.length - 5;
    const remaining = remainingCount > 0
      ? t('inspections.importErrorExcelMoreErrors', { count: remainingCount })
      : '';

    throw new Error(t('inspections.importErrorExcelValidationSummary', {
      count: errors.length,
      errors: visibleErrors,
      remaining
    }));
  };

  const parseExcelBoolean = (value, rowNumber, columnName, errors) => {
    if (!value) return undefined;

    const normalizedValue = value.toLowerCase();
    if (TEMPLATE_IMPORT_BOOLEAN_TRUE_VALUES.has(normalizedValue)) return true;
    if (TEMPLATE_IMPORT_BOOLEAN_FALSE_VALUES.has(normalizedValue)) return false;

    errors.push(buildExcelRowError(rowNumber, columnName, 'inspections.importErrorExcelInvalidBoolean', { value }));
    return undefined;
  };

  const parseExcelNumber = (value, rowNumber, columnName, errors) => {
    if (!value) return undefined;

    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
      errors.push(buildExcelRowError(rowNumber, columnName, 'inspections.importErrorExcelInvalidNumber', { value }));
      return undefined;
    }

    return numberValue;
  };

  const parseExcelStatus = (value, rowNumber, errors) => {
    if (!value) return undefined;

    const normalizedValue = value.toLowerCase();
    if (TEMPLATE_IMPORT_STATUS_VALUES.includes(normalizedValue)) return normalizedValue;

    errors.push(buildExcelRowError(rowNumber, 'Template Status', 'inspections.importErrorExcelInvalidStatus', {
      value,
      allowed: TEMPLATE_IMPORT_STATUS_VALUES.join(', ')
    }));
    return undefined;
  };

  const parseExcelRequirementType = (value, rowNumber, errors) => {
    if (!value) return undefined;

    const normalizedValue = value.toLowerCase();
    if (TEMPLATE_IMPORT_REQUIREMENT_TYPE_VALUES.includes(normalizedValue)) return normalizedValue;

    errors.push(buildExcelRowError(rowNumber, 'Requirement Type', 'inspections.importErrorExcelInvalidRequirementType', {
      value,
      allowed: TEMPLATE_IMPORT_REQUIREMENT_TYPE_VALUES.join(', ')
    }));
    return undefined;
  };

  const parseExcelAnswerType = (value, rowNumber, errors) => {
    if (!value) return undefined;

    const normalizedValue = value.toLowerCase().replace(/\s+/g, ' ').trim();
    const answerType = TEMPLATE_IMPORT_ANSWER_TYPE_ALIASES[normalizedValue] || normalizedValue;
    if (TEMPLATE_IMPORT_ANSWER_TYPE_VALUES.includes(answerType)) return answerType;

    errors.push(buildExcelRowError(rowNumber, 'Answer Type', 'inspections.importErrorExcelInvalidAnswerType', {
      value,
      allowed: TEMPLATE_IMPORT_ANSWER_TYPE_VALUES.join(', ')
    }));
    return undefined;
  };

  const parseExcelPipeList = (value) => {
    if (!value) return [];
    return value.split('|').map(item => item.trim()).filter(Boolean);
  };

  const resolveExcelOptionName = (option, options) => {
    if (!options.length) return option;

    return options.find(existingOption => (
      existingOption.toLowerCase() === option.toLowerCase()
    )) || '';
  };

  const getDefaultExcelOptions = (answerType, includeNA) => {
    const defaultOptions = TEMPLATE_IMPORT_DEFAULT_OPTIONS[answerType] || [];
    if ((answerType === 'yesno' || answerType === 'yes_no') && includeNA === false) {
      return ['Yes', 'No'];
    }

    return [...defaultOptions];
  };

  const getRelevantExcelScoreColumns = (answerType) => {
    if (answerType === 'yesno' || answerType === 'yes_no') {
      return ['Score Yes', 'Score No', 'Score N/A'];
    }

    if (answerType === 'compliance') {
      return [
        'Score Full Compliance',
        'Score Partial Compliance',
        'Score Non-Compliant',
        'Score Not Applicable'
      ];
    }

    return [];
  };

  const parseExcelScores = (value, rowNumber, options, errors, columnName = 'Scores') => {
    if (!value) return {};

    const scores = {};

    value.split('|').map(item => item.trim()).filter(Boolean).forEach((scoreEntry) => {
      const separatorIndex = scoreEntry.indexOf('=');
      const option = separatorIndex > -1 ? scoreEntry.slice(0, separatorIndex).trim() : '';
      const scoreValue = separatorIndex > -1 ? scoreEntry.slice(separatorIndex + 1).trim() : '';
      const numericScore = Number(scoreValue);

      if (!option || !scoreValue || !Number.isFinite(numericScore)) {
        errors.push(buildExcelRowError(rowNumber, columnName, 'inspections.importErrorExcelMalformedScores', {
          value: scoreEntry
        }));
        return;
      }

      if (!options.length) {
        errors.push(buildExcelRowError(rowNumber, columnName, 'inspections.importErrorExcelScoresRequireOptions', {
          value: option
        }));
        return;
      }

      const resolvedOption = resolveExcelOptionName(option, options);
      if (!resolvedOption) {
        errors.push(buildExcelRowError(rowNumber, columnName, 'inspections.importErrorExcelScoreOptionMismatch', {
          value: option
        }));
        return;
      }

      scores[resolvedOption] = numericScore;
    });

    return scores;
  };

  const parseExcelScoreColumns = (row, headerMap, rowNumber, options, answerType, errors) => {
    const scores = {};
    const relevantColumns = getRelevantExcelScoreColumns(answerType);

    Object.entries(TEMPLATE_IMPORT_SCORE_COLUMNS).forEach(([columnName, optionName]) => {
      if (!relevantColumns.includes(columnName)) return;

      const scoreValue = getExcelCellValue(row, headerMap, columnName);
      if (!scoreValue) return;

      const numericScore = parseExcelNumber(scoreValue, rowNumber, columnName, errors);
      if (numericScore === undefined) return;

      if (!options.length) {
        errors.push(buildExcelRowError(rowNumber, columnName, 'inspections.importErrorExcelScoresRequireOptions', {
          value: optionName
        }));
        return;
      }

      const resolvedOption = resolveExcelOptionName(optionName, options);
      if (!resolvedOption) {
        errors.push(buildExcelRowError(rowNumber, columnName, 'inspections.importErrorExcelScoreOptionMismatch', {
          value: optionName
        }));
        return;
      }

      scores[resolvedOption] = numericScore;
    });

    return scores;
  };

  const getExcelRows = (worksheet) => (
    XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false,
      raw: false
    })
  );

  const getExcelHeaderInfo = (rows, requiredColumns) => {
    const headerRowIndex = rows.findIndex(row => row.some(cell => toTemplateImportExcelCellString(cell)));
    if (headerRowIndex === -1) {
      throw new Error(t('inspections.importErrorEmptyFile'));
    }

    const headerMap = new Map();
    rows[headerRowIndex].forEach((header, index) => {
      const normalizedHeader = normalizeTemplateImportExcelHeader(header);
      if (normalizedHeader && !headerMap.has(normalizedHeader)) {
        headerMap.set(normalizedHeader, index);
      }
    });

    const missingHeaders = requiredColumns.filter(
      column => !headerMap.has(normalizeTemplateImportExcelHeader(column))
    );

    if (missingHeaders.length > 0) {
      throw new Error(t('inspections.importErrorExcelMissingHeaders', {
        headers: missingHeaders.join(', ')
      }));
    }

    return { headerRowIndex, headerMap };
  };

  const convertSingleSheetExcelWorkbookToTemplate = (workbook) => {
    if (!workbook?.SheetNames?.length) {
      throw new Error(t('inspections.importErrorExcelNoSheets'));
    }

    const sheetName = workbook.SheetNames.includes(TEMPLATE_IMPORT_EXCEL_SHEET_NAME)
      ? TEMPLATE_IMPORT_EXCEL_SHEET_NAME
      : workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false,
      raw: false
    });

    const headerRowIndex = rows.findIndex(row => row.some(cell => toTemplateImportExcelCellString(cell)));
    if (headerRowIndex === -1) {
      throw new Error(t('inspections.importErrorEmptyFile'));
    }

    const headerMap = new Map();
    rows[headerRowIndex].forEach((header, index) => {
      const normalizedHeader = normalizeTemplateImportExcelHeader(header);
      if (normalizedHeader && !headerMap.has(normalizedHeader)) {
        headerMap.set(normalizedHeader, index);
      }
    });

    const missingHeaders = REQUIRED_TEMPLATE_IMPORT_EXCEL_COLUMNS.filter(
      column => !headerMap.has(normalizeTemplateImportExcelHeader(column))
    );

    if (missingHeaders.length > 0) {
      throw new Error(t('inspections.importErrorExcelMissingHeaders', {
        headers: missingHeaders.join(', ')
      }));
    }

    const dataRows = rows
      .slice(headerRowIndex + 1)
      .map((row, index) => ({
        row,
        rowNumber: headerRowIndex + index + 2
      }))
      .filter(({ row }) => row.some(cell => toTemplateImportExcelCellString(cell)));

    if (dataRows.length === 0) {
      throw new Error(t('inspections.importErrorExcelNoRows'));
    }

    const errors = [];
    const template = {
      name: '',
      description: '',
      type: '',
      status: 'draft',
      pages: []
    };
    const pageMap = new Map();

    dataRows.forEach(({ row, rowNumber }) => {
      const missingRequiredValues = REQUIRED_TEMPLATE_IMPORT_EXCEL_COLUMNS.filter(
        column => !getExcelCellValue(row, headerMap, column)
      );

      missingRequiredValues.forEach((column) => {
        errors.push(buildExcelRowError(rowNumber, column, 'inspections.importErrorExcelMissingCell'));
      });

      if (missingRequiredValues.length > 0) return;

      const templateName = getExcelCellValue(row, headerMap, 'Template Name');
      if (!template.name) {
        template.name = templateName;
      } else if (template.name !== templateName) {
        errors.push(buildExcelRowError(rowNumber, 'Template Name', 'inspections.importErrorExcelTemplateNameMismatch', {
          expected: template.name,
          value: templateName
        }));
      }

      const templateDescription = getExcelCellValue(row, headerMap, 'Template Description');
      const templateType = getExcelCellValue(row, headerMap, 'Template Type');
      const templateStatus = parseExcelStatus(getExcelCellValue(row, headerMap, 'Template Status'), rowNumber, errors);
      const pageName = getExcelCellValue(row, headerMap, 'Page Name');
      const pageDescription = getExcelCellValue(row, headerMap, 'Page Description');
      const pageOrder = parseExcelNumber(getExcelCellValue(row, headerMap, 'Page Order'), rowNumber, 'Page Order', errors);
      const sectionName = getExcelCellValue(row, headerMap, 'Section Name');
      const sectionDescription = getExcelCellValue(row, headerMap, 'Section Description');
      const sectionOrder = parseExcelNumber(getExcelCellValue(row, headerMap, 'Section Order'), rowNumber, 'Section Order', errors);
      const answerType = parseExcelAnswerType(
        getExcelCellValue(row, headerMap, 'Answer Type') || getExcelCellValue(row, headerMap, 'Type'),
        rowNumber,
        errors
      ) || 'text';
      const required = parseExcelBoolean(getExcelCellValue(row, headerMap, 'Required'), rowNumber, 'Required', errors);
      const mandatory = parseExcelBoolean(getExcelCellValue(row, headerMap, 'Mandatory'), rowNumber, 'Mandatory', errors);
      const includeNA = parseExcelBoolean(getExcelCellValue(row, headerMap, 'Include N/A'), rowNumber, 'Include N/A', errors);
      const requirementType = parseExcelRequirementType(getExcelCellValue(row, headerMap, 'Requirement Type'), rowNumber, errors);
      const percentageWeight = getExcelCellValue(row, headerMap, 'Weight (%)');
      const weight = parseExcelNumber(percentageWeight || getExcelCellValue(row, headerMap, 'Weight'), rowNumber, percentageWeight ? 'Weight (%)' : 'Weight', errors);
      const options = parseExcelPipeList(getExcelCellValue(row, headerMap, 'Options'));
      const scores = parseExcelScores(getExcelCellValue(row, headerMap, 'Scores'), rowNumber, options, errors);
      const scoringEnabled = parseExcelBoolean(getExcelCellValue(row, headerMap, 'Scoring Enabled'), rowNumber, 'Scoring Enabled', errors);
      const scoringMax = parseExcelNumber(getExcelCellValue(row, headerMap, 'Scoring Max'), rowNumber, 'Scoring Max', errors);

      if (!template.description && templateDescription) template.description = templateDescription;
      if (!template.type && templateType) template.type = templateType;
      if (templateStatus && template.status === 'draft') template.status = templateStatus;

      if (!pageMap.has(pageName)) {
        const page = {
          name: pageName,
          description: pageDescription,
          ...(pageOrder !== undefined ? { order: pageOrder } : {}),
          sections: []
        };
        pageMap.set(pageName, {
          page,
          sectionMap: new Map()
        });
        template.pages.push(page);
      }

      const pageEntry = pageMap.get(pageName);
      if (!pageEntry.sectionMap.has(sectionName)) {
        const section = {
          name: sectionName,
          description: sectionDescription,
          ...(sectionOrder !== undefined ? { order: sectionOrder } : {}),
          questions: []
        };
        pageEntry.sectionMap.set(sectionName, section);
        pageEntry.page.sections.push(section);
      }

      const scoreValues = Object.values(scores);
      const inferredScoringMax = scoreValues.length > 0 ? Math.max(...scoreValues) : 0;
      const question = {
        text: getExcelCellValue(row, headerMap, 'Question Text'),
        description: getExcelCellValue(row, headerMap, 'Question Description'),
        answerType,
        type: answerType,
        required: required !== undefined ? required : true,
        options,
        scores
      };

      if (mandatory !== undefined) question.mandatory = mandatory;
      if (requirementType) question.requirementType = requirementType;
      if (includeNA !== undefined) question.includeNA = includeNA;
      if (weight !== undefined) {
        question.weight = weight;
        if (percentageWeight) question.weightUnit = 'percentage';
      }
      if (scoringEnabled !== undefined || scoringMax !== undefined || scoreValues.length > 0) {
        question.scoring = {
          enabled: scoringEnabled !== undefined ? scoringEnabled : scoreValues.length > 0,
          max: scoringMax !== undefined ? scoringMax : inferredScoringMax
        };
      }

      pageEntry.sectionMap.get(sectionName).questions.push(question);
    });

    if (errors.length > 0) {
      throwExcelValidationErrors(errors);
    }

    return template;
  };

  const convertTabbedExcelWorkbookToTemplate = (workbook) => {
    const basicInfoSheet = workbook.Sheets[TEMPLATE_IMPORT_EXCEL_BASIC_INFO_SHEET_NAME];
    const pagesQuestionsSheet = workbook.Sheets[TEMPLATE_IMPORT_EXCEL_PAGES_QUESTIONS_SHEET_NAME];

    if (!basicInfoSheet) {
      throw new Error(t('inspections.importErrorExcelMissingSheet', {
        sheet: TEMPLATE_IMPORT_EXCEL_BASIC_INFO_SHEET_NAME
      }));
    }

    if (!pagesQuestionsSheet) {
      throw new Error(t('inspections.importErrorExcelMissingSheet', {
        sheet: TEMPLATE_IMPORT_EXCEL_PAGES_QUESTIONS_SHEET_NAME
      }));
    }

    const errors = [];
    const template = {
      name: '',
      description: '',
      type: '',
      status: 'draft',
      pages: []
    };

    const basicInfoRows = getExcelRows(basicInfoSheet);
    const basicInfoHeaderInfo = getExcelHeaderInfo(basicInfoRows, ['Field', 'Value']);
    const basicInfoDataRows = basicInfoRows
      .slice(basicInfoHeaderInfo.headerRowIndex + 1)
      .map((row, index) => ({
        row,
        rowNumber: basicInfoHeaderInfo.headerRowIndex + index + 2
      }))
      .filter(({ row }) => row.some(cell => toTemplateImportExcelCellString(cell)));

    basicInfoDataRows.forEach(({ row, rowNumber }) => {
      const field = getExcelCellValue(row, basicInfoHeaderInfo.headerMap, 'Field');
      const value = getExcelCellValue(row, basicInfoHeaderInfo.headerMap, 'Value');
      if (!field) return;

      switch (normalizeTemplateImportExcelHeader(field)) {
        case 'template name':
          template.name = value;
          break;
        case 'template description':
          template.description = value;
          break;
        case 'template type':
          template.type = value;
          break;
        case 'template status': {
          const status = parseExcelStatus(value, rowNumber, errors);
          if (status) template.status = status;
          break;
        }
        default:
          break;
      }
    });

    if (!template.name) {
      errors.push(t('inspections.importErrorExcelBasicInfoRequired'));
    }

    const pagesQuestionsRows = getExcelRows(pagesQuestionsSheet);
    const pagesQuestionsHeaderInfo = getExcelHeaderInfo(
      pagesQuestionsRows,
      REQUIRED_TEMPLATE_IMPORT_EXCEL_PAGES_QUESTIONS_COLUMNS
    );
    const dataRows = pagesQuestionsRows
      .slice(pagesQuestionsHeaderInfo.headerRowIndex + 1)
      .map((row, index) => ({
        row,
        rowNumber: pagesQuestionsHeaderInfo.headerRowIndex + index + 2
      }))
      .filter(({ row }) => row.some(cell => toTemplateImportExcelCellString(cell)));

    if (dataRows.length === 0) {
      throw new Error(t('inspections.importErrorExcelNoRows'));
    }

    const pageMap = new Map();

    dataRows.forEach(({ row, rowNumber }) => {
      const headerMap = pagesQuestionsHeaderInfo.headerMap;
      const missingRequiredValues = REQUIRED_TEMPLATE_IMPORT_EXCEL_PAGES_QUESTIONS_COLUMNS.filter(
        column => !getExcelCellValue(row, headerMap, column)
      );

      missingRequiredValues.forEach((column) => {
        errors.push(buildExcelRowError(rowNumber, column, 'inspections.importErrorExcelMissingCell'));
      });

      if (missingRequiredValues.length > 0) return;

      const pageName = getExcelCellValue(row, headerMap, 'Page Name');
      const pageDescription = getExcelCellValue(row, headerMap, 'Page Description');
      const pageOrder = parseExcelNumber(getExcelCellValue(row, headerMap, 'Page Order'), rowNumber, 'Page Order', errors);
      const sectionName = getExcelCellValue(row, headerMap, 'Section Name');
      const sectionDescription = getExcelCellValue(row, headerMap, 'Section Description');
      const sectionOrder = parseExcelNumber(getExcelCellValue(row, headerMap, 'Section Order'), rowNumber, 'Section Order', errors);
      const answerType = parseExcelAnswerType(getExcelCellValue(row, headerMap, 'Answer Type'), rowNumber, errors) || 'text';
      const required = parseExcelBoolean(getExcelCellValue(row, headerMap, 'Required'), rowNumber, 'Required', errors);
      const mandatory = parseExcelBoolean(getExcelCellValue(row, headerMap, 'Mandatory'), rowNumber, 'Mandatory', errors);
      const includeNA = parseExcelBoolean(getExcelCellValue(row, headerMap, 'Include N/A'), rowNumber, 'Include N/A', errors);
      const requirementType = parseExcelRequirementType(getExcelCellValue(row, headerMap, 'Requirement Type'), rowNumber, errors);
      const percentageWeight = getExcelCellValue(row, headerMap, 'Weight (%)');
      const weight = parseExcelNumber(percentageWeight || getExcelCellValue(row, headerMap, 'Weight'), rowNumber, percentageWeight ? 'Weight (%)' : 'Weight', errors);
      const explicitOptions = parseExcelPipeList(getExcelCellValue(row, headerMap, 'Options'));
      const options = explicitOptions.length > 0
        ? explicitOptions
        : getDefaultExcelOptions(answerType, includeNA);
      const scoreColumnScores = parseExcelScoreColumns(row, headerMap, rowNumber, options, answerType, errors);
      const optionScores = parseExcelScores(
        getExcelCellValue(row, headerMap, 'Option Scores') || getExcelCellValue(row, headerMap, 'Scores'),
        rowNumber,
        options,
        errors,
        getExcelCellValue(row, headerMap, 'Option Scores') ? 'Option Scores' : 'Scores'
      );
      const scores = {
        ...scoreColumnScores,
        ...optionScores
      };
      const scoringEnabled = parseExcelBoolean(getExcelCellValue(row, headerMap, 'Scoring Enabled'), rowNumber, 'Scoring Enabled', errors);
      const scoringMax = parseExcelNumber(getExcelCellValue(row, headerMap, 'Scoring Max'), rowNumber, 'Scoring Max', errors);

      if (!pageMap.has(pageName)) {
        const page = {
          name: pageName,
          description: pageDescription,
          ...(pageOrder !== undefined ? { order: pageOrder } : {}),
          sections: []
        };
        pageMap.set(pageName, {
          page,
          sectionMap: new Map()
        });
        template.pages.push(page);
      }

      const pageEntry = pageMap.get(pageName);
      if (!pageEntry.sectionMap.has(sectionName)) {
        const section = {
          name: sectionName,
          description: sectionDescription,
          ...(sectionOrder !== undefined ? { order: sectionOrder } : {}),
          questions: []
        };
        pageEntry.sectionMap.set(sectionName, section);
        pageEntry.page.sections.push(section);
      }

      const scoreValues = Object.values(scores);
      const inferredScoringMax = scoreValues.length > 0 ? Math.max(...scoreValues) : 0;
      const question = {
        text: getExcelCellValue(row, headerMap, 'Question Text'),
        description: getExcelCellValue(row, headerMap, 'Question Description'),
        answerType,
        type: answerType,
        required: required !== undefined ? required : true,
        options,
        scores
      };

      if (mandatory !== undefined) question.mandatory = mandatory;
      if (requirementType) question.requirementType = requirementType;
      if (includeNA !== undefined) question.includeNA = includeNA;
      if (weight !== undefined) {
        question.weight = weight;
        if (percentageWeight) question.weightUnit = 'percentage';
      }
      if (scoringEnabled !== undefined || scoringMax !== undefined || scoreValues.length > 0) {
        question.scoring = {
          enabled: scoringEnabled !== undefined ? scoringEnabled : scoreValues.length > 0,
          max: scoringMax !== undefined ? scoringMax : inferredScoringMax
        };
      }

      pageEntry.sectionMap.get(sectionName).questions.push(question);
    });

    if (errors.length > 0) {
      throwExcelValidationErrors(errors);
    }

    return template;
  };

  const convertExcelWorkbookToTemplate = (workbook) => {
    if (!workbook?.SheetNames?.length) {
      throw new Error(t('inspections.importErrorExcelNoSheets'));
    }

    const usesTabbedTemplate = workbook.Sheets[TEMPLATE_IMPORT_EXCEL_BASIC_INFO_SHEET_NAME]
      || workbook.Sheets[TEMPLATE_IMPORT_EXCEL_PAGES_QUESTIONS_SHEET_NAME];

    if (usesTabbedTemplate) {
      return convertTabbedExcelWorkbookToTemplate(workbook);
    }

    return convertSingleSheetExcelWorkbookToTemplate(workbook);
  };

  return { convertExcelWorkbookToTemplate };
};
