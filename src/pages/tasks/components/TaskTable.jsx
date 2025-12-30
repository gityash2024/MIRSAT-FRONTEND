import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, Edit, Trash, MoreVertical, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, List, Database, X, CheckCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import TaskStatus from './TaskStatus';
import TaskPriority from './TaskPriority';
import TaskAssignee from './TaskAssignee';
import { PERMISSIONS } from '../../../utils/permissions';
import usePermissions from '../../../hooks/usePermissions';
import { deleteTask } from '../../../store/slices/taskSlice';
import Skeleton from '../../../components/ui/Skeleton';
import { themeColors, getStatusColor } from '../../../utils/themeUtils';
import { useLanguage } from '../../../context/LanguageContext';

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
  const [position, setPosition] = React.useState({ top: 0, left: 0, placement: 'top' });
  const wrapperRef = React.useRef(null);
  const tooltipRef = React.useRef(null);

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

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    border-radius: 8px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;

  @media (max-width: 768px) {
    min-width: 700px;
  }

  @media (max-width: 480px) {
    min-width: 600px;
  }

  th, td {
    padding: 16px;
    text-align: ${props => props.$isRTL ? 'right' : 'left'};
    border-bottom: 1px solid var(--color-gray-light);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
    position: relative;
    transition: all 0.2s ease;
    vertical-align: middle;

    @media (max-width: 768px) {
      padding: 12px;
      font-size: 12px;
      max-width: 150px;
    }

    @media (max-width: 480px) {
      padding: 6px 4px;
      font-size: 11px;
      max-width: 120px;
    }

    &:last-child {
      @media (max-width: 480px) {
        padding-right: 4px;
        min-width: 120px;
        max-width: none;
      }
    }
  }

  th {
    background: var(--color-offwhite);
    font-weight: 600;
    color: var(--color-gray-dark);
    font-size: 14px;
    cursor: pointer;
    user-select: none;
    
    @media (max-width: 768px) {
      font-size: 12px;
    }

    @media (max-width: 480px) {
      font-size: 11px;
    }
    
    &:hover {
      background: var(--color-skyblue);
    }
  }

  td {
    font-size: 14px;
    color: var(--color-gray-medium);

    @media (max-width: 768px) {
      font-size: 12px;
    }

    @media (max-width: 480px) {
      font-size: 11px;
    }
  }

  tbody tr:hover {
    background: var(--color-offwhite);
  }
`;

const DialogContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
  max-height: 90vh;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 20px;
    max-width: 100%;
    border-radius: 12px 12px 0 0;
  }

  @media (max-width: 480px) {
    padding: 16px;
    max-width: 100%;
    border-radius: 12px 12px 0 0;
    max-height: 85vh;
  }
`;

const DialogTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-error);
  margin-bottom: 8px;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 17px;
    margin-bottom: 6px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 6px;
  }
`;

const DialogMessage = styled.p`
  color: var(--color-gray-medium);
  font-size: 14px;
  margin-bottom: 24px;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 13px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 16px;
  }
`;

const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 10px;
  }

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: 8px;
    width: 100%;

    button {
      width: 100%;
      justify-content: center;
    }
  }
`;

const DialogButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.variant === 'danger' ? `
    background: var(--color-error);
    color: white;
    border: none;

    &:hover {
      background: var(--color-error);
      opacity: 0.9;
    }
  ` : `
    background: white;
    color: var(--color-gray-medium);
    border: 1px solid var(--color-gray-light);

    &:hover {
      background: var(--color-offwhite);
    }
  `}
`;

const LoadingOverlay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: var(--color-gray-medium);
  font-size: 14px;
`;

const NoDataMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: var(--color-gray-medium);
  font-size: 14px;
`;

const ActionsMenu = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: nowrap;
  justify-content: flex-start;
  min-width: 0;

  @media (max-width: 480px) {
    gap: 4px;
    flex-shrink: 0;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 6px;
  border-radius: 4px;
  color: var(--color-gray-medium);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;

  @media (max-width: 480px) {
    padding: 4px;
    min-width: 24px;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 14px;
      height: 14px;
    }
  }

  &:hover {
    background: var(--color-offwhite);
    color: var(--color-navy);
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px solid var(--color-gray-light);
  background: white;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
  margin-top: 0;
  position: sticky;
  bottom: 0;
  z-index: 10;

  @media (max-width: 768px) {
    padding: 12px;
    flex-wrap: wrap;
    gap: 12px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    padding: 12px;
    gap: 10px;
  }
`;

