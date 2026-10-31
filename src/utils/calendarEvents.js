export const CALENDAR_STATUSES = [
  { status: 'pending', label: 'tasks.pending', color: 'var(--color-navy)' },
  { status: 'in_progress', label: 'tasks.inProgress', color: 'var(--color-navy)' },
  { status: 'completed', label: 'tasks.completed', color: '#10b981' },
  { status: 'cancelled', label: 'tasks.cancelled', color: '#ef4444' },
  { status: 'archived', label: 'tasks.archived', color: '#6b7280' },
  { status: 'incomplete', label: 'tasks.incomplete', color: '#f59e0b' },
  { status: 'partially_completed', label: 'calendar.partiallyCompleted', color: '#8b5cf6' }
];

// A legacy task with only a deadline is a point on the calendar, not a task
// lasting another hour (FullCalendar's default) or extending into tomorrow.
export const CALENDAR_POINT_DURATION = { milliseconds: 1 };

const localDateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// Only the time-grid presentation changes. Keep taskData (and the original
// event objects) intact so opening/editing a range still uses its exact times.
export const calendarEventsForView = (events, view) => {
  if (view !== 'timeGridWeek' && view !== 'timeGridDay') return events;
  return events.map(event => {
    if (event.allDay || !event.end) return event;
    const start = new Date(event.start);
    const end = new Date(event.end);
    // Compare local calendar days too: a whole day across DST can be 23 hours.
    const midnight = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
    const spansFullDay = end - start >= 24 * 60 * 60 * 1000
      || (start.getTime() === new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
        && end >= midnight);
    if (!spansFullDay) return event;
    const exclusiveEnd = new Date(end);
    if (end.getHours() || end.getMinutes() || end.getSeconds() || end.getMilliseconds()) {
      exclusiveEnd.setDate(exclusiveEnd.getDate() + 1);
    }
    return { ...event, allDay: true, start: localDateKey(start), end: localDateKey(exclusiveEnd) };
  });
};

const isDateOnly = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
const parseDate = value => {
  if (!value) return null;
  const date = new Date(isDateOnly(value) ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const transformTasksToCalendarEvents = tasks => {
  if (!Array.isArray(tasks)) return [];

  return tasks.flatMap(task => {
    const deadline = parseDate(task.deadline);
    if (!deadline) return [];

    const startDate = parseDate(task.startDate);
    const hasStart = startDate && startDate < deadline;
    const allDay = isDateOnly(task.deadline);
    let start = hasStart ? startDate : deadline;
    let end = hasStart ? deadline : null;

    if (allDay) {
      start = hasStart ? task.startDate : task.deadline;
      // Date-only deadlines include that day; FullCalendar's all-day end is
      // exclusive. Do calendar-day arithmetic in UTC to avoid DST shifts.
      const exclusiveEnd = new Date(`${task.deadline}T00:00:00Z`);
      exclusiveEnd.setUTCDate(exclusiveEnd.getUTCDate() + 1);
      end = exclusiveEnd.toISOString().slice(0, 10);
    }

    const color = CALENDAR_STATUSES.find(({ status }) => status === task.status)?.color
      || 'var(--color-navy)';

    return [{
      id: task._id || task.id,
      title: task.title,
      start,
      end,
      allDay,
      backgroundColor: color,
      borderColor: color,
      textColor: '#ffffff',
      type: task.inspectionLevel?._id || '',
      assignee: task.assignedTo?.length > 0 ? task.assignedTo[0]._id : '',
      description: task.description,
      status: task.status,
      priority: task.priority,
      taskData: task
    }];
  });
};
