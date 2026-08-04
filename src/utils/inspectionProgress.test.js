import { describe, expect, it } from 'vitest';
import {
  calculateInspectionProgress,
  isAnsweredResponse,
} from './inspectionProgress';

const inspection = {
  pages: [{
    _id: 'page-1',
    sections: [{
      _id: 'section-1',
      questions: [
        { _id: 'q-required', required: true },
        { _id: 'q-optional', required: false },
        { _id: 'q-false', required: true },
        { _id: 'q-zero', required: true },
      ],
    }],
  }],
};

describe('inspection progress', () => {
  it('counts the live response map, so clearing an answer decrements progress immediately', () => {
    const full = calculateInspectionProgress({
      inspectionLevel: inspection,
      responses: {
        'q-required': 'yes',
        'q-optional': 'note',
        'q-false': false,
        'q-zero': 0,
      }
    });
    const cleared = calculateInspectionProgress({
      inspectionLevel: inspection,
      responses: {
        'q-required': '',
        'q-optional': 'note',
        'q-false': false,
        'q-zero': 0,
      }
    });

    expect(full).toMatchObject({ answeredCount: 4, totalCount: 4, completionRate: 100 });
    expect(cleared).toMatchObject({ answeredCount: 3, totalCount: 4, completionRate: 75 });
    expect(cleared.unansweredRequiredQuestionIds).toEqual(['q-required']);
  });

  it('treats false and zero as answers but rejects blank values and empty uploads', () => {
    expect(isAnsweredResponse(false)).toBe(true);
    expect(isAnsweredResponse(0)).toBe(true);
    expect(isAnsweredResponse('   ')).toBe(false);
    expect(isAnsweredResponse([])).toBe(false);
    expect(isAnsweredResponse({ url: '' })).toBe(false);
    expect(isAnsweredResponse({ fileUrl: 'https://files.example/evidence.jpg' })).toBe(true);
  });
});
