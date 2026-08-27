import { describe, expect, it } from 'vitest';
import { buildReportScoreSummaries, calculateReportScoreSummary } from './pdfGenerator';

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
    })).toEqual({ achieved: 208, total: 326, percentage: 63.8 });
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

  it('preserves each page and section result, including an unscored cover page', () => {
    const task = {
      inspectionLevel: {
        pages: [
          { name: 'Cover Page', sections: [] },
          {
            name: 'Documentation',
            sections: [
              {
                name: 'Licences',
                questions: [
                  {
                    _id: 'licence',
                    type: 'compliance',
                    scores: { full_compliance: 4, partial_compliance: 2, non_compliance: 0 }
                  }
                ]
              },
              {
                name: 'Logbooks',
                questions: [
                  {
                    _id: 'logbook',
                    type: 'compliance',
                    weight: 2,
                    scores: { full_compliance: 3, partial_compliance: 1.5, non_compliance: 0 }
                  }
                ]
              }
            ]
          }
        ]
      },
      questionnaireResponses: {
        licence: 'full compliance',
        logbook: 'partial_compliance'
      }
    };

    expect(buildReportScoreSummaries(task)).toEqual({
      pages: [
        { number: '1', name: 'Cover Page', achieved: 0, total: 0, percentage: 0, sections: [] },
        {
          number: '2',
          name: 'Documentation',
          achieved: 7,
          total: 10,
          percentage: 70,
          sections: [
            { number: '2.1', name: 'Licences', achieved: 4, total: 4, percentage: 100 },
            { number: '2.2', name: 'Logbooks', achieved: 3, total: 6, percentage: 50 }
          ]
        }
      ],
      achieved: 7,
      total: 10,
      percentage: 70
    });
  });

  it('uses truncated two-decimal score percentages in report summaries', () => {
    const rows = [{
      id: 'decimal-score',
      question: {
        type: 'compliance',
        scores: { full_compliance: 1000000, partial_compliance: 836956, non_compliance: 0 },
      },
    }];

    expect(calculateReportScoreSummary(rows, {
      'decimal-score': 'partial_compliance',
    })).toEqual({ achieved: 836956, total: 1000000, percentage: 83.69 });
  });
});
