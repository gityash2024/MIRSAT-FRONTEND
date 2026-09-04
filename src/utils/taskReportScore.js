export const getTaskReportScoreValue = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const formatTaskReportScore = (value) => {
  const score = getTaskReportScoreValue(value);
  return `${Number.isInteger(score) ? score.toFixed(0) : score.toFixed(2)}%`;
};

export const getTaskReportScoreColor = (value) => (
  getTaskReportScoreValue(value) >= 75 ? [22, 163, 74] : [220, 38, 38]
);
