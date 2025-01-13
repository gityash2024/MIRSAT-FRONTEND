import React from 'react';
import styled from 'styled-components';

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  ${props => {
    switch (props.status.toLowerCase()) {
      case 'completed':
        return `
          background: #e8f5e9;
          color: #2e7d32;
        `;
      case 'in progress':
        return `
          background: #fff3e0;
          color: #ed6c02;
        `;
      case 'under review':
        return `
          background: #e3f2fd;
          color: #1976d2;
        `;
      default:
        return `
          background: #f5f5f5;
          color: #666;
        `;
    }
  }}
`;

const TaskStatus = ({ status }) => (
  <StatusBadge status={status}>{status}</StatusBadge>
);

export default TaskStatus;