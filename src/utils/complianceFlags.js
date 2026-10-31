const COMPLIANCE_ALIASES = {
  full_compliance: ['full compliance', 'compliant', 'كامل', 'امتثال كامل'],
  partial_compliance: ['partial compliance', 'جزئي', 'امتثال جزئي'],
  non_compliant: ['non compliant', 'non compliance', 'noncompliant', 'غير متوافق', 'غير ممتثل'],
  not_applicable: ['not applicable', 'na', 'n/a', 'غير متاح', 'غير قابل للتطبيق']
};

const normalizeComplianceAnswer = value => {
  const text = String(value ?? '').trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
  return Object.keys(COMPLIANCE_ALIASES).find(key => COMPLIANCE_ALIASES[key].includes(text)) || text;
};

const getConfiguredComplianceFlag = (question, response) => {
  if (String(question?.answerType || question?.type || '').toLowerCase() !== 'compliance'
    || !question?.flaggedOptions || typeof question.flaggedOptions !== 'object' || Array.isArray(question.flaggedOptions)) return undefined;
  const value = response && typeof response === 'object' && !Array.isArray(response)
    ? response.value ?? response.response ?? response.answer ?? response.status : response;
  const key = normalizeComplianceAnswer(value);
  const entries = question.flaggedOptions instanceof Map ? [...question.flaggedOptions] : Object.entries(question.flaggedOptions);
  return entries.some(([option, flagged]) => normalizeComplianceAnswer(option) === key && flagged === true);
};

const isComplianceOptionFlagged = (question, option) => getConfiguredComplianceFlag(question, option)
  ?? normalizeComplianceAnswer(option) === 'non_compliant';

export { COMPLIANCE_ALIASES, normalizeComplianceAnswer, getConfiguredComplianceFlag, isComplianceOptionFlagged };
