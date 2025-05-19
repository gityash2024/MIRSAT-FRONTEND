import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  ArrowLeft, Clock, Calendar, Map, AlertTriangle, Edit,
  CheckCircle, XCircle, Activity, PaperclipIcon, Send, 
  Download, Info, CheckSquare, Camera, FileText, Loader,
  Circle, MoreHorizontal, Timer, PlayCircle, PauseCircle,
  File, ChevronUp, ChevronDown, MessageSquare, ChevronRight, ChevronLeft,
  Award, Clipboard, AlertCircle, Layers, HelpCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  fetchUserTaskDetails, 
  updateUserTaskProgress,
  addUserTaskComment,
  exportTaskReport,
  updateTaskQuestionnaire
} from '../../store/slices/userTasksSlice';
import { userTaskService } from '../../services/userTask.service';
import { useAuth } from '../../hooks/useAuth';
import Skeleton from '../../components/ui/Skeleton';

// Component Imports
import PreInspectionStepForm from './components/PreInspectionStepForm';
import QuestionnaireStepForm from './components/QuestionnaireStepForm';
import InspectionStepForm from './components/InspectionStepForm';

const PageContainer = styled.div`
  padding: 16px;
  background: linear-gradient(135degcomponents/, #f8fafc 0%, #eef2ff 100%);
  min-height: 100vh;
  
  @media (min-width: 768px) {
    padding: 28px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  color: var(--color-navy);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 10px 16px;
  margin-bottom: 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.9);
    color: #0d1186;
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Header = styled.div`
  background: rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(26, 35, 126, 0.08);
  margin-bottom: 28px;
  transition: all 0.4s ease;
  border: 1px solid rgba(255, 255, 255, 0.8);
  
  &:hover {
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1), 0 3px 10px rgba(26, 35, 126, 0.1);
    transform: translateY(-3px);
  }
  
  @media (min-width: 768px) {
    padding: 28px;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: var(--color-navy);
  margin-bottom: 12px;
  letter-spacing: -0.5px;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  
  @media (min-width: 768px) {
    font-size: 26px;
  }
`;

const Description = styled.p`
  color: #4b5563;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
  white-space: pre-wrap;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  ${props => {
    switch(props.status) {
      case 'pending':
        return `
          background: linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%);
          color: #e65100;
          border: 1px solid rgba(245, 124, 0, 0.2);
        `;
      case 'in_progress':
      case 'partial_compliance':
        return `
          background: linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%);
          color: #0069c0;
          border: 1px solid rgba(2, 136, 209, 0.2);
        `;
      case 'completed':
      case 'full_compliance':
        return `
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          color: #2e7d32;
          border: 1px solid rgba(56, 142, 60, 0.2);
        `;
      case 'incomplete':
      case 'non_compliance':
        return `
          background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
          color: #c62828;
          border: 1px solid rgba(211, 47, 47, 0.2);
        `;
      case 'not_applicable':
        return `
          background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
          color: #616161;
          border: 1px solid rgba(97, 97, 97, 0.2);
        `;
      default:
        return `
          background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
          color: #424242;
          border: 1px solid rgba(97, 97, 97, 0.2);
        `;
    }
  }}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1);
  }
  
  @media (min-width: 768px) {
    margin-left: 8px;
  }
`;

const PriorityBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  
  ${props => {
    switch(props.priority) {
      case 'high':
        return `
          background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
          color: #c62828;
          border: 1px solid rgba(211, 47, 47, 0.2);
        `;
      case 'medium':
        return `
          background: linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%);
          color: #e65100;
          border: 1px solid rgba(245, 124, 0, 0.2);
        `;
      case 'low':
        return `
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          color: #2e7d32;
          border: 1px solid rgba(46, 125, 50, 0.2);
        `;
      default:
        return `
          background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
          color: #424242;
          border: 1px solid rgba(97, 97, 97, 0.2);
        `;
    }
  }}
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  }
  
  margin-left: 6px;
`;

const ScoreCard = styled.div`
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
  border: 1px solid rgba(2, 136, 209, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
  
  .score-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #0069c0;
    margin-bottom: 12px;
  }
  
  .score-details {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    
    @media (min-width: 768px) {
      flex-direction: row;
    }
  }
  
  .score-item {
    flex: 1;
    background: rgba(255, 255, 255, 0.8);
    padding: 12px;
    border-radius: 8px;
    min-width: 120px;
    
    .label {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 4px;
    }
    
    .value {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-navy);
    }
  }
`;

const ProgressSection = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    background: rgba(255, 255, 255, 0.8);
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: rgba(224, 224, 224, 0.6);
  border-radius: 8px;
  overflow: hidden;
  margin-top: 10px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-navy) 0%, #5c6bc0 100%);
    border-radius: 8px;
    width: ${props => props.progress}%;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .progress-label {
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }
  
  .progress-percentage {
    font-size: 15px;
    font-weight: 700;
    color: var(--color-navy);
    background: rgba(255, 255, 255, 0.6);
    padding: 4px 10px;
    border-radius: 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 28px;
  transition: all 0.35s cubic-bezier(0.21, 0.6, 0.35, 1);
  border: 1px solid rgba(255, 255, 255, 0.7);
  
  &:hover {
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-4px);
  }
  
  @media (min-width: 768px) {
    padding: 28px;
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
`;

const TimerWidget = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.7);
  padding: 10px 20px;
  border-radius: 50px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-navy);
  margin-bottom: 15px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
  
  svg {
    color: var(--color-navy);
  }
  
  .timer-controls {
    display: flex;
    gap: 8px;
    margin-left: 10px;
  }
  
  .timer-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    
    &.pause {
      color: #f44336;
    }
    
    &.play {
      color: #4caf50;
    }
  }
`;

const DetailLayout = styled.div`
  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
  }
`;

const RightPanel = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  height: fit-content;
  margin-top: 20px;

  @media (min-width: 1024px) {
    margin-top: 0;
  }
`;

const RightPanelTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RightPanelSection = styled.div`
  margin-bottom: 24px;
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
  flex-wrap: wrap;
  gap: 16px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-navy);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  svg {
    color: var(--color-navy);
  }
`;

const StepBackButton = styled(ActionButton)`
  background: rgba(255, 255, 255, 0.8);
  color: var(--color-navy);
