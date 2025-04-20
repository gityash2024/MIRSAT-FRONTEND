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
  Award, Clipboard, AlertCircle
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
  color: #1a237e;
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
  color: #1a237e;
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
      color: #1a237e;
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
    background: linear-gradient(90deg, #1a237e 0%, #5c6bc0 100%);
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
    color: #1a237e;
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
  color: #1a237e;
  margin-bottom: 15px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
  
  svg {
    color: #1a237e;
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
  color: #1a237e;
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
  gap: 10px;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  color: #1a237e;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 10px 16px;
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
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const StepBackButton = styled(ActionButton)`
  background: rgba(255, 255, 255, 0.8);
  color: #1a237e;
`;

const NextButton = styled(ActionButton)`
  background: linear-gradient(135deg, #1a237e 0%, #3f51b5 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.2);
  
  &:hover {
    background: linear-gradient(135deg, #0d1186 0%, #303f9f 100%);
    color: white;
    box-shadow: 0 6px 16px rgba(26, 35, 126, 0.3);
  }
`;

const StartButton = styled(ActionButton)`
  background: linear-gradient(135deg, #1a237e 0%, #3f51b5 100%);
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
  color: #1a237e;
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
    ? '#1a237e' 
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
  color: ${props => props.active ? '#1a237e' : '#666'};
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
  color: #1a237e;
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
    color: #1a237e;
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
  color: #1a237e;
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
    color: #1a237e;
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
  color: ${props => props.active ? '#1a237e' : '#4b5563'};
  font-weight: ${props => props.active ? '600' : '400'};
`;

const TreeItemIcon = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.active ? '#1a237e' : '#4b5563'};
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

const UserTaskDetail = () => {
  const dispatch = useDispatch();
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const commentBoxRef = useRef(null);
  const timerRef = useRef(null);
  const [expandedSubLevels, setExpandedSubLevels] = useState({});
  const [comment, setComment] = useState('');
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [userClickedStep, setUserClickedStep] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const location = useLocation();
  
  const {
    currentTask,
    loading,
    error,
    actionLoading
  } = useSelector((state) => state.userTasks);

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
    if (!comment.trim()) return;
    
    try {
      await dispatch(addUserTaskComment({
        taskId,
        comment
      })).unwrap();
      
      setComment('');
      
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
      await userTaskService.exportTaskReport(taskId);
    } catch (error) {
      toast.error(error.message || 'Failed to download report');
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
          
          totalQuestionPoints += (2 * weight); // Max score is 2 per question
          
          if (response === 'full_compliance' || response === 'yes') {
            achievedQuestionPoints += (2 * weight);
          } else if (response === 'partial_compliance') {
            achievedQuestionPoints += (1 * weight);
          } else if (response === 'na' || response === 'not_applicable') {
            totalQuestionPoints -= (2 * weight); // Don't count NA questions
          }
        }
      });
    }
    
    // Calculate checkpoint scores
    let totalCheckpoints = 0;
    let completedCheckpoints = 0;
    
    if (currentTask.progress) {
      totalCheckpoints = currentTask.progress.length;
      completedCheckpoints = currentTask.progress.filter(p => p.status === 'completed' || p.status === 'full_compliance').length;
    }
    
    // Calculate assessment area scores
    const assessmentAreas = currentTask.assessmentAreas || [];
    
    // Calculate total score
    const totalPoints = totalQuestionPoints + (totalCheckpoints * 2); // Each checkpoint is worth 2 points max
    const achievedPoints = achievedQuestionPoints + (completedCheckpoints * 2);
    const percentage = totalPoints > 0 ? Math.round((achievedPoints / totalPoints) * 100) : 0;
    
    return {
      total: totalPoints,
      achieved: achievedPoints,
      percentage,
      areas: assessmentAreas
    };
  };

  const renderQuestionnaire = () => {
    if (!currentTask) return null;
    
    const categories = getQuestionCategories();
    
    return (
      <QuestionnaireView>
        <TreeContainer>
          <RightPanelTitle>
            <Clipboard size={18} />
            Questionnaire Categories
          </RightPanelTitle>
          
          {categories.map((category, index) => (
            <TreeItem key={index} level={0}>
              <TreeItemContent 
                active={selectedCategory === category}
                onClick={() => {
                  setSelectedCategory(category);
                  setSelectedQuestion(null);
                }}
              >
                <TreeItemIcon active={selectedCategory === category}>
                  {selectedCategory === category ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </TreeItemIcon>
                <TreeItemText active={selectedCategory === category}>
                  {category}
                </TreeItemText>
              </TreeItemContent>
              
              {selectedCategory === category && (
                <>
                  {getQuestionsByCategoryAndLevel(category).map((question, qIndex) => (
                    <TreeItem key={`q-${qIndex}`} level={1}>
                      <TreeItemContent 
                        active={selectedQuestion === question}
                        onClick={() => setSelectedQuestion(question)}
                      >
                        <TreeItemIcon active={selectedQuestion === question}>
                          <CheckSquare size={16} />
                        </TreeItemIcon>
                        <TreeItemText active={selectedQuestion === question}>
                          {question.text?.length > 30 ? 
                            `${question.text.substring(0, 30)}...` : 
                            question.text}
                        </TreeItemText>
                      </TreeItemContent>
                    </TreeItem>
                  ))}
                </>
              )}
            </TreeItem>
          ))}
        </TreeContainer>
        
        <div>
          {selectedCategory && (
            <ImageUploadContainer>
              <QuestionnaireStepForm 
                task={currentTask} 
                onSave={() => setActiveStep(2)}
                filteredCategory={selectedCategory}
                filteredQuestion={selectedQuestion}
              />
            </ImageUploadContainer>
          )}
        </div>
      </QuestionnaireView>
    );
  };

  const renderStepContent = () => {
    if (!currentTask) return null;

    const taskCompleted = currentTask.status === 'completed';
    const isInspector = user?.role === 'inspector';
    const hasInspectionLevel = currentTask.inspectionLevel && 
                              currentTask.inspectionLevel._id;
    const hasSubLevels = hasInspectionLevel && 
                        currentTask.inspectionLevel.subLevels && 
                        currentTask.inspectionLevel.subLevels.length > 0;
    const canCompleteTask = isInspector && 
                           currentTask.status === 'in_progress' && 
                           (currentTask.overallProgress === 100 || !hasSubLevels);

    // Calculate scores for display
    const scores = calculateScores();

    switch (activeStep) {
      case 0:
        return (
          <>
            <PreInspectionStepForm task={currentTask} />
            
            {/* Display scoring summary if task is in progress or completed */}
            {(currentTask.status === 'in_progress' || currentTask.status === 'completed') && (
              <ScoreSummary>
                <ScoreTitle>
                  <Award size={20} color="#1a237e" />
                  Compliance Score Summary
                </ScoreTitle>
                
                <ScoreGrid>
                  <ScoreItem>
                    <div className="score-label">Total Score</div>
                    <div className="score-value">
                      {scores.achieved} / {scores.total}
                      <span className="score-percent">({scores.percentage}%)</span>
                    </div>
                  </ScoreItem>
                  
                  <ScoreItem>
                    <div className="score-label">Questionnaire</div>
                    <div className="score-value">
                      {currentTask.questionnaireCompleted ? 
                        <CheckCircle size={18} color="#4caf50" style={{ marginRight: '5px' }} /> : 
                        <AlertCircle size={18} color="#f57c00" style={{ marginRight: '5px' }} />}
                      {currentTask.questionnaireCompleted ? 'Completed' : 'Pending'}
                    </div>
                  </ScoreItem>
                  
                  <ScoreItem>
                    <div className="score-label">Checkpoints</div>
                    <div className="score-value">
                      {currentTask.overallProgress}%
                    </div>
                  </ScoreItem>
                </ScoreGrid>
                
                {canCompleteTask && !taskCompleted && (
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Button onClick={handleCompleteTask} disabled={actionLoading}>
                      <CheckCircle size={18} /> Mark Task as Complete
                    </Button>
                  </div>
                )}
              </ScoreSummary>
            )}
            
            {(currentTask.status === 'pending' || !currentTask.status) && (
              <ButtonContainer>
                <NextButton onClick={handleStartTask} disabled={actionLoading}>
                  Start Inspection
                  <ChevronRight size={16} />
                </NextButton>
              </ButtonContainer>
            )}
            
            {currentTask.status === 'in_progress' && (
              <ButtonContainer>
                <NextButton onClick={() => setActiveStep(1)} disabled={actionLoading}>
                  Continue Inspection
                  <ChevronRight size={16} />
                </NextButton>
              </ButtonContainer>
            )}
          </>
        );
      case 1:
        return (
          <>
            <TaskDetailSection>
              <SectionTitle>Task Overview</SectionTitle>
              <PreInspectionStepForm task={currentTask} />
            </TaskDetailSection>
            
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '16px',
                color: '#1a237e',
                display: 'flex',
                alignItems: 'center',
                gap: '8px' 
              }}>
                <CheckSquare size={20} />
                Questionnaire
              </h3>
              
              {renderQuestionnaire()}
            </div>
            
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '16px',
                color: '#1a237e',
                display: 'flex',
                alignItems: 'center',
                gap: '8px' 
              }}>
                <Activity size={20} />
                Inspection Items
              </h3>
              
              <InspectionStepForm 
                task={currentTask} 
                onUpdateProgress={(updatedTask) => {
                  dispatch(fetchUserTaskDetails(taskId));
                }}
                onExportReport={handleExportReport}
              />
            </div>
            
            {/* Display scoring summary for inspection phase */}
            {(currentTask.status === 'in_progress' || currentTask.status === 'completed') && (
              <ScoreSummary>
                <ScoreTitle>
                  <Award size={20} color="#1a237e" />
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
                      {currentTask.status.charAt(0).toUpperCase() + currentTask.status.slice(1)}
                    </div>
                  </ScoreItem>
                </ScoreGrid>
                
                {canCompleteTask && !taskCompleted && (
                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <Button onClick={handleCompleteTask} disabled={actionLoading}>
                      <CheckCircle size={18} /> Mark Task as Complete
                    </Button>
                  </div>
                )}
              </ScoreSummary>
            )}
            
            <ButtonContainer>
              <StepBackButton onClick={() => {
                setActiveStep(0);
                setUserClickedStep(true);
              }}>
                <ChevronLeft size={16} />
                Back to Task Details
              </StepBackButton>
            </ButtonContainer>
          </>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <UserTaskDetailSkeleton />;
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
      <BackButton onClick={() => navigate('/user-tasks')}>
        <ArrowLeft size={18} />
        Back to Tasks
      </BackButton>
      
      <Header>
        <HeaderContent>
          <TitleSection>
            <Title>{currentTask.title}</Title>
            <Description>{currentTask.description}</Description>
          </TitleSection>
          <div>
            <StatusBadge status={currentTask.status || 'pending'}>
              <StatusIcon status={currentTask.status || 'pending'} size={14} />
              {currentTask.status ? currentTask.status.charAt(0).toUpperCase() + currentTask.status.slice(1).replace('_', ' ') : 'Pending'}
            </StatusBadge>
            <PriorityBadge priority={currentTask.priority || 'medium'}>
              {currentTask.priority ? currentTask.priority.charAt(0).toUpperCase() + currentTask.priority.slice(1) : 'Medium'}
            </PriorityBadge>
          </div>
        </HeaderContent>
      </Header>
      
      {currentTask.status === 'in_progress' && (
        <TimerWidget>
          <Timer size={20} />
          <span>{formatTime(timer)}</span>
          <div className="timer-controls">
            {timerRunning ? (
              <button className="timer-button pause" onClick={stopTimer}>
                <PauseCircle size={20} />
              </button>
            ) : (
              <button className="timer-button play" onClick={startTimer}>
                <PlayCircle size={20} />
              </button>
            )}
          </div>
        </TimerWidget>
      )}
      
      {renderStepper()}
      
      <DetailLayout>
        <div>
          {renderStepContent()}
        </div>
        
        <RightPanel>
          <RightPanelTitle>
            <Info size={16} />
            Task Summary
          </RightPanelTitle>
          
          <RightPanelSection>
            <div style={{ marginBottom: '8px', fontWeight: '500' }}>Asset Information</div>
            {currentTask?.asset ? (
              <div>
                {typeof currentTask.asset === 'object' ? (
                  <>
                    <div>{currentTask.asset.displayName || currentTask.asset.name || 'Unnamed Asset'}</div>
                    {currentTask.asset.uniqueId && (
                      <div style={{ color: '#64748b', fontSize: '14px' }}>
                        ID: {currentTask.asset.uniqueId}
                      </div>
                    )}
                    {currentTask.asset.type && (
                      <div style={{ color: '#64748b', fontSize: '14px' }}>
                        Type: {currentTask.asset.type}
                      </div>
                    )}
                    {currentTask.asset.serialNumber && (
                      <div style={{ color: '#64748b', fontSize: '14px' }}>
                        S/N: {currentTask.asset.serialNumber}
                      </div>
                    )}
                    {currentTask.asset.location && (
                      <div style={{ color: '#64748b', fontSize: '14px' }}>
                        Location: {currentTask.asset.location}
                      </div>
                    )}
                  </>
                ) : (
                  <div>Asset ID: {currentTask.asset}</div>
                )}
              </div>
            ) : (
              <div style={{ color: '#64748b' }}>No asset assigned</div>
            )}
          </RightPanelSection>
          
          <RightPanelSection>
            <div style={{ marginBottom: '8px', fontWeight: '500' }}>Task Progress</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                background: '#e2e8f0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${currentTask.overallProgress || 0}%`,
                  height: '100%',
                  background: '#3b82f6',
                  borderRadius: '4px'
                }}></div>
              </div>
              <span style={{ fontWeight: '500' }}>{currentTask.overallProgress || 0}%</span>
            </div>
          </RightPanelSection>
          
          {(currentTask?.status === 'completed' || 
            (currentTask?.questionnaireResponses && 
             Object.keys(currentTask?.questionnaireResponses || {}).length > 0)) && (
            <RightPanelSection>
              <RightPanelTitle>
                <CheckSquare size={16} />
                Questionnaire Summary
              </RightPanelTitle>
              
              {currentTask.questionnaireResponses && Object.keys(currentTask.questionnaireResponses).length > 0 ? (
                <div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontWeight: '500' }}>Status: </span>
                    {currentTask.questionnaireCompleted ? (
                      <span style={{ color: '#2e7d32' }}>Completed</span>
                    ) : (
                      <span style={{ color: '#f57c00' }}>In Progress</span>
                    )}
                  </div>
                  
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontWeight: '500' }}>Questions Answered: </span>
                    {Object.keys(currentTask.questionnaireResponses).length}
                  </div>
                  
                  <div>
                    <span style={{ fontWeight: '500' }}>Compliance Rate: </span>
                    {(() => {
                      const responses = Object.values(currentTask.questionnaireResponses);
                      if (responses.length === 0) return '0%';
                      
                      const fullCompliance = responses.filter(r => 
                        r === 'full_compliance' || r === 'yes'
                      ).length;
                      
                      const partialCompliance = responses.filter(r => 
                        r === 'partial_compliance'
                      ).length;
                      
                      const notApplicable = responses.filter(r => 
                        r === 'na' || r === 'not_applicable'
                      ).length;
                      
                      const effectiveTotal = responses.length - notApplicable;
                      
                      if (effectiveTotal === 0) return '100%';
                      
                      const rate = ((fullCompliance * 2 + partialCompliance) / (effectiveTotal * 2)) * 100;
                      return `${Math.round(rate)}%`;
                    })()}
                  </div>
                </div>
              ) : (
                <div style={{ color: '#64748b', fontStyle: 'italic' }}>
                  No questionnaire responses available
                </div>
              )}
            </RightPanelSection>
          )}
          
          <RightPanelSection>
            <RightPanelTitle>
              <PaperclipIcon size={16} />
              Attachments
            </RightPanelTitle>
            {currentTask.attachments && currentTask.attachments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentTask.attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      color: '#1a237e',
                      textDecoration: 'none',
                      fontSize: '14px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <File size={16} />
                    <span>{att.filename || `Attachment ${idx + 1}`}</span>
                  </a>
                ))}
              </div>
            ) : (
              <div style={{ color: '#64748b', fontStyle: 'italic' }}>
                No attachments available
              </div>
            )}
          </RightPanelSection>
          
          {currentTask.flaggedItems && currentTask.flaggedItems.length > 0 && (
            <RightPanelSection>
              <RightPanelTitle>
                <AlertTriangle size={16} />
                Flagged Items ({currentTask.flaggedItems.length})
              </RightPanelTitle>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentTask.flaggedItems.map((item, idx) => (
                  <div 
                    key={idx}
                    style={{
                      padding: '10px',
                      background: '#fff8e1',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 152, 0, 0.2)',
                    }}
                  >
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                      {item.title || 'Flagged Item'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {item.category || 'General'} - {item.status || 'Issue'}
                    </div>
                    {item.notes && (
                      <div style={{ fontSize: '13px', marginTop: '6px' }}>
                        {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </RightPanelSection>
          )}
        </RightPanel>
      </DetailLayout>
    </PageContainer>
  );
};

export default UserTaskDetail;