const PaginationInfo = styled.div`
  color: var(--color-gray-medium);
  font-size: 14px;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 13px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    text-align: center;
  }
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    justify-content: center;
    gap: 6px;
  }
`;

const PaginationButton = styled.button`
  background: white;
  border: 1px solid var(--color-gray-light);
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 6px;
    min-width: 32px;
    font-size: 12px;
  }

  @media (max-width: 480px) {
    padding: 6px 8px;
    min-width: 30px;
    font-size: 11px;
  }

  &:hover:not(:disabled) {
    background: var(--color-offwhite);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    @media (max-width: 480px) {
      width: 14px;
      height: 14px;
    }
  }
`;

const DeleteConfirmDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1000;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 12px;
    align-items: flex-end;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderText = styled.span`
  flex-grow: 1;
`;

const SortIcon = styled.span`
  display: inline-flex;
  align-items: center;
`;

const RowNumber = styled.td`
  text-align: center;
  font-size: 12px;
  color: var(--color-gray-medium);
  width: 50px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: var(--color-gray-light);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: ${props => {
    if (props.value < 30) return 'var(--color-error)';
    if (props.value < 70) return 'var(--color-warning)';
    return 'var(--color-success)';
  }};
  width: ${props => `${props.value}%`};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-gray-medium);
  text-align: right;
`;

const SublevelsModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1000;
`;

const SublevelsModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const SublevelsModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SublevelsModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-gray-dark);
`;

const SublevelsModalCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-gray-medium);
  
  &:hover {
    color: var(--color-navy);
  }
`;

const TreeContainer = styled.div`
  padding-left: 0;
`;

const TreeItemContainer = styled.div`
  padding-left: ${props => props.level * 20}px;
  margin-bottom: 8px;
`;

const TreeItem = styled.div`
  padding: 8px;
  border-radius: 6px;
  background: ${props => props.level === 0 ? 'var(--color-skyblue)' : 'transparent'};
  border-left: ${props => props.level > 0 ? '2px solid var(--color-gray-light)' : 'none'};
  margin-left: ${props => props.level > 0 ? '8px' : '0'};
  font-weight: ${props => props.level === 0 ? '500' : '400'};
`;

const TreeItemName = styled.div`
  margin-bottom: 4px;
`;

const TreeItemDescription = styled.div`
  font-size: 12px;
  color: var(--color-gray-medium);
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 16px;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 12px;
    align-items: flex-end;
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 20px;
    max-width: 100%;
    border-radius: 12px 12px 0 0;
  }

  @media (max-width: 480px) {
    padding: 16px;
    max-width: 100%;
    border-radius: 12px 12px 0 0;
    max-height: 85vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 480px) {
    margin-bottom: 16px;
    padding-bottom: 12px;
  }
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
  display: flex;
  align-items: center;
  gap: 8px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 17px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    gap: 6px;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  
  &:hover {
    background: #f1f5f9;
    color: #334155;
  }
`;

const QuestionListItem = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const QuestionText = styled.div`
  font-weight: 500;
  color: #334155;
  font-size: 16px;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 15px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const QuestionType = styled.div`
  background: #e2e8f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #475569;
  font-weight: 500;
`;

const QuestionOptions = styled.div`
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const QuestionOption = styled.div`
  background: #e2e8f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  color: #475569;
`;

const ComplianceOption = styled(QuestionOption)`
  display: flex;
  align-items: center;
  gap: 4px;
  ${props => {
    if (props.variant === 'Full compliance') {
      return `background: #dcfce7; color: #166534;`;
    } else if (props.variant === 'Partial compliance') {
      return `background: #fef9c3; color: #854d0e;`;
    } else if (props.variant === 'Non-compliant') {
      return `background: #fee2e2; color: #b91c1c;`;
    } else {
      return `background: #e2e8f0; color: #475569;`;
    }
  }}
`;

const RequiredTag = styled.span`
  background: #fee2e2;
  color: #b91c1c;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 8px;
`;

const NoQuestionsMessage = styled.div`
  text-align: center;
  padding: 32px 16px;
  color: #64748b;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
