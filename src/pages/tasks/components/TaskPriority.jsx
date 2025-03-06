import React from 'react';
import styled from 'styled-components';
import { AlertTriangle, Flag, MoreHorizontal } from 'lucide-react';

const PriorityBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  ${props => {
    switch (props.priority?.toLowerCase()) {
      case 'high':
        return `
          background: #fee2e2;
          color: #dc2626;
        `;
      case 'medium':
        return `
          background: #fff3e0;
          color: #ed6c02;
        `;
      case 'low':
        return `
          background: #e8f5e9;
          color: #2e7d32;
        `;
      default:
        return `
          background: #f5f5f5;
          color: #666;
        `;
    }
  }}
`;

const TaskPriority = ({ priority }) => {
  const getIcon = () => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return <AlertTriangle size={12} />;
      case 'medium':
        return <Flag size={12} />;
      case 'low':
        return <MoreHorizontal size={12} />;
      default:
        return null;
    }
  };

  return (
    <PriorityBadge priority={priority}>
      {getIcon()}
      {priority || 'None'}
    </PriorityBadge>
  );
};

export default TaskPriority;