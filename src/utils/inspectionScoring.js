const SCOREABLE_QUESTION_TYPES = new Set([
  'yesno',
  'yes_no',
  'yes/no',
  'boolean',
  'compliance',
]);

const NOT_APPLICABLE_VALUES = new Set([
  'na',
  'n/a',
  'not_applicable',
  'not applicable',
]);

const FULL_COMPLIANCE_VALUES = new Set([
  'full_compliance',
  'full compliance',
  'yes',
]);

const PARTIAL_COMPLIANCE_VALUES = new Set([
  'partial_compliance',
  'partial compliance',
]);

export const getScoreResponseValue = (response) => {
  if (response && typeof response === 'object' && !Array.isArray(response)) {
    return response.value ?? response.response ?? response.answer ?? response.status ?? response;
  }
  return response;
};

const normalizeValue = (value) => String(value ?? '').trim().toLowerCase();

const getConfiguredScore = (scores, value) => {
  if (!scores || value === null || value === undefined || value === '') return undefined;

  const valueKey = String(value);
  if (scores[valueKey] !== undefined && Number.isFinite(Number(scores[valueKey]))) {
    return Number(scores[valueKey]);
  }

  const normalizedValue = normalizeValue(value);
  const matchingKey = Object.keys(scores).find(key => normalizeValue(key) === normalizedValue);
  return matchingKey !== undefined && Number.isFinite(Number(scores[matchingKey]))
    ? Number(scores[matchingKey])
    : undefined;
};

// A score map describes the actual value for each answer.  Some older task
// snapshots also contain a `scoring.max` value that was accidentally saved as
// the question's position (3, 4, 5, …), rather than its maximum score.  When
// answer scores are available they are therefore the source of truth for the
// maximum as well as the achieved value.
const getConfiguredScoreValues = (scores) => Object.entries(scores || {})
  .filter(([key]) => normalizeValue(key) !== 'max')
  .map(([, value]) => Number(value))
  .filter(Number.isFinite);

const getQuestionMaxScore = (question) => {
  const configuredScores = getConfiguredScoreValues(question?.scores);
  if (configuredScores.length > 0) {
    return Math.max(0, ...configuredScores);
  }

  return Number(question?.scoring?.max)
    || Number(question?.scores?.max)
    || 2;
};

export const getQuestionScore = (question, response) => {
  const questionType = normalizeValue(question?.type || question?.answerType);
  const isScorable = SCOREABLE_QUESTION_TYPES.has(questionType)
    && normalizeValue(question?.requirementType) !== 'recommended'
    && question?.mandatory !== false
    && question?.required !== false;

  if (!isScorable) return { total: 0, achieved: 0 };

  const maxScore = getQuestionMaxScore(question);
  const weight = Number(question?.weight) || 1;
  const value = getScoreResponseValue(response);
  const normalizedValue = normalizeValue(value);

  // N/A removes the question from both numerator and denominator.
  if (NOT_APPLICABLE_VALUES.has(normalizedValue)) return { total: 0, achieved: 0 };

  const configuredScore = getConfiguredScore(question?.scores, value);
  let achieved = 0;
  if (configuredScore !== undefined) {
    achieved = configuredScore;
  } else if (FULL_COMPLIANCE_VALUES.has(normalizedValue)) {
    achieved = maxScore;
  } else if (PARTIAL_COMPLIANCE_VALUES.has(normalizedValue)) {
    achieved = maxScore / 2;
  }

  return { total: maxScore * weight, achieved: achieved * weight };
};

const findResponse = (responses, questionId) => {
  if (!responses || !questionId) return undefined;
  if (responses[questionId] !== undefined) return responses[questionId];

  const responseKey = Object.keys(responses).find(key =>
    key.includes(questionId) || key.endsWith(questionId)
  );
  return responseKey ? responses[responseKey] : undefined;
};

export const calculateSectionScore = (section, responses) => {
  if (!section?.questions || !responses) {
    return { total: 0, achieved: 0, percentage: 0 };
  }

  const { total, achieved } = section.questions.reduce((score, question) => {
    const questionId = question._id || question.id;
    const questionScore = getQuestionScore(question, findResponse(responses, questionId));
    return {
      total: score.total + questionScore.total,
      achieved: score.achieved + questionScore.achieved,
    };
  }, { total: 0, achieved: 0 });

  return {
    total,
    achieved,
    percentage: total > 0 ? Math.round((achieved / total) * 100) : 0,
  };
};

export const calculatePageScore = (page, responses) => {
  if (!page?.sections) return { total: 0, achieved: 0, percentage: 0 };

  const { total, achieved } = page.sections.reduce((score, section) => {
    const sectionScore = calculateSectionScore(section, responses);
    return {
      total: score.total + sectionScore.total,
      achieved: score.achieved + sectionScore.achieved,
    };
  }, { total: 0, achieved: 0 });

  return {
    total,
    achieved,
    percentage: total > 0 ? Math.round((achieved / total) * 100) : 0,
  };
};
