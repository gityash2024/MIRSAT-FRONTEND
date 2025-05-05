import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { 
  ChevronDown, ChevronUp, ChevronRight, CheckCircle, XCircle, 
  AlertTriangle, Clock, Loader, FileText,
  PaperclipIcon, MessageSquare, Timer, Image,
  Trash2, Award, BarChart2, HelpCircle, Activity,
  Clipboard, AlertCircle, Info, Search,
  PauseCircle, PlayCircle, Download, Edit, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { updateUserTaskProgress, uploadTaskAttachment } from '../../../store/slices/userTasksSlice';
import { CustomTimeInput } from './TimeInput';

const Container = styled.div`
  padding: 16px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const NoSubLevelsMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-navy);
    margin-bottom: 8px;
  }
  
  p {
    font-size: 14px;
    color: #64748b;
  }
  
  svg {
    margin-bottom: 16px;
    color: #3f51b5;
  }
`;

const InspectionLayout = styled.div`
  display: flex;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  min-height: 600px;
  margin-bottom: 24px;
`;

const Sidebar = styled.div`
  width: 300px;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  overflow-y: auto;
  max-height: 80vh;
`;

const SidebarHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  background: #f8fafc;
  z-index: 10;
`;

const SearchBox = styled.div`
  position: relative;
  margin-top: 10px;
  
  input {
    width: 100%;
    padding: 8px 12px 8px 34px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: #3f51b5;
      box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.1);
    }
  }
  
  svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
  }
`;

const SidebarContent = styled.div`
  padding: 8px;
`;

const TreeNode = styled.div`
  margin-bottom: 2px;
`;

const NodeHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${props => props.isSelected ? 'rgba(26, 35, 126, 0.08)' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.isSelected ? 'rgba(26, 35, 126, 0.12)' : 'rgba(226, 232, 240, 0.5)'};
  }
`;

const NodeIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  margin-right: 8px;
  color: ${props => props.isSelected ? 'var(--color-navy)' : '#64748b'};
`;

const StatusIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-right: 8px;
  
  svg {
    color: ${props => {
      switch(props.status) {
        case 'completed':
        case 'full_compliance':
          return '#388e3c';
        case 'failed':
        case 'incomplete':
        case 'non_compliance':
          return '#d32f2f';
        case 'in_progress':
        case 'partial_compliance':
          return '#f57c00';
        case 'not_applicable':
          return '#9e9e9e';
        default:
          return '#64748b';
      }
    }};
  }
`;

const NodeLabel = styled.div`
  font-size: 14px;
  color: ${props => props.isSelected ? 'var(--color-navy)' : '#334155'};
  font-weight: ${props => props.isSelected ? '600' : '400'};
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChildNodes = styled.div`
  padding-left: ${props => props.level * 16}px;
`;

const ContentPane = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  max-height: 80vh;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  margin-left: 8px;
  
  ${props => {
    switch(props.status) {
      case 'pending':
        return 'background-color: rgba(255, 248, 225, 0.8); color: #f57c00; border: 1px solid rgba(245, 124, 0, 0.2);';
      case 'completed':
      case 'full_compliance':
        return 'background-color: rgba(232, 245, 233, 0.8); color: #2e7d32; border: 1px solid rgba(46, 125, 50, 0.2);';
      case 'failed':
      case 'incomplete':
      case 'non_compliance':
        return 'background-color: rgba(255, 235, 238, 0.8); color: #d32f2f; border: 1px solid rgba(211, 47, 47, 0.2);';
      case 'in_progress':
      case 'partial_compliance':
        return 'background-color: rgba(227, 242, 253, 0.8); color: #0277bd; border: 1px solid rgba(2, 119, 189, 0.2);';
      case 'not_applicable':
        return 'background-color: rgba(245, 245, 245, 0.8); color: #616161; border: 1px solid rgba(97, 97, 97, 0.2);';
      default:
        return 'background-color: rgba(245, 245, 245, 0.8); color: #616161; border: 1px solid rgba(97, 97, 97, 0.2);';
    }
  }}
`;

const MandatoryBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => props.mandatory ? 'rgba(227, 242, 253, 0.8)' : 'rgba(245, 245, 245, 0.8)'};
  color: ${props => props.mandatory ? '#0277bd' : '#616161'};
  border: 1px solid ${props => props.mandatory ? 'rgba(2, 119, 189, 0.2)' : 'rgba(97, 97, 97, 0.2)'};
  margin-left: 8px;
`;

const ContentHeader = styled.div`
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
`;

const ContentTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`;

const ContentDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
  margin: 12px 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const CompleteButton = styled(ActionButton)`
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #2e7d32;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.15);
`;

const PartialButton = styled(ActionButton)`
  background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
  color: #f57c00;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.15);
`;

const FailButton = styled(ActionButton)`
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  color: #c62828;
  box-shadow: 0 2px 8px rgba(229, 57, 53, 0.15);
`;

const NAButton = styled(ActionButton)`
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  color: #616161;
  box-shadow: 0 2px 8px rgba(97, 97, 97, 0.15);
`;

const ScoringSummary = styled.div`
  background: rgba(237, 246, 255, 0.8);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  border: 1px solid rgba(191, 220, 255, 0.5);
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ScoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 12px;
`;

const ScoreItem = styled.div`
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  
  .score-label {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 6px;
  }
  
  .score-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-navy);
  }
  
  .score-percent {
    font-size: 13px;
    color: ${props => props.percent >= 80 ? '#4caf50' : props.percent >= 50 ? '#ff9800' : '#f44336'};
    margin-left: 4px;
  }
`;

const ScoringCriteria = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
  
  .criteria-item {
    background: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 6px;
    
    &.full {
      color: #2e7d32;
      border: 1px solid rgba(76, 175, 80, 0.2);
    }
    
    &.partial {
      color: #e65100;
      border: 1px solid rgba(255, 152, 0, 0.2);
    }
    
    &.non {
      color: #c62828;
      border: 1px solid rgba(244, 67, 54, 0.2);
    }
    
    &.na {
      color: #616161;
      border: 1px solid rgba(97, 97, 97, 0.2);
    }
  }
`;

const ActionInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
`;

const CommentInput = styled.textarea`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(248, 250, 252, 0.7);
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: #3f51b5;
    box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.1);
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: fit-content;
  
  &:hover {
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  }
`;


// Add styled components for the new design
const InspectionContainer = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
`;

const SearchContainer = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 16px 10px 40px;
  font-size: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  
  &:focus {
    outline: none;
    border-color: var(--color-navy);
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const SearchButton = styled.button`
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
`;

const ResultsTitle = styled.h3`
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const InspectionBodyContainer = styled.div`
  display: flex;
  min-height: 500px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const TreeView = styled.div`
  width: 300px;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  overflow-y: auto;
  max-height: 80vh;
  
  @media (max-width: 768px) {
    width: 100%;
    max-height: 400px;
  }
`;

const TreeHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-navy);
    margin: 0;
  }
`;

const ProgressIndicator = styled.div`
  background: #e3f2fd;
  color: #0d47a1;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const ExportButtonContainer = styled.div`
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  margin-top: 16px;
`;

const SectionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 24px;
`;

// Add status icon component
const StatusIcon2 = ({ status, size = 18 }) => {
  switch(status) {
    case 'completed':
    case 'full_compliance':
      return <CheckCircle size={size} color="#388e3c" />;
    case 'failed':
    case 'incomplete':
    case 'non_compliance':
      return <XCircle size={size} color="#d32f2f" />;
    case 'in_progress':
    case 'partial_compliance':
      return <AlertTriangle size={size} color="#f57c00" />;
    case 'not_applicable':
      return <Clock size={size} color="#9e9e9e" />;
    default:
      return <Clock size={size} color="#64748b" />;
  }
};

// Add this styled component for level numbers
const LevelNumber = styled.span`
  font-weight: 600;
  color: var(--color-navy);
  margin-right: 4px;
`;

// Add these photo-related components
const PhotoPreviewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;

const PhotoPreview = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .remove-button {
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  &:hover .remove-button {
    opacity: 1;
  }
`;

const PhotoLightbox = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
  }
  
  .close-button {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 20px;
    cursor: pointer;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

const ImageUploadWrapper = styled.div`
  margin-top: 10px;
`;

// Add these question-related components
const QuestionMandatory = styled.span`
  font-size: 12px;
  color: #f44336;
  margin-left: 8px;
`;

// Add compliance buttons component
const ComplianceButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
  justify-content: center;
`;

// Add progress bar components
const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 24px;
  
  .fill {
    height: 100%;
    width: ${props => `${props.progress}%`};
    background: linear-gradient(90deg, #3f51b5 0%, #1976d2 100%);
    border-radius: 4px;
    transition: width 0.5s ease;
  }
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 14px;
  
  .label {
    color: #64748b;
  }
  
  .percentage {
    font-weight: 600;
    color: var(--color-navy);
  }
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #3f51b5 0%, #1976d2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(25, 118, 210, 0.3);
  }
`;

const NoSelectionMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  color: #64748b;
  
  svg {
    color: #e2e8f0;
    margin-bottom: 16px;
  }
  
  h3 {
    color: var(--color-navy);
    margin-bottom: 8px;
  }
  
  p {
    max-width: 300px;
    margin: 0 auto;
  }
`;

// Add other required styled components
const TimeInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TimeLabel = styled.span`
  font-size: 14px;
  color: #64748b;
`;

const StartTimerButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid rgba(46, 125, 50, 0.2);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  
  &:hover {
    background: #c8e6c9;
  }
`;

const StopTimerButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ffebee;
  color: #c62828;
  border: 1px solid rgba(198, 40, 40, 0.2);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  
  &:hover {
    background: #ffcdd2;
  }
`;

// Add these accordion styled components
const AccordionSection = styled.div`
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const AccordionHeader = styled.div`
  padding: 16px;
  background: ${props => props.isOpen ? '#f8fafc' : 'white'};
  border-bottom: ${props => props.isOpen ? '1px solid #e2e8f0' : 'none'};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
  
  &:hover {
    background: #f8fafc;
  }
`;

const AccordionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  
  svg {
    transition: transform 0.2s;
    transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  }
`;

const AccordionBody = styled.div`
  padding: ${props => props.isOpen ? '16px' : '0'};
  max-height: ${props => props.isOpen ? '9999px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
`;

const ScoreBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${props => props.score === 0 ? '#f1f5f9' : 
    props.percentage >= 80 ? '#e8f5e9' : 
    props.percentage >= 50 ? '#fff8e1' : 
    '#ffebee'};
  color: ${props => props.score === 0 ? '#64748b' : 
    props.percentage >= 80 ? '#2e7d32' : 
    props.percentage >= 50 ? '#f57c00' : 
    '#c62828'};
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid ${props => props.score === 0 ? '#e2e8f0' : 
    props.percentage >= 80 ? '#c8e6c9' : 
    props.percentage >= 50 ? '#ffe0b2' : 
    '#ffcdd2'};
`;

const QuestionAccordion = styled.div`
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  background: white;
`;

const QuestionAccordionHeader = styled.div`
  padding: 12px 16px;
  background: ${props => props.isOpen ? '#f8fafc' : 'white'};
  border-bottom: ${props => props.isOpen ? '1px solid #e2e8f0' : 'none'};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
  
  &:hover {
    background: #f8fafc;
  }
`;

const QuestionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: ${props => props.isOpen ? '600' : '500'};
  color: ${props => props.isOpen ? 'var(--color-navy)' : '#334155'};
  
  svg {
    transition: transform 0.2s;
    transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  }
`;

const QuestionBody = styled.div`
  padding: ${props => props.isOpen ? '16px' : '0'};
  max-height: ${props => props.isOpen ? '9999px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
`;

const QuestionScoreBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${props => props.score === 0 ? '#f1f5f9' : 
    props.percentage >= 80 ? '#e8f5e9' : 
    props.percentage >= 50 ? '#fff8e1' : 
    '#ffebee'};
  color: ${props => props.score === 0 ? '#64748b' : 
    props.percentage >= 80 ? '#2e7d32' : 
    props.percentage >= 50 ? '#f57c00' : 
    '#c62828'};
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid ${props => props.score === 0 ? '#e2e8f0' : 
    props.percentage >= 80 ? '#c8e6c9' : 
    props.percentage >= 50 ? '#ffe0b2' : 
    '#ffcdd2'};
`;

const InspectionStepForm = ({ 
  task, 
  onUpdateProgress, 
  onExportReport,
  activePage,
  pageData
}) => {
  const dispatch = useDispatch();
  const [selectedSubLevel, setSelectedSubLevel] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [loading, setLoading] = useState({});
  const [notes, setNotes] = useState({});
  const [timeSpent, setTimeSpent] = useState({});
  const [photos, setPhotos] = useState({});
  const [activeTimers, setActiveTimers] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [complianceStatus, setComplianceStatus] = useState({});
  const [uploadingPhotos, setUploadingPhotos] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [scores, setScores] = useState({
    total: 0,
    achieved: 0,
    percentage: 0,
    areas: []
  });
  // Add state for question responses
  const [questionResponses, setQuestionResponses] = useState({});
  
  const fileInputRefs = useRef({});
  const timerRefs = useRef({});
  
  // Move getSections function inside the component
  const getSections = () => {
    // This would normally extract sections from the task data
    // For now, return subLevels from the inspection data
    const { subLevels } = getInspectionData();
    return subLevels || [];
  };
  
  // Initialize from existing task data - Add loading of responses from progress
  useEffect(() => {
    if (task && task.progress && task.progress.length > 0) {
      const notesObj = {};
      const timeObj = {};
      const photosObj = {};
      const complianceObj = {};
      const responsesObj = {}; // Add initialization for responses
      
      task.progress.forEach(p => {
        if (p && p.subLevelId) {
          const id = typeof p.subLevelId === 'string' 
            ? p.subLevelId 
            : (p.subLevelId._id || p.subLevelId.id || p.subLevelId);
          
          notesObj[id] = p.notes || '';
          timeObj[id] = p.timeSpent || 0;
          photosObj[id] = p.photos || [];
          complianceObj[id] = p.status || 'pending';
          
          // If this progress item has question responses, add them
          if (p.responses) {
            Object.entries(p.responses).forEach(([questionId, response]) => {
              responsesObj[`${id}_${questionId}`] = response;
            });
          }
        }
      });
      
      setNotes(notesObj);
      setTimeSpent(timeObj);
      setPhotos(photosObj);
      setComplianceStatus(complianceObj);
      setQuestionResponses(responsesObj); // Set the initialized responses
      
      // Calculate scores
      calculateScores();
    }
  }, [task, pageData, activePage]);
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timerRefs.current).forEach(timer => {
        if (timer) clearInterval(timer);
      });
    };
  }, []);
  
  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    const { subLevels } = getInspectionData();
    const results = searchSubLevels(subLevels, searchTerm.toLowerCase());
    setSearchResults(results);
  }, [searchTerm, task]);
  
  const searchSubLevels = (subLevels, term, path = '') => {
    if (!subLevels || !Array.isArray(subLevels)) return [];
    
    let results = [];
    
    for (const subLevel of subLevels) {
      if (!subLevel) continue;
      
      const currentPath = path ? `${path} > ${subLevel.name}` : subLevel.name;
      
      if (subLevel.name?.toLowerCase().includes(term) || 
          subLevel.description?.toLowerCase().includes(term)) {
        results.push({
          ...subLevel,
          path: currentPath
        });
      }
      
      if (subLevel.subLevels && subLevel.subLevels.length > 0) {
        const childResults = searchSubLevels(subLevel.subLevels, term, currentPath);
        results = [...results, ...childResults];
      }
    }
    
    return results;
  };
  
  // Fix calculateSectionScore to properly identify questions and their scores
  const calculateSectionScore = (sectionId) => {
    if (!task || !sectionId) {
      return { achieved: 0, total: 0, percentage: 0 };
    }
    
    // Find the section in the data
    let section = null;
    let questions = [];
    
    // First try to find it in subLevels
    if (task.inspectionLevel?.subLevels) {
      const findSection = (subLevels) => {
        for (const sl of subLevels) {
          if (sl._id === sectionId) {
            section = sl;
            questions = sl.questions || [];
            return true;
          }
          if (sl.subLevels && sl.subLevels.length > 0) {
            for (const ssl of sl.subLevels) {
              if (ssl._id === sectionId) {
                section = ssl;
                questions = ssl.questions || [];
                return true;
              }
            }
          }
        }
        return false;
      };
      
      findSection(task.inspectionLevel.subLevels);
    }
    
    // If not found, search in pages/sections
    if (!section && task.inspectionLevel?.pages) {
      for (const page of task.inspectionLevel.pages) {
        if (page.sections) {
          for (const sec of page.sections) {
            if (sec._id === sectionId) {
              section = sec;
              questions = sec.questions || [];
              break;
            }
          }
        }
      }
    }
    
    // If no section found or no questions, return zero score
    if (!section || !questions || questions.length === 0) {
      return { achieved: 0, total: 0, percentage: 0 };
    }
    
    // Calculate total possible score from all questions
    let totalPossible = 0;
    let totalAchieved = 0;
    
    questions.forEach(question => {
      if (!question) return;
      
      // Get max score from question data
      const maxScore = question.scoring?.max || 
        (question.scores ? Math.max(...Object.values(question.scores).filter(v => !isNaN(v))) : 0) || 2;
      
      if (maxScore > 0) {
        totalPossible += maxScore;
        
        // Get achieved score from responses
        const response = getQuestionResponse(question._id, sectionId);
        if (response && question.scores && question.scores[response] !== undefined) {
          totalAchieved += question.scores[response];
        }
      }
    });
    
    const percentage = totalPossible > 0 ? Math.round((totalAchieved / totalPossible) * 100) : 0;
    
    return { achieved: totalAchieved, total: totalPossible, percentage };
  };
  
  // Fix calculateScores to avoid double-counting
  const calculateScores = () => {
    if (!task || !task.inspectionLevel) return;
    
    let totalPoints = 0;
    let achievedPoints = 0;
    const assessmentAreas = {};
    const processedSections = new Set(); // Track processed sections to avoid double counting
    
    // First, organize into assessment areas
    if (task.inspectionLevel) {
      const processSubLevels = (subLevels, areaName = 'General') => {
        if (!subLevels || !Array.isArray(subLevels)) return;
        
        subLevels.forEach(subLevel => {
          if (!subLevel || !subLevel._id || processedSections.has(subLevel._id)) return;
          
          // Mark this section as processed
          processedSections.add(subLevel._id);
          
          // Use category/area name if available
          const currentArea = subLevel.category || areaName;
          
          if (!assessmentAreas[currentArea]) {
            assessmentAreas[currentArea] = {
              name: currentArea,
              totalPoints: 0,
              achievedPoints: 0,
              items: []
            };
          }
          
          // Process this sublevel
          if (subLevel.questions && subLevel.questions.length > 0) {
            let sectionTotalPossible = 0;
            let sectionAchieved = 0;
            
            // Calculate score for each question
            subLevel.questions.forEach(question => {
              if (!question || !question._id) return;
              
              // Get max score from question data
              const maxScore = question.scoring?.max || 
                (question.scores ? Math.max(...Object.values(question.scores).filter(v => !isNaN(v))) : 0) || 2;
              
              if (maxScore > 0) {
                sectionTotalPossible += maxScore;
                
                // Get response for this question
                const response = getQuestionResponse(question._id, subLevel._id);
                if (response && question.scores && question.scores[response] !== undefined) {
                  sectionAchieved += question.scores[response];
                }
              }
            });
            
            // Only add section if it has a score
            if (sectionTotalPossible > 0) {
              // Add to area totals
              assessmentAreas[currentArea].totalPoints += sectionTotalPossible;
              assessmentAreas[currentArea].achievedPoints += sectionAchieved;
              
              // Add to total score
              totalPoints += sectionTotalPossible;
              achievedPoints += sectionAchieved;
              
              // Add to items list
              assessmentAreas[currentArea].items.push({
                id: subLevel._id,
                name: subLevel.name,
                score: sectionAchieved,
                maxScore: sectionTotalPossible,
                percentage: sectionTotalPossible > 0 ? Math.round((sectionAchieved / sectionTotalPossible) * 100) : 0
              });
            }
          }
          
          // Process nested sub-levels
          if (subLevel.subLevels && subLevel.subLevels.length > 0) {
            processSubLevels(subLevel.subLevels, currentArea);
          }
        });
      };
      
      // Process both subLevels and pages/sections to make sure we catch everything
      if (task.inspectionLevel.subLevels) {
        processSubLevels(task.inspectionLevel.subLevels);
      }
      
      // Also process pages if they exist (but avoid double counting)
      if (task.inspectionLevel.pages) {
        task.inspectionLevel.pages.forEach(page => {
          if (page.sections) {
            processSubLevels(page.sections, page.name || 'General');
          }
        });
      }
    }
    
    // Convert assessment areas to array format
    const areasList = Object.values(assessmentAreas).map(area => ({
      name: area.name,
      score: area.achievedPoints,
      maxScore: area.totalPoints,
      percentage: area.totalPoints > 0 ? Math.round((area.achievedPoints / area.totalPoints) * 100) : 0,
      items: area.items
    }));
    
    const percentage = totalPoints > 0 ? Math.round((achievedPoints / totalPoints) * 100) : 0;
    
    setScores({
      total: totalPoints,
      achieved: achievedPoints,
      percentage,
      areas: areasList
    });
  };
  
  const startTimer = (subLevelId) => {
    // Clear any existing timer for this sublevel
    if (timerRefs.current[subLevelId]) {
      clearInterval(timerRefs.current[subLevelId]);
    }
    
    // Start new timer
    setActiveTimers(prev => ({ ...prev, [subLevelId]: true }));
    
    // Get starting value
    const startingValue = timeSpent[subLevelId] || 0;
    const startTime = Date.now();
    
    // Update time every second
    timerRefs.current[subLevelId] = setInterval(() => {
      const elapsedHours = (Date.now() - startTime) / (1000 * 60 * 60);
      const newValue = startingValue + elapsedHours;
      
      setTimeSpent(prev => ({
        ...prev,
        [subLevelId]: newValue
      }));
    }, 1000);
    
    toast.success('Timer started');
  };
  
  const stopTimer = (subLevelId) => {
    if (timerRefs.current[subLevelId]) {
      clearInterval(timerRefs.current[subLevelId]);
      delete timerRefs.current[subLevelId];
    }
    
    setActiveTimers(prev => ({ ...prev, [subLevelId]: false }));
    toast.success('Timer stopped');
  };
  
  // Ensure we have the proper data structure for rendering
  const getInspectionData = () => {
    // If we're in page-wise view, use the pageData
    if (pageData) {
      return {
        name: pageData.name || 'Unnamed Page',
        description: pageData.description || '',
        subLevels: pageData.sections || []
      };
    }
    
    // Otherwise, use the full inspection level data
    return {
      name: task.inspectionLevel?.name || 'Inspection',
      description: task.inspectionLevel?.description || '',
      subLevels: task.inspectionLevel?.subLevels || []
    };
  };
  
  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };
  
  const handleFileChange = async (subLevelId, e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Basic validation
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('File size should be less than 5MB');
      return;
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, PNG and GIF images are allowed');
      return;
    }
    
    // Set uploading state
    setUploadingPhotos(prev => ({ ...prev, [subLevelId]: true }));
    
    toast.loading('Uploading file...');
    
    try {
      // Use the Redux action to upload the file
      const result = await dispatch(uploadTaskAttachment({
        taskId: task._id,
        file
      })).unwrap();
      
      toast.dismiss();
      toast.success('File uploaded successfully');
      
      // Add to photos state for this sublevel
      const fileUrl = result.attachments?.[result.attachments.length - 1]?.url || '';
      
      setPhotos(prev => {
        const currentPhotos = prev[subLevelId] || [];
        return {
          ...prev,
          [subLevelId]: [...currentPhotos, fileUrl]
        };
      });
      
      // Reset the file input
      if (fileInputRefs.current[subLevelId]) {
        fileInputRefs.current[subLevelId].value = '';
      }
    } catch (error) {
      toast.dismiss();
      console.error('File upload error:', error);
      toast.error('Failed to upload file: ' + (error.message || 'Unknown error'));
    } finally {
      // Remove uploading state
      setUploadingPhotos(prev => ({ ...prev, [subLevelId]: false }));
    }
  };
  
  const removePhoto = (subLevelId, photoUrl) => {
    setPhotos(prev => {
      const currentPhotos = prev[subLevelId] || [];
      return {
        ...prev,
        [subLevelId]: currentPhotos.filter(url => url !== photoUrl)
      };
    });
  };
  
  const handleNoteChange = (subLevelId, value) => {
    setNotes(prev => ({
      ...prev,
      [subLevelId]: value
    }));
  };
  
  const handleTimeChange = (subLevelId, value) => {
    const time = parseFloat(value) || 0;
    setTimeSpent(prev => ({
      ...prev,
      [subLevelId]: time
    }));
  };
  
  const handleComplianceChange = (subLevelId, status) => {
    setComplianceStatus(prev => ({
      ...prev,
      [subLevelId]: status
    }));
    
    // Update the status in the backend
    handleUpdateSubLevel(subLevelId, status);
  };
  
  const handleUpdateSubLevel = async (subLevelId, status) => {
    // Check if deadline has passed
    const isDeadlinePassed = task && task.deadline && new Date(task.deadline) < new Date();
    if (isDeadlinePassed) {
      toast.error('Cannot update: task deadline has passed');
      return;
    }
    
    // Validate inputs if completing
    if (status === 'completed' || status === 'full_compliance') {
      const subLevelNotes = notes[subLevelId] || '';
      const subLevelPhotos = photos[subLevelId] || [];
      
      // Check if template requires photos
      if (task.inspectionLevel?.completionCriteria?.requiredPhotos && 
         (!subLevelPhotos || subLevelPhotos.length === 0)) {
        toast.error('Please add at least one photo before completing this item');
        return;
      }
      
      // Check if template requires notes
      if (task.inspectionLevel?.completionCriteria?.requiredNotes && 
         (!subLevelNotes || subLevelNotes.trim() === '')) {
        toast.error('Please add notes before completing this item');
        return;
      }
    }
    
    setLoading(prev => ({ ...prev, [subLevelId]: true }));
    
    try {
      const updatedTask = await dispatch(updateUserTaskProgress({
        taskId: task._id,
        subLevelId,
        status,
        notes: notes[subLevelId] || '',
        photos: photos[subLevelId] || [],
        timeSpent: timeSpent[subLevelId] || 0
      })).unwrap();
      
      toast.success(`Checkpoint status updated`);
      if (onUpdateProgress) onUpdateProgress(updatedTask);
      
      // Update local compliance status
      setComplianceStatus(prev => ({
        ...prev,
        [subLevelId]: status
      }));
      
      // Recalculate scores
      calculateScores();
      
      // Stop timer if running
      if (activeTimers[subLevelId]) {
        stopTimer(subLevelId);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update checkpoint status');
    } finally {
      setLoading(prev => ({ ...prev, [subLevelId]: false }));
    }
  };
  
  // Get progress status for a specific sublevel
  const getSubLevelStatus = (subLevelId) => {
    // First check local state
    if (complianceStatus[subLevelId]) {
      return complianceStatus[subLevelId];
    }
    
    // Then check task progress
    const { progress } = getInspectionData();
    if (!progress || !progress.length) return 'pending';
    
    const progressItem = progress.find(p => {
      if (!p || !p.subLevelId) return false;
      
      const progressSubLevelId = typeof p.subLevelId === 'string' 
        ? p.subLevelId 
        : (p.subLevelId._id || p.subLevelId.id || p.subLevelId);
        
      return progressSubLevelId === subLevelId.toString();
    });
    
    return progressItem ? progressItem.status : 'pending';
  };
  
  const calculateProgress = () => {
    return task?.overallProgress || 0;
  };
  
  // Add this helper function to calculate node numbering
  const getLevelNumber = (node, index, parentNumber = '') => {
    if (!node) return '';
    
    // If the node already has a levelNumber property, use it
    if (node.levelNumber) return node.levelNumber;
    
    // Calculate based on hierarchy
    if (parentNumber) {
      // Sub-level under a parent - use numeric (e.g., A.1, A.2, etc.)
      return `${parentNumber}.${index + 1}`;
    } else {
      // Top-level - use letters (A, B, C, etc.)
      return String.fromCharCode(65 + index);
    }
  };
  
  // Update the flattenSubLevels function to include level numbers and status
  const flattenSubLevels = (subLevels, parentName = '', level = 0, parentNumber = '') => {
    let result = [];
    
    if (!subLevels || !Array.isArray(subLevels)) return result;
    
    subLevels.forEach((subLevel, index) => {
      // Calculate the level number for this node
      const levelNumber = getLevelNumber(subLevel, index, parentNumber);
      
      // Create the path name
      const fullName = parentName ? `${parentName} > ${subLevel.name || 'Unnamed'}` : (subLevel.name || 'Unnamed');
      
      // Add this node to the result
      result.push({
        ...subLevel,
        path: fullName,
        level,
        levelNumber, // Add level number to the node
        status: getSubLevelStatus(subLevel._id) // Keep the status property for search functionality
      });
      
      // Recursively add child nodes
      if (subLevel.subLevels && subLevel.subLevels.length > 0) {
        result = [
          ...result,
          ...flattenSubLevels(subLevel.subLevels, fullName, level + 1, levelNumber)
        ];
      }
    });
    
    return result;
  };
  
  // Update the renderTreeNode function to display level numbers
  const renderTreeNode = (node, level = 0, index = 0, parentNumber = '') => {
    if (!node) return null;
    
    const hasChildren = node.subLevels && node.subLevels.length > 0;
    const isExpanded = expandedNodes[node._id];
    const isSelected = selectedSubLevel && selectedSubLevel._id === node._id;
    const status = getSubLevelStatus(node._id);
    
    // Calculate the level number for this node
    const levelNumber = node.levelNumber || getLevelNumber(node, index, parentNumber);
    
    return (
      <TreeNode key={node._id}>
        <NodeHeader 
          isSelected={isSelected}
          onClick={() => {
            setSelectedSubLevel(node);
            if (hasChildren) {
              toggleNode(node._id);
            }
          }}
        >
          <NodeIcon isSelected={isSelected}>
            {hasChildren ? (
              isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            ) : (
              <span style={{ width: 16 }}></span>
            )}
          </NodeIcon>
          <StatusIcon status={status}>
            <StatusIcon2 status={status} size={16} />
          </StatusIcon>
          <NodeLabel isSelected={isSelected}>
            <LevelNumber>{levelNumber}</LevelNumber> {node.name || 'Unnamed'}
          </NodeLabel>
        </NodeHeader>
        
        {hasChildren && isExpanded && (
          <ChildNodes level={level + 1}>
            {node.subLevels.map((child, idx) => 
              renderTreeNode(child, level + 1, idx, levelNumber)
            )}
          </ChildNodes>
        )}
      </TreeNode>
    );
  };
  
  const renderSearchResults = () => {
    if (!searchResults || searchResults.length === 0) {
      return (
        <div style={{ padding: '16px', color: '#64748b', fontSize: '14px', textAlign: 'center' }}>
          No results found
        </div>
      );
    }
    
    return (
      <div style={{ padding: '8px' }}>
        {searchResults.map(result => (
          <NodeHeader 
            key={result._id}
            isSelected={selectedSubLevel && selectedSubLevel._id === result._id}
            onClick={() => setSelectedSubLevel(result)}
            style={{ marginBottom: '2px' }}
          >
            <StatusIcon status={result.status || getSubLevelStatus(result._id)}>
              <StatusIcon2 status={result.status || getSubLevelStatus(result._id)} size={16} />
            </StatusIcon>
            <div style={{ flexGrow: 1 }}>
              <NodeLabel isSelected={selectedSubLevel && selectedSubLevel._id === result._id}>
                <LevelNumber>{result.levelNumber || ''}</LevelNumber>
                {result.name || 'Unnamed'}
              </NodeLabel>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                {result.path}
              </div>
            </div>
          </NodeHeader>
        ))}
      </div>
    );
  };
  
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});
  
  // Function to toggle section accordion state
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  // Function to toggle question accordion state
  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };
  
  // Update the renderContentForm function to remove section compliance buttons
  const renderContentForm = () => {
    if (!selectedSubLevel) {
      return (
        <NoSelectionMessage>
          <HelpCircle size={48} />
          <h3>No Section Selected</h3>
          <p>Please select a section from the sidebar to view its details</p>
        </NoSelectionMessage>
      );
    }
  
    // Get the status of the current sublevel
    const status = getSubLevelStatus(selectedSubLevel._id);
    
    // Get the questions for this sublevel
    const questions = selectedSubLevel.questions || [];
    
    return (
      <div>
        <ContentHeader>
          {selectedSubLevel.levelNumber && (
            <LevelNumber>{selectedSubLevel.levelNumber}</LevelNumber>
          )}
          {selectedSubLevel.name || 'Unnamed Section'}
          <StatusBadge status={status}>
            <StatusIcon2 status={status} size={14} />
            {status === 'completed' ? 'Completed' : 
              status === 'in_progress' ? 'In Progress' : 
              status === 'full_compliance' ? 'Full Compliance' :
              status === 'partial_compliance' ? 'Partial Compliance' :
              status === 'non_compliance' ? 'Non-Compliance' :
              status === 'not_applicable' ? 'Not Applicable' : 'Pending'}
          </StatusBadge>
          {selectedSubLevel.mandatory !== false && (
            <MandatoryBadge mandatory={true}>Required</MandatoryBadge>
          )}
        </ContentHeader>
  
        {/* Scoring Summary */}
        <ScoringSummary>
          <SectionTitle>
            <Award size={18} />
            Scoring Summary
          </SectionTitle>
          
          <ScoreGrid>
            <ScoreItem percent={calculateSectionScore(selectedSubLevel._id).percentage}>
              <div className="score-label">Section Score</div>
              <div className="score-value">
                {calculateSectionScore(selectedSubLevel._id).achieved}/{calculateSectionScore(selectedSubLevel._id).total}
                <span className="score-percent">
                  ({calculateSectionScore(selectedSubLevel._id).percentage}%)
                </span>
              </div>
            </ScoreItem>
          </ScoreGrid>
          
          <ScoringCriteria>
            <div className="criteria-item full">
              <CheckCircle size={14} /> Full Compliance (2 pts)
            </div>
            <div className="criteria-item partial">
              <AlertTriangle size={14} /> Partial Compliance (1 pt)
            </div>
            <div className="criteria-item non">
              <XCircle size={14} /> Non-Compliance (0 pts)
            </div>
            <div className="criteria-item na">
              <Clock size={14} /> Not Applicable (N/A)
            </div>
          </ScoringCriteria>
        </ScoringSummary>
  
        {/* Questions as accordions */}
        {questions.length > 0 ? (
          <div>
            <SectionTitle>
              <Clipboard size={18} />
              Questions
            </SectionTitle>
            
            {questions.map((question, index) => {
              const questionId = question._id || `question-${index}`;
              const isOpen = expandedQuestions[questionId] || false;
              const questionScore = calculateQuestionScore(question, selectedSubLevel._id);
              const questionPercentage = questionScore.total > 0 ? 
                Math.round((questionScore.achieved / questionScore.total) * 100) : 0;
              
              return (
                <QuestionAccordion key={questionId}>
                  <QuestionAccordionHeader 
                    isOpen={isOpen}
                    onClick={() => toggleQuestion(questionId)}
                  >
                    <QuestionTitle isOpen={isOpen}>
                      <ChevronDown size={16} />
                      {index + 1}. {question.text || 'Unnamed Question'}
                      {question.mandatory !== false && <QuestionMandatory>*</QuestionMandatory>}
                    </QuestionTitle>
                    
                    <QuestionScoreBadge 
                      score={questionScore.achieved}
                      percentage={questionPercentage}
                    >
                      {questionScore.achieved}/{questionScore.total}
                    </QuestionScoreBadge>
                  </QuestionAccordionHeader>
                  
                  <QuestionBody isOpen={isOpen}>
                    {question.description && (
                      <p style={{ 
                        color: '#64748b', 
                        fontSize: '14px',
                        marginBottom: '12px'
                      }}>
                        {question.description}
                      </p>
                    )}
                    
                    {renderQuestionInput(question, selectedSubLevel._id)}
                  </QuestionBody>
                </QuestionAccordion>
              );
            })}
          </div>
        ) : (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            color: '#64748b',
            background: '#f8fafc',
            borderRadius: '8px'
          }}>
            No questions available for this section.
          </div>
        )}
  
        {/* Action area */}
        <ActionInput>
          <SectionTitle>
            <MessageSquare size={18} />
            Comments
          </SectionTitle>
          <CommentInput
            placeholder="Add your notes here..."
            value={notes[selectedSubLevel._id] || ''}
            onChange={(e) => handleNoteChange(selectedSubLevel._id, e.target.value)}
            disabled={task.status === 'completed'}
          />
          
          <SectionTitle style={{ marginTop: '20px' }}>
            <PaperclipIcon size={18} />
            Attachments
          </SectionTitle>
          
          <FileInput
            type="file"
            id={`file-input-${selectedSubLevel._id}`}
            ref={el => fileInputRefs.current[selectedSubLevel._id] = el}
            onChange={(e) => handleFileChange(selectedSubLevel._id, e)}
            accept="image/*"
            disabled={task.status === 'completed'}
          />
          
          <FileInputLabel 
            htmlFor={`file-input-${selectedSubLevel._id}`}
            style={{ opacity: task.status === 'completed' ? 0.7 : 1 }}
          >
            <Image size={16} />
            {uploadingPhotos[selectedSubLevel._id] ? 'Uploading...' : 'Add Photos'}
          </FileInputLabel>
          
          <PhotoPreviewContainer>
            {(photos[selectedSubLevel._id] || []).map((photo, index) => (
              <PhotoPreview key={index}>
                <img 
                  src={photo} 
                  alt="Attachment" 
                  onClick={() => setPhotoPreview(photo)}
                />
                {task.status !== 'completed' && (
                  <button 
                    className="remove-button"
                    onClick={() => removePhoto(selectedSubLevel._id, photo)}
                  >
                    <X size={12} />
                  </button>
                )}
              </PhotoPreview>
            ))}
          </PhotoPreviewContainer>
          
          <SectionTitle style={{ marginTop: '20px' }}>
            <Timer size={18} />
            Time Spent
          </SectionTitle>
          
          <TimeInputContainer>
            {activeTimers[selectedSubLevel._id] ? (
              <>
                <CustomTimeInput 
                  value={timeSpent[selectedSubLevel._id] || 0} 
                  onChange={(val) => handleTimeChange(selectedSubLevel._id, val)}
                  disabled={true}
                />
                <StopTimerButton 
                  onClick={() => stopTimer(selectedSubLevel._id)}
                  disabled={task.status === 'completed'}
                >
                  <PauseCircle size={14} />
                  Stop Timer
                </StopTimerButton>
              </>
            ) : (
              <>
                <CustomTimeInput 
                  value={timeSpent[selectedSubLevel._id] || 0} 
                  onChange={(val) => handleTimeChange(selectedSubLevel._id, val)}
                  disabled={task.status === 'completed'}
                />
                <StartTimerButton 
                  onClick={() => startTimer(selectedSubLevel._id)}
                  disabled={task.status === 'completed'}
                >
                  <PlayCircle size={14} />
                  Start Timer
                </StartTimerButton>
              </>
            )}
          </TimeInputContainer>
        </ActionInput>
  
        {/* Submit section button - no compliance buttons for the section */}
        <ButtonGroup>
          <CompleteButton
            onClick={() => handleUpdateSection(selectedSubLevel._id)}
            disabled={loading[selectedSubLevel._id] || task.status === 'completed'}
          >
            {loading[selectedSubLevel._id] ? <Loader size={16} /> : <CheckCircle size={16} />}
            Submit Section
          </CompleteButton>
        </ButtonGroup>
      </div>
    );
  };
  
  // Now let's update the rendering of the inspection when viewing all sections at once
  // Modify the existing renderSections function or create a new one
  const renderAllSections = () => {
    const { subLevels } = getInspectionData();
  
    if (!subLevels || subLevels.length === 0) {
      return (
        <NoSubLevelsMessage>
          <HelpCircle size={48} />
          <h3>No Inspection Sections Found</h3>
          <p>This inspection template doesn't have any sections defined.</p>
        </NoSubLevelsMessage>
      );
    }
  
    return (
      <SectionsContainer>
        {subLevels.map((section, index) => {
          const sectionId = section._id || `section-${index}`;
          const isOpen = expandedSections[sectionId] || false;
          const status = getSubLevelStatus(sectionId);
          const sectionScore = calculateSectionScore(sectionId);
          const sectionPercentage = sectionScore.total > 0 ? 
            Math.round((sectionScore.achieved / sectionScore.total) * 100) : 0;
            
          // Get the questions for this section
          const questions = section.questions || [];
          
          // Calculate level number
          const levelNumber = getLevelNumber(section, index);
          
          return (
            <AccordionSection key={sectionId}>
              <AccordionHeader 
                isOpen={isOpen} 
                onClick={() => toggleSection(sectionId)}
              >
                <AccordionTitle isOpen={isOpen}>
                  <ChevronDown />
                  {levelNumber && <LevelNumber>{levelNumber}</LevelNumber>}
                  {section.name || 'Unnamed Section'}
                  {section.mandatory !== false && <MandatoryBadge mandatory={true}>Required</MandatoryBadge>}
                </AccordionTitle>
                
                <ScoreBadge 
                  score={sectionScore.achieved}
                  percentage={sectionPercentage}
                >
                  {sectionScore.achieved}/{sectionScore.total}
                </ScoreBadge>
              </AccordionHeader>
              
              <AccordionBody isOpen={isOpen}>
                {section.description && (
                  <ContentDescription>{section.description}</ContentDescription>
                )}
                
                {/* Section status */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <StatusIcon2 status={status} size={16} />
                  <span style={{ 
                    fontSize: '14px',
                    fontWeight: '500',
                    color: status === 'completed' || status === 'full_compliance' ? '#2e7d32' :
                      status === 'in_progress' || status === 'partial_compliance' ? '#f57c00' :
                      status === 'non_compliance' ? '#c62828' : '#64748b'
                  }}>
                    {status === 'completed' ? 'Completed' : 
                      status === 'in_progress' ? 'In Progress' : 
                      status === 'full_compliance' ? 'Full Compliance' :
                      status === 'partial_compliance' ? 'Partial Compliance' :
                      status === 'non_compliance' ? 'Non-Compliance' :
                      status === 'not_applicable' ? 'Not Applicable' : 'Pending'}
                  </span>
                </div>
                
                {/* Questions as accordions */}
                {questions.length > 0 ? (
                  <div>
                    <SectionTitle>
                      <Clipboard size={18} />
                      Questions
                    </SectionTitle>
                    
                    {questions.map((question, qIndex) => {
                      const questionId = question._id || `question-${index}-${qIndex}`;
                      const isQuestionOpen = expandedQuestions[questionId] || false;
                      const questionScore = calculateQuestionScore(question, sectionId);
                      const questionPercentage = questionScore.total > 0 ? 
                        Math.round((questionScore.achieved / questionScore.total) * 100) : 0;
                      
                      return (
                        <QuestionAccordion key={questionId}>
                          <QuestionAccordionHeader 
                            isOpen={isQuestionOpen}
                            onClick={() => toggleQuestion(questionId)}
                          >
                            <QuestionTitle isOpen={isQuestionOpen}>
                              <ChevronDown size={16} />
                              {qIndex + 1}. {question.text || 'Unnamed Question'}
                              {question.mandatory !== false && <QuestionMandatory>*</QuestionMandatory>}
                            </QuestionTitle>
                            
                            <QuestionScoreBadge 
                              score={questionScore.achieved}
                              percentage={questionPercentage}
                            >
                              {questionScore.achieved}/{questionScore.total}
                            </QuestionScoreBadge>
                          </QuestionAccordionHeader>
                          
                          <QuestionBody isOpen={isQuestionOpen}>
                            {question.description && (
                              <p style={{ 
                                color: '#64748b', 
                                fontSize: '14px',
                                marginBottom: '12px'
                              }}>
                                {question.description}
                              </p>
                            )}
                            
                            {renderQuestionInput(question, sectionId)}
                          </QuestionBody>
                        </QuestionAccordion>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ 
                    padding: '16px', 
                    textAlign: 'center', 
                    color: '#64748b',
                    background: '#f8fafc',
                    borderRadius: '8px'
                  }}>
                    No questions available for this section.
                  </div>
                )}
                
                {/* Single Submit button */}
                <ButtonGroup>
                  <CompleteButton
                    onClick={() => handleUpdateSection(sectionId)}
                    disabled={loading[sectionId] || task.status === 'completed'}
                  >
                    {loading[sectionId] ? <Loader size={16} /> : <CheckCircle size={16} />}
                    Submit Section
                  </CompleteButton>
                </ButtonGroup>
              </AccordionBody>
            </AccordionSection>
          );
        })}
      </SectionsContainer>
    );
  };
  
  // Add the missing renderPhotoLightbox function
  const renderPhotoLightbox = () => {
    if (!photoPreview) return null;
    
    return (
      <PhotoLightbox>
        <img src={photoPreview} alt="Attachment Preview" />
        <button className="close-button" onClick={() => setPhotoPreview(null)}>
          <X size={24} />
        </button>
      </PhotoLightbox>
    );
  };
  
  // Move these functions here, inside the component
  const getQuestionResponse = (questionId, sectionId) => {
    const key = `${sectionId}_${questionId}`;
    return questionResponses[key] || null;
  };
  
  // Add calculateQuestionScore inside the component
  const calculateQuestionScore = (question, sectionId) => {
    if (!question || !question.scoring || !question.scoring.enabled) {
      return { achieved: 0, total: question?.scoring?.max || 0, percentage: 0 };
    }
    
    // Get the max score from the question data
    const total = question.scoring.max || 2; // Default to 2 if not specified
    
    // Get the response for this question
    const response = getQuestionResponse(question._id, sectionId);
    
    // If no response, return zero achieved
    if (!response || !question.scores) {
      return { achieved: 0, total, percentage: 0 };
    }
    
    // Get the score for this response from the question's scores object
    const achieved = question.scores[response] || 0;
    
    const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0;
    
    return { achieved, total, percentage };
  };
  
  // Fix handleQuestionResponse to properly save responses
  const handleQuestionResponse = (questionId, sectionId, value) => {
    const key = `${sectionId}_${questionId}`;
    
    // Update local state first for instant UI feedback
    setQuestionResponses(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Find the question and section in the data
    let section = null;
    let questions = [];
    
    // Find section
    if (task.inspectionLevel?.subLevels) {
      const findSection = (subLevels) => {
        for (const sl of subLevels) {
          if (sl._id === sectionId) {
            section = sl;
            questions = sl.questions || [];
            return true;
          }
          if (sl.subLevels && sl.subLevels.length > 0) {
            for (const ssl of sl.subLevels) {
              if (ssl._id === sectionId) {
                section = ssl;
                questions = ssl.questions || [];
                return true;
              }
            }
          }
        }
        return false;
      };
      
      findSection(task.inspectionLevel.subLevels);
    }
    
    // If not found, search in pages/sections
    if (!section && task.inspectionLevel?.pages) {
      for (const page of task.inspectionLevel.pages) {
        if (page.sections) {
          for (const sec of page.sections) {
            if (sec._id === sectionId) {
              section = sec;
              questions = sec.questions || [];
              break;
            }
          }
        }
      }
    }
    
    const question = questions.find(q => q && q._id === questionId);
    
    let scoreMsg = '';
    if (question && question.scores && question.scores[value] !== undefined) {
      // Show the score value in toast
      scoreMsg = ` (${question.scores[value]} points)`;
    }
    
    // Find the progress item for this section
    const progressItem = task.progress?.find(p => 
      p.subLevelId && (p.subLevelId === sectionId || 
                       p.subLevelId._id === sectionId || 
                       p.subLevelId.toString() === sectionId.toString())
    );
    
    // Collect all current responses for this section
    const responses = progressItem?.responses || {}; 
    
    // Add the new response
    responses[questionId] = value;
    
    // Save to database
    setLoading(prev => ({ ...prev, [sectionId]: true }));
    
    dispatch(updateUserTaskProgress({
      taskId: task._id,
      subLevelId: sectionId,
      status: progressItem?.status || 'pending', // Maintain current status
      notes: notes[sectionId] || progressItem?.notes || '',
      photos: photos[sectionId] || progressItem?.photos || [],
      timeSpent: timeSpent[sectionId] || progressItem?.timeSpent || 0,
      responses: responses
    })).unwrap()
      .then((updatedTask) => {
        if (onUpdateProgress) onUpdateProgress(updatedTask);
        toast.success(`Response recorded: ${value}${scoreMsg}`);
        // Recalculate scores
        calculateScores();
        setLoading(prev => ({ ...prev, [sectionId]: false }));
      })
      .catch(error => {
        toast.error(`Failed to save response: ${error.message || 'Unknown error'}`);
        setLoading(prev => ({ ...prev, [sectionId]: false }));
      });
  };
  
  // Add a new function to handle section updates based on question responses
  const handleUpdateSection = async (sectionId) => {
    // Check if deadline has passed
    const isDeadlinePassed = task && task.deadline && new Date(task.deadline) < new Date();
    if (isDeadlinePassed) {
      toast.error('Cannot update: task deadline has passed');
      return;
    }
  
    // Calculate the status based on question responses
    const section = task.inspectionLevel?.subLevels?.find(sl => 
      sl._id === sectionId || sl.subLevels?.some(ssl => ssl._id === sectionId)
    );
    
    const subLevel = section?._id === sectionId ? section : 
      section?.subLevels?.find(ssl => ssl._id === sectionId);
    
    if (!subLevel || !subLevel.questions || subLevel.questions.length === 0) {
      toast.error('No questions found for this section');
      return;
    }
    
    // Check if all required questions have responses
    const requiredQuestions = subLevel.questions.filter(q => q.required !== false && q.mandatory !== false);
    let allRequiredAnswered = true;
    let anyCompliance = false;
    let allFullCompliance = true;
    let anyNonCompliance = false;
    
    for (const question of requiredQuestions) {
      const response = getQuestionResponse(question._id, sectionId);
      
      if (!response) {
        allRequiredAnswered = false;
        break;
      }
      
      if (question.type === 'compliance') {
        anyCompliance = true;
        
        if (response === 'Non-compliant') {
          anyNonCompliance = true;
          allFullCompliance = false;
        } else if (response === 'Partial compliance') {
          allFullCompliance = false;
        }
      }
    }
    
    if (!allRequiredAnswered) {
      toast.error('Please answer all required questions before submitting');
      return;
    }
    
    // Determine the status
    let status = 'completed';
    
    if (anyCompliance) {
      if (allFullCompliance) {
        status = 'full_compliance';
      } else if (anyNonCompliance) {
        status = 'non_compliance';
      } else {
        status = 'partial_compliance';
      }
    }
    
    // Update the section status
    setLoading(prev => ({ ...prev, [sectionId]: true }));
    
    try {
      // Prepare the responses object
      const responses = {};
      subLevel.questions.forEach(question => {
        const response = getQuestionResponse(question._id, sectionId);
        if (response !== null && response !== undefined) {
          responses[question._id] = response;
        }
      });
      
      const updatedTask = await dispatch(updateUserTaskProgress({
        taskId: task._id,
        subLevelId: sectionId,
        status,
        notes: notes[sectionId] || '',
        photos: photos[sectionId] || [],
        timeSpent: timeSpent[sectionId] || 0,
        responses // Include the question responses
      })).unwrap();
      
      toast.success(`Section submitted successfully`);
      if (onUpdateProgress) onUpdateProgress(updatedTask);
      
      // Update local compliance status
      setComplianceStatus(prev => ({
        ...prev,
        [sectionId]: status
      }));
      
      // Recalculate scores
      calculateScores();
      
      // Stop timer if running
      if (activeTimers[sectionId]) {
        stopTimer(sectionId);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to submit section');
    } finally {
      setLoading(prev => ({ ...prev, [sectionId]: false }));
    }
  };
  
  // Add the renderQuestionInput function inside the component
  const renderQuestionInput = (question, sectionId) => {
    if (!question) return null;
    
    // Only disable if deadline has passed or task is completed
    const isTaskCompleted = task && task.status === 'completed';
    const isDeadlinePassed = task && task.deadline && new Date(task.deadline) < new Date();
    const disabled = isDeadlinePassed || isTaskCompleted;
    
    // Get current response for this question
    const currentResponse = getQuestionResponse(question._id, sectionId);
    
    switch (question.type) {
      case 'compliance':
        return (
          <ComplianceButtonGroup>
            <ComplianceButton 
              selected={currentResponse === 'Full compliance'}
              onClick={() => !disabled && handleQuestionResponse(question._id, sectionId, 'Full compliance')}
              disabled={disabled || loading[sectionId]}
            >
              {loading[sectionId] ? <Loader size={16} /> : <CheckCircle size={16} />}
              Full Compliance
            </ComplianceButton>
            <ComplianceButton 
              selected={currentResponse === 'Partial compliance'}
              onClick={() => !disabled && handleQuestionResponse(question._id, sectionId, 'Partial compliance')}
              disabled={disabled || loading[sectionId]}
            >
              {loading[sectionId] ? <Loader size={16} /> : <AlertCircle size={16} />}
              Partial Compliance
            </ComplianceButton>
            <ComplianceButton 
              selected={currentResponse === 'Non-compliant'}
              onClick={() => !disabled && handleQuestionResponse(question._id, sectionId, 'Non-compliant')}
              disabled={disabled || loading[sectionId]}
            >
              {loading[sectionId] ? <Loader size={16} /> : <XCircle size={16} />}
              Non-Compliance
            </ComplianceButton>
            <ComplianceButton 
              selected={currentResponse === 'Not applicable'}
              onClick={() => !disabled && handleQuestionResponse(question._id, sectionId, 'Not applicable')}
              disabled={disabled || loading[sectionId]}
            >
              {loading[sectionId] ? <Loader size={16} /> : <HelpCircle size={16} />}
              Not Applicable
            </ComplianceButton>
          </ComplianceButtonGroup>
        );
      
      case 'text':
        return (
          <TextInput 
            type="text"
            placeholder="Enter your answer here"
            disabled={disabled}
            value={currentResponse || ''}
            onChange={(e) => handleQuestionResponse(question._id, sectionId, e.target.value)}
          />
        );
      
      case 'yesno':
        return (
          <RadioGroup>
            {['Yes', 'No', 'N/A'].map((option, idx) => (
              <RadioOption key={idx}>
                <RadioInput 
                  type="radio"
                  name={`question_${question._id}`}
                  id={`option_${question._id}_${idx}`}
                  disabled={disabled}
                  value={option}
                  checked={currentResponse === option}
                  onChange={() => handleQuestionResponse(question._id, sectionId, option)}
                />
                <RadioLabel htmlFor={`option_${question._id}_${idx}`}>{option}</RadioLabel>
              </RadioOption>
            ))}
          </RadioGroup>
        );
      
      case 'multiple':
        return (
          <RadioGroup>
            {(question.options || ['Yes', 'No', 'N/A']).map((option, idx) => (
              <RadioOption key={idx}>
                <RadioInput 
                  type="radio"
                  name={`question_${question._id}`}
                  id={`option_${question._id}_${idx}`}
                  disabled={disabled}
                  value={option}
                  checked={currentResponse === option}
                  onChange={() => handleQuestionResponse(question._id, sectionId, option)}
                />
                <RadioLabel htmlFor={`option_${question._id}_${idx}`}>{option}</RadioLabel>
              </RadioOption>
            ))}
          </RadioGroup>
        );
      
      case 'radio':
        return (
          <RadioGroup>
            {(question.options || []).map((option, idx) => (
              <RadioOption key={idx}>
                <RadioInput 
                  type="radio"
                  name={`question_${question._id}`}
                  id={`option_${question._id}_${idx}`}
                  disabled={disabled}
                  value={typeof option === 'object' ? option.value : option}
                  checked={currentResponse === (typeof option === 'object' ? option.value : option)}
                  onChange={() => handleQuestionResponse(question._id, sectionId, typeof option === 'object' ? option.value : option)}
                />
                <RadioLabel htmlFor={`option_${question._id}_${idx}`}>
                  {typeof option === 'object' ? option.label : option}
                </RadioLabel>
              </RadioOption>
            ))}
          </RadioGroup>
        );
      
      case 'checkbox':
        return (
          <div>
            {(question.options || []).map((option, idx) => {
              const isChecked = currentResponse && Array.isArray(currentResponse) 
                ? currentResponse.includes(typeof option === 'object' ? option.value : option)
                : false;
                
              return (
                <RadioOption key={idx}>
                  <input 
                    type="checkbox"
                    id={`option_${question._id}_${idx}`}
                    disabled={disabled}
                    checked={isChecked}
                    onChange={() => {
                      // Handle checkbox state
                      const value = typeof option === 'object' ? option.value : option;
                      const currentValues = currentResponse && Array.isArray(currentResponse) 
                        ? [...currentResponse]
                        : [];
                        
                      if (isChecked) {
                        // Remove if already checked
                        const newValues = currentValues.filter(v => v !== value);
                        handleQuestionResponse(question._id, sectionId, newValues);
                      } else {
                        // Add if not checked
                        handleQuestionResponse(question._id, sectionId, [...currentValues, value]);
                      }
                    }}
                  />
                  <RadioLabel htmlFor={`option_${question._id}_${idx}`}>
                    {typeof option === 'object' ? option.label : option}
                  </RadioLabel>
                </RadioOption>
              );
            })}
          </div>
        );
      
      case 'signature':
        return (
          <SignatureArea>
            <SignatureBox 
              style={{
                height: '100px',
                border: '1px dashed #e2e8f0',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                fontSize: '14px'
              }}
            >
              {currentResponse ? (
                <img 
                  src={currentResponse} 
                  alt="Signature" 
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} 
                />
              ) : (
                <span>Click to sign</span>
              )}
            </SignatureBox>
            {currentResponse && (
              <ClearButton 
                onClick={() => handleQuestionResponse(question._id, sectionId, null)}
                disabled={disabled}
                style={{ marginTop: '8px' }}
              >
                Clear signature
              </ClearButton>
            )}
          </SignatureArea>
        );
        
      default:
        return (
          <div style={{ color: '#64748b', fontStyle: 'italic' }}>
            No input available for this question type: {question.type}
          </div>
        );
    }
  };
  
  // Update the main render method to use our new accordion-based sections
  return (
    <Container>
      <Title>
        <Clipboard size={20} />
        {task ? task.title || 'Inspection' : 'Inspection'}
      </Title>
      
      {task && task.inspectionLevel ? (
        <>
          <InspectionContainer>
            {searchTerm.trim() ? (
              // Show search results
              <>
                <SearchContainer>
                  <SearchButton>
                    <Search size={18} />
                  </SearchButton>
                  <SearchInput
                    type="text"
                    placeholder="Search sections and questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </SearchContainer>
                
                {renderSearchResults()}
              </>
            ) : (
              // Show regular inspection content
              <>
                <SearchContainer>
                  <SearchButton>
                    <Search size={18} />
                  </SearchButton>
                  <SearchInput
                    type="text"
                    placeholder="Search sections and questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </SearchContainer>
                
                <InspectionBodyContainer>
                  {selectedSubLevel ? (
                    // When a specific section is selected
                    <>
                      <TreeView>
                        <TreeHeader>
                          <h3>Sections</h3>
                          <ProgressIndicator>{calculateProgress()}%</ProgressIndicator>
                        </TreeHeader>
                        
                        <SidebarContent>
                          {getSections().map((node, index) => 
                            renderTreeNode(node, 0, index)
                          )}
                        </SidebarContent>
                        
                        <ExportButtonContainer>
                          <ExportButton onClick={onExportReport}>
                            <Download size={16} />
                            Export Report
                          </ExportButton>
                        </ExportButtonContainer>
                      </TreeView>
                      
                      <ContentPane>
                        {renderContentForm()}
                      </ContentPane>
                    </>
                  ) : (
                    // Show all sections as accordions when no specific section is selected
                    <div style={{ padding: '24px', width: '100%' }}>
                      {renderAllSections()}
                      
                      <div style={{ marginTop: '32px', textAlign: 'right' }}>
                        <ExportButton onClick={onExportReport}>
                          <Download size={16} />
                          Export Report
                        </ExportButton>
                      </div>
                    </div>
                  )}
                </InspectionBodyContainer>
              </>
            )}
          </InspectionContainer>
          
          <ProgressBar progress={calculateProgress()}>
            <div className="fill" style={{ width: `${calculateProgress()}%` }}></div>
          </ProgressBar>
          
          <ProgressInfo>
            <span className="label">Inspection Progress</span>
            <span className="percentage">{calculateProgress()}%</span>
          </ProgressInfo>
          
          {/* This renders the photo lightbox modal */}
          {renderPhotoLightbox()}
        </>
      ) : (
        <NoSubLevelsMessage>
          <HelpCircle size={48} />
          <h3>No Inspection Template Found</h3>
          <p>This task doesn't have an inspection template attached.</p>
        </NoSubLevelsMessage>
      )}
    </Container>
  );
};

export default InspectionStepForm;

// Update SectionGrid to match new design
const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  width: 100%;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SectionCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const SectionHeader = styled.div`
  padding: 16px;
  background: rgba(248, 250, 252, 0.8);
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SectionHeaderContent = styled.div`
  display: flex;
  gap: 12px;
  flex: 1;
`;

const SectionNumber = styled.div`
  width: 32px;
  height: 32px;
  background: var(--color-navy);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
`;

const SectionDescription = styled.div`
  padding: 16px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
  border-bottom: 1px solid #edf2f7;
`;

const SectionScore = styled.div`
  background: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: center;
  min-width: 120px;
`;

const ScoreTitle = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
`;

const ScoreValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
`;

const ScorePercentage = styled.span`
  font-size: 14px;
  color: ${props => props.percent >= 80 ? '#4caf50' : props.percent >= 50 ? '#ff9800' : '#f44336'};
  margin-left: 4px;
`;

const QuestionsContainer = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const QuestionCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid #f1f5f9;
`;

const QuestionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
`;

const QuestionNumber = styled.div`
  min-width: 24px;
  height: 24px;
  background: var(--color-navy-light);
  color: var(--color-navy);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
`;

const QuestionText = styled.div`
  font-weight: 500;
  color: #334155;
  flex-grow: 1;
`;

const QuestionDescription = styled.div`
  color: #64748b;
  font-size: 14px;
  margin-left: 36px;
  margin-bottom: 16px;
`;

const QuestionResponseArea = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ResponseContainer = styled.div`
  flex: 1;
`;

const QuestionScoreBox = styled.div`
  background: #f8fafc;
  padding: 10px;
  border-radius: 6px;
  text-align: center;
  min-width: 100px;
  
  @media (max-width: 768px) {
    align-self: flex-end;
  }
`;

const ComplianceButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ComplianceButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${props => props.selected ? 'var(--color-navy-light)' : 'white'};
  color: ${props => props.selected ? 'var(--color-navy)' : '#64748b'};
  border: 1px solid ${props => props.selected ? 'var(--color-navy)' : '#e2e8f0'};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: var(--color-navy-light);
    color: var(--color-navy);
    border-color: var(--color-navy);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TextInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: var(--color-navy);
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
  
  &:disabled {
    background: #f8fafc;
    cursor: not-allowed;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RadioOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RadioInput = styled.input`
  cursor: pointer;
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const RadioLabel = styled.label`
  font-size: 14px;
  color: #334155;
  cursor: pointer;
`;

const SignatureArea = styled.div`
  margin-top: 8px;
`;

const SignatureBox = styled.div`
  width: 100%;
  cursor: pointer;
`;

const ClearButton = styled.button`
  background: white;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  
  &:hover {
    background: #f8fafc;
  }
`;

const SectionFooter = styled.div`
  padding: 16px;
  background: rgba(248, 250, 252, 0.5);
  border-top: 1px solid #e2e8f0;
`;

const FooterTitle = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: var(--color-navy);
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FooterContent = styled.div`
  display: flex;
  gap: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const InputLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

