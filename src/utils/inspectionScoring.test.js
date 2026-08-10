import { describe, expect, it } from 'vitest';
import { calculatePageScore, calculateSectionScore, getQuestionScore } from './inspectionScoring';

describe('inspection scoring', () => {
  it('uses the configured answer score and question weight, not question count', () => {
    const score = getQuestionScore({
      type: 'compliance',
      weight: 2,
      scores: { full_compliance: 5, partial_compliance: 2, non_compliance: 0 },
    }, 'partial_compliance');

    expect(score).toEqual({ total: 10, achieved: 4 });
  });

  it('scores yes/no aliases and accepts saved response objects', () => {
    const score = getQuestionScore({
      type: 'yes_no',
      weight: 3,
      scores: { Yes: 2, No: 0 },
    }, { answer: 'yes' });

    expect(score).toEqual({ total: 6, achieved: 6 });
  });

  it('excludes N/A questions and non-scoring recommendations from the denominator', () => {
    const section = {
      questions: [
        { _id: 'full', type: 'compliance', scores: { full_compliance: 4 } },
        { _id: 'na', type: 'compliance', scores: { full_compliance: 5 } },
        { _id: 'recommended', type: 'compliance', requirementType: 'recommended', scores: { full_compliance: 7 } },
      ],
    };

    expect(calculateSectionScore(section, {
      full: 'full_compliance',
      na: 'N/A',
      recommended: 'full_compliance',
    })).toEqual({ total: 4, achieved: 4, percentage: 100 });
  });

  it('sums section scores into the correct overall page score', () => {
    const page = {
      sections: [
        { questions: [
          { _id: 'q1', type: 'compliance', weight: 2, scores: { full_compliance: 5 } },
          { _id: 'q2', type: 'compliance', scores: { partial_compliance: 4, full_compliance: 4 } },
        ] },
        { questions: [
          { _id: 'q3', answerType: 'boolean', scores: { true: 2, false: 0 } },
        ] },
      ],
    };

    expect(calculatePageScore(page, {
      q1: 'full_compliance',
      q2: 'partial_compliance',
      q3: true,
    })).toEqual({ total: 16, achieved: 16, percentage: 100 });
  });
});
