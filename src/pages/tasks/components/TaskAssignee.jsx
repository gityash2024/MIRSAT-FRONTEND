import React from 'react';
import styled from 'styled-components';
import { User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AssigneeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.color || '#e3f2fd'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.textColor || 'var(--color-navy)'};
  font-weight: 600;
  font-size: 14px;
`;

const AssigneeInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const AssigneeName = styled.span`
  font-size: 14px;
  color: #333;
  font-weight: 500;
`;

const AssigneeRole = styled.span`
  font-size: 12px;
  color: #666;
`;

const AssigneeCount = styled.div`
  padding: 2px 8px;
  background: #f1f5f9;
  border-radius: 12px;
  font-size: 12px;
  color: #64748b;
`;

const getColorFromName = (name) => {
  const colors = [
    { bg: '#e3f2fd', text: '#1565c0' },
    { bg: '#e8f5e9', text: '#2e7d32' },
    { bg: '#fff3e0', text: '#e65100' },
    { bg: '#f3e5f5', text: '#7b1fa2' },
    { bg: '#e0f2f1', text: '#00695c' },
  ];

  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

const getInitials = (name) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

const TaskAssignee = ({ 
  assignees = [], 
  showRole = true, 
  maxDisplay = 3,
  size = 'medium'
}) => {
  const { t } = useTranslation();
  const displayAssignees = assignees.slice(0, maxDisplay);
  const remainingCount = assignees.length - maxDisplay;

  return (
    <AssigneeWrapper>
      {displayAssignees.map((assignee, index) => {
        const colors = getColorFromName(assignee.name);
        return (
          <Avatar 
            key={assignee._id || index}
            color={colors.bg}
            textColor={colors.text}
            style={{
              marginLeft: index > 0 ? '-8px' : '0',
              zIndex: displayAssignees.length - index,
              width: size === 'small' ? '24px' : '32px',
              height: size === 'small' ? '24px' : '32px',
              fontSize: size === 'small' ? '12px' : '14px'
            }}
          >
            {getInitials(assignee.name)}
          </Avatar>
        );
      })}
      
      {remainingCount > 0 && (
        <AssigneeCount>+{remainingCount}</AssigneeCount>
      )}

      {assignees.length === 0 && (
        <AssigneeName style={{ color: '#64748b' }}>
          {t('common.unassigned')}
        </AssigneeName>
      )}
    </AssigneeWrapper>
  );
};

export default TaskAssignee;