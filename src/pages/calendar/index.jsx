// src/pages/calendar/index.jsx
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { usePermissions } from '../../hooks/usePermissions';
import CalendarView from './CalendarView';
import { PERMISSIONS } from '../../utils/permissions';
import { fetchUsers } from '../../store/slices/userSlice';
import { fetchInspectionLevels } from '../../store/slices/inspectionLevelSlice';

const Calendar = () => {
  const { hasPermission } = usePermissions();
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch the necessary data when the component mounts
    dispatch(fetchUsers());
    dispatch(fetchInspectionLevels());
  }, [dispatch]);

  return (
    <div>
      {hasPermission(PERMISSIONS.VIEW_CALENDAR) ? (
        <CalendarView />
      ) : (
        <div style={{ padding: "24px", color: "#666" }}>
          You don't have permission to view the calendar.
        </div>
      )}
    </div>
  );
};

export default Calendar;