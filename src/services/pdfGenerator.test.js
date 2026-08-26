import { describe, expect, it } from 'vitest';
import { calculateReportScoreSummary } from './pdfGenerator';

describe('inspection PDF score summary', () => {
  it('uses template answer scores instead of legacy positional scoring.max values', () => {
    const rows = [
      {
        id: 'marina-answered',
        question: {
          type: 'compliance',
          scoring: { max: 12000 },
          scores: {
            'Full compliance': 208,
            'Partial compliance': 104,
            'Non-compliant': 0,
            max: 12000,
          },
        },
      },
      {
        id: 'marina-unanswered',
        question: {
          type: 'compliance',
          scoring: { max: 8389 },
          scores: {
            full_compliance: 118,
            partial_compliance: 59,
            non_compliance: 0,
            max: 8389,
          },
        },
      },
    ];

    expect(calculateReportScoreSummary(rows, {
      'q-marina-answered': 'full_compliance',
      'q-marina-unanswered': 'non_compliance',
    })).toEqual({ achieved: 208, total: 326, percentage: 64 });
  });

  it('keeps N/A and recommended questions out of the PDF denominator', () => {
    const rows = [
      {
        id: 'na',
        question: { type: 'compliance', scores: { full_compliance: 4, non_compliance: 0 } },
      },
      {
        id: 'recommended',
        question: { type: 'compliance', requirementType: 'recommended', scores: { full_compliance: 9 } },
      },
    ];

    expect(calculateReportScoreSummary(rows, {
      na: 'not_applicable',
      recommended: 'full_compliance',
    })).toEqual({ achieved: 0, total: 0, percentage: 0 });
  });
});
