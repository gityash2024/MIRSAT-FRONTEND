import { describe, expect, it } from 'vitest';
import { CALENDAR_POINT_DURATION, calendarEventsForView, transformTasksToCalendarEvents } from './calendarEvents';

const eventFor = task => transformTasksToCalendarEvents([task])[0];

describe('long inspection range presentation', () => {
  it.each(['timeGridWeek', 'timeGridDay'])('uses the range area in %s without changing saved times', view => {
    const task = { startDate: new Date(2026, 8, 22, 9).toISOString(), deadline: new Date(2026, 9, 18, 23, 45).toISOString() };
    const event = eventFor(task);
    const display = calendarEventsForView([event], view)[0];
    expect(display).toMatchObject({ start: '2026-09-22', end: '2026-10-19', allDay: true });
    expect(display.taskData).toBe(task);
    expect(event.start.toISOString()).toBe(task.startDate);
    expect(event.end.toISOString()).toBe(task.deadline);
    expect(event.allDay).toBe(false);
    expect(calendarEventsForView([event], 'dayGridMonth')[0]).toBe(event);
  });

  it('keeps midnight exclusive for a long range', () => {
    const event = eventFor({ startDate: new Date(2026, 9, 1, 9), deadline: new Date(2026, 9, 19) });
    expect(calendarEventsForView([event], 'timeGridWeek')[0].end).toBe('2026-10-19');
  });

  it('keeps same-day, short overnight, and deadline-only appointments on the time grid', () => {
    const events = transformTasksToCalendarEvents([
      { startDate: new Date(2026, 9, 18, 9), deadline: new Date(2026, 9, 18, 11) },
      { startDate: new Date(2026, 9, 18, 23), deadline: new Date(2026, 9, 19, 0, 15) },
      { deadline: new Date(2026, 9, 18, 23, 59, 59, 999) }
    ]);
    const display = calendarEventsForView(events, 'timeGridDay');
    expect(display.every((event, i) => event === events[i] && !event.allDay)).toBe(true);
  });

  it('leaves true date-only ranges unchanged in every view', () => {
    const event = eventFor({ startDate: '2026-10-17', deadline: '2026-10-18' });
    expect(calendarEventsForView([event], 'timeGridWeek')[0]).toBe(event);
  });
});

describe('inspection calendar dates', () => {
  it('uses the saved start and exact late-night deadline without adding hours', () => {
    const event = eventFor({
      startDate: '2026-10-18T09:00:00+03:00',
      deadline: '2026-10-18T23:45:00+03:00'
    });
    expect(event.start.toISOString()).toBe('2026-10-18T06:00:00.000Z');
    expect(event.end.toISOString()).toBe('2026-10-18T20:45:00.000Z');
    expect(event.allDay).toBe(false);
  });

  it('preserves a genuine overnight end instead of clipping it to the start date', () => {
    const event = eventFor({
      startDate: '2026-10-18T23:00:00+03:00',
      deadline: '2026-10-19T00:15:00+03:00'
    });
    expect(event.end.getTime() - event.start.getTime()).toBe(75 * 60 * 1000);
    expect(event.end.toISOString()).toBe('2026-10-18T21:15:00.000Z');
  });

  it('keeps an exact midnight end exclusive without adding another day', () => {
    const event = eventFor({
      startDate: '2026-10-18T12:00:00+03:00',
      deadline: '2026-10-19T00:00:00+03:00'
    });
    expect(event.end.toISOString()).toBe('2026-10-18T21:00:00.000Z');
  });

  it('preserves the actual elapsed time across a daylight-saving transition', () => {
    const event = eventFor({
      startDate: '2026-11-01T00:30:00-04:00',
      deadline: '2026-11-01T02:30:00-05:00'
    });
    expect(event.end.getTime() - event.start.getTime()).toBe(3 * 60 * 60 * 1000);
  });

  it.each([undefined, 'invalid', '2026-10-19T12:00:00Z', '2026-10-18T23:59:59.999Z'])(
    'keeps a task with absent, invalid, or non-earlier start %s as a deadline marker', startDate => {
      const event = eventFor({ startDate, deadline: '2026-10-18T23:59:59.999Z' });
      expect(event.start.toISOString()).toBe('2026-10-18T23:59:59.999Z');
      expect(event.end).toBeNull();
      // Even at the last millisecond, the rendering interval ends exactly at
      // exclusive midnight, so FullCalendar cannot spill into the next day.
      expect(event.start.getTime() + CALENDAR_POINT_DURATION.milliseconds)
        .toBe(new Date('2026-10-19T00:00:00Z').getTime());
    }
  );

  it('keeps a date-only deadline on that date in every browser time zone', () => {
    const event = eventFor({ deadline: '2026-10-18' });
    expect(event).toMatchObject({ start: '2026-10-18', end: '2026-10-19', allDay: true });
  });

  it('includes the final date of a date-only range across year boundaries', () => {
    const event = eventFor({ startDate: '2026-12-30', deadline: '2026-12-31' });
    expect(event).toMatchObject({ start: '2026-12-30', end: '2027-01-01', allDay: true });
  });

  it('includes the whole date-only deadline even when the saved start has a time', () => {
    const event = eventFor({ startDate: '2026-10-17T09:00:00+03:00', deadline: '2026-10-18' });
    expect(event).toMatchObject({ start: '2026-10-17T09:00:00+03:00', end: '2026-10-19', allDay: true });
  });

  it('ignores missing or invalid deadlines rather than creating phantom events', () => {
    expect(transformTasksToCalendarEvents([{ deadline: null }, { deadline: 'invalid' }])).toEqual([]);
    expect(transformTasksToCalendarEvents(null)).toEqual([]);
  });
});

describe('inspection calendar appearance and data', () => {
  it('gives single-day and multi-day inspections of the same status the same colors', () => {
    const events = transformTasksToCalendarEvents([
      { status: 'pending', startDate: '2026-10-18T10:00:00Z', deadline: '2026-10-18T11:00:00Z' },
      { status: 'pending', startDate: '2026-10-17T10:00:00Z', deadline: '2026-10-18T11:00:00Z' },
      { status: 'completed', deadline: '2026-10-18T11:00:00Z' }
    ]);
    expect(events[0].backgroundColor).toBe('var(--color-navy)');
    expect(events[1].backgroundColor).toBe(events[0].backgroundColor);
    expect(events[2].backgroundColor).toBe('#10b981');
    expect(events.every(event => event.textColor === '#ffffff')).toBe(true);
  });

  it('preserves the task and metadata used to open and edit an inspection', () => {
    const task = Object.freeze({
      _id: 'task-1', title: 'Inspection', description: 'Existing description',
      deadline: '2026-10-18T20:45:00Z', status: 'in_progress', priority: 'high',
      inspectionLevel: { _id: 'template-1' }, assignedTo: [{ _id: 'inspector-1' }]
    });
    const event = eventFor(task);
    expect(event.taskData).toBe(task);
    expect(event).toMatchObject({
      id: 'task-1', title: 'Inspection', description: 'Existing description',
      type: 'template-1', assignee: 'inspector-1', status: 'in_progress', priority: 'high'
    });
    expect(task.deadline).toBe('2026-10-18T20:45:00Z');
  });
});
