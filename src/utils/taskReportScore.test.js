import { describe, expect, it } from 'vitest';
import { formatTaskReportScore, getTaskReportScoreColor } from './taskReportScore';

describe('Task Report score presentation', () => {
  it('formats integer and truncated decimal export scores as percentages', () => {
    expect(formatTaskReportScore(92)).toBe('92%');
    expect(formatTaskReportScore(83.69)).toBe('83.69%');
    expect(formatTaskReportScore(undefined)).toBe('0%');
  });

  it('uses green at 75% and red below 75%', () => {
    expect(getTaskReportScoreColor(75)).toEqual([22, 163, 74]);
    expect(getTaskReportScoreColor(74.99)).toEqual([220, 38, 38]);
  });
});
