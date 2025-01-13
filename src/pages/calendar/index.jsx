// src/pages/calendar/index.jsx
import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import CalendarView from './CalendarView';

const Calendar = () => {
  // const { hasPermission } = usePermissions();

  return (
    <div>
      <CalendarView />
      {/* {hasPermission('view_calendar') && <CalendarView />} */}
    </div>
  );
};

export default Calendar;