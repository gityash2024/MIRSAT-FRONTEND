import { describe, expect, it } from 'vitest';
import { updateQuestionSettings } from './questionSettings';
import { getQuestionScore, isQuestionScored } from './inspectionScoring';
import { calculateInspectionProgress, isRequiredQuestion } from './inspectionProgress';
import { calculateReportScoreSummary } from '../services/pdfGenerator';

const base = { _id: 'question', text: 'Check', type: 'compliance', required: true,
  mandatory: true, requirementType: 'mandatory', scores: { full_compliance: 4, non_compliance: 0 },
  scoring: { enabled: true, max: 4 } };

describe('independent question scoring and requiredness', () => {
  it.each([[true, true], [true, false], [false, true], [false, false]])(
    'saves scored=%s and required=%s independently across score and completion calculations', (isScored, required) => {
      const question = updateQuestionSettings(base, { isScored, required });
      const reloaded = JSON.parse(JSON.stringify(question));
      expect(getQuestionScore(reloaded, 'full_compliance')).toEqual({ total: isScored ? 4 : 0, achieved: isScored ? 4 : 0 });
      expect(calculateReportScoreSummary([{ id: question._id, question: reloaded }], { question: 'full_compliance' }))
        .toEqual({ total: isScored ? 4 : 0, achieved: isScored ? 4 : 0, percentage: isScored ? 100 : 0 });
      const progress = calculateInspectionProgress({ inspectionLevel: { questions: [reloaded] } });
      expect(progress.requiredTotalCount).toBe(required ? 1 : 0);
      expect(progress.requiredUnansweredCount).toBe(required ? 1 : 0);
    });

  it('retains configured scores and Required through No -> Yes', () => {
    const off = updateQuestionSettings(base, { isScored: false });
    const on = updateQuestionSettings(off, { isScored: true });
    expect(off.scores).toEqual(base.scores);
    expect(off.scoring).toEqual(base.scoring);
    expect(isRequiredQuestion(off)).toBe(true);
    expect(getQuestionScore(on, 'full_compliance')).toEqual({ total: 4, achieved: 4 });
    expect(base.isScored).toBeUndefined();
  });

  it('Required edits retain a legacy question’s score choice and effective requiredness', () => {
    const recommended = { ...base, requirementType: 'recommended' };
    expect(isQuestionScored(recommended)).toBe(false);
    expect(isRequiredQuestion(recommended)).toBe(false);
    const required = updateQuestionSettings(recommended, { required: true });
    expect(required.isScored).toBe(false);
    expect(isRequiredQuestion(required)).toBe(true);
    const scored = updateQuestionSettings(recommended, { isScored: true });
    expect(isRequiredQuestion(scored)).toBe(false);
    expect(getQuestionScore(scored, 'full_compliance').total).toBe(4);
    const optional = updateQuestionSettings(base, { required: false });
    expect(optional.isScored).toBe(true);
    expect(getQuestionScore(optional, 'full_compliance').total).toBe(4);
  });

  it('excludes No from both numerator and denominator while keeping required completion', () => {
    const no = { ...base, isScored: false };
    const yes = { ...base, _id: 'other', isScored: true, required: false };
    const rows = [{ id: no._id, question: no }, { id: yes._id, question: yes }];
    expect(calculateReportScoreSummary(rows, { other: 'full_compliance' })).toEqual({ achieved: 4, total: 4, percentage: 100 });
    expect(calculateInspectionProgress({ inspectionLevel: { questions: [no, yes] }, responses: { other: 'full_compliance' } }).requiredUnansweredCount).toBe(1);
  });

  it.each(['select', 'multiple_choice', 'checkbox'])('uses configured %s scores only with explicit opt-in', type => {
    const question = { ...base, type, required: false, isScored: true, scores: { A: 5, B: 2 }, scoring: { enabled: false, max: 999 } };
    for (const response of ['B', ['B']]) {
      expect(getQuestionScore(question, response)).toEqual({ total: 5, achieved: 2 });
      expect(calculateReportScoreSummary([{ id: 'q', question }], { q: response })).toEqual({ total: 5, achieved: 2, percentage: 40 });
    }
    expect(getQuestionScore({ ...question, isScored: undefined }, 'A')).toEqual({ total: 0, achieved: 0 });
    expect(getQuestionScore({ ...question, scores: {} }, 'A')).toEqual({ total: 0, achieved: 0 });
  });

  it('keeps N/A and non-scoreable types out even with Yes', () => {
    expect(getQuestionScore({ ...base, isScored: true, required: false }, 'N/A')).toEqual({ total: 0, achieved: 0 });
    expect(getQuestionScore({ ...base, type: 'text', isScored: true }, 'note')).toEqual({ total: 0, achieved: 0 });
  });
});

it('keeps explicitly scored zero-value questions at zero in web and PDF', () => {
  for (const question of [{ ...base, isScored: true, weight: 0 }, { ...base, isScored: true, scores: { full_compliance: 0, non_compliance: 0 } }]) {
    expect(getQuestionScore(question, 'full_compliance')).toEqual({ total: 0, achieved: 0 });
    expect(calculateReportScoreSummary([{ id: 'q', question }], { q: 'full_compliance' })).toEqual({ total: 0, achieved: 0, percentage: 0 });
  }
});

it('shows legacy Select questions as unscored until explicitly enabled, preserving their previous total', () => {
  const question = { ...base, type: 'select', scores: { A: 5, B: 2 } };
  expect(isQuestionScored(question)).toBe(false);
  const enabled = updateQuestionSettings(question, { isScored: true });
  expect(getQuestionScore(enabled, 'A')).toEqual({ total: 5, achieved: 5 });
});
