// src/pages/calendar/index.jsx
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '../../hooks/usePermissions';
import CalendarView from './CalendarView';
import { PERMISSIONS } from '../../utils/permissions';
import { fetchUsers } from '../../store/slices/userSlice';
import { fetchInspectionLevels } from '../../store/slices/inspectionLevelSlice';

const Calendar = () => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch the necessary data when the component mounts
    dispatch(fetchUsers());
    dispatch(fetchInspectionLevels());
  }, [dispatch]);

  return (
    <div>
      {hasPermission(PERMISSIONS.CALENDAR.VIEW_CALENDAR) ? (
        <CalendarView />
      ) : (
        <div style={{ padding: "24px", color: "#666" }}>
          {t('calendar.noPermissionToView')}
        </div>
      )}
    </div>
  );
};

export default Calendar;