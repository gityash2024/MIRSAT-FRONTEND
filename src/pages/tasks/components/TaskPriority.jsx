import React from 'react';
import styled from 'styled-components';
import { AlertTriangle } from 'lucide-react';

const PriorityBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  ${props => {
    switch (props.priority.toLowerCase()) {
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

const TaskPriority = ({ priority }) => (
  <PriorityBadge priority={priority}>
    {priority === 'high' && <AlertTriangle size={12} />}
    {priority}
  </PriorityBadge>
);

export default TaskPriority;