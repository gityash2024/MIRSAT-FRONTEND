import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ArrowDown, Flag, MoreHorizontal } from 'lucide-react';

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
  const { t } = useTranslation();
  const getIcon = () => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return <AlertTriangle size={12} />;
      case 'medium':
        return <Flag size={12} />;
      case 'low':
        return <ArrowDown size={12} />;
      default:
        return null;
    }
  };

  const getPriorityText = () => {
    if (!priority) return t('common.none');
    
    switch (priority.toLowerCase()) {
      case 'high':
        return t('common.high');
      case 'medium':
        return t('common.medium');
      case 'low':
        return t('common.low');
      default:
        return priority;
    }
  };

  return (
    <PriorityBadge priority={priority}>
      {getIcon()}
      {getPriorityText()}
    </PriorityBadge>
  );
};

export default TaskPriority;