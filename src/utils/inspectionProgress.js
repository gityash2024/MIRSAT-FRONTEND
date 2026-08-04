const OBJECT_ID_PATTERN = /^[a-fA-F0-9]{24}$/;

export const getCanonicalQuestionId = (rawKey) => {
  if (!rawKey || rawKey.startsWith('c-')) return null;
  if (OBJECT_ID_PATTERN.test(rawKey)) return rawKey;

  if (rawKey.startsWith('q-') || rawKey.startsWith('question-')) {
    const direct = rawKey.split('-').slice(1).join('-');
    if (OBJECT_ID_PATTERN.test(direct)) return direct;
  }

  const matches = rawKey.match(/[a-fA-F0-9]{24}/g);
  return matches?.[matches.length - 1] || null;
};

export const isAnsweredResponse = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(isAnsweredResponse);

  if (typeof value === 'object') {
    if ('value' in value) return isAnsweredResponse(value.value);
    if ('url' in value) return isAnsweredResponse(value.url);
    if ('fileUrl' in value) return isAnsweredResponse(value.fileUrl);
    return Object.values(value).some(isAnsweredResponse);
  }

  return true;
};

export const getQuestionId = (question) => {
  const id = question?._id ?? question?.id;
  return id === null || id === undefined ? null : String(id);
};

export const getResponseForQuestion = (responses = {}, questionOrId) => {
  const questionId = typeof questionOrId === 'object'
    ? getQuestionId(questionOrId)
    : String(questionOrId || '');
  if (!questionId) return undefined;

  if (Object.prototype.hasOwnProperty.call(responses, questionId)) {
    return responses[questionId];
  }

  const responseKey = Object.keys(responses).find((key) => (
    getCanonicalQuestionId(key) === questionId
    || key.endsWith(questionId)
  ));
  return responseKey ? responses[responseKey] : undefined;
};

export const isQuestionAnswered = (responses, questionOrId) => (
  isAnsweredResponse(getResponseForQuestion(responses, questionOrId))
);

const addQuestions = (target, seen, questions) => {
  if (!Array.isArray(questions)) return;
  questions.forEach((question) => {
    const id = getQuestionId(question);
    if (!id || seen.has(id)) return;
    seen.add(id);
    target.push(question);
  });
};

const addSubLevelQuestions = (target, seen, subLevels) => {
  if (!Array.isArray(subLevels)) return;
  subLevels.forEach((subLevel) => {
    addQuestions(target, seen, subLevel?.questions);
    addSubLevelQuestions(target, seen, subLevel?.subLevels);
  });
};

export const collectInspectionQuestions = (
  inspectionLevel,
  preInspectionQuestions = []
) => {
  const questions = [];
  const seen = new Set();

  inspectionLevel?.pages?.forEach((page) => {
    page?.sections?.forEach((section) => {
      addQuestions(questions, seen, section?.questions);
    });
  });

  if (questions.length === 0) {
    addSubLevelQuestions(questions, seen, inspectionLevel?.subLevels);
  }

  if (questions.length === 0) {
    addQuestions(questions, seen, inspectionLevel?.questions);
  }

  addQuestions(questions, seen, preInspectionQuestions);
  return questions;
};

export const isRequiredQuestion = (question) => (
  question?.requirementType !== 'recommended'
  && question?.mandatory !== false
  && question?.required !== false
);

export const calculateInspectionProgress = ({
  inspectionLevel,
  preInspectionQuestions = [],
  responses = {}
}) => {
  const questions = collectInspectionQuestions(
    inspectionLevel,
    preInspectionQuestions
  );
  const unansweredRequiredQuestionIds = [];
  let answeredCount = 0;

  questions.forEach((question) => {
    if (isQuestionAnswered(responses, question)) {
      answeredCount += 1;
    } else if (isRequiredQuestion(question)) {
      unansweredRequiredQuestionIds.push(getQuestionId(question));
    }
  });

  const totalCount = questions.length;
  return {
    answeredCount,
    totalCount,
    requiredUnansweredCount: unansweredRequiredQuestionIds.length,
    unansweredRequiredQuestionIds,
    completionRate: totalCount > 0
      ? Math.round((answeredCount / totalCount) * 100)
      : 0
  };
};

