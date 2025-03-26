import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  ArrowLeft, Clock, Calendar, Map, AlertTriangle, Edit,
  CheckCircle, XCircle, Activity, PaperclipIcon, Send, 
  Download, Info, CheckSquare, Camera, FileText, Loader,
  Circle, MoreHorizontal, Timer, PlayCircle, PauseCircle,
  File, ChevronUp, ChevronDown, MessageSquare, ChevronRight, ChevronLeft
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
import Stepper from '../../components/ui/Stepper';
import PreInspectionStepForm from './components/PreInspectionStepForm';
import QuestionnaireStepForm from './components/QuestionnaireStepForm';
import InspectionStepForm from './components/InspectionStepForm';

const PageContainer = styled.div`
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
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
        return `
          background: linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%);
          color: #0069c0;
          border: 1px solid rgba(2, 136, 209, 0.2);
        `;
      case 'completed':
        return `
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          color: #2e7d32;
          border: 1px solid rgba(56, 142, 60, 0.2);
        `;
      case 'incomplete':
        return `
          background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
          color: #c62828;
          border: 1px solid rgba(211, 47, 47, 0.2);
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

const getAssetInfo = (asset) => {
  if (!asset) return null;
  
  if (typeof asset === 'string') {
    const assetId = asset;
    return { _id: assetId, displayName: 'Loading...', type: '', uniqueId: '' };
  }
  
  return asset;
};

const renderQuestionnaireAnswers = (task) => {
  if (!task || !task.questionnaireResponses || Object.keys(task.questionnaireResponses || {}).length === 0) {
    return <p>No questionnaire data available</p>;
  }
  
  return (
    <div>
      {Object.entries(task.questionnaireResponses || {}).map(([questionId, answer], index) => {
        if (!questionId.includes('-')) return null;
        
        const questionIdPart = questionId.split('-')[1];
        const question = task.questions?.find(q => 
          q && (
            (q._id && q._id.toString() === questionIdPart) || 
            (q.id && q.id.toString() === questionIdPart)
          )
        );
        
        return (
          <div key={questionId} style={{ marginBottom: '12px', padding: '8px', background: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>
              {question?.text || `Question ${index + 1}`}
            </div>
            <div style={{ color: '#4b5563' }}>
              {answer !== undefined && answer !== null 
                ? (typeof answer === 'boolean' 
                  ? (answer ? 'Yes' : 'No') 
                  : (answer || 'No answer'))
                : 'No answer'
              }
            </div>
          </div>
        );
      })}
    </div>
  );
};

const renderAttachments = (task) => {
  const attachments = [];
  
  if (task?.progress && Array.isArray(task.progress)) {
    task.progress.forEach(item => {
      if (item?.photos && Array.isArray(item.photos) && item.photos.length > 0) {
        attachments.push(...item.photos.map((photo, idx) => ({
          id: `photo-${item.subLevelId || 'unknown'}-${idx}`,
          url: photo,
          type: 'image',
          name: typeof photo === 'string' && photo.includes('/') ? photo.split('/').pop() : `Photo ${idx + 1}`
        })));
      }
    });
  }
  
  if (task?.attachments && Array.isArray(task.attachments)) {
    attachments.push(...task.attachments.map((att, idx) => ({
      id: att._id || `att-${idx}`,
      url: att.url,
      type: 'file',
      name: att.filename || `Attachment ${idx + 1}`
    })));
  }
  
  if (attachments.length === 0) {
    return <p>No attachments available</p>;
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {attachments.map(att => (
        <a
          key={att.id}
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
            fontSize: '14px'
          }}
        >
          {att.type === 'image' ? <Camera size={16} /> : <File size={16} />}
          <span>{att.name}</span>
        </a>
      ))}
    </div>
  );
};

const StatusIcon = ({ status, size = 18 }) => {
  switch (status) {
    case 'pending':
      return <Clock size={size} color="#f57c00" />;
    case 'in_progress':
      return <Activity size={size} color="#0288d1" />;
    case 'completed':
      return <CheckCircle size={size} color="#388e3c" />;
    case 'incomplete':
      return <XCircle size={size} color="#d32f2f" />;
    default:
      return <Clock size={size} color="#616161" />;
  }
};

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
      setActiveStep(2);
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
      
      toast.success(`Sublevel marked as ${status}`);
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
      const response = await dispatch(exportTaskReport(taskId)).unwrap();
      
      const blob = new Blob([response], { type: 'application/pdf' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `task_report_${taskId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report downloaded successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to download report');
    }
  };
  
  const calculateStepperProgress = () => {
    if (!currentTask) return 0;
    
    if (currentTask.status === 'completed') return 100;
    
    if (currentTask.status === 'pending') return 0;
    
    if (activeStep === 0) return 0;
    if (activeStep === 1) return 33;
    if (activeStep === 2) {
      if (currentTask.overallProgress === 100) return 100;
      return 66;
    }
    
    return 0;
  };
  
  const canNavigateToStep = (stepIndex) => {
    if (!currentTask) return false;
    
    if (stepIndex === 0) return true;
    
    if (stepIndex === 1) {
      return currentTask.status !== 'pending';
    }
    
    if (stepIndex === 2) {
      return currentTask.status !== 'pending' && 
             (currentTask.questionnaireCompleted || 
              Object.keys(currentTask.questionnaireResponses || {}).length > 0);
    }
    
    return false;
  };
  
  const isStepComplete = (stepIndex) => {
    if (!currentTask) return false;
    
    if (stepIndex === 0) {
      return currentTask.status !== 'pending';
    }
    
    if (stepIndex === 1) {
      return currentTask.questionnaireCompleted || 
             Object.keys(currentTask.questionnaireResponses || {}).length > 0;
    }
    
    if (stepIndex === 2) {
      return currentTask.status === 'completed';
    }
    
    return false;
  };

  const renderStepper = () => {
    const steps = [
      { label: 'Task Details', icon: <Info size={14} /> },
      { label: 'Questionnaire', icon: <CheckSquare size={14} /> },
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

    switch (activeStep) {
      case 0:
        return (
          <>
            <PreInspectionStepForm task={currentTask} />
            <ButtonContainer>
              {currentTask.status === 'pending' && isInspector && (
                <StartButton onClick={handleStartTask} disabled={actionLoading}>
                  {actionLoading ? <Loader size={16} /> : <PlayCircle size={16} />}
                  Start Task
                </StartButton>
              )}
              {currentTask.status === 'in_progress' && (
                <NextButton onClick={() => setActiveStep(1)}>
                  Proceed to Questionnaire
                  <ChevronRight size={16} />
                </NextButton>
              )}
            </ButtonContainer>
          </>
        );
      case 1:
        return (
          <>
            <TaskDetailSection>
              <SectionTitle>Task Overview</SectionTitle>
              <PreInspectionStepForm task={currentTask} />
            </TaskDetailSection>
            
            <QuestionnaireStepForm 
              task={currentTask} 
              onSave={() => setActiveStep(2)}
            />
            <ButtonContainer>
              <StepBackButton onClick={() => {
                setActiveStep(0);
                setUserClickedStep(true);
              }}>
                <ChevronLeft size={16} />
                Back to Task Details
              </StepBackButton>
              {currentTask.questionnaireCompleted || Object.keys(currentTask.questionnaireResponses || {}).length > 0 ? (
                <NextButton onClick={() => setActiveStep(2)}>
                  Proceed to Inspection
                  <ChevronRight size={16} />
                </NextButton>
              ) : null}
            </ButtonContainer>
          </>
        );
      case 2:
        return (
          <>
            <InspectionStepForm 
              task={currentTask} 
              onUpdateProgress={(updatedTask) => {
                dispatch(fetchUserTaskDetails(taskId));
              }}
              onExportReport={handleExportReport}
            />
            <ButtonContainer>
              <StepBackButton onClick={() => {
                setActiveStep(1);
                setUserClickedStep(true);
              }}>
                <ChevronLeft size={16} />
                Back to Questionnaire
              </StepBackButton>
              {!taskCompleted && canCompleteTask && (
                <CompleteButton onClick={handleCompleteTask} disabled={actionLoading}>
                  {actionLoading ? <Loader size={16} /> : <CheckCircle size={16} />}
                  Complete Task
                </CompleteButton>
              )}
              {taskCompleted && (
                <ExportButton onClick={handleExportReport}>
                  <FileText size={16} />
                  Export Report
                </ExportButton>
              )}
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
                {getAssetInfo(currentTask.asset).displayName || 'Unnamed Asset'}
                {getAssetInfo(currentTask.asset).uniqueId && (
                  <div style={{ color: '#64748b', fontSize: '14px' }}>
                    ID: {getAssetInfo(currentTask.asset).uniqueId}
                  </div>
                )}
                {getAssetInfo(currentTask.asset).type && (
                  <div style={{ color: '#64748b', fontSize: '14px' }}>
                    Type: {getAssetInfo(currentTask.asset).type}
                  </div>
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
                Questionnaire Answers
              </RightPanelTitle>
              {renderQuestionnaireAnswers(currentTask)}
            </RightPanelSection>
          )}
          
          <RightPanelSection>
            <RightPanelTitle>
              <PaperclipIcon size={16} />
              Attachments
            </RightPanelTitle>
            {renderAttachments(currentTask)}
          </RightPanelSection>
        </RightPanel>
      </DetailLayout>
    </PageContainer>
  );
};

export default UserTaskDetail;