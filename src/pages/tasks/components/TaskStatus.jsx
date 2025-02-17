import React from 'react';
import styled from 'styled-components';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  Pause
} from 'lucide-react';

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  ${props => {
    switch (props.status?.toLowerCase()) {
      case 'completed':
        return `
          background: #e8f5e9;
          color: #2e7d32;
        `;
      case 'in_progress':
        return `
          background: #fff3e0;
          color: #ed6c02;
        `;
      case 'pending':
        return `
          background: #e3f2fd;
          color: #1976d2;
        `;
      case 'incomplete':
        return `
          background: #ffebee;
          color: #c62828;
        `;
      case 'partially_completed':
        return `
          background: #f3e5f5;
          color: #9c27b0;
        `;
      default:
        return `
          background: #f5f5f5;
          color: #666;
        `;
    }
  }}
`;

const TaskStatus = ({ status }) => {
  const getIcon = () => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle size={12} />;
      case 'in_progress':
        return <Clock size={12} />;
      case 'pending':
        return <AlertCircle size={12} />;
      case 'incomplete':
        return <XCircle size={12} />;
      case 'partially_completed':
        return <Pause size={12} />;
      default:
        return null;
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <StatusBadge status={status}>
      {getIcon()}
      {formatStatus(status)}
    </StatusBadge>
  );
};

export default TaskStatus;