`;

const TaskTableSkeleton = () => {
  return (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            <th style={{ width: '50px' }}>#</th>
            <th>{t('tasks.title')}</th>
            <th>{t('common.status')}</th>
            <th>{t('common.priority')}</th>
            <th>{t('tasks.assignees')}</th>
            <th>{t('calendar.deadline')}</th>
            <th>{t('common.progress')}</th>
            <th style={{ width: '100px' }}>{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {Array(5).fill().map((_, index) => (
            <tr key={index}>
              <td>
                <Skeleton.Base width="20px" height="16px" />
              </td>
              <td>
                <Skeleton.Base width={`${Math.floor(Math.random() * 100) + 150}px`} height="18px" />
              </td>
              <td>
                <Skeleton.Base width="80px" height="24px" radius="12px" />
              </td>
              <td>
                <Skeleton.Base width="70px" height="24px" radius="12px" />
              </td>
              <td>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {Array(Math.floor(Math.random() * 3) + 1).fill().map((_, i) => (
                    <Skeleton.Circle key={i} size="28px" />
                  ))}
                </div>
              </td>
              <td>
                <Skeleton.Base width="100px" height="16px" />
              </td>
              <td style={{ width: '120px' }}>
                <Skeleton.Base width="100%" height="8px" radius="4px" />
              </td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Skeleton.Circle size="28px" />
                  <Skeleton.Circle size="28px" />
                  <Skeleton.Circle size="28px" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <PaginationContainer>
        <Skeleton.Base width="150px" height="16px" />
        <PaginationButtons>
          <Skeleton.Button width="35px" height="35px" />
          <Skeleton.Button width="35px" height="35px" />
        </PaginationButtons>
      </PaginationContainer>
    </TableContainer>
  );
};

const PreInspectionQuestionsModal = ({ isOpen, onClose, task }) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;
  
  const hasQuestions = task.preInspectionQuestions && task.preInspectionQuestions.length > 0;
  
  const getTypeLabel = (type) => {
    switch(type) {
      case 'yesno': return t('common.yesNo');
      case 'text': return t('common.text');
      case 'number': return t('common.number');
      case 'select': return t('common.select');
      case 'multiple_choice': return t('common.multipleChoice');
      case 'compliance': return t('common.compliance');
      case 'date': return t('common.date');
      default: return type;
    }
  };
  
  return (
    <Modal>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            <Database size={18} /> 
            {t('common.preInspectionQuestionsFor')} {task.title}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>
        
        {!hasQuestions ? (
          <NoQuestionsMessage>
            <Database size={24} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>{t('tasks.noPreInspectionQuestionsAdded')}</p>
          </NoQuestionsMessage>
        ) : (
          <>
            {task.preInspectionQuestions.map((question, index) => (
              <QuestionListItem key={index}>
                <QuestionHeader>
                  <QuestionText>
                    {index + 1}. {question.text}
                    {question.required && <RequiredTag>{t('common.required')}</RequiredTag>}
                  </QuestionText>
                  <QuestionType>{getTypeLabel(question.type)}</QuestionType>
                </QuestionHeader>
                
                {question.options && question.options.length > 0 && (
                  <QuestionOptions>
                    {question.type === 'compliance' ? (
                      question.options.map((option, i) => (
                        <ComplianceOption key={i} variant={option}>
                          {option === t('tasks.fullCompliance') && <CheckCircle size={14} />}
                          {option}
                        </ComplianceOption>
                      ))
                    ) : (
                      question.options.map((option, i) => (
                        <QuestionOption key={i}>{option}</QuestionOption>
                      ))
                    )}
                  </QuestionOptions>
                )}
              </QuestionListItem>
            ))}
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

const TaskTable = ({ tasks: initialTasks, loading, pagination, onPageChange, onSort }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { hasPermission } = usePermissions();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sublevelsModal, setSublevelsModal] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });
  const [sortedTasks, setSortedTasks] = useState([...initialTasks]);
  const [preInspectionModalOpen, setPreInspectionModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Debug: Log pagination data
  useEffect(() => {
    console.log('TaskTable Pagination Debug:', {
      pagination,
      hasPagination: !!pagination,
      total: pagination?.total,
      page: pagination?.page,
      pages: pagination?.pages,
      limit: pagination?.limit,
      tasksCount: sortedTasks.length
    });
  }, [pagination, sortedTasks]);

  useEffect(() => {
    const sorted = [...initialTasks].sort((a, b) => {
      if (!a || !b) return 0;

      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'inspectionLevel') {
        aValue = a.inspectionLevel?.name || '';
        bValue = b.inspectionLevel?.name || '';
      } else if (sortConfig.key === 'assignedTo') {
        aValue = a.assignedTo?.[0]?.name || '';
        bValue = b.assignedTo?.[0]?.name || '';
      } else if (sortConfig.key === 'deadline') {
        aValue = new Date(a.deadline || 0).getTime();
        bValue = new Date(b.deadline || 0).getTime();
      } else if (sortConfig.key === 'asset') {
        aValue = a.asset?.displayName || a.asset?.name || '';
        bValue = b.asset?.displayName || b.asset?.name || '';
      } else if (sortConfig.key === 'createdAt') {
        aValue = new Date(a.createdAt || 0).getTime();
        bValue = new Date(b.createdAt || 0).getTime();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setSortedTasks(sorted);
  }, [initialTasks, sortConfig.key, sortConfig.direction]);

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    
    if (onSort) {
      onSort({ key, direction });
    }
  };

  const handleViewTask = (taskId) => {
    navigate(`/tasks/${taskId}`);
    setActiveDropdown(null);
  };

  const handleEditTask = (taskId) => {
    navigate(`/tasks/${taskId}/edit`);
    setActiveDropdown(null);
  };

  const handleDeleteClick = (task) => {
    setDeleteConfirm(task);
    setActiveDropdown(null);
  };

  const handleConfirmDelete = async () => {
    try {
      const taskId = deleteConfirm._id || deleteConfirm.id;
      await dispatch(deleteTask(taskId)).unwrap();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      if (!error.message) {
        toast.error(t('tasks.failedToDeleteTask'));
      }
    }
  };

  const handleViewSublevels = (task) => {
    setSublevelsModal(task);
  };

  const hasPreInspectionQuestions = (task) => {
    return task.preInspectionQuestions && task.preInspectionQuestions.length > 0;
  };
  
  const handleShowPreInspectionQuestions = (task) => {
    setSelectedTask(task);
    setPreInspectionModalOpen(true);
  };

  const renderTreeItems = (subLevels, level = 0) => {
    if (!subLevels || subLevels.length === 0) return null;
    
    return (
      <>
        {subLevels.map((item) => (
          <React.Fragment key={item._id}>
            <TreeItemContainer level={level}>
              <TreeItem level={level}>
                <TreeItemName>{item.name}</TreeItemName>
                {item.description && (
                  <TreeItemDescription>{item.description}</TreeItemDescription>
                )}
              </TreeItem>
            </TreeItemContainer>
            {item.subLevels && renderTreeItems(item.subLevels, level + 1)}
          </React.Fragment>
        ))}
      </>
    );
  };

  if (loading) {
    return <TaskTableSkeleton />;
  }

  return (
    <>
      <TableContainer>
        {!sortedTasks.length ? (
          <NoDataMessage>{t('tasks.noTasksFoundMatchingCriteria')}</NoDataMessage>
        ) : (
          <Table $isRTL={isRTL}>
          <thead>
            <tr>
              <th style={{ width: '50px', textAlign: 'center' }}>#</th>
              <th onClick={() => handleSort('title')}>
                <HeaderContent>
                  <HeaderText>{t('common.taskName')}</HeaderText>
                  {sortConfig.key === 'title' && (
                    <SortIcon>
                      {sortConfig.direction === 'asc' ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </SortIcon>
                  )}
                </HeaderContent>
              </th>
              <th onClick={() => handleSort('inspectionLevel')}>
                <HeaderContent>
                  <HeaderText>{t('common.template')}</HeaderText>
                  {sortConfig.key === 'inspectionLevel' && (
                    <SortIcon>
                      {sortConfig.direction === 'asc' ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </SortIcon>
                  )}
                </HeaderContent>
              </th>
              <th onClick={() => handleSort('asset')}>
                <HeaderContent>
                  <HeaderText>{t('common.asset')}</HeaderText>
                  {sortConfig.key === 'asset' && (
                    <SortIcon>
                      {sortConfig.direction === 'asc' ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </SortIcon>
                  )}
                </HeaderContent>
              </th>
              <th>{t('common.sublevels')}</th>
              <th onClick={() => handleSort('assignedTo')}>
                <HeaderContent>
                  <HeaderText>{t('common.assignee')}</HeaderText>
                  {sortConfig.key === 'assignedTo' && (
                    <SortIcon>
                      {sortConfig.direction === 'asc' ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </SortIcon>
                  )}
                </HeaderContent>
              </th>
              <th onClick={() => handleSort('priority')}>
                <HeaderContent>
                  <HeaderText>{t('common.priority')}</HeaderText>
                  {sortConfig.key === 'priority' && (
                    <SortIcon>
                      {sortConfig.direction === 'asc' ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </SortIcon>
                  )}
                </HeaderContent>
              </th>
              <th onClick={() => handleSort('status')}>
                <HeaderContent>
                  <HeaderText>{t('common.status')}</HeaderText>
                  {sortConfig.key === 'status' && (
                    <SortIcon>
                      {sortConfig.direction === 'asc' ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </SortIcon>
                  )}
                </HeaderContent>
              </th>
              <th onClick={() => handleSort('deadline')}>
                <HeaderContent>
                  <HeaderText>{t('tasks.dueDate')}</HeaderText>
                  {sortConfig.key === 'deadline' && (
                    <SortIcon>
                      {sortConfig.direction === 'asc' ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </SortIcon>
                  )}
                </HeaderContent>
              </th>
              {/* <th onClick={() => handleSort('overallProgress')}>
                <HeaderContent>
                  <HeaderText>{t('common.progress')}</HeaderText>
                  {sortConfig.key === 'overallProgress' && (
                    <SortIcon>
                      {sortConfig.direction === 'asc' ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </SortIcon>
                  )}
                </HeaderContent>
              </th> */}
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.map((task, index) => (
              <tr key={task._id}>
                <RowNumber>
                  {pagination && pagination.page && pagination.limit
                    ? ((pagination.page - 1) * pagination.limit + index + 1)
                    : (index + 1)}
                </RowNumber>
                <td>{task.title}</td>
                <td>{task.inspectionLevel?.name || '--'}</td>
                <td>
                  {task.asset ? (
                    <Tooltip content={`${task.asset.displayName || task.asset.name} - ${task.asset.type || ''}`}>
                      <span>
                        {task.asset.displayName || task.asset.name || t('logs.unknown')} 
                        {task.asset.uniqueId && <small style={{ color: '#666', display: 'block' }}>{task.asset.uniqueId}</small>}
                      </span>
                    </Tooltip>
                  ) : '--'}
                </td>
                <td>
                  {task.inspectionLevel?.subLevels?.length > 0 ? (
                    <Tooltip content={`${t('common.view')} ${t('common.sublevels')}`}>
                      <ActionButton onClick={() => handleViewSublevels(task)}>
                        <List size={16} />
                      </ActionButton>
                    </Tooltip>
                  ) : (
                    '--'
                  )}
                </td>
                <td>
                  <TaskAssignee 
                    assignees={task.assignedTo} 
                    maxDisplay={2}
                  />
                </td>
                <td><TaskPriority priority={task.priority} /></td>
                <td><TaskStatus status={task.status} /></td>
                <td>{new Date(task.deadline).toLocaleDateString()}</td>
                {/* <td>
            <ProgressBar>
              <ProgressFill value={task.overallProgress || 0} />
            </ProgressBar>
            <ProgressText>{task.overallProgress || 0}%</ProgressText>
                </td> */}
                <td>
                  <ActionsMenu>
                    {hasPermission(PERMISSIONS.TASKS.VIEW_TASKS) && (
                      <Tooltip content={t('common.view')}>
                        <ActionButton onClick={() => handleViewTask(task.id)}>
                          <Eye size={16} />
                        </ActionButton>
                      </Tooltip>
                    )}
                    
                    {hasPermission(PERMISSIONS.TASKS.EDIT_TASKS) && (
                      <Tooltip content={t('common.edit')}>
                        <ActionButton onClick={() => handleEditTask(task.id)}>
                          <Edit size={16} />
                        </ActionButton>
                      </Tooltip>
                    )}
                    
                    {hasPermission(PERMISSIONS.TASKS.DELETE_TASKS) && (
                      <Tooltip content={t('common.delete')}>
                        <ActionButton onClick={() => handleDeleteClick(task)}>
                          <Trash size={16} />
                        </ActionButton>
                      </Tooltip>
                    )}
                    
                   
                    {hasPreInspectionQuestions(task) && (
                      <Tooltip content={t('tasks.viewPreTemplateQuestions')}>
                        <ActionButton 
                          onClick={() => handleShowPreInspectionQuestions(task)}
                          style={{
                            background: '#e0f2fe',
                            color: '#0284c7'
                          }}
                        >
                          <Database size={16} />
                        </ActionButton>
                      </Tooltip>
                    )}
                  </ActionsMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        )}
      </TableContainer>

        <PaginationContainer>
          <PaginationInfo>
            {pagination && pagination.total !== undefined && pagination.total > 0 ? (
              <>
                {t('common.showing')} {((pagination.page - 1) * pagination.limit) + 1} {t('common.to')}{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} {t('common.of')}{' '}
                {pagination.total} {pagination.total === 1 ? t('common.task') : t('common.tasks')}
              </>
            ) : pagination && pagination.total === 0 ? (
              <>{t('common.showing')} 0 {t('common.tasks')}</>
            ) : (
              <>{t('common.showing')} {sortedTasks.length} {sortedTasks.length === 1 ? t('common.task') : t('common.tasks')}</>
            )}
          </PaginationInfo>
          
          <PaginationButtons>
            <PaginationButton 
              onClick={() => onPageChange((pagination?.page || 1) - 1)}
              disabled={(pagination?.page || 1) <= 1}
            >
              <ChevronLeft size={16} />
            </PaginationButton>
            
            {/* Page Numbers */}
            {pagination && pagination.pages && pagination.pages > 1 && (
              <>
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const pageNum = i + 1;
                  const isCurrentPage = pageNum === pagination.page;
                  
                  return (
                    <PaginationButton
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      style={{
                        background: isCurrentPage ? 'var(--color-navy)' : 'white',
                        color: isCurrentPage ? 'white' : 'var(--color-gray-dark)',
                        fontWeight: isCurrentPage ? '600' : '400'
                      }}
                    >
                      {pageNum}
                    </PaginationButton>
                  );
                })}
                {pagination.pages > 5 && (
                  <>
                    <span style={{ padding: '0 8px', color: 'var(--color-gray-medium)' }}>...</span>
                    <PaginationButton
                      onClick={() => onPageChange(pagination.pages)}
                      style={{
                        background: pagination.page === pagination.pages ? 'var(--color-navy)' : 'white',
                        color: pagination.page === pagination.pages ? 'white' : 'var(--color-gray-dark)',
                        fontWeight: pagination.page === pagination.pages ? '600' : '400'
                      }}
                    >
                      {pagination.pages}
                    </PaginationButton>
                  </>
                )}
              </>
            )}
            
            <PaginationButton
              onClick={() => onPageChange((pagination?.page || 1) + 1)}
              disabled={(pagination?.page || 1) >= (pagination?.pages || 1)}
            >
              <ChevronRight size={16} />
            </PaginationButton>
          </PaginationButtons>
        </PaginationContainer>

      {deleteConfirm && (
        <DeleteConfirmDialog>
          <DialogContent>
            <DialogTitle>{t('common.deleteTask')}</DialogTitle>
            <DialogMessage>
              {t('common.deleteTaskConfirm')} "{deleteConfirm.title}"? {t('common.thisActionCannotBeUndone')}.
            </DialogMessage>
            <DialogActions>
              <DialogButton onClick={() => setDeleteConfirm(null)}>
                {t('common.cancel')}
              </DialogButton>
              <DialogButton variant="danger" onClick={handleConfirmDelete}>
                {t('common.delete')}
              </DialogButton>
            </DialogActions>
          </DialogContent>
        </DeleteConfirmDialog>
      )}

      {sublevelsModal && (
        <SublevelsModalOverlay>
          <SublevelsModalContent>
            <SublevelsModalHeader>
              <SublevelsModalTitle>
                {sublevelsModal.inspectionLevel?.name || t('tasks.inspectionSublevels')}
              </SublevelsModalTitle>
              <SublevelsModalCloseButton onClick={() => setSublevelsModal(null)}>
                &times;
              </SublevelsModalCloseButton>
            </SublevelsModalHeader>
            <TreeContainer>
              {renderTreeItems(sublevelsModal.inspectionLevel?.subLevels || [])}
            </TreeContainer>
          </SublevelsModalContent>
        </SublevelsModalOverlay>
      )}

      {selectedTask && (
        <PreInspectionQuestionsModal 
          isOpen={preInspectionModalOpen}
          onClose={() => setPreInspectionModalOpen(false)}
          task={selectedTask}
        />
      )}
    </>
  );
};

export default TaskTable;