`;

const NextButton = styled(ActionButton)`
  background: linear-gradient(135deg, var(--color-navy) 0%, #3f51b5 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.2);
  
  &:hover {
    background: linear-gradient(135deg, #0d1186 0%, #303f9f 100%);
    color: white;
    box-shadow: 0 6px 16px rgba(26, 35, 126, 0.3);
  }
`;

const StartButton = styled(ActionButton)`
  background: linear-gradient(135deg, var(--color-navy) 0%, #3f51b5 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.2);
  
  &:hover {
    background: linear-gradient(135deg, #0d1186 0%, #303f9f 100%);
    color: white;
    box-shadow: 0 6px 16px rgba(26, 35, 126, 0.3);
  }
`;

const CompleteButton = styled(ActionButton)`
  background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
  
  &:hover {
    background: linear-gradient(135deg, #1b5e20 0%, #388e3c 100%);
    color: white;
    box-shadow: 0 6px 16px rgba(46, 125, 50, 0.3);
  }
`;

const ExportButton = styled(ActionButton)`
  background: linear-gradient(135deg, #0d47a1 0%, #2196f3 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(13, 71, 161, 0.2);
  
  &:hover {
    background: linear-gradient(135deg, #0a3880 0%, #1e88e5 100%);
    color: white;
    box-shadow: 0 6px 16px rgba(13, 71, 161, 0.3);
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: rgba(255, 245, 245, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(244, 67, 54, 0.2);
  
  h3 {
    font-size: 18px;
    color: #d32f2f;
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 14px;
    color: #616161;
    margin: 0;
  }
`;

const TaskDetailSection = styled.div`
  margin-bottom: 32px;
  background: rgba(248, 250, 252, 0.7);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(226, 232, 240, 0.7);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const StepperContainer = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const StepperWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  margin: 0 auto;
  max-width: 600px;
`;

const Step = styled.div`
  text-align: center;
  position: relative;
  z-index: 2;
`;

const StepCircle = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${props => props.active 
    ? 'var(--color-navy)' 
    : props.completed 
      ? '#4caf50' 
      : '#e0e0e0'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8px;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ? '0 0 0 3px rgba(26, 35, 126, 0.2)' : 'none'};
  
  &:hover {
    transform: ${props => props.clickable ? 'scale(1.1)' : 'none'};
  }
`;

const StepLabel = styled.div`
  font-size: 12px;
  color: ${props => props.active ? 'var(--color-navy)' : '#666'};
  font-weight: ${props => props.active ? 600 : 400};
`;

const StepConnector = styled.div`
  position: absolute;
  top: 15px;
  left: 0;
  right: 0;
  height: 2px;
  background: #e0e0e0;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: #4caf50;
    width: ${props => props.progress}%;
    transition: width 0.3s ease;
  }
`;

// Score display component
const ScoreSummary = styled.div`
  margin-top: 24px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(226, 232, 240, 0.7);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
`;

const ScoreTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ScoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

const ScoreItem = styled.div`
  background: white;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
  
  .score-label {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 8px;
  }
  
  .score-value {
    font-size: 20px;
    font-weight: 700;
    color: var(--color-navy);
  }
  
  .score-percent {
    font-size: 14px;
    color: #4caf50;
    margin-left: 5px;
  }
`;

const AssessmentSection = styled.div`
  margin-top: 24px;
`;

const AssessmentTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 12px;
`;

const AssessmentTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 16px;
  
  th, td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }
  
  th {
    background: rgba(26, 35, 126, 0.05);
    font-weight: 600;
    color: var(--color-navy);
  }
  
  tr:hover td {
    background: rgba(26, 35, 126, 0.02);
  }
  
  tr:last-child td {
    border-bottom: none;
  }
`;

// Tree view for questionnaire
const TreeContainer = styled.div`
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid rgba(226, 232, 240, 0.7);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
`;

const TreeItem = styled.div`
  position: relative;
  padding: 8px 0;
  margin-left: ${props => props.level * 20}px;

  &:hover {
    background: rgba(26, 35, 126, 0.02);
  }
`;

const TreeItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  background-color: ${props => props.active ? 'rgba(26, 35, 126, 0.05)' : 'transparent'};
  
  &:hover {
    background-color: rgba(26, 35, 126, 0.05);
  }
`;

const TreeItemText = styled.span`
  font-size: 14px;
  color: ${props => props.active ? 'var(--color-navy)' : '#4b5563'};
  font-weight: ${props => props.active ? '600' : '400'};
`;

const TreeItemIcon = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.active ? 'var(--color-navy)' : '#4b5563'};
`;

const QuestionnaireView = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 20px;
  }
`;

const ImageUploadContainer = styled.div`
  position: relative;
  max-height: 500px;
  overflow: auto;
  height: fit-content;
`;

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const StatusIcon = ({ status, size = 18 }) => {
  switch (status) {
    case 'pending':
      return <Clock size={size} color="#f57c00" />;
    case 'in_progress':
    case 'partial_compliance':
      return <Activity size={size} color="#0288d1" />;
    case 'completed':
    case 'full_compliance':
      return <CheckCircle size={size} color="#388e3c" />;
    case 'incomplete':
    case 'non_compliance':
      return <XCircle size={size} color="#d32f2f" />;
    case 'not_applicable':
      return <AlertCircle size={size} color="#9e9e9e" />;
    default:
      return <Clock size={size} color="#616161" />;
  }
};

const UserTaskDetailSkeleton = () => (
  <PageContainer>
    <BackButton disabled>
      <Skeleton.Circle size="18px" />
      <Skeleton.Base width="100px" height="16px" />
    </BackButton>
    
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.85)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(26, 35, 126, 0.08)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Skeleton.Base width="280px" height="28px" margin="0 0 8px 0" />
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Skeleton.Circle size="18px" />
              <Skeleton.Base width="100px" height="16px" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Skeleton.Circle size="18px" />
              <Skeleton.Base width="130px" height="16px" />
            </div>
          </div>
        </div>
        <Skeleton.Base width="120px" height="32px" radius="16px" />
      </div>
    </div>
    
    <div style={{ 
      display: 'flex', 
      gap: '10px', 
      marginBottom: '20px',
      background: 'rgba(255, 255, 255, 0.7)',
      padding: '10px',
      borderRadius: '12px'
    }}>
      {Array(3).fill().map((_, i) => (
        <Skeleton.Button key={i} width="120px" height="40px" radius="12px" />
      ))}
    </div>
    
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.85)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(26, 35, 126, 0.08)'
    }}>
      <Skeleton.Base width="200px" height="24px" margin="0 0 16px 0" />
      
      <div style={{ marginBottom: '24px' }}>
        <Skeleton.Base width="100%" height="80px" radius="8px" margin="0 0 16px 0" />
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {Array(4).fill().map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Skeleton.Circle size="16px" />
              <Skeleton.Base width="80%" height="16px" />
            </div>
          ))}
        </div>
      </div>
      
      <Skeleton.Base width="180px" height="24px" margin="0 0 16px 0" />
      
      <div style={{ display: 'grid', gap: '12px' }}>
        {Array(5).fill().map((_, i) => (
          <div key={i} style={{ 
            padding: '16px', 
            background: 'rgba(255, 255, 255, 0.5)', 
            borderRadius: '12px',
            marginLeft: `${Math.min(i, 2) * 20}px`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Skeleton.Circle size="18px" />
                <Skeleton.Base width={`${150 - Math.min(i, 2) * 20}px`} height="18px" />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Skeleton.Circle size="24px" />
                <Skeleton.Circle size="24px" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </PageContainer>
);

// New styled components for the tabbed interface
const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: none;
  border: none;
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.active ? 'var(--color-navy)' : '#64748b'};
  position: relative;
  cursor: pointer;
  white-space: nowrap;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.active ? 'var(--color-navy)' : 'transparent'};
    border-radius: 3px 3px 0 0;
    transition: all 0.2s ease;
  }
  
  &:hover {
    color: var(--color-navy);
  }
`;

const PageSelector = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const PageTitle = styled.div`
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
`;

const PageNavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: ${props => props.disabled ? '#f1f5f9' : 'white'};
  color: ${props => props.disabled ? '#94a3b8' : 'var(--color-navy)'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  box-shadow: ${props => props.disabled ? 'none' : '0 2px 6px rgba(0, 0, 0, 0.08)'};
  margin: 0 4px;
  
  &:hover:not(:disabled) {
    background: #f8fafc;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const PageIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 16px;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

// Add the missing styled component definitions
const MetaContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
  
  svg {
    color: var(--color-navy);
  }
`;

const ActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  @media (min-width: 768px) {
    align-items: flex-end;
  }
`;

// Add missing comment section components
const CommentSection = styled.div`
  margin-top: 32px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
`;

const CommentsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
`;

const CommentItem = styled.div`
  background: white;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const CommentAuthor = styled.div`
  font-weight: 600;
  color: var(--color-navy);
  font-size: 14px;
`;

const CommentTime = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const CommentText = styled.div`
  color: #334155;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
`;

const CommentForm = styled.form`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const CommentInput = styled.textarea`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  resize: none;
  height: 80px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: var(--color-navy);
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const SendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-navy);
  color: white;
  border: none;
  border-radius: 8px;
  width: 40px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #0d1186;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #64748b;
  
  svg {
    color: #94a3b8;
    margin-bottom: 16px;
  }
  
  h2 {
    color: var(--color-navy);
    margin-bottom: 8px;
    font-size: 20px;
  }
  
  p {
    margin-bottom: 16px;
    font-size: 14px;
  }
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--color-navy);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #0d1186;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(26, 35, 126, 0.2);
  }
`;

// New styled components for Inspection Template
const InspectionTemplateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const PageNavigation = styled.div`
  display: flex;
  align-items: center;
`;

const ExportButtonWrapper = styled.div`
  @media (max-width: 768px) {
    width: 100%;
    
    button {
      width: 100%;
      justify-content: center;
    }
  }
`;

const EmptyInspectionState = styled.div`
  padding: 40px 20px;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-navy);
    margin-bottom: 8px;
  }
  
  p {
    color: #64748b;
  }
`;

// Add this new component for the Final Report tab after the last styled component
const FinalReportSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;
`;

const ReportHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  border-bottom: 1px solid #edf2f7;
  padding-bottom: 16px;
`;

const ReportTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--color-navy);
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PerformanceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const PerformanceCard = styled.div`
  background: ${props => props.background || '#f8fafc'};
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  }
`;

const MetricTitle = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-navy);
`;

const MetricSubValue = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
`;

const ScoreProgress = styled.div`
  width: 100%;
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
  margin-top: 8px;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    width: ${props => props.value || 0}%;
    height: 100%;
    background-color: ${props => {
      if (props.value >= 80) return '#4caf50';
      if (props.value >= 60) return '#8bc34a';
      if (props.value >= 40) return '#ffc107';
      if (props.value >= 20) return '#ff9800';
      return '#f44336';
    }};
    border-radius: 4px;
    transition: width 0.3s ease;
  }
`;

const AssessmentAreaSection = styled.div`
  margin-bottom: 24px;
`;

const AreaTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AreaCard = styled.div`
  background: white;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
`;

const AreaHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #e2e8f0;
`;

const AreaName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #334155;
`;

const AreaScore = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => {
    if (props.percentage >= 80) return '#4caf50';
    if (props.percentage >= 60) return '#8bc34a';
    if (props.percentage >= 40) return '#ffc107';
    if (props.percentage >= 20) return '#ff9800';
    return '#f44336';
  }};
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dotted #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemName = styled.div`
  font-size: 13px;
  color: #475569;
  flex: 1;
`;

const ItemScore = styled.div`
  font-size: 13px;
  color: ${props => {
    if (props.percentage >= 80) return '#4caf50';
    if (props.percentage >= 60) return '#8bc34a';
    if (props.percentage >= 40) return '#ffc107';
    if (props.percentage >= 20) return '#ff9800';
    return '#f44336';
  }};
  font-weight: 500;
`;

const TaskMetricsSection = styled.div`
  margin-top: 32px;
`;

// Add these styled components for pre-inspection questionnaire
const PreInspectionContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-top: 24px;
  overflow: hidden;
`;

const PreInspectionHeader = styled.div`
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PreInspectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CompletionBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  background: ${props => props.incomplete ? 'rgba(255, 248, 225, 0.7)' : 'rgba(232, 245, 233, 0.7)'};
  color: ${props => props.incomplete ? '#f57c00' : '#2e7d32'};
  border: 1px solid ${props => props.incomplete ? 'rgba(245, 124, 0, 0.2)' : 'rgba(46, 125, 50, 0.2)'};
`;

const PreInspectionContent = styled.div`
  padding: 20px;
`;

const QuestionnaireItem = styled.div`
  display: flex;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px dashed #e2e8f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const QuestionNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--color-navy);
  color: white;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
  margin-top: 2px;
`;

const QuestionContent = styled.div`
  flex: 1;
`;

const QuestionText = styled.div`
  font-size: 14px;
  color: #334155;
  margin-bottom: 12px;
  font-weight: 500;
`;

const ResponseOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ResponseOption = styled.div`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  background: ${props => props.selected ? 'rgba(63, 81, 181, 0.1)' : 'white'};
  color: ${props => props.selected ? 'var(--color-navy)' : '#64748b'};
  border: 1px solid ${props => props.selected ? 'var(--color-navy)' : '#e2e8f0'};
  opacity: ${props => props.disabled && !props.selected ? 0.5 : 1};
`;

const QuestionResponse = styled.div`
  font-size: 14px;
  color: #475569;
  padding: 8px 0 0 36px;
  
  strong {
    font-weight: 600;
    color: #334155;
  }
`;

// Add this after the QuestionResponse component
const QuestionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
`;

const QuestionItem = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
`;

// Add scoring utility functions at the top of the file after the imports
// Function to calculate section score
const calculateSectionScore = (section, responses) => {
  if (!section || !section.questions || !responses) return { achieved: 0, total: 0 };
  
  let totalPoints = 0;
  let achievedPoints = 0;
  
  section.questions.forEach(question => {
    const maxScore = question.scoring?.max || 2;
    // Only count mandatory questions in the total score
    if (question.required !== false) {
      totalPoints += maxScore;
      
      const response = responses[question._id];
      if (response) {
        // Calculate achieved points based on response
        if (response === 'full_compliance' || response === 'yes' || response === 'Yes') {
          achievedPoints += maxScore;
        } else if (response === 'partial_compliance') {
          achievedPoints += (maxScore / 2);
        }
      }
    }
  });
  
  return { achieved: achievedPoints, total: totalPoints };
};

// Function to calculate page score
const calculatePageScore = (page, responses) => {
  if (!page || !page.sections) return { achieved: 0, total: 0 };
  
  let totalPoints = 0;
  let achievedPoints = 0;
  
  page.sections.forEach(section => {
    const sectionScore = calculateSectionScore(section, responses);
    totalPoints += sectionScore.total;
    achievedPoints += sectionScore.achieved;
  });
  
  return { achieved: achievedPoints, total: totalPoints };
};

// Function to calculate pre-inspection questionnaire score
const calculatePreInspectionScore = (questions, responses) => {
  if (!questions || !questions.length || !responses) return { achieved: 0, total: 0 };
  
  let totalPoints = 0;
  let achievedPoints = 0;
  
  questions.forEach(question => {
    const maxScore = question.scoring?.max || 2;
    // Only count mandatory questions in the total score
    if (question.required !== false) {
      totalPoints += maxScore;
      
      const response = responses[question._id];
      if (response) {
        // Calculate achieved points based on response
        if (response === 'full_compliance' || response === 'yes' || response === 'Yes') {
          achievedPoints += maxScore;
        } else if (response === 'partial_compliance') {
          achievedPoints += (maxScore / 2);
        }
      }
    }
  });
  
  return { achieved: achievedPoints, total: totalPoints };
};

const UserTaskDetail = () => {
  const dispatch = useDispatch();
  const { taskId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const commentBoxRef = useRef(null);
  const timerRef = useRef(null);
  const [expandedSubLevels, setExpandedSubLevels] = useState({});
  const [commentText, setCommentText] = useState('');
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [userClickedStep, setUserClickedStep] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  
  const {
    currentTask,
    loading,
    error,
    actionLoading
  } = useSelector((state) => state.userTasks);

  // New state variables for tabbed interface
  const [activeTab, setActiveTab] = useState('overview');
  const [activePage, setActivePage] = useState(0);
  
  // Add this new state for report data
  const [reportData, setReportData] = useState({
    completionRate: 0,
    timeSpent: 0,
    userProgress: 0,
    completedSubTasks: 0,
    totalSubTasks: 0,
    subLevelTimeSpent: {}
  });
  
  // Add state for scores calculation
  const [scores, setScores] = useState({
    total: 0,
    achieved: 0,
    percentage: 0,
    areas: []
  });
  
  // Add state for inspection pages
  const [inspectionPages, setInspectionPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  
  useEffect(() => {
    dispatch(fetchUserTaskDetails(taskId));
    
    if (location.state?.questionnaireCompleted) {
      setActiveStep(1);
      setUserClickedStep(true);
    }
  }, [dispatch, taskId, location.state]);
  
  useEffect(() => {
    if (currentTask && !userClickedStep) {
      if (currentTask.status === 'completed') {
        setActiveStep(2);
      } else if (currentTask.status === 'pending') {
        setActiveStep(0);
      } else if (currentTask.status === 'in_progress') {
        if (currentTask.questionnaireResponses && 
            Object.keys(currentTask.questionnaireResponses || {}).length > 0 &&
            currentTask.questionnaireCompleted) {
          setActiveStep(2);
        } else {
          setActiveStep(1);
        }
      }
    }
    
    // Set first category as selected by default
    if (currentTask && currentTask.questions && currentTask.questions.length > 0) {
      const categories = getQuestionCategories();
      if (categories.length > 0 && !selectedCategory) {
        setSelectedCategory(categories[0]);
      }
    }
  }, [currentTask, userClickedStep]);

  useEffect(() => {
    if (currentTask?.taskMetrics?.timeSpent) {
      setTimer(currentTask.taskMetrics.timeSpent * 3600);
    }
    
    if (currentTask?.status === 'in_progress') {
      startTimer();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentTask]);

  // After the existing code that fetches task details, add this to update report data
  useEffect(() => {
    if (currentTask && currentTask.taskMetrics) {
      // Extract and format metrics data for the report
      setReportData({
        completionRate: currentTask.taskMetrics.completionRate || 0,
        timeSpent: currentTask.taskMetrics.timeSpent || 0,
        userProgress: currentTask.taskMetrics.userProgress || 0,
        completedSubTasks: currentTask.progress ? 
          currentTask.progress.filter(p => 
            p.status === 'completed' || 
            p.status === 'full_compliance'
          ).length : 0,
        totalSubTasks: currentTask.taskMetrics.totalSubTasks || 
          (currentTask.progress ? currentTask.progress.length : 0),
        subLevelTimeSpent: currentTask.taskMetrics.subLevelTimeSpent || {}
      });
    }
  }, [currentTask]);

  // Calculate scores whenever the task changes
  useEffect(() => {
    if (currentTask) {
      calculateScores();
    }
  }, [currentTask]);

  // Fix the effect that processes inspection pages
  useEffect(() => {
    if (currentTask) {
      console.log('Checking for inspection data in task:', currentTask);
      
      let pagesToUse = [];
      
      // First check if inspectionLevel.pages exists in the API response
      if (currentTask.inspectionLevel && currentTask.inspectionLevel.pages) {
        console.log('Using pages from inspectionLevel.pages:', currentTask.inspectionLevel.pages);
        pagesToUse = currentTask.inspectionLevel.pages.map(page => ({
          _id: page._id,
          id: page._id,
          name: page.name,
          description: page.description,
          order: page.order,
          isCompleted: page.isCompleted,
          sections: Array.isArray(page.sections) ? page.sections.map(section => ({
            _id: section._id,
            id: section._id,
            name: section.name,
            description: section.description,
            order: section.order,
            isCompleted: section.isCompleted,
            questions: section.questions || []
          })) : []
        }));
      }
      // If not available but we have pages in the root of the task
      else if (currentTask.pages) {
        console.log('Using pages from task.pages:', currentTask.pages);
        pagesToUse = currentTask.pages.map(page => ({
          _id: page._id,
          id: page._id,
          name: page.name,
          description: page.description,
          order: page.order,
          isCompleted: page.isCompleted,
          sections: Array.isArray(page.sections) ? page.sections.map(section => ({
            _id: section._id,
            id: section._id,
            name: section.name,
            description: section.description,
            order: section.order,
            isCompleted: section.isCompleted,
            questions: section.questions || []
          })) : []
        }));
      }
      // Fallback to transforming levels if needed
      else if (currentTask.levels) {
        console.log('Converting levels to pages');
        // Create a compatible pages object from the task's levels structure
        pagesToUse = currentTask.levels.map(level => ({
          _id: level._id,
          id: level._id,
          name: level.name,
          description: level.description,
          order: level.order,
          isCompleted: level.isCompleted,
          sections: Array.isArray(level.subLevels) ? level.subLevels.map(section => ({
            _id: section._id,
            id: section._id,
            name: section.name,
            description: section.description,
            order: section.order,
            isCompleted: section.isCompleted,
            questions: section.questions || []
          })) : []
        }));
      }
      
      // Set the state with the formatted pages
      console.log('Setting inspectionPages state:', pagesToUse);
      setInspectionPages(pagesToUse);
      
      // If there are pages, set the first one as selected by default
      if (pagesToUse.length > 0) {
        const firstPageId = pagesToUse[0]._id || pagesToUse[0].id;
        console.log('Setting first page as selected:', firstPageId, pagesToUse[0].name);
        setSelectedPage(firstPageId);
        
        // If the first page has sections, set the first section as selected
        if (pagesToUse[0].sections && pagesToUse[0].sections.length > 0) {
          const firstSectionId = pagesToUse[0].sections[0]._id || pagesToUse[0].sections[0].id;
          console.log('Setting first section as selected:', firstSectionId, pagesToUse[0].sections[0].name);
          setSelectedSection(firstSectionId);
        }
      }
    }
  }, [currentTask]);
  
  const getQuestionCategories = () => {
    if (!currentTask || !currentTask.questions) return [];
    
    const categories = new Set();
    currentTask.questions.forEach(q => {
      categories.add(q.category || 'General');
    });
    
    return Array.from(categories);
  };
  
  const getQuestionsByCategoryAndLevel = (category) => {
    if (!currentTask || !currentTask.questions) return [];
    
    return currentTask.questions.filter(q => (q.category || 'General') === category);
  };

  const toggleSubLevel = (subLevelId) => {
    setExpandedSubLevels(prev => ({
      ...prev,
      [subLevelId]: !prev[subLevelId]
    }));
  };

  const handleStartTask = async () => {
    try {
      await userTaskService.startTask(taskId);
      toast.success('Task started successfully!');
      dispatch(fetchUserTaskDetails(taskId));
      setActiveStep(1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start task');
    }
  };

  const handleCompleteTask = async () => {
    try {
      await userTaskService.completeTask(taskId);
      toast.success('Task completed successfully!');
      dispatch(fetchUserTaskDetails(taskId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete task');
    }
  };

  const handleUpdateSubLevel = async (subLevelId, status) => {
    try {
      await dispatch(updateUserTaskProgress({
        taskId,
        subLevelId,
        status
      })).unwrap();
      
      toast.success(`Sublevel status updated`);
    } catch (error) {
      toast.error(error.message || 'Failed to update sublevel');
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    
    try {
      await dispatch(addUserTaskComment({
        taskId,
        comment: commentText
      })).unwrap();
      
      setCommentText('');
      
      if (commentBoxRef.current) {
        commentBoxRef.current.style.height = 'auto';
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add comment');
    }
  };

  const startTimer = () => {
    if (!timerRunning) {
      setTimerRunning(true);
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
  };

  const stopTimer = () => {
    if (timerRunning) {
      setTimerRunning(false);
      clearInterval(timerRef.current);
    }
  };

  const handleExportReport = async () => {
    try {
      toast.loading('Generating report...');
      const result = await dispatch(exportTaskReport(taskId)).unwrap();
      
      if (result.url) {
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = result.url;
        link.setAttribute('download', `inspection_report_${taskId}.pdf`);
        document.body.appendChild(link);
        
        // Trigger the download
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        toast.dismiss();
        toast.success('Report downloaded successfully');
      } else {
        toast.dismiss();
        toast.error('Failed to generate report: No URL returned');
      }
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed to export report: ${error.message || 'Unknown error'}`);
    }
  };
  
  
  const calculateStepperProgress = () => {
    if (!currentTask) return 0;

    // We now have 2 steps instead of 3
    if (currentTask.status === 'completed') {
      return 100; // All steps completed
    }

    let progress = 0;
    if (currentTask.status === 'in_progress') {
      progress = 50; // Task started

      if (currentTask.questionnaireCompleted) {
        progress = 75; // Questionnaire completed
      }

      if (currentTask.overallProgress > 0) {
        progress = 50 + (currentTask.overallProgress / 2);
      }
    }

    return progress;
  };
  
  const canNavigateToStep = (stepIndex) => {
    if (!currentTask) return false;

    if (stepIndex === 0) return true; // Can always go to task details

    if (stepIndex === 1) {
      // Can go to inspection if task is started or completed
      return currentTask.status === 'in_progress' || currentTask.status === 'completed';
    }

    return false;
  };
  
  const isStepComplete = (stepIndex) => {
    if (!currentTask) return false;
    
    if (stepIndex === 0) {
      return currentTask.status !== 'pending';
    }
    
    if (stepIndex === 1) {
      return currentTask.status === 'completed';
    }
    
    return false;
  };

  const renderStepper = () => {
    const steps = [
      { label: 'Task Details', icon: <Info size={14} /> },
      { label: 'Inspection', icon: <Activity size={14} /> }
    ];
    
    const progress = calculateStepperProgress();
    
    return (
      <StepperContainer>
        <StepperWrapper>
          <StepConnector progress={progress} />
          
          {steps.map((step, index) => (
            <Step key={index}>
              <StepCircle 
                active={activeStep === index} 
                completed={isStepComplete(index)}
                clickable={canNavigateToStep(index)}
                onClick={() => {
                  if (canNavigateToStep(index)) {
                    setActiveStep(index);
                    setUserClickedStep(true);
                  }
                }}
              >
                {isStepComplete(index) 
                  ? <CheckCircle size={16} /> 
                  : (index + 1)}
              </StepCircle>
              <StepLabel active={activeStep === index}>{step.label}</StepLabel>
            </Step>
          ))}
        </StepperWrapper>
      </StepperContainer>
    );
  };
  
  // Function to calculate overall score and details
  const calculateScores = () => {
    if (!currentTask) return { total: 0, achieved: 0, percentage: 0, areas: [] };
    
    // Calculate questionnaire scores
    let totalQuestionPoints = 0;
    let achievedQuestionPoints = 0;
    
    if (currentTask.questions && currentTask.questionnaireResponses) {
      const responses = currentTask.questionnaireResponses;
      const questions = currentTask.questions.filter(q => q.mandatory !== false);
      
      questions.forEach(question => {
        const questionId = question._id || question.id;
        const responseKey = Object.keys(responses).find(key => 
          key.includes(questionId) || key.endsWith(questionId)
        );
        
        if (responseKey) {
          const response = responses[responseKey];
          const weight = question.weight || 1;
          const maxScore = question.scoring?.max || 2; // Default max score is 2
          
          // Handle N/A responses properly - they should not affect the score
          if (response === 'na' || response === 'not_applicable' || response === 'N/A') {
            // Don't include N/A questions in the total or achieved points
            return; // Skip to the next question
          }
          
          // Add the question's possible points to the total
          totalQuestionPoints += (maxScore * weight);
          
          // Calculate points achieved based on response
          if (response === 'full_compliance' || response === 'yes' || response === 'Yes') {
            achievedQuestionPoints += (maxScore * weight);
          } else if (response === 'partial_compliance') {
            achievedQuestionPoints += (maxScore / 2 * weight); // Half of max score for partial compliance
          }
        }
      });
    }
    
    // Calculate checkpoint scores
    let totalCheckpoints = 0;
    let completedCheckpoints = 0;
    let notApplicableCheckpoints = 0;
    
    if (currentTask.progress) {
      // Count all checkpoints except those marked as "not_applicable"
      totalCheckpoints = currentTask.progress.filter(p => p.status !== 'not_applicable').length;
      completedCheckpoints = currentTask.progress.filter(p => p.status === 'completed' || p.status === 'full_compliance').length;
      notApplicableCheckpoints = currentTask.progress.filter(p => p.status === 'not_applicable').length;
    }
    
    // Calculate assessment area scores
    const assessmentAreas = currentTask.assessmentAreas || [];
    
    // Calculate total score - each checkpoint is worth 2 points max
    const totalPoints = totalQuestionPoints + (totalCheckpoints * 2);
    const achievedPoints = achievedQuestionPoints + (completedCheckpoints * 2);
    const percentage = totalPoints > 0 ? Math.round((achievedPoints / totalPoints) * 100) : 0;
    
    const result = {
      total: totalPoints,
      achieved: achievedPoints,
      percentage,
      areas: assessmentAreas,
      notApplicable: notApplicableCheckpoints // Track N/A checkpoints for reference
    };
    
    // Update the scores state
    setScores(result);
    
    return result;
  };

  // Add a useEffect to initialize inspectionPages
  useEffect(() => {
    if (currentTask?.levels && currentTask.levels.length > 0 && !inspectionPages.length) {
      console.log('Initializing inspection pages from:', currentTask.levels);
      
      const formattedPages = currentTask.levels.map(level => {
        const sections = level.sections || [];
        return {
          id: level._id,
          name: level.name,
          sections: sections.map(section => ({
            id: section._id,
            name: section.name,
            questions: section.questions || []
          }))
        };
      });
      
      console.log('Formatted inspection pages:', formattedPages);
      setInspectionPages(formattedPages);
      
      // If there are pages, set the first one as selected by default
      if (formattedPages.length > 0) {
        setSelectedPage(formattedPages[0].id);
        
        // If the first page has sections, set the first section as selected
        if (formattedPages[0].sections && formattedPages[0].sections.length > 0) {
          setSelectedSection(formattedPages[0].sections[0].id);
        }
      }
    }
  }, [currentTask]);

  // Add cleanup effect
  useEffect(() => {
    // This effect runs when the component unmounts
    return () => {
      console.log('Component unmounting, cleaning up states');
      setInspectionPages([]);
      setSelectedPage(null);
      setSelectedSection(null);
      setScores({
        total: 0,
        achieved: 0,
        percentage: 0,
        areas: []
      });
    };
  }, []);

  // Update renderQuestionnaire to show page scores
  const renderQuestionnaire = () => {
    console.log('Rendering questionnaire with:');
    console.log('- inspectionPages:', inspectionPages.map(p => ({ id: p.id, _id: p._id, name: p.name })));
    console.log('- inspectionPages length:', inspectionPages.length);
    console.log('- Selected page ID:', selectedPage);
    console.log('- Selected section ID:', selectedSection);
    
    if (!currentTask || inspectionPages.length === 0) {
      console.log('No inspection pages found, rendering empty state');
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>No inspection pages found for this task.</p>
        </div>
      );
    }

    // Find the selected page - check both id and _id properties
    const page = inspectionPages.find(p => 
      (p.id && p.id === selectedPage) || 
      (p._id && p._id === selectedPage)
    );
    
    console.log('Found selected page:', page ? { 
      id: page.id, 
      _id: page._id, 
      name: page.name, 
      sections: page.sections?.length 
    } : null);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
        {/* Pages tabs */}
        <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', flexWrap: 'wrap' }}>
          {inspectionPages.map((page, pageIdx) => {
            const pageId = page.id || page._id;
            const isActive = selectedPage === pageId;
            const pageScore = calculatePageScore(page, currentTask.questionnaireResponses || {});
            
            return (
              <div
                key={pageId}
                onClick={() => {
                  console.log('Clicking on page:', page.name, 'with ID:', pageId);
                  setSelectedPage(pageId);
                  if (page.sections && page.sections.length > 0) {
                    const firstSectionId = page.sections[0].id || page.sections[0]._id;
                    console.log('Setting first section:', page.sections[0].name, 'with ID:', firstSectionId);
                    setSelectedSection(firstSectionId);
                  }
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  backgroundColor: isActive ? '#4299e1' : '#e2e8f0',
                  color: isActive ? 'white' : 'black',
                  cursor: 'pointer',
                  fontWeight: isActive ? 'bold' : 'normal',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>{`${pageIdx + 1}. ${page.name}`}</span>
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.2)' : '#e6f0fa',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: isActive ? 'white' : '#1e40af',
                }}>
                  {pageScore.achieved}/{pageScore.total}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Page content */}
        {page ? (
          <div>
            <InspectionSection
              page={page}
              selectedSection={selectedSection}
              setSelectedSection={setSelectedSection}
              task={currentTask}
              onSaveResponse={handleSaveInspectionResponse}
            />
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  const pageId = page.id || page._id;
                  console.log('Marking page as complete:', pageId);
                  handleCompletePage(pageId);
                }}
                disabled={currentTask.status === 'completed'}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4299e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentTask.status === 'completed' ? 'default' : 'pointer',
                  opacity: currentTask.status === 'completed' ? 0.7 : 1,
                }}
              >
                Mark Page as Complete
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>No page selected. Please select a page from above.</p>
          </div>
        )}
      </div>
    );
  };

  // Completely rewrite the InspectionSection component to fix all issues
  const InspectionSection = ({ page, selectedSection, setSelectedSection, task, onSaveResponse }) => {
    console.log('InspectionSection props:', { 
      page: page ? { id: page.id, _id: page._id, name: page.name, sections: page.sections?.length } : null, 
      selectedSection 
    });
    
    const handleSelectSection = (sectionId) => {
      console.log('Selecting section with ID:', sectionId);
      setSelectedSection(sectionId);
    };
    
    if (!page || !page.sections || page.sections.length === 0) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>No sections found for this page.</p>
        </div>
      );
    }
    
    // Calculate page score
    const pageScore = calculatePageScore(page, task.questionnaireResponses || {});
    
    // Find the selected section - check both id and _id properties
    const section = page.sections.find(s => 
      (s.id && s.id === selectedSection) || 
      (s._id && s._id === selectedSection)
    );
    
    console.log('Found selected section:', section ? { 
      id: section.id, 
      _id: section._id, 
      name: section.name, 
      questions: section.questions?.length 
    } : null);
    
    // Calculate section score if section is selected
    const sectionScore = section 
      ? calculateSectionScore(section, task.questionnaireResponses || {})
      : { achieved: 0, total: 0 };
    
    // Find the index of the selected section for numbering
    const sectionIndex = section 
      ? page.sections.findIndex(s => (s.id === section.id || s._id === section._id))
      : -1;
    
    // Page identifier for numbering (using first letter of page name)
    const pageIdentifier = page.name ? page.name.charAt(0).toUpperCase() : 'P';
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Page Title with Score */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <h3>{page.name}</h3>
          <div style={{ 
            background: '#f0f9ff', 
            padding: '4px 12px', 
            borderRadius: '50px',
            border: '1px solid #93c5fd',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#1e40af'
          }}>
            Score: {pageScore.achieved}/{pageScore.total}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Section list */}
          <div style={{ width: '250px', borderRight: '1px solid #e2e8f0', paddingRight: '15px' }}>
            <h4 style={{ marginBottom: '10px' }}>Sections</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {page.sections.map((section, idx) => {
                const sectionId = section.id || section._id;
                const isActive = selectedSection === sectionId;
                const sectionScore = calculateSectionScore(section, task.questionnaireResponses || {});
                
                return (
                  <div
                    key={sectionId}
                    onClick={() => handleSelectSection(sectionId)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '4px',
                      backgroundColor: isActive ? '#4299e1' : '#f7fafc',
                      color: isActive ? 'white' : 'black',
                      cursor: task.status === 'completed' ? 'default' : 'pointer',
                      fontWeight: isActive ? 'bold' : 'normal',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      transition: 'background-color 0.2s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>{`${pageIdentifier}.${idx + 1}. ${section.name}`}</span>
                    <span style={{
                      background: isActive ? 'rgba(255,255,255,0.2)' : '#e6f0fa',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: isActive ? 'white' : '#1e40af',
                    }}>
                      {sectionScore.achieved}/{sectionScore.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Questions for selected section */}
          <div style={{ flex: 1 }}>
            {section ? (
              <>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '15px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <h4>{`${pageIdentifier}.${sectionIndex + 1}. ${section.name}`}</h4>
                  <div style={{ 
                    background: '#f0f9ff', 
                    padding: '4px 12px', 
                    borderRadius: '50px',
                    border: '1px solid #93c5fd',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#1e40af'
                  }}>
                    Score: {sectionScore.achieved}/{sectionScore.total}
                  </div>
                </div>
                
                {section.questions && section.questions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {section.questions.map((question, qIndex) => {
                      const response = task.questionnaireResponses && task.questionnaireResponses[question._id];
                      const maxScore = question.scoring?.max || 2;
                      
                      // Calculate achieved score
                      let achievedScore = 0;
                      if (response) {
                        if (response === 'full_compliance' || response === 'yes' || response === 'Yes') {
                          achievedScore = maxScore;
                        } else if (response === 'partial_compliance') {
                          achievedScore = maxScore / 2;
                        }
                      }
                      
                      return (
                        <div key={question._id || qIndex} style={{ 
                          padding: '15px', 
                          borderRadius: '8px', 
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#f8fafc' 
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            marginBottom: '10px',
                          }}>
                            <div style={{ 
                              fontWeight: 'bold',
                              flex: 1
                            }}>
                              <span style={{ marginRight: '8px' }}>
                                {`${pageIdentifier}.${sectionIndex + 1}.${qIndex + 1}.`}
                              </span>
                              {question.text}
                              
                              {/* Mandatory or Recommended badge */}
                              {question.required !== false && (
                                <span style={{
                                  display: 'inline-block',
                                  marginLeft: '8px',
                                  background: '#fef3c7',
                                  color: '#92400e',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  verticalAlign: 'middle',
                                }}>
                                  Mandatory
                                </span>
                              )}
                              
                              {question.required === false && (
                                <span style={{
                                  display: 'inline-block',
                                  marginLeft: '8px',
                                  background: '#e0f2fe',
                                  color: '#0369a1',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  verticalAlign: 'middle',
                                }}>
                                  Recommended
                                </span>
                              )}
                            </div>
                            
                            {/* Question Score */}
                            {question.scoring?.enabled !== false && (
                              <div style={{ 
                                background: response ? '#f0fdf4' : '#f7fee7', 
                                padding: '4px 12px', 
                                borderRadius: '50px',
                                border: response ? '1px solid #86efac' : '1px solid #d9f99d',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: response ? '#166534' : '#3f6212',
                                whiteSpace: 'nowrap',
                                marginLeft: '10px'
                              }}>
                                {achievedScore}/{maxScore}
                              </div>
                            )}
                          </div>
                          
                          {renderQuestionInput(question, task, onSaveResponse)}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <p>No questions found in this section.</p>
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Please select a section to view questions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Update the renderQuestionInput function to properly handle all question types
  const renderQuestionInput = (question, task, onSaveResponse) => {
    console.log('Rendering question input for:', question);
    console.log('Response:', task.questionnaireResponses?.[question._id]);
    
    const response = task.questionnaireResponses?.[question._id];
    const isDisabled = task.status === 'completed';
    const questionType = question.type || question.answerType;
    
    console.log('Question type:', questionType);
    
    switch (questionType) {
      case 'compliance':
        return (
          <ResponseOptions>
            {question.options && question.options.map((option, optIndex) => (
              <ResponseOption 
                key={optIndex}
                selected={response === option}
                disabled={isDisabled}
                onClick={() => !isDisabled && onSaveResponse(question._id, option)}
                style={{ cursor: isDisabled ? 'default' : 'pointer' }}
              >
                {option}
              </ResponseOption>
            ))}
          </ResponseOptions>
        );
        
      case 'radio':
        return (
          <ResponseOptions>
            {question.options && question.options.map((option, optIndex) => (
              <ResponseOption 
                key={optIndex}
                selected={response === option}
                disabled={isDisabled}
                onClick={() => !isDisabled && onSaveResponse(question._id, option)}
                style={{ cursor: isDisabled ? 'default' : 'pointer' }}
              >
                {option}
              </ResponseOption>
            ))}
          </ResponseOptions>
        );
        
      case 'checkbox':
        // For checkboxes, responses should be an array
        const selectedOptions = Array.isArray(response) ? response : response ? [response] : [];
        console.log('Selected checkbox options:', selectedOptions);
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {question.options && question.options.map((option, optIndex) => (
              <label 
                key={optIndex} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  cursor: isDisabled ? 'default' : 'pointer' 
                }}
              >
                <input 
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={() => {
                    if (isDisabled) return;
                    
                    let newSelected;
                    if (selectedOptions.includes(option)) {
                      newSelected = selectedOptions.filter(item => item !== option);
                    } else {
                      newSelected = [...selectedOptions, option];
                    }
                    onSaveResponse(question._id, newSelected);
                  }}
                  disabled={isDisabled}
                />
                {option}
              </label>
            ))}
          </div>
        );
        
      case 'dropdown':
        return (
          <div>
            <select
              value={response || ''}
              onChange={(e) => !isDisabled && onSaveResponse(question._id, e.target.value)}
              disabled={isDisabled}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                fontSize: '14px'
              }}
            >
              <option value="">Select an option</option>
              {question.options && question.options.map((option, optIndex) => (
                <option key={optIndex} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
        
      case 'date':
        return (
          <div>
            <input
              type="date"
              value={response || ''}
              onChange={(e) => !isDisabled && onSaveResponse(question._id, e.target.value)}
              disabled={isDisabled}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                fontSize: '14px'
              }}
            />
          </div>
        );
        
      case 'signature':
        // For simplicity, using text for signature - in a real app, would use a signature pad
        return (
          <div>
            <input
              type="text"
              placeholder="Type your signature"
              value={response || ''}
              onChange={(e) => !isDisabled && onSaveResponse(question._id, e.target.value)}
              disabled={isDisabled}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                fontSize: '14px'
              }}
            />
          </div>
        );
        
      default:
        console.log('Unknown question type:', questionType);
        return (
          <div>
            <input
              type="text"
              placeholder="Enter your response"
              value={response || ''}
              onChange={(e) => !isDisabled && onSaveResponse(question._id, e.target.value)}
              disabled={isDisabled}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                fontSize: '14px'
              }}
            />
          </div>
        );
    }
  };

  // Update the handleSaveInspectionResponse function to fix the API error
  const handleSaveInspectionResponse = async (questionId, value) => {
    if (!currentTask || currentTask.status === 'completed') {
      console.log('Task is completed or not available, cannot save response');
      return;
    }
    
    console.log('Saving response for question:', questionId, 'Value:', value);
    
    try {
      const currentResponses = currentTask.questionnaireResponses || {};
      const updatedResponses = {
        ...currentResponses,
        [questionId]: value
      };
      
      console.log('Updated responses:', updatedResponses);
      
      await dispatch(updateTaskQuestionnaire({
        taskId: currentTask._id,
        questionnaire: {
          responses: updatedResponses,
          notes: currentTask.questionnaireNotes || '',
          completed: false // Don't auto-complete the entire questionnaire
        }
      })).unwrap();
      
      toast.success('Response saved successfully');
      await dispatch(fetchUserTaskDetails(currentTask._id));
    } catch (error) {
      console.error('Error saving response:', error);
      toast.error(`Failed to save response: ${error.message || 'Unknown error'}`);
    }
  };

  // Update handleCompletePage function to correctly handle the API parameters
  const handleCompletePage = async (pageId) => {
    if (!currentTask || currentTask.status === 'completed') {
      console.log('Task is completed or not available, cannot mark page as complete');
      return;
    }
    
    console.log('Marking page as complete. Page ID:', pageId, 'Task ID:', currentTask._id);
    
    try {
      // The API expects subLevelId, not levelId
      const result = await dispatch(updateUserTaskProgress({
        taskId: currentTask._id,
        subLevelId: pageId,
        status: 'completed'
      })).unwrap();
      
      console.log('Page completion result:', result);
      toast.success('Page marked as completed');
      await dispatch(fetchUserTaskDetails(currentTask._id));
    } catch (error) {
      console.error('Error completing page:', error);
      toast.error(`Failed to mark page as complete: ${error.message || 'Unknown error'}`);
    }
  };

  // Add this function before renderStepContent() to render pre-inspection questionnaire
  const renderPreInspectionQuestionnaire = () => {
    if (!currentTask?.preInspectionQuestions || currentTask.preInspectionQuestions.length === 0) {
      return null;
    }
    
    // Calculate total score for pre-inspection questionnaire
    const preInspectionScore = calculatePreInspectionScore(
      currentTask.preInspectionQuestions, 
      currentTask.questionnaireResponses || {}
    );
    
    return (
      <PreInspectionContainer>
        <PreInspectionHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PreInspectionTitle>
              <CheckSquare size={18} />
              Pre-Inspection Questionnaire
            </PreInspectionTitle>
            
            <div style={{ 
              background: '#f0f9ff', 
              padding: '4px 12px', 
              borderRadius: '50px',
              border: '1px solid #93c5fd',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#1e40af'
            }}>
              Score: {preInspectionScore.achieved}/{preInspectionScore.total}
            </div>
          </div>
          
          {currentTask.questionnaireCompleted ? (
            <CompletionBadge>
              <CheckCircle size={16} />
              Completed
            </CompletionBadge>
          ) : (
            <CompletionBadge incomplete>
              <AlertCircle size={16} />
              Incomplete
            </CompletionBadge>
          )}
        </PreInspectionHeader>
        
        <PreInspectionContent>
          {currentTask.preInspectionQuestions.map((question, index) => {
            const response = currentTask.questionnaireResponses?.[question._id];
            const maxScore = question.scoring?.max || 2;
            
            // Calculate achieved score
            let achievedScore = 0;
            if (response) {
              if (response === 'full_compliance' || response === 'yes' || response === 'Yes') {
                achievedScore = maxScore;
              } else if (response === 'partial_compliance') {
                achievedScore = maxScore / 2;
              }
            }
            
            return (
              <QuestionnaireItem key={index}>
                <QuestionNumber>{index + 1}</QuestionNumber>
                <QuestionContent>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '12px',
                  }}>
                    <div style={{ flex: 1 }}>
                      <QuestionText>
                        {question.text}
                        
                        {/* Mandatory or Recommended badge */}
                        {question.required !== false && (
                          <span style={{
                            display: 'inline-block',
                            marginLeft: '8px',
                            background: '#fef3c7',
                            color: '#92400e',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            verticalAlign: 'middle',
                          }}>
                            Mandatory
                          </span>
                        )}
                        
                        {question.required === false && (
                          <span style={{
                            display: 'inline-block',
                            marginLeft: '8px',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            verticalAlign: 'middle',
                          }}>
                            Recommended
                          </span>
                        )}
                      </QuestionText>
                    </div>
                    
                    {/* Question Score */}
                    {question.scoring?.enabled !== false && (
                      <div style={{ 
                        background: response ? '#f0fdf4' : '#f7fee7', 
                        padding: '4px 12px', 
                        borderRadius: '50px',
                        border: response ? '1px solid #86efac' : '1px solid #d9f99d',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: response ? '#166534' : '#3f6212',
                        whiteSpace: 'nowrap',
                        marginLeft: '10px'
                      }}>
                        {achievedScore}/{maxScore}
                      </div>
                    )}
                  </div>
                  
                  <ResponseOptions>
                    {question.options && question.options.map((option, optIndex) => (
                      <ResponseOption 
                        key={optIndex}
                        selected={response === option}
                        disabled={currentTask.status === 'completed'}
                        onClick={() => handleSaveInspectionResponse(question._id, option)}
                        style={{ cursor: currentTask.status === 'completed' ? 'default' : 'pointer' }}
                      >
                        {option}
                      </ResponseOption>
                    ))}
                  </ResponseOptions>
                </QuestionContent>
              </QuestionnaireItem>
            );
          })}
        </PreInspectionContent>
      </PreInspectionContainer>
    );
  };

  // Update renderStepContent() function case 0 to include pre-inspection questionnaire
  const renderStepContent = () => {
    if (!currentTask) return null;
    
    switch (activeStep) {
      case 0:
        return (
          <>
            <PreInspectionStepForm task={currentTask} />
            
            {/* Add Pre-Inspection Questionnaire Section */}
            {renderPreInspectionQuestionnaire()}
            
            {/* Display scoring summary if task is in progress or completed */}
            {/* ... rest of existing code ... */}
          </>
        );
      
      // ... other cases ...
    }
  };
  
  // ... rest of component ...

  if (loading || (!error && !currentTask)) {
    return (
      <PageContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '5px solid #f3f3f3',
            borderTop: '5px solid var(--color-navy)', 
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{ fontSize: '16px', color: 'var(--color-navy)', fontWeight: '500' }}>
            Loading task details...
          </div>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <BackButton onClick={() => navigate('/user-tasks')}>
          <ArrowLeft size={18} />
          Back to Tasks
        </BackButton>
        <Header>
          <ErrorContainer>
            <AlertTriangle size={40} color="#d32f2f" />
            <div>
              <h3>Error Loading Task</h3>
              <p>{error}</p>
            </div>
          </ErrorContainer>
        </Header>
      </PageContainer>
    );
  }

  if (!currentTask) {
    return (
      <PageContainer>
        <BackButton onClick={() => navigate('/user-tasks')}>
          <ArrowLeft size={18} />
          Back to Tasks
        </BackButton>
        <Header>
          <ErrorContainer>
            <AlertTriangle size={40} color="#d32f2f" />
            <div>
              <h3>Task Not Found</h3>
              <p>The task you are looking for does not exist.</p>
            </div>
          </ErrorContainer>
        </Header>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BackButton onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
        Back to Tasks
      </BackButton>
      
      {loading ? (
        <UserTaskDetailSkeleton />
      ) : currentTask ? (
        <>
          <Header>
            <HeaderContent>
              <TitleSection>
                <Title>
                  {currentTask.name}
                  <StatusBadge status={currentTask.status}>
                    <StatusIcon status={currentTask.status} />
                    {currentTask.status === 'pending' && 'Pending'}
                    {currentTask.status === 'in_progress' && 'In Progress'}
                    {currentTask.status === 'completed' && 'Completed'}
                  </StatusBadge>
                </Title>
                {currentTask.description && (
                  <Description>{currentTask.description}</Description>
                )}
                <MetaContainer>
                  {currentTask.dueDate && (
                    <MetaItem>
                      <Calendar size={16} />
                      <span>Due Date: {formatDate(currentTask.dueDate)}</span>
                    </MetaItem>
                  )}
                  {currentTask.location && (
                    <MetaItem>
                      <Map size={16} />
                      <span>Location: {currentTask.location}</span>
                    </MetaItem>
                  )}
                  {currentTask.inspectionType && (
                    <MetaItem>
                      <Clipboard size={16} />
                      <span>Type: {currentTask.inspectionType}</span>
                    </MetaItem>
                  )}
                  {currentTask.priority && (
                    <MetaItem>
                      <AlertTriangle size={16} />
                      <span>Priority: {currentTask.priority}</span>
                      <PriorityBadge priority={currentTask.priority}>
                        {currentTask.priority}
                      </PriorityBadge>
                    </MetaItem>
                  )}
                </MetaContainer>
              </TitleSection>
              <ActionContainer>
                <ButtonGroup>
                  <ActionButton 
                    onClick={handleExportReport}
                    disabled={currentTask.status === 'pending'}
                  >
                    <Download size={16} />
                    Export Report
                  </ActionButton>
                </ButtonGroup>
              </ActionContainer>
            </HeaderContent>
          </Header>
          
          <TabsContainer>
            <TabButton 
              active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')}
            >
              <Info size={18} />
              Overview
            </TabButton>
            <TabButton 
              active={activeTab === 'inspection'} 
              onClick={() => setActiveTab('inspection')}
              disabled={currentTask?.status === 'pending'}
            >
              <CheckSquare size={16} />
              Inspection
            </TabButton>
            <TabButton 
              active={activeTab === 'report'} 
              onClick={() => setActiveTab('report')}
              disabled={currentTask?.status === 'pending'}
            >
              <FileText size={16} />
              Final Report
            </TabButton>
          </TabsContainer>
          
          {(() => {
            switch (activeTab) {
              case 'overview':
                return (
                  <TaskDetailSection>
                    <SectionTitle>Task Overview</SectionTitle>
                    <PreInspectionStepForm task={currentTask} />
                    
                    {/* Add Pre-Inspection Questionnaire Section */}
                    {renderPreInspectionQuestionnaire()}
                    
                    {/* Display button to start task if pending */}
                    {(currentTask.status === 'pending' || !currentTask.status) && (
                      <ButtonContainer>
                        <NextButton onClick={handleStartTask} disabled={actionLoading}>
                          Start Inspection
                          <ChevronRight size={16} />
                        </NextButton>
                      </ButtonContainer>
                    )}
                    
                    {/* Button to continue inspection if in progress */}
                    {currentTask.status === 'in_progress' && (
                      <ButtonContainer>
                        <NextButton onClick={() => setActiveTab('inspection')} disabled={actionLoading}>
                          Continue Inspection
                          <ChevronRight size={16} />
                        </NextButton>
                      </ButtonContainer>
                    )}
                  </TaskDetailSection>
                );
                
              case 'inspection':
                return (
                  <>
                    <TaskDetailSection>
                      <SectionTitle>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Clipboard size={20} />
                          Inspection Task
                        </span>
                        {currentTask.status !== 'completed' && (
                          <ActionButton 
                            onClick={() => handleCompleteTask()}
                            style={{ marginLeft: 'auto' }}
                          >
                            <CheckCircle size={16} />
                            Mark Inspection as Complete
                          </ActionButton>
                        )}
                      </SectionTitle>
                      <p style={{
                        color: '#64748b',
                        fontSize: '14px',
                        marginBottom: '16px'
                      }}>
                        Complete all sections of the inspection to mark the task as finished.
                      </p>
                    </TaskDetailSection>
                    
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        marginBottom: '16px',
                        color: 'var(--color-navy)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px' 
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckSquare size={20} />
                          Inspection Questionnaire
                        </div>
                        {currentTask.status !== 'completed' && selectedCategory && (
                          <ActionButton 
                            onClick={() => {
                              // Find the page in the inspectionPages state using selectedCategory
                              const page = inspectionPages.find(p => p.name === selectedCategory);
                              console.log('Found page for completion:', page);
                              if (page) {
                                handleCompletePage(page._id || page.id);
                              } else {
                                toast.error('Could not find the selected page');
                              }
                            }}
                            style={{ fontSize: '14px' }}
                          >
                            <CheckCircle size={16} />
                            Mark Page as Complete
                          </ActionButton>
                        )}
                      </h3>
                      
                      {renderQuestionnaire()}
                    </div>
                    
                    {/* Display scoring summary for inspection phase */}
                    {(currentTask.status === 'in_progress' || currentTask.status === 'completed') && (
                      <ScoreSummary>
                        <ScoreTitle>
                          <Award size={20} color="var(--color-navy)" />
                          Inspection Scoring Summary
                        </ScoreTitle>
                        
                        <ScoreGrid>
                          <ScoreItem>
                            <div className="score-label">Compliance Score</div>
                            <div className="score-value">
                              {scores.achieved} / {scores.total}
                              <span className="score-percent">({scores.percentage}%)</span>
                            </div>
                          </ScoreItem>
                          
                          <ScoreItem>
                            <div className="score-label">Completion Rate</div>
                            <div className="score-value">
                              {currentTask.overallProgress || 0}%
                            </div>
                          </ScoreItem>
                          
                          <ScoreItem>
                            <div className="score-label">Status</div>
                            <div className="score-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <StatusIcon status={currentTask.status} />
                              {currentTask.status.charAt(0).toUpperCase() + currentTask.status.slice(1).replace('_', ' ')}
                            </div>
                          </ScoreItem>
                        </ScoreGrid>
                      </ScoreSummary>
                    )}
                  </>
                );
                
              case 'report':
                return (
                  <>
                    <FinalReportSection>
                      <ReportHeader>
                        <ReportTitle>
                          <FileText size={20} />
                          Inspection Final Report
                        </ReportTitle>
                        
                        <ActionButton 
                          onClick={handleExportReport}
                          disabled={currentTask?.status === 'pending'}
                        >
                          <Download size={16} />
                          Export PDF
                        </ActionButton>
                      </ReportHeader>
                      
                      <PerformanceGrid>
                        <PerformanceCard background="linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)">
                          <MetricTitle>
                            <Activity size={16} />
                            Overall Completion Rate
                          </MetricTitle>
                          <MetricValue>{currentTask?.overallProgress || 0}%</MetricValue>
                          <ScoreProgress value={currentTask?.overallProgress || 0} />
                        </PerformanceCard>
                        
                        <PerformanceCard background="linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)">
                          <MetricTitle>
                            <Clock size={16} />
                            Total Time Spent
                          </MetricTitle>
                          <MetricValue>
                            {reportData.timeSpent ? Math.round(reportData.timeSpent) : 0}
                            <span style={{ fontSize: '16px', opacity: 0.7 }}> min</span>
                          </MetricValue>
                          <MetricSubValue>
                            {reportData.timeSpent ? (reportData.timeSpent / 60).toFixed(1) : 0} hours
                          </MetricSubValue>
                        </PerformanceCard>
                        
                        <PerformanceCard background="linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)">
                          <MetricTitle>
                            <CheckSquare size={16} />
                            Items Completed
                          </MetricTitle>
                          <MetricValue>
                            {reportData.completedSubTasks}
                            <span style={{ fontSize: '16px', opacity: 0.7 }}>/{reportData.totalSubTasks}</span>
                          </MetricValue>
                          <MetricSubValue>
                            {reportData.totalSubTasks > 0 
                              ? Math.round((reportData.completedSubTasks / reportData.totalSubTasks) * 100) 
                              : 0}% complete
                          </MetricSubValue>
                        </PerformanceCard>
                        
                        <PerformanceCard background="linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)">
                          <MetricTitle>
                            <Award size={16} />
                            Compliance Score
                          </MetricTitle>
                          <MetricValue>
                            {scores.achieved}
                            <span style={{ fontSize: '16px', opacity: 0.7 }}>/{scores.total}</span>
                          </MetricValue>
                          <MetricSubValue>{scores.percentage}% compliance</MetricSubValue>
                          <ScoreProgress value={scores.percentage} />
                        </PerformanceCard>
                      </PerformanceGrid>
                      
                      {/* Show Pre-Inspection Questionnaire in the Report */}
                      {currentTask?.preInspectionQuestions && currentTask.preInspectionQuestions.length > 0 && (
                        <TaskMetricsSection>
                          <AreaTitle>
                            <CheckSquare size={18} />
                            Pre-Inspection Questionnaire
                          </AreaTitle>
                          
                          <QuestionsList>
                            {currentTask.preInspectionQuestions.map((question, index) => (
                              <QuestionItem key={index}>
                                <QuestionText>
                                  <QuestionNumber>{index + 1}</QuestionNumber>
                                  {question.text}
                                </QuestionText>
                                
                                <QuestionResponse>
                                  <strong>Response:</strong> {
                                    currentTask.questionnaireResponses && 
                                    currentTask.questionnaireResponses[question._id] ? 
                                    currentTask.questionnaireResponses[question._id] : 
                                    'Not answered'
                                  }
                                </QuestionResponse>
                              </QuestionItem>
                            ))}
                          </QuestionsList>
                        </TaskMetricsSection>
                      )}
                      
                      {/* Include other report sections like assessment areas, etc. */}
                    </FinalReportSection>
                    
                    <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '32px' }}>
                      <ActionButton 
                        onClick={handleExportReport}
                        disabled={currentTask?.status === 'pending'}
                      >
                        <Download size={16} />
                        Download Full Report (PDF)
                      </ActionButton>
                    </div>
                  </>
                );
              
              default:
                return null;
            }
          })()}
          
          <CommentSection>
            <SectionTitle>Comments</SectionTitle>
            <CommentsContainer>
              {currentTask.comments && currentTask.comments.length > 0 ? (
                currentTask.comments.map((comment, index) => (
                  <CommentItem key={index}>
                    <CommentHeader>
                      <div>
                        <CommentAuthor>
                          {comment.user?.name || 'Unknown User'}
                        </CommentAuthor>
                        <CommentTime>
                          {formatDateTime(comment.createdAt)}
                        </CommentTime>
                      </div>
                    </CommentHeader>
                    <CommentText>{comment.text}</CommentText>
                  </CommentItem>
                ))
              ) : (
                <EmptyState>
                  <MessageSquare size={32} />
                  <p>No comments yet. Be the first to comment!</p>
                </EmptyState>
              )}
            </CommentsContainer>
            <CommentForm onSubmit={(e) => {
              e.preventDefault();
              handleCommentSubmit();
            }}>
              <CommentInput
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <SendButton type="submit" disabled={!commentText.trim()}>
                <Send size={18} />
              </SendButton>
            </CommentForm>
          </CommentSection>
        </>
      ) : (
        <EmptyState>
          <AlertCircle size={48} />
          <h2>Task Not Found</h2>
          <p>The task you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate('/tasks')}>Back to Tasks</Button>
        </EmptyState>
      )}
    </PageContainer>
  );
};

export default UserTaskDetail;