// src/pages/tasks/components/TaskAssignee.jsx
import React from 'react';
import styled from 'styled-components';
import { User } from 'lucide-react';

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
  color: ${props => props.textColor || '#1a237e'};
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

// Function to get consistent colors based on name
const getColorFromName = (name) => {
  const colors = [
    { bg: '#e3f2fd', text: '#1565c0' }, // Blue
    { bg: '#e8f5e9', text: '#2e7d32' }, // Green
    { bg: '#fff3e0', text: '#e65100' }, // Orange
    { bg: '#f3e5f5', text: '#7b1fa2' }, // Purple
    { bg: '#e0f2f1', text: '#00695c' }, // Teal
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

const TaskAssignee = ({ assignee, role = "Inspector", showRole = true }) => {
  const colors = getColorFromName(assignee);

  return (
    <AssigneeWrapper>
      <Avatar color={colors.bg} textColor={colors.text}>
        {getInitials(assignee)}
      </Avatar>
      <AssigneeInfo>
        <AssigneeName>{assignee}</AssigneeName>
        {showRole && <AssigneeRole>{role}</AssigneeRole>}
      </AssigneeInfo>
    </AssigneeWrapper>
  );
};

export default TaskAssignee;