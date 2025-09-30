import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LogsList from './LogsList';

const Logs = () => {
  return (
    <Routes>
      <Route index element={<LogsList />} />
      <Route path="/*" element={<LogsList />} />
    </Routes>
  );
};

export default Logs;
export { default as LogsList } from './LogsList';
export { default as LogDetailsModal } from './LogDetailsModal';
