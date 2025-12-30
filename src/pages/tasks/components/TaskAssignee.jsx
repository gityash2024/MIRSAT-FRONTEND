import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Tooltip Component
const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const TooltipContent = styled.div`
  visibility: hidden;
  opacity: 0;
  background-color: #1f2937;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 8px 12px;
  position: fixed;
  z-index: 10000;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: opacity 0.2s, visibility 0.2s;
  pointer-events: none;
  max-width: 250px;
  word-wrap: break-word;
  white-space: normal;
  
  &::after {
    content: "";
    position: absolute;
    ${props => props.placement === 'top' ? `
      top: 100%;
      border-color: #1f2937 transparent transparent transparent;
    ` : `
      bottom: 100%;
      border-color: transparent transparent #1f2937 transparent;
    `}
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
  }
  
  ${TooltipWrapper}:hover & {
    visibility: visible;
    opacity: 1;
  }
`;

const Tooltip = ({ children, content }) => {
  const [position, setPosition] = useState({ top: 0, left: 0, placement: 'top' });
  const wrapperRef = useRef(null);
  const tooltipRef = useRef(null);

  const handleMouseEnter = () => {
    if (!wrapperRef.current) return;
    
    const rect = wrapperRef.current.getBoundingClientRect();
    const tooltipHeight = 50; // Approximate tooltip height
    const spacing = 8;
    
    // Check if there's enough space above (accounting for table header ~50px)
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const minSpaceNeeded = tooltipHeight + spacing + 10; // Extra padding for header
    
    // Determine placement: show above if enough space, otherwise below
    let top, placement;
    if (spaceAbove >= minSpaceNeeded) {
      // Show above
      top = rect.top - tooltipHeight - spacing;
      placement = 'top';
    } else if (spaceBelow >= minSpaceNeeded) {
      // Show below
      top = rect.bottom + spacing;
      placement = 'bottom';
    } else {
      // Not enough space either way, show above anyway but adjust
      top = Math.max(10, rect.top - tooltipHeight - spacing);
      placement = 'top';
    }
    
    const left = rect.left + (rect.width / 2);
    
    setPosition({ top, left, placement });
  };

  if (!content) return children;
  
  return (
    <TooltipWrapper 
      ref={wrapperRef}
      onMouseEnter={handleMouseEnter}
    >
      {children}
      <TooltipContent 
        ref={tooltipRef}
        placement={position.placement}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: 'translateX(-50%)'
        }}
      >
        {content}
      </TooltipContent>
    </TooltipWrapper>
  );
};

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
        const tooltipText = assignee.name || assignee.email || '';
        return (
          <Tooltip key={assignee._id || index} content={tooltipText}>
            <Avatar 
              color={colors.bg}
              textColor={colors.text}
              style={{
                marginLeft: index > 0 ? '-8px' : '0',
                zIndex: displayAssignees.length - index,
                width: size === 'small' ? '24px' : '32px',
                height: size === 'small' ? '24px' : '32px',
                fontSize: size === 'small' ? '12px' : '14px',
                cursor: 'pointer'
              }}
            >
              {getInitials(assignee.name)}
            </Avatar>
          </Tooltip>
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