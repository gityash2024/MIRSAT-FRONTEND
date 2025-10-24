import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchInspectionLevels } from '../../store/slices/inspectionLevelSlice';
import { fetchUsers } from '../../store/slices/userSlice';
import TaskList from './TaskList';

const Tasks = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isListView = location.pathname === '/tasks';
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchInspectionLevels());
    dispatch(fetchUsers());
  }, [dispatch]);

  return (
    <div>
      {isListView ? (
        <TaskList />
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default Tasks;