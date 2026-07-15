import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { format, differenceInSeconds } from 'date-fns';
import { useTranslation } from 'react-i18next';
import FrontendLogger from '../../services/frontendLogger.service';
import {
  Info,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  Download,
  CheckSquare,
  Paperclip,
  Send,
  Trash2,
  Edit,
  Plus,
  Award,
  User,
  MapPin,
  Calendar,
  Clock as ClockIcon,
  Edit3,
  Upload,
  Clipboard,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  X,
  MessageSquare,
  AlertTriangle,
  Map,
  Star,
  Target,
  Zap,
  TrendingUp,
  BarChart2,
  PieChart,
  Eye,
  EyeOff,
  Filter,
  Search,
  RotateCw,
  Save,
  Play,
  Pause,
  RefreshCcw,
  List,
  Grid,
  Navigation,
  Maximize2,
  Minimize2,
  Loader
} from 'react-feather';
import { toast } from 'react-hot-toast';
import {
  fetchUserTaskDetails,
  updateUserTaskProgress,
  addUserTaskComment,
  exportTaskReport,
  updateTaskQuestionnaire,
  saveTaskSignature,
  archiveTask
} from '../../store/slices/userTasksSlice';
import { userTaskService } from '../../services/userTask.service';
import { useAuth } from '../../hooks/useAuth';
import Skeleton from '../../components/ui/Skeleton';
import SignaturePad from 'react-signature-canvas';
import DocumentNamingModal from '../../components/ui/DocumentNamingModal';

import PreInspectionStepForm from './components/PreInspectionStepForm';
import QuestionnaireStepForm from './components/QuestionnaireStepForm';
import InspectionStepForm from './components/InspectionStepForm';
import { Rotate3dIcon } from 'lucide-react';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
`;

const glow = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(55, 136, 216, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(55, 136, 216, 0.6);
  }
  100% {
    box-shadow: 0 0 5px rgba(55, 136, 216, 0.3);
  }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 6px;
  position: relative;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 4px;
  }

  @media (max-width: 480px) {
    padding: 2px;
  }
`;

const MainContent = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  animation: ${fadeIn} 0.6s ease-out;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    width: 100%;
    max-width: 100%;
  }
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 6px;
  background: rgba(255, 255, 255, 0.95);
  padding: 16px 24px;
  border-radius: 20px;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.4);
  animation: ${slideIn} 0.5s ease-out;
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 768px) {
    padding: 12px 16px;
    margin: 4px;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    margin: 2px;
    border-radius: 12px;
    gap: 8px;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #3788d8, #2c3e50);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4px 15px rgba(55, 136, 216, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(55, 136, 216, 0.3);
  white-space: nowrap;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 14px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 13px;
    gap: 4px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 25px rgba(55, 136, 216, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    animation: ${glow} 2s infinite;
  }
  
  &:active {
    transform: translateY(0);
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }
`;

const TopBarLeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 8px;
    width: 100%;
  }

  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const LiveStatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${props => props.$paused ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)'};
  border-radius: 8px;
  font-size: 12px;
  color: ${props => props.$paused ? '#dc2626' : '#16a34a'};
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 11px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    padding: 5px 8px;
    font-size: 10px;
    gap: 4px;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 8px;
    width: 100%;
    justify-content: flex-end;
  }

  @media (max-width: 480px) {
    gap: 6px;
    justify-content: stretch;
    flex-direction: column;
  }
`;

const QuickActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.primary ? 'linear-gradient(135deg, #3788d8, #2c3e50)' : 'rgba(255, 255, 255, 0.9)'};
  color: ${props => props.primary ? 'white' : '#333'};
  border: ${props => props.primary ? '1px solid rgba(55, 136, 216, 0.3)' : '1px solid rgba(0, 0, 0, 0.1)'};
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: ${props => props.primary ?
    '0 4px 15px rgba(55, 136, 216, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)' :
    '0 2px 8px rgba(0, 0, 0, 0.1)'};
  white-space: nowrap;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 13px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 12px;
    gap: 4px;
    width: 100%;
    justify-content: center;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.primary ?
    '0 8px 25px rgba(55, 136, 216, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)' :
    '0 4px 15px rgba(0, 0, 0, 0.2)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 14px;
      height: 14px;
    }
  }
`;

// Export dropdown styled components
const ExportButtonContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: white;
  border: 1px solid rgba(22, 163, 74, 0.3);
  padding: 16px 32px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(22, 163, 74, 0.4);
  min-width: 200px;
  height: 56px;
  
  @media (max-width: 480px) {
    min-width: 100%;
    padding: 12px 20px;
    font-size: 14px;
    height: 48px;
    justify-content: center;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(22, 163, 74, 0.6);
  }
`;

const ExportDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  margin-top: 4px;
`;

const ExportOption = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: white;
  color: #374151;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  
  &:hover {
    background: #f8fafc;
  }
  
  &:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  
  &:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

const TaskHeader = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 32px;
  margin: 6px;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.4);
  animation: ${fadeIn} 0.6s ease-out 0.1s both;
  position: relative;
  overflow: hidden;
  min-width: 0;

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 16px;
    margin: 4px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 12px;
    margin: 2px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3788d8, #2c3e50, #3788d8, #2c3e50);
    background-size: 300% 100%;
    animation: ${shimmer} 3s ease-in-out infinite;
  }
`;

const TaskTitle = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: #1a202c;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #3788d8, #2c3e50);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  overflow-wrap: break-word;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 12px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
    margin-bottom: 10px;
  }
`;

const TaskMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 24px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    margin-top: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 8px;
    margin-top: 12px;
  }
`;

const MetaCard = styled.div`
  background: rgba(255, 255, 255, 0.7);
  padding: 20px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  margin: 6px;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  min-width: 0;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 12px;
    margin: 4px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 10px;
    margin: 2px;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
    border-color: rgba(55, 136, 216, 0.3);

    @media (max-width: 768px) {
      transform: translateY(-2px);
    }
  }
`;

const MetaLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const MetaValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 8px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 14px;
    gap: 6px;
    flex-wrap: wrap;
  }

  @media (max-width: 480px) {
    font-size: 13px;
    gap: 4px;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 14px;
      height: 14px;
    }
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-transform: capitalize;
  border: 1px solid rgba(255, 255, 255, 0.3);
  white-space: nowrap;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 12px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    padding: 5px 10px;
    font-size: 11px;
    gap: 4px;
  }
  
  ${props => {
    switch (props.status) {
      case 'pending':
        return css`
          background: linear-gradient(135deg, #f39c12, #e67e22);
          color: white;
          box-shadow: 0 4px 15px rgba(243, 156, 18, 0.4);
        `;
      case 'in_progress':
        return css`
          background: linear-gradient(135deg, #3788d8, #2980b9);
          color: white;
          box-shadow: 0 4px 15px rgba(55, 136, 216, 0.4);
        `;
      case 'completed':
        return css`
          background: linear-gradient(135deg, #27ae60, #2ecc71);
          color: white;
          box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4);
        `;
      default:
        return css`
          background: linear-gradient(135deg, #95a5a6, #7f8c8d);
          color: white;
        `;
    }
  }}

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 12px;
      height: 12px;
    }
  }
`;

const PriorityBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  border: 1px solid rgba(255, 255, 255, 0.3);
  white-space: nowrap;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 5px 10px;
    font-size: 11px;
    gap: 4px;
  }

  @media (max-width: 480px) {
    padding: 4px 8px;
    font-size: 10px;
    gap: 3px;
  }
  
  ${props => {
    switch (props.priority) {
      case 'high':
        return css`
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: white;
          animation: ${pulse} 2s infinite;
        `;
      case 'medium':
        return css`
          background: linear-gradient(135deg, #f39c12, #e67e22);
          color: white;
        `;
      case 'low':
        return css`
          background: linear-gradient(135deg, #27ae60, #2ecc71);
          color: white;
        `;
      default:
        return css`
          background: #f3f4f6;
          color: #6b7280;
        `;
    }
  }}
`;

const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 12px;
  margin: 6px;
  
  @media (max-width: 1400px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 768px) {
    gap: 8px;
    margin: 4px;
  }

  @media (max-width: 480px) {
    gap: 6px;
    margin: 2px;
  }
`;

const MainPanel = styled.div`
  animation: ${fadeIn} 0.6s ease-out 0.2s both;
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  animation: ${fadeIn} 0.6s ease-out 0.3s both;
  
  @media (max-width: 1400px) {
    order: -1;
  }
`;

const TabsContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 8px;
  margin: 6px;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.4);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    padding: 6px;
    margin: 4px;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    padding: 4px;
    margin: 2px;
    border-radius: 12px;
  }

  &::-webkit-scrollbar {
    display: none;
  }

  scrollbar-width: none;
`;

const TabsWrapper = styled.div`
  display: flex;
  gap: 4px;
  min-width: max-content;

  @media (max-width: 480px) {
    gap: 3px;
  }
`;

const Tab = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 16px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  white-space: nowrap;
  min-width: max-content;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 12px;
    gap: 4px;
    border-radius: 12px;
  }
  
  ${props => props.active ? css`
    background: linear-gradient(135deg, #3788d8, #2c3e50);
    color: white;
    transform: translateY(-2px);
    box-shadow: 
      0 4px 15px rgba(55, 136, 216, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(55, 136, 216, 0.3);

    @media (max-width: 768px) {
      transform: translateY(-1px);
    }
  ` : css`
    background: transparent;
    color: #64748b;
    
    &:hover {
      background: rgba(55, 136, 216, 0.1);
      color: #3788d8;
      border: 1px solid rgba(55, 136, 216, 0.2);
      border-radius: 16px;
    }
  `}
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    
    &:hover {
      background: transparent;
      color: #64748b;
      border: none;
    }
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 14px;
      height: 14px;
    }
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  margin: 6px;
  min-width: 0;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 16px;
    margin: 4px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 12px;
    margin: 2px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 30px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.4),
      0 2px 6px rgba(0, 0, 0, 0.1);
    border-color: rgba(55, 136, 216, 0.3);

    @media (max-width: 768px) {
      transform: translateY(-1px);
    }
  }
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 16px;
    gap: 8px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 12px;
    gap: 6px;
    flex-wrap: wrap;
  }
  
  svg {
    color: #3788d8;
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 18px;
      height: 18px;
    }
  }
`;

const ProgressContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
  margin: 6px;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.4);
  min-width: 0;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 16px;
    margin: 4px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 12px;
    margin: 2px;
  }
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ProgressTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProgressValue = styled.div`
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #3788d8, #2c3e50);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 20px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background: linear-gradient(90deg, #3788d8, #2c3e50);
    border-radius: 8px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(55, 136, 216, 0.4);
  }
`;

const InspectionContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.4);
  overflow: visible;
  min-height: 80vh;
  margin: 6px;
  min-width: 0;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  position: relative;

  @media (max-width: 768px) {
    border-radius: 16px;
    margin: 4px;
    min-height: 70vh;
    width: calc(100% - 8px);
    max-width: calc(100% - 8px);
  }

  @media (max-width: 480px) {
    border-radius: 12px;
    margin: 2px;
    min-height: 60vh;
    width: calc(100% - 4px);
    max-width: calc(100% - 4px);
    overflow-x: hidden;
  }
`;

const InspectionHeader = styled.div`
  padding: 24px 32px;
  background: linear-gradient(135deg, rgba(55, 136, 216, 0.1), rgba(44, 62, 80, 0.1));
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  min-width: 0;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow: visible;
  position: relative;
  z-index: 1;
  z-index: 1;

  > div:first-child {
    flex: 0 1 auto;
    min-width: 0;
  }

  @media (max-width: 768px) {
    padding: 16px 20px;
    gap: 12px;
    width: 100%;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    padding: 12px;
    gap: 8px;
    flex-direction: column;
    width: 100%;
    max-width: 100%;
    align-items: stretch;
  }
`;

const InspectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 18px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const InspectionControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
  min-width: 0;
  max-width: 100%;
  width: auto;
  box-sizing: border-box;
  overflow: visible;
  flex-shrink: 0;
  position: relative;

  @media (max-width: 768px) {
    gap: 8px;
    flex-wrap: wrap;
    width: 100%;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    gap: 6px;
    width: 100%;
    max-width: 100%;
    justify-content: stretch;
    flex-wrap: wrap;
  }

  > * {
    min-width: 0;
    flex-shrink: 1;
    max-width: 100%;

    @media (max-width: 480px) {
      flex: 1;
      min-width: 0;
      max-width: 100%;
    }
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  z-index: 10000;
  flex: 1 1 auto;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  overflow: visible;

  @media (max-width: 480px) {
    flex: 1 1 100%;
    order: 2;
    width: 100%;
    max-width: 100%;
  }
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  min-width: 200px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  flex-shrink: 1;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  overflow: visible;

  @media (max-width: 768px) {
    min-width: 0;
    flex: 1;
    padding: 6px 12px;
    font-size: 13px;
    gap: 6px;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    min-width: 0;
    flex: 1;
    padding: 6px 10px;
    font-size: 12px;
    gap: 4px;
    max-width: 100%;
    width: 100%;
    white-space: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
    
    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      min-width: 0;
      max-width: 100%;
    }
    
    svg {
      flex-shrink: 0;
      width: 14px;
      height: 14px;
    }
  }

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
  
  &:hover {
    border-color: #3788d8;
    background: rgba(55, 136, 216, 0.05);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }
  
  &:focus {
    outline: none;
    border-color: #3788d8;
    box-shadow: 0 0 0 3px rgba(55, 136, 216, 0.1);
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 14px;
      height: 14px;
    }
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  z-index: 10003 !important;
  max-height: 300px;
  overflow-y: auto;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  
  &:hover {
    background: rgba(55, 136, 216, 0.05);
    border-left: 3px solid #3788d8;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const NavigationButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid rgba(55, 136, 216, 0.3);
  border-radius: 8px;
  background: linear-gradient(135deg, #3788d8, #2c3e50);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4px 15px rgba(55, 136, 216, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 0;

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 13px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 12px;
    gap: 4px;
    flex: 1;
    min-width: 0;
    max-width: 100%;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 
      0 6px 20px rgba(55, 136, 216, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);

    @media (max-width: 768px) {
      transform: translateY(-1px);
    }
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 
      0 2px 10px rgba(55, 136, 216, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #94a3b8, #64748b);
    color: rgba(255, 255, 255, 0.6);
    cursor: not-allowed;
    box-shadow: none;
    border-color: rgba(148, 163, 184, 0.3);
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
  
  &:focus {
    outline: none;
    box-shadow: 
      0 4px 15px rgba(55, 136, 216, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      0 0 0 3px rgba(55, 136, 216, 0.2);
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 14px;
      height: 14px;
    }
  }
`;

const InspectionLayout = styled.div`
  display: flex;
  height: calc(80vh - 80px);
  min-width: 0;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  
  @media (max-width: 1200px) {
    flex-direction: column;
    height: auto;
    overflow: visible;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    width: 100%;
    max-width: 100%;
  }
`;

const NavigationPanel = styled.div`
  width: 320px;
  border-right: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(248, 250, 252, 0.8);
  display: flex;
  flex-direction: column;
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.3);
  box-sizing: border-box;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  
  @media (max-width: 1200px) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    max-height: none;
    overflow: visible;
  }

  @media (max-width: 480px) {
    width: 100%;
    max-width: 100%;
  }
`;

const NavigationHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  overflow: hidden;

  @media (max-width: 1200px) {
    flex-shrink: 0;
    overflow: visible;
  }

  @media (max-width: 480px) {
    padding: 12px 16px;
    width: 100%;
    max-width: 100%;
  }
`;

const NavigationTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const KeyboardShortcutsBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: rgba(55, 136, 216, 0.1);
  border: 1px solid rgba(55, 136, 216, 0.3);
  border-radius: 50%;
  cursor: help;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(55, 136, 216, 0.2);
    border-color: rgba(55, 136, 216, 0.5);
    transform: scale(1.1);
  }
  
  svg {
    color: #3788d8;
  }
`;

const ProgressSummary = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(55, 136, 216, 0.1);
  border-radius: 8px;
  font-size: 12px;
  border: 1px solid rgba(55, 136, 216, 0.2);
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  overflow: hidden;
  flex-wrap: wrap;
  gap: 4px;

  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 11px;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
`;

const SectionNavigationControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 12px 16px;
  background: rgba(248, 250, 252, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  overflow: visible;

  @media (max-width: 1200px) {
    flex-shrink: 0;
    overflow: visible;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    padding: 8px 12px;
    gap: 6px;
    width: 100%;
    max-width: 100%;
  }
`;

const SectionButtonsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;

  @media (max-width: 480px) {
    display: flex;
    width: 100%;
    gap: 6px;
  }
`;

const SectionNavigationButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid rgba(55, 136, 216, 0.3);
  border-radius: 6px;
  background: linear-gradient(135deg, #3788d8, #2c3e50);
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 2px 8px rgba(55, 136, 216, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  white-space: normal;
  word-break: break-word;
  justify-content: center;
  text-align: center;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 
      0 4px 12px rgba(55, 136, 216, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 
      0 1px 6px rgba(55, 136, 216, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #cbd5e0, #a0aec0);
    color: rgba(255, 255, 255, 0.6);
    cursor: not-allowed;
    box-shadow: none;
    border-color: rgba(203, 213, 224, 0.3);
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
  
  &:focus {
    outline: none;
    box-shadow: 
      0 2px 8px rgba(55, 136, 216, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      0 0 0 2px rgba(55, 136, 216, 0.2);
  }

  @media (max-width: 480px) {
    padding: 6px 8px;
    font-size: 11px;
    gap: 4px;
    flex: 1 1 auto;
    min-width: 0;
    
    svg {
      width: 12px;
      height: 12px;
      flex-shrink: 0;
    }
  }
`;

const SectionCounter = styled.div`
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #1a202c;
  background: rgba(255, 255, 255, 0.8);
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  min-width: 0;
  max-width: 100%;
  width: 100%;
  overflow: hidden;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 480px) {
    width: 100%;
    padding: 6px 10px;
    font-size: 11px;
    margin-top: 0;
  }
`;

const SectionsNavigation = styled.div`
  padding: 16px;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;

  @media (max-width: 1200px) {
    flex-shrink: 0;
    max-height: 40vh;
    overflow-y: auto;
  }

  @media (max-width: 480px) {
    padding: 12px;
    width: 100%;
    max-width: 100%;
  }
`;

const SectionNavItem = styled.div`
  padding: 12px 16px;
  margin: 6px 0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  gap: 8px;
  
  ${props => props.active ? css`
    background: linear-gradient(135deg, #3788d8, #2c3e50);
    color: white;
    transform: translateY(-1px);
    box-shadow: 
      0 4px 15px rgba(55, 136, 216, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    border-color: rgba(55, 136, 216, 0.3);
  ` : css`
    background: rgba(255, 255, 255, 0.7);
    color: #1a202c;
    border: 1px solid rgba(255, 255, 255, 0.3);
    
    &:hover {
      background: rgba(55, 136, 216, 0.1);
      transform: translateY(-1px);
      border-color: rgba(55, 136, 216, 0.3);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
  `}

  @media (max-width: 480px) {
    padding: 10px 12px;
    margin: 4px 0;
    width: 100%;
    max-width: 100%;
    
    ${props => props.active ? css`
      transform: none;
    ` : css`
      &:hover {
        transform: none;
      }
    `}
  }
`;

const SectionTitle2 = styled.div`
  font-weight: 600;
  font-size: 14px;
  flex: 1;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const SectionScore = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
  flex-shrink: 0;
  white-space: nowrap;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(55, 136, 216, 0.2)'};
  border: 1px solid ${props => props.active ? 'rgba(255, 255, 255, 0.3)' : 'rgba(55, 136, 216, 0.3)'};
`;

const ContentPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 1200px) {
    height: auto;
    overflow: visible;
    min-height: 50vh;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    width: 100%;
    max-width: 100%;
  }
`;

const ContentHeader = styled.div`
  padding: 20px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-width: 0;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px 20px;
    gap: 12px;
  }

  @media (max-width: 480px) {
    padding: 12px 16px;
    gap: 8px;
  }
`;

const ContentTitle = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const QuestionCounter = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
`;

const QuestionsContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  display: block;
  min-width: 0;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (max-width: 1200px) {
    height: auto;
    overflow-y: visible;
    min-height: 50vh;
  }

  @media (max-width: 768px) {
    padding: 16px 20px;
    width: 100%;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    padding: 12px;
    width: 100%;
    max-width: 100%;
  }
`;

const QuestionCard = styled.div`
  background: ${props => props.$isHighlighted ? 'rgba(255, 243, 205, 0.95)' : 'rgba(255, 255, 255, 0.9)'};
  border-radius: 16px;
  padding: 24px;
  margin: 6px 0 20px 0;
  border: 2px solid ${props => props.$isHighlighted ? '#f59e0b' : 'rgba(255, 255, 255, 0.4)'};
  transition: all 0.3s ease;
  box-shadow: 
    ${props => props.$isHighlighted ? '0 6px 20px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.3)'};
  position: relative;
  min-width: 0;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  ${props => props.$isHighlighted ? 'animation: pulse-highlight 2s ease-in-out infinite;' : ''}

  @keyframes pulse-highlight {
    0%, 100% {
      box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }
    50% {
      box-shadow: 0 8px 25px rgba(245, 158, 11, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }
  }

  @media (max-width: 768px) {
    padding: 16px;
    margin: 4px 0 16px 0;
    border-radius: 12px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    margin: 3px 0 12px 0;
    border-radius: 10px;
  }
  
  &:hover {
    border-color: rgba(55, 136, 216, 0.4);
    transform: translateY(-2px);
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);

    @media (max-width: 768px) {
      transform: translateY(-1px);
    }
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 1px;
    background: linear-gradient(90deg, transparent, #cbd5e0, transparent);
    border-bottom: 2px dotted #cbd5e0;
  }
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;
  min-width: 0;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    gap: 12px;
    margin-bottom: 12px;
  }

  @media (max-width: 480px) {
    gap: 8px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }
`;

const QuestionText = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  flex: 1;
  line-height: 1.5;
  min-width: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;

  @media (max-width: 768px) {
    font-size: 15px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    flex: 1 1 100%;
    min-width: 0;
  }
`;

const QuestionBadges = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    gap: 4px;
    flex-wrap: wrap;
    width: 100%;
    max-width: 100%;
  }
`;

const QuestionBadge = styled.div`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  ${props => props.type === 'mandatory' ? css`
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    color: white;
    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
  ` : css`
    background: linear-gradient(135deg, #3788d8, #2980b9);
    color: white;
    box-shadow: 0 2px 8px rgba(55, 136, 216, 0.3);
  `}
`;

const ScoreBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: ${props => props.hasResponse ?
    'linear-gradient(135deg, #27ae60, #2ecc71)' :
    'linear-gradient(135deg, #f3f4f6, #e5e7eb)'};
  color: ${props => props.hasResponse ? 'white' : '#6b7280'};
  box-shadow: ${props => props.hasResponse ?
    '0 2px 8px rgba(39, 174, 96, 0.3)' :
    '0 2px 8px rgba(0, 0, 0, 0.1)'};
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 4px 8px;
    font-size: 11px;
    gap: 3px;
    
    svg {
      width: 12px;
      height: 12px;
      flex-shrink: 0;
    }
  }

  @media (max-width: 768px) {
    padding: 5px 10px;
    font-size: 11px;
    gap: 3px;
  }

  @media (max-width: 480px) {
    padding: 4px 8px;
    font-size: 10px;
    gap: 2px;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 10px;
      height: 10px;
    }
  }
`;

const InputContainer = styled.div`
  ${props => props.$isUnanswered && props.$isRequired ? css`
    background-color: #fee2e2 !important;
    border: 2px solid #dc2626 !important;
    border-radius: 8px;
    padding: 8px;
    animation: pulse 2s infinite;
    
    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
      }
      50% {
        box-shadow: 0 0 0 4px rgba(220, 38, 38, 0);
      }
    }
  ` : ''}
  margin-top: 16px;
`;

const InputGroup = styled.div`
  position: relative;
  
  input, select, textarea {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    font-size: 14px;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 
      0 2px 8px rgba(0, 0, 0, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    
    &:focus {
      outline: none;
      border-color: #3788d8;
      box-shadow: 
        0 0 0 4px rgba(55, 136, 216, 0.1),
        0 4px 15px rgba(0, 0, 0, 0.1);
      background: white;
      transform: translateY(-1px);
    }
    
    &:disabled {
      background: #f9fafb;
      color: #6b7280;
      cursor: not-allowed;
      opacity: 0.7;
    }
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  ${props => props.$isUnanswered && props.$isRequired ? css`
    background-color: #fee2e2 !important;
    border: 2px solid #dc2626 !important;
    border-radius: 8px;
    padding: 12px;
    animation: pulse 2s infinite;
    
    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
      }
      50% {
        box-shadow: 0 0 0 4px rgba(220, 38, 38, 0);
      }
    }
  ` : ''}
`;

const OptionButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.9);
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  ${props => props.selected ? css`
    background: linear-gradient(135deg, #3788d8, #2c3e50);
    color: white;
    border-color: transparent;
    transform: translateY(-2px);
    box-shadow: 
      0 4px 15px rgba(55, 136, 216, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  ` : css`
    &:hover {
      background: rgba(55, 136, 216, 0.1);
      border-color: #3788d8;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  
  &:hover {
    background: rgba(55, 136, 216, 0.05);
    border-color: rgba(55, 136, 216, 0.2);
  }
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #3788d8;
  }
`;

const PreInspectionContainer = styled.div`
  margin: 6px;
`;

const PreInspectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(55, 136, 216, 0.1), rgba(44, 62, 80, 0.1));
  border-radius: 16px 16px 0 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const PreInspectionLockNotice = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 24px 0;
  padding: 12px 14px;
  background: rgba(245, 158, 11, 0.08);
  color: #92400e;
  border: 1px solid rgba(245, 158, 11, 0.22);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;

  svg {
    flex-shrink: 0;
  }
`;

const PreInspectionContent = styled.div`
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 0 0 16px 16px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
`;

const QuestionNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3788d8, #2c3e50);
  color: white;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(55, 136, 216, 0.3);
  border: 1px solid rgba(55, 136, 216, 0.3);
  min-width: 0;

  @media (max-width: 480px) {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }
`;

const QuestionRow = styled.div`
  display: flex;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 2px dashed rgba(0, 0, 0, 0.1);
  position: relative;
  
  &:last-child {
    border-bottom: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 1px;
    background: linear-gradient(90deg, transparent, #cbd5e0, transparent);
  }
`;

const QuestionContent = styled.div`
  flex: 1;
`;

const CommentSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.4);
`;

const CommentsContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
`;

const CommentTime = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const CommentText = styled.div`
  color: #374151;
  line-height: 1.5;
`;

const CommentForm = styled.form`
  display: flex;
  gap: 12px;
`;

const CommentInput = styled.textarea`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  resize: none;
  height: 80px;
  font-family: inherit;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  
  &:focus {
    outline: none;
    border-color: #3788d8;
    box-shadow: 
      0 0 0 4px rgba(55, 136, 216, 0.1),
      0 4px 15px rgba(0, 0, 0, 0.1);
  }
`;

const SendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #3788d8, #2c3e50);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-end;
  box-shadow: 
    0 4px 15px rgba(55, 136, 216, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(55, 136, 216, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 25px rgba(55, 136, 216, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #64748b;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  &:hover {
    background: rgba(55, 136, 216, 0.1);
    color: #3788d8;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: rgba(55, 136, 216, 0.3);
  }
  
  svg {
    animation: ${props => props.loading ? css`${rotate} 1s linear infinite` : 'none'};
  }
`;

const ScoreCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.4);
  margin: 6px;
  min-width: 0;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 16px;
    margin: 4px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 12px;
    margin: 2px;
  }
`;

const ScoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    margin-top: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 8px;
    margin-top: 8px;
  }
`;

const ScoreItem = styled.div`
  background: rgba(255, 255, 255, 0.7);
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.4);
  margin: 6px;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  min-width: 0;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 12px;
    border-radius: 10px;
    margin: 4px;
  }

  @media (max-width: 480px) {
    padding: 10px;
    border-radius: 8px;
    margin: 2px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 4px 15px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
    border-color: rgba(55, 136, 216, 0.3);

    @media (max-width: 768px) {
      transform: translateY(-1px);
    }
  }
`;

const ScoreLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
`;

const ScoreValue = styled.div`
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #3788d8, #2c3e50);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 20px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const MetricCard = styled.div`
  background: ${props => props.$bgColor || 'rgba(255, 255, 255, 0.1)'};
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  min-width: 0;
  overflow: hidden;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 8px;
  }
`;

const MetricLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 11px;
    margin-bottom: 6px;
  }

  @media (max-width: 480px) {
    font-size: 10px;
    margin-bottom: 4px;
  }
`;

const MetricValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: ${props => props.$color || '#3788d8'};
  margin-bottom: 4px;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 24px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const MetricDescription = styled.div`
  font-size: 14px;
  color: #64748b;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 13px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const PageScoresContainer = styled.div`
  margin-top: 24px;
  background: rgba(248, 250, 252, 0.9);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
  min-width: 0;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 12px;
    margin-top: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 10px;
    margin-top: 12px;
  }
`;

const PageScoreItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin: 6px 0;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  min-width: 0;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 12px;
    border-radius: 10px;
    margin: 4px 0;
    flex-wrap: wrap;
    gap: 8px;
  }

  @media (max-width: 480px) {
    padding: 10px;
    border-radius: 8px;
    margin: 3px 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 4px 15px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
    border-color: rgba(55, 136, 216, 0.3);

    @media (max-width: 768px) {
      transform: translateY(-1px);
    }
  }
`;

const SectionCommentsContainer = styled.div`
  margin-top: 32px;
  padding: 20px;
  background: rgba(55, 136, 216, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(55, 136, 216, 0.1);
  min-width: 0;
  overflow: hidden;

  @media (max-width: 768px) {
    margin-top: 24px;
    padding: 16px;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    margin-top: 16px;
    padding: 12px;
    border-radius: 8px;
  }
`;

const SectionCommentsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;

  @media (max-width: 768px) {
    font-size: 15px;
    gap: 6px;
    margin-bottom: 12px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    gap: 4px;
    margin-bottom: 10px;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }
`;

const CommentsList = styled.div`
  margin-bottom: 16px;

  @media (max-width: 480px) {
    margin-bottom: 12px;
  }
`;

const CommentItem = styled.div`
  margin-bottom: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  min-width: 0;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 10px;
  }

  @media (max-width: 480px) {
    padding: 8px;
    border-radius: 6px;
    margin-bottom: 8px;
  }
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 4px;

  @media (max-width: 480px) {
    margin-bottom: 6px;
  }
`;

const CommentAuthor = styled.span`
  font-weight: 600;
  color: #374151;
  font-size: 14px;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const CommentDate = styled.span`
  font-size: 12px;
  color: #6b7280;

  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const CommentContent = styled.div`
  color: #374151;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
  font-size: 14px;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const CommentInputContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;

  @media (max-width: 768px) {
    gap: 10px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
`;

const CommentTextarea = styled.textarea`
  flex: 1;
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  box-sizing: border-box;
  min-width: 0;
  max-width: 100%;

  @media (max-width: 768px) {
    padding: 10px;
    font-size: 13px;
    min-height: 70px;
    width: 100%;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    padding: 8px;
    font-size: 13px;
    min-height: 60px;
    border-radius: 6px;
    width: 100%;
    max-width: 100%;
  }

  &:focus {
    outline: none;
    border-color: #3788d8;
    box-shadow: 0 0 0 2px rgba(55, 136, 216, 0.1);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

const CommentSubmitButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  background: ${props => props.disabled
    ? '#9ca3af'
    : 'linear-gradient(135deg, #3788d8, #2980b9)'};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  flex-shrink: 0;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
    gap: 5px;
  }

  @media (max-width: 480px) {
    padding: 10px 16px;
    font-size: 13px;
    width: 100%;
    justify-content: center;
    width: 100%;
    justify-content: center;
    border-radius: 6px;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 14px;
      height: 14px;
    }
  }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(55, 136, 216, 0.3);
  }
`;

const ReportSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px;
  margin: 6px;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.4);
  min-width: 0;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 16px;
    margin: 4px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 12px;
    margin: 2px;
  }
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(55, 136, 216, 0.1);
`;

const ReportTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SignatureSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  border: 2px dashed rgba(55, 136, 216, 0.3);
  border-radius: 16px;
  background: rgba(55, 136, 216, 0.05);
  margin-top: 24px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
`;

const SignatureImage = styled.img`
  max-height: 120px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  background: white;
  padding: 16px;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
`;

const SignatureInfo = styled.div`
  text-align: center;
  margin-top: 16px;
  color: #64748b;
  font-size: 14px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(8px);
  animation: ${fadeIn} 0.3s ease-out;
  overflow: hidden;
  overscroll-behavior: contain;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.4);
  animation: ${fadeIn} 0.3s ease-out;
  margin: 20px;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 16px;
    width: calc(100% - 32px);
    max-width: none;
    margin: 16px;
    max-height: calc(100vh - 32px);
    padding-bottom: 20px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 12px;
    width: calc(100% - 20px);
    margin: 10px;
    max-height: calc(100vh - 20px);
    padding-bottom: 16px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;

  @media (max-width: 480px) {
    margin-bottom: 16px;
    padding-bottom: 10px;
  }
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
  word-wrap: break-word;
  overflow-wrap: break-word;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 18px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.2);
    transform: rotate(90deg);
  }
`;

const SignatureTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
`;

const SignatureTab = styled.button`
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  ${props => props.active ? css`
    background: linear-gradient(135deg, #3788d8, #2c3e50);
    color: white;
    transform: translateY(-2px);
    box-shadow: 
      0 4px 15px rgba(55, 136, 216, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  ` : css`
    background: #f3f4f6;
    color: #6b7280;
    border: 1px solid rgba(0, 0, 0, 0.1);
    
    &:hover {
      background: #e5e7eb;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  `}
`;

const SignatureCanvas = styled.div`
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  background: #f9fafb;
  margin-bottom: 20px;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  transition: all 0.3s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  min-height: 0;
  
  &:hover {
    border-color: ${props => props.clickable ? '#3788d8' : '#e5e7eb'};
    background: ${props => props.clickable ? 'rgba(55, 136, 216, 0.05)' : '#f9fafb'};
  }
  
  canvas {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    max-width: 100%;
    height: auto;
    
    @media (max-width: 480px) {
      width: 100% !important;
      height: 150px !important;
    }
  }
  
  @media (max-width: 768px) {
    padding: 16px;
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    margin-bottom: 12px;
  }
`;

const SignatureActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  flex-shrink: 0;
  margin-top: auto;
  
  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const SignatureButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ClearButton = styled(SignatureButton)`
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
  
  &:hover {
    background: #e5e7eb;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const SaveButton = styled(SignatureButton)`
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  border: none;
  
  &:hover {
    box-shadow: 
      0 4px 15px rgba(39, 174, 96, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
`;

const UploadButton = styled(SignatureButton)`
  background: linear-gradient(135deg, #3788d8, #2980b9);
  color: white;
  border: none;
  
  &:hover {
    box-shadow: 
      0 4px 15px rgba(55, 136, 216, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(55, 136, 216, 0.2);
  border-top: 4px solid #3788d8;
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
  margin: 20px auto;
`;

const LoadingIndicator = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #3788d8, #2c3e50);
  color: white;
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 
    0 4px 20px rgba(55, 136, 216, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
  border: 1px solid rgba(55, 136, 216, 0.3);
  
  svg {
    animation: ${rotate} 1s linear infinite;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
  
  h3 {
    font-size: 18px;
    color: #1a202c;
    margin: 16px 0 8px;
  }
  
  p {
    margin-bottom: 20px;
  }
`;

const StartTaskButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 32px auto;
  box-shadow: 
    0 4px 15px rgba(39, 174, 96, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(39, 174, 96, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 25px rgba(39, 174, 96, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ContinueButton = styled(StartTaskButton)`
  background: linear-gradient(135deg, #3788d8, #2c3e50);
  box-shadow: 
    0 4px 15px rgba(55, 136, 216, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(55, 136, 216, 0.3);
  
  &:hover {
    box-shadow: 
      0 8px 25px rgba(55, 136, 216, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
`;

const CompletionBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  ${props => props.complete ? css`
    background: linear-gradient(135deg, #27ae60, #2ecc71);
    color: white;
    box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
  ` : css`
    background: linear-gradient(135deg, #f39c12, #e67e22);
    color: white;
    box-shadow: 0 2px 8px rgba(243, 156, 18, 0.3);
  `}
`;

const formatTimeSpent = (timeInHours) => {
  if (!timeInHours || timeInHours === 0) return '0:00';

  const totalMinutes = Math.round(timeInHours * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  } else {
    return `0:${minutes.toString().padStart(2, '0')}`;
  }
};

// Format time from seconds with milliseconds
const formatTimeFromSeconds = (timeInSeconds) => {
  if (!timeInSeconds || timeInSeconds === 0) return '00:00:00.000';
  
  const totalSeconds = Math.floor(timeInSeconds);
  const milliseconds = Math.floor((timeInSeconds - totalSeconds) * 1000);
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  // Show HH:MM:SS.mmm format
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
};

// Format time as HH:MM for display (simpler format)
const formatTimeAsHHMM = (timeInSeconds) => {
  if (!timeInSeconds || timeInSeconds === 0) return '00:00';
  
  const totalSeconds = Math.floor(timeInSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

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

const StatusIcon = ({ status, size = 18 }) => {
  switch (status) {
    case 'pending':
      return <Clock size={size} />;
    case 'in_progress':
    case 'partial_compliance':
      return <Activity size={size} />;
    case 'completed':
    case 'full_compliance':
      return <CheckCircle size={size} />;
    case 'incomplete':
    case 'non_compliance':
      return <XCircle size={size} />;
    case 'not_applicable':
      return <AlertCircle size={size} />;
    default:
      return <Clock size={size} />;
  }
};

// NEW: Function to get unanswered questions in a section
const getUnansweredQuestionsInSection = (section, responses) => {
  if (!section || !section.questions || !responses) {
    return [];
  }

  const unanswered = [];

  section.questions.forEach(question => {
    // Only check required questions
    if (question.requirementType === 'recommended' || question.mandatory === false || question.required === false) {
      return; // Skip non-required questions
    }

    const questionId = question._id || question.id;
    let hasResponse = false;

    // Check if question has a response
    if (responses[questionId] !== undefined && responses[questionId] !== null && responses[questionId] !== '') {
      hasResponse = true;
    } else {
      const responseKey = Object.keys(responses).find(key =>
        key.includes(questionId) || key.endsWith(questionId)
      );
      if (responseKey && responses[responseKey] !== undefined && responses[responseKey] !== null && responses[responseKey] !== '') {
        hasResponse = true;
      }
    }

    if (!hasResponse) {
      unanswered.push(questionId);
    }
  });

  return unanswered;
};

const calculateSectionScore = (section, responses) => {
  if (!section || !section.questions || !responses) {
    return { total: 0, achieved: 0, percentage: 0 };
  }

  let totalPossible = 0;
  let totalAchieved = 0;

  section.questions.forEach(question => {
    // CRITICAL FIX: Exclude recommended questions from scoring
    if (question.requirementType === 'recommended' || question.mandatory === false || question.required === false) {
      return; // Skip recommended/non-mandatory questions
    }

    // CRITICAL FIX: Only score Yes/No and Compliance question types
    const questionType = question.type || question.answerType;
    const scorableTypes = ['yesno', 'compliance'];
    // Exclude non-scorable types: text, number, date, signature, file, media, checkbox, select, multiple_choice
    if (!scorableTypes.includes(questionType)) {
      return; // Skip text, signature, date, number, file, media, checkbox, select, multiple_choice and other non-scorable types
    }

    const questionId = question._id || question.id;
    let responseKey = null;

    if (responses[questionId] !== undefined) {
      responseKey = questionId;
    } else {
      responseKey = Object.keys(responses).find(key =>
        key.includes(questionId) || key.endsWith(questionId)
      );
    }

    const maxScore = question.scores?.max || question.scoring?.max || 2;
    const weight = question.weight || 1;

    totalPossible += (maxScore * weight);

    if (responseKey) {
      const response = responses[responseKey];

      if (response === 'na' || response === 'not_applicable' || response === 'N/A' || response === 'Not applicable') {
        totalPossible -= (maxScore * weight);
        return;
      }

      // Use template-defined scores if available
      if (question.scores && typeof question.scores === 'object') {
        // Get the score for this specific response from the template
        const responseScore = question.scores[response] || question.scores[response.toString()] || 0;
        totalAchieved += responseScore * weight;
      } else {
        // Fallback to old logic if no template scores defined
        // Only process compliance and yesno types (already filtered above)
        if (questionType === 'compliance' || questionType === 'yesno') {
          if (response === 'full_compliance' || response === 'yes' || response === 'Yes' || response === 'Full compliance') {
            totalAchieved += (maxScore * weight);
          } else if (response === 'partial_compliance' || response === 'Partial compliance') {
            totalAchieved += (maxScore / 2 * weight);
          }
        }
        // REMOVED: All other question types (text, signature, date, number, file, checkbox, multiple)
        // These should NEVER be scored
      }
    }
  });

  const percentage = totalPossible > 0 ? Math.round((totalAchieved / totalPossible) * 100) : 0;

  return {
    total: totalPossible,
    achieved: totalAchieved,
    percentage: percentage
  };
};

const calculatePageScore = (page, responses) => {
  if (!page || !page.sections) {
    return { total: 0, achieved: 0, percentage: 0 };
  }

  let pageTotal = 0;
  let pageAchieved = 0;

  page.sections.forEach(section => {
    const sectionScore = calculateSectionScore(section, responses);
    pageTotal += sectionScore.total;
    pageAchieved += sectionScore.achieved;
  });

  const percentage = pageTotal > 0 ? Math.round((pageAchieved / pageTotal) * 100) : 0;

  return {
    total: pageTotal,
    achieved: pageAchieved,
    percentage: percentage
  };
};

// Signature Canvas Component for individual questions - moved outside to prevent re-renders
const SignatureCanvasComponent = React.memo(({ questionId, response, metadata, isDisabled, onSaveResponse, formatCaptureMetadata }) => {
  const { t } = useTranslation();
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const signaturePadRef = useRef(null);

  const handleOpenSignatureModal = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDisabled) return;
    setShowSignatureModal(true);
  }, [isDisabled]);

  const handleCloseModal = useCallback(() => {
    setShowSignatureModal(false);
  }, []);

  const handleClearSignature = useCallback(() => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  }, []);

  const handleSaveSignature = useCallback(async () => {
    if (!signaturePadRef.current) return;

    if (signaturePadRef.current.isEmpty()) {
      toast.error(t('tasks.pleaseProvideSignatureBeforeSaving'));
      return;
    }

    const dataURL = signaturePadRef.current.toDataURL('image/png');
    const saved = await onSaveResponse(questionId, dataURL, { captureType: 'question_signature' });
    if (saved) {
      setShowSignatureModal(false);
      toast.success(t('tasks.signatureSavedSuccessfully'));
    }
  }, [questionId, onSaveResponse, t]);

  const handleDeleteSignature = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onSaveResponse(questionId, '');
    toast.success(t('tasks.signatureRemoved'));
  }, [questionId, onSaveResponse]);

  const handleModalOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      setShowSignatureModal(false);
    }
  }, []);

  const handleModalContentClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '16px', color: '#64748b', fontSize: '14px' }}>
        {isDisabled ? t('tasks.signature') : t('tasks.digitalSignatureRequired')}
      </div>

      {/* Signature Display or Button - NO EMBEDDED CANVAS */}
      {response ? (
        <div style={{
          border: '2px dashed #e5e7eb',
          borderRadius: '12px',
          padding: '16px',
          background: '#f9fafb',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#16a34a',
            fontWeight: '500',
            marginBottom: '12px'
          }}>
            ✅ {t('tasks.signatureCaptured')}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '8px',
              background: 'white',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <img
                src={response}
                alt="Signature preview"
                style={{
                  width: '200px',
                  height: '80px',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </div>
          </div>

          {metadata && (
            <div style={{
              fontSize: '12px',
              color: '#475569',
              marginBottom: '12px'
            }}>
              Captured: {formatCaptureMetadata ? formatCaptureMetadata(metadata) : 'N/A'}
            </div>
          )}

          {!isDisabled && (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleOpenSignatureModal}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #3788d8',
                  background: '#3788d8',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Update Signature
              </button>
              <button
                type="button"
                onClick={handleDeleteSignature}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #ef4444',
                  background: '#ef4444',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        // No signature - just show button to open modal (NO CANVAS HERE)
        <div style={{ textAlign: 'center' }}>
          {!isDisabled && (
            <button
              type="button"
              onClick={handleOpenSignatureModal}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: '1px solid #3788d8',
                background: '#3788d8',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              ✏️ Add Signature
            </button>
          )}
          {isDisabled && (
            <div style={{
              fontSize: '14px',
              color: '#9ca3af',
              padding: '12px'
            }}>
              No signature provided
            </div>
          )}
        </div>
      )}

      {/* Signature Modal - Canvas ONLY appears here */}
      {showSignatureModal && ReactDOM.createPortal(
        <ModalOverlay onClick={handleModalOverlayClick}>
          <ModalContent onClick={handleModalContentClick}>
            <ModalHeader>
              <ModalTitle>Digital Signature</ModalTitle>
              <CloseButton type="button" onClick={handleCloseModal}>
                ✕
              </CloseButton>
            </ModalHeader>

            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                Please sign in the area below
              </div>

              <div style={{
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                background: 'white',
                overflow: 'hidden'
              }}>
                <SignaturePad
                  ref={signaturePadRef}
                  canvasProps={{
                    width: 500,
                    height: 200,
                    style: {
                      width: '100%',
                      height: '200px'
                    }
                  }}
                  backgroundColor="#ffffff"
                  penColor="#000000"
                />
              </div>
            </div>

            <SignatureActions>
              <ClearButton type="button" onClick={handleClearSignature}>
                Clear
              </ClearButton>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {t('common.cancel')}
              </button>
              <SaveButton type="button" onClick={handleSaveSignature}>
                {t('tasks.saveSignature')}
              </SaveButton>
            </SignatureActions>
          </ModalContent>
        </ModalOverlay>,
        document.body
      )}
    </div>
  );
});

// Set display name for better debugging
SignatureCanvasComponent.displayName = 'SignatureCanvasComponent';

const UserTaskDetail = () => {
  const dispatch = useDispatch();
  const { taskId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const commentBoxRef = useRef(null);
  const timerRef = useRef(null);
  const signatureCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const lastKnownLocationRef = useRef(null);
  
  // Refs for debouncing progress updates to reduce API calls
  const progressUpdateTimeoutRef = useRef(null);
  const lastProgressUpdateRef = useRef(0);
  const [commentText, setCommentText] = useState('');
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureImage, setSignatureImage] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showProgressDetails, setShowProgressDetails] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState('draw');
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showUnansweredModal, setShowUnansweredModal] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [signatureJustSaved, setSignatureJustSaved] = useState(false);
  const [showDocumentNamingModal, setShowDocumentNamingModal] = useState(false);
  const [selectedReportFormat, setSelectedReportFormat] = useState('excel');
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [inspectionPages, setInspectionPages] = useState([]);
  const [scores, setScores] = useState({
    total: 0,
    achieved: 0,
    percentage: 0,
    checkpointScores: {},
    assessmentAreaScores: {}
  });
  const [taskCompletionPercentage, setTaskCompletionPercentage] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [showPageDropdown, setShowPageDropdown] = useState(false);
  const [localInputValues, setLocalInputValues] = useState({});
  const [locationHelpModal, setLocationHelpModal] = useState({
    open: false,
    reason: '',
    permissionState: 'unknown',
    errorCode: null,
    steps: []
  });

  // CRITICAL FIX: Track unanswered required questions for validation
  const [unansweredRequiredQuestions, setUnansweredRequiredQuestions] = useState(new Set());
  
  // NEW: Track highlight mode for unanswered questions in current section
  const [highlightUnansweredMode, setHighlightUnansweredMode] = useState(false);
  const [currentSectionUnansweredQuestions, setCurrentSectionUnansweredQuestions] = useState(new Set());

  // Section comments state
  const [sectionComments, setSectionComments] = useState({});
  const [sectionCommentTexts, setSectionCommentTexts] = useState({});
  const [commentLoadingStates, setCommentLoadingStates] = useState({});

  // Enhanced time tracking state
  const [isScreenActive, setIsScreenActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0); // in seconds
  const [displayTime, setDisplayTime] = useState(0); // in seconds with milliseconds for display
  const sessionTimerRef = useRef(null);
  const displayTimerRef = useRef(null);
  const accumulatedTimeRef = useRef(0); // Ref to track accumulated time for timer updates
  const sessionStartTimeRef = useRef(null); // Ref to track session start time for timer updates

  // Auto-update functionality - DISABLED by default to prevent infinite API calls
  const autoUpdateRef = useRef(null);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);

  // Track user interactions to prevent auto-update interference
  const userActiveRef = useRef(false);

  // Refs for focus management
  const sectionNavigationRef = useRef(null);
  const pageNavigationRef = useRef(null);
  const dropdownRef = useRef(null);
  const questionsContentRef = useRef(null);

  // Derive currentPage from inspectionPages and selectedPage
  const currentPage = useMemo(() => {
    if (!inspectionPages || !selectedPage) return null;
    return inspectionPages.find(p => (p.id || p._id) === selectedPage);
  }, [inspectionPages, selectedPage]);

  // Derive currentSection from currentPage and selectedSection
  const currentSection = useMemo(() => {
    if (!currentPage || !selectedSection) return null;
    return currentPage.sections?.find(s => (s.id || s._id) === selectedSection);
  }, [currentPage, selectedSection]);

  // Issue 3.2 Fix: Scroll to top when switching sections or pages
  useEffect(() => {
    if (questionsContentRef.current) {
      questionsContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedPage, selectedSection]);

  // Log auto-update status
  useEffect(() => {
    console.log('Auto-update enabled:', autoUpdateEnabled);
  }, [autoUpdateEnabled]);

  // Handle click outside dropdown to close it
  useEffect(() => {
    if (!showPageDropdown) return;
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPageDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showPageDropdown]);

  const {
    currentTask,
    loading,
    error,
    actionLoading
  } = useSelector((state) => state.userTasks);

  const scheduledStartLocked = Boolean(
    currentTask?.startDate && new Date(currentTask.startDate).getTime() > Date.now()
  );

  useEffect(() => {
    if (!currentTask?.startDate) return undefined;

    const unlockDelay = new Date(currentTask.startDate).getTime() - Date.now();
    if (unlockDelay <= 0) return undefined;

    const timer = setTimeout(() => {
      setLastUpdateTime(Date.now());
    }, Math.min(unlockDelay + 1000, 2147483647));

    return () => clearTimeout(timer);
  }, [currentTask?.startDate]);

  // Define calculateTaskCompletionPercentage BEFORE all useEffects that use it
  const calculateTaskCompletionPercentage = useCallback((taskData = null) => {
    const taskToUse = taskData || currentTask;

    if (!taskToUse || !inspectionPages || inspectionPages.length === 0) {
      if (!taskData) setTaskCompletionPercentage(0); // Only update state if using current task
      return 0;
    }

    let totalQuestions = 0;
    let answeredQuestions = 0;

    inspectionPages.forEach(page => {
      if (page.sections) {
        page.sections.forEach(section => {
          if (section.questions) {
            section.questions.forEach(question => {
              // CRITICAL FIX: Only count required questions in progress calculation
              // Exclude recommended questions
              if (question.requirementType === 'recommended' || question.mandatory === false || question.required === false) {
                return; // Skip recommended/non-mandatory questions
              }

              totalQuestions++;

              const questionId = question._id || question.id;
              let hasResponse = false;

              if (taskToUse.questionnaireResponses) {
                if (taskToUse.questionnaireResponses[questionId] !== undefined) {
                  const response = taskToUse.questionnaireResponses[questionId];
                  // Count as answered if response exists and is not empty
                  hasResponse = response !== null && response !== undefined && response !== '';
                } else {
                  const responseKey = Object.keys(taskToUse.questionnaireResponses).find(key =>
                    key.includes(questionId) || key.endsWith(questionId)
                  );

                  if (responseKey) {
                    const response = taskToUse.questionnaireResponses[responseKey];
                    // Count as answered if response exists and is not empty
                    hasResponse = response !== null && response !== undefined && response !== '';
                  }
                }
              }

              if (hasResponse) {
                answeredQuestions++;
              }
            });
          }
        });
      }
    });

    if (taskToUse.preInspectionQuestions && taskToUse.preInspectionQuestions.length > 0) {
      taskToUse.preInspectionQuestions.forEach(question => {
        totalQuestions++;
        if (taskToUse.questionnaireResponses &&
          taskToUse.questionnaireResponses[question._id] !== undefined) {
          answeredQuestions++;
        }
      });
    }

    const percentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

    console.log(`Task completion calculation: ${answeredQuestions}/${totalQuestions} = ${percentage}% (using ${taskData ? 'fresh data' : 'current state'})`);

    if (!taskData) {
      setTaskCompletionPercentage(percentage);
      setLastUpdateTime(Date.now()); // Force re-render
    }

    return percentage;
  }, [currentTask, inspectionPages]);

  // Function to get detailed list of unanswered required questions
  const getUnansweredQuestionsDetails = useCallback(() => {
    const unansweredDetails = [];

    if (!currentTask || !inspectionPages || inspectionPages.length === 0) {
      return unansweredDetails;
    }

    inspectionPages.forEach((page, pageIndex) => {
      if (page.sections) {
        page.sections.forEach((section, sectionIndex) => {
          if (section.questions) {
            section.questions.forEach((question, questionIndex) => {
              // Only check required questions
              if (question.requirementType === 'recommended' || question.mandatory === false || question.required === false) {
                return; // Skip recommended/non-mandatory questions
              }

              const questionId = question._id || question.id;
              let hasResponse = false;

              if (currentTask.questionnaireResponses) {
                if (currentTask.questionnaireResponses[questionId] !== undefined) {
                  const response = currentTask.questionnaireResponses[questionId];
                  hasResponse = response !== null && response !== undefined && response !== '';
                } else {
                  const responseKey = Object.keys(currentTask.questionnaireResponses).find(key =>
                    key.includes(questionId) || key.endsWith(questionId)
                  );

                  if (responseKey) {
                    const response = currentTask.questionnaireResponses[responseKey];
                    hasResponse = response !== null && response !== undefined && response !== '';
                  }
                }
              }

              if (!hasResponse) {
                unansweredDetails.push({
                  pageName: page.name || `Page ${pageIndex + 1}`,
                  pageIndex: pageIndex + 1,
                  sectionName: section.name || `Section ${sectionIndex + 1}`,
                  sectionIndex: sectionIndex + 1,
                  questionText: question.question || question.text || `Question ${questionIndex + 1}`,
                  questionIndex: questionIndex + 1,
                  questionId: questionId
                });
              }
            });
          }
        });
      }
    });

    return unansweredDetails;
  }, [currentTask, inspectionPages]);

  // Add readonly mode check for archived tasks
  const isArchivedTask = currentTask?.status === 'archived';

  // Switch to Overview tab if on Inspection tab for archived tasks
  // useEffect(() => {
  //   if (isArchivedTask && activeTab === 'inspection') {
  //     setActiveTab('overview');
  //   }
  // }, [isArchivedTask, activeTab]);

  // Ref to store current task data for timer functions (prevents recreation on task updates)
  const currentTaskRef = useRef(null);
  
  // Keep ref in sync with currentTask
  useEffect(() => {
    currentTaskRef.current = currentTask;
  }, [currentTask]);

  // Effect to update unanswered questions when section changes or responses change
  useEffect(() => {
    if (highlightUnansweredMode && currentSection && currentTask) {
      const unanswered = getUnansweredQuestionsInSection(currentSection, currentTask.questionnaireResponses || {});
      setCurrentSectionUnansweredQuestions(new Set(unanswered));
      
      // If all questions are now answered, turn off highlight mode
      if (unanswered.length === 0 && highlightUnansweredMode) {
        setHighlightUnansweredMode(false);
        toast.success('All questions answered!', { duration: 2000 });
      }
    }
  }, [highlightUnansweredMode, currentSection, currentTask?.questionnaireResponses]);

  // Define timer functions BEFORE useEffects that use them
  // CRITICAL FIX: Use refs instead of currentTask to prevent infinite loops
  const startScreenTimer = useCallback(() => {
    const task = currentTaskRef.current;
    // Only start timer if task is in_progress and not completed/archived
    if (task?.status !== 'in_progress' || task?.signature || task?.status === 'completed' || task?.status === 'archived') {
      return; // Don't start timer for completed/archived tasks
    }

    if (!isScreenActive) {
      setIsScreenActive(true);
      const now = Date.now();
      sessionStartTimeRef.current = now;
      setSessionStartTime(now);

      // Clear any existing timer
      if (displayTimerRef.current) {
        clearInterval(displayTimerRef.current);
      }

      // Update display timer every 100ms for smooth milliseconds display
      displayTimerRef.current = setInterval(() => {
        if (sessionStartTimeRef.current) {
          const elapsed = (Date.now() - sessionStartTimeRef.current) / 1000; // in seconds
          const totalTime = accumulatedTimeRef.current + elapsed;
          setDisplayTime(totalTime);
        }
      }, 100);
    }
  }, [isScreenActive]); // FIXED: Removed currentTask dependency

  // CRITICAL FIX: Use refs instead of currentTask to prevent infinite loops
  const pauseScreenTimer = useCallback(async (saveToBackend = true) => {
    if (isScreenActive) {
      setIsScreenActive(false);

      if (sessionStartTimeRef.current) {
        const sessionDuration = (Date.now() - sessionStartTimeRef.current) / 1000; // in seconds
        const newAccumulatedTime = accumulatedTimeRef.current + sessionDuration;
        accumulatedTimeRef.current = newAccumulatedTime;
        setAccumulatedTime(newAccumulatedTime);
        setDisplayTime(newAccumulatedTime); // Update display time to accumulated time
        sessionStartTimeRef.current = null;
        setSessionStartTime(null);
      }

      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }

      if (displayTimerRef.current) {
        clearInterval(displayTimerRef.current);
        displayTimerRef.current = null;
      }

      // Save time to backend when pausing (e.g., when navigating away)
      const task = currentTaskRef.current;
      if (saveToBackend && task && task.status === 'in_progress' && !task.signature && task.status !== 'completed' && task.status !== 'archived') {
        const totalActiveTimeInSeconds = accumulatedTimeRef.current;
        if (totalActiveTimeInSeconds > 0) {
          try {
            // Use synchronous dispatch or ensure it completes
            await dispatch(updateUserTaskProgress({
              taskId: task._id,
              subLevelId: task.inspectionLevel?.subLevels?.[0]?._id || 'default',
              status: task.status,
              taskMetrics: {
                ...task.taskMetrics,
                timeSpent: totalActiveTimeInSeconds // Save in seconds
              }
            }));
          } catch (error) {
            console.error('Failed to save time to backend on pause:', error);
          }
        }
      }
    }
  }, [isScreenActive, dispatch]); // FIXED: Removed currentTask dependency

  // CRITICAL FIX: Use refs instead of currentTask to prevent infinite loops
  const stopTimerPermanently = useCallback(() => {
    pauseScreenTimer();
    // Save final time to backend when task is completed
    const task = currentTaskRef.current;
    if (task && (accumulatedTimeRef.current > 0 || sessionStartTimeRef.current)) {
      const finalSessionTime = sessionStartTimeRef.current ? (Date.now() - sessionStartTimeRef.current) / 1000 : 0;
      const totalActiveTimeInSeconds = accumulatedTimeRef.current + finalSessionTime;

      // Update task metrics with final time in seconds (backend will handle conversion if needed)
      dispatch(updateUserTaskProgress({
        taskId: task._id,
        subLevelId: task.inspectionLevel?.subLevels?.[0]?._id || 'default',
        status: task.status,
        taskMetrics: {
          ...task.taskMetrics,
          timeSpent: totalActiveTimeInSeconds // Save in seconds
        }
      }));
    }
  }, [pauseScreenTimer, dispatch]); // FIXED: Removed currentTask dependency

  const calculateScores = useCallback((taskData = null) => {
    const taskToUse = taskData || currentTask;
    if (!taskToUse) return;

    try {
      let totalPoints = 0;
      let achievedPoints = 0;

      inspectionPages.forEach(page => {
        if (!page.sections) return;

        page.sections.forEach(section => {
          if (!section.questions) return;

          const pageScore = calculateSectionScore(section, taskToUse.questionnaireResponses || {});
          totalPoints += pageScore.total;
          achievedPoints += pageScore.achieved;
        });
      });

      if (totalPoints === 0) {
        if (!taskData) { // Only update state if using current task
          setScores({
            total: 0,
            achieved: 0,
            percentage: 0,
            checkpointScores: {},
            assessmentAreaScores: {}
          });
        }
        return;
      }

      const percentage = Math.round((achievedPoints / totalPoints) * 100) || 0;

      const result = {
        total: totalPoints,
        achieved: achievedPoints,
        percentage,
        checkpointScores: {},
        assessmentAreaScores: {}
      };

      if (!taskData) { // Only update state if using current task
        setScores(result);
      }

      return result;
    } catch (error) {
      console.error('Error calculating scores:', error);
      if (!taskData) { // Only update state if using current task
        setScores({
          total: 0,
          achieved: 0,
          percentage: 0,
          checkpointScores: {},
          assessmentAreaScores: {}
        });
      }
    }
  }, [currentTask, inspectionPages]);

  useEffect(() => {
    dispatch(fetchUserTaskDetails(taskId));

    if (location.state?.questionnaireCompleted) {
      setActiveTab('inspection');
    }
  }, [dispatch, taskId, location.state]);

  // Add keyboard navigation for sections and pages
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only enable keyboard navigation when in inspection tab and not typing in inputs
      if (activeTab !== 'inspection' ||
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.tagName === 'SELECT') {
        return;
      }

      // Alt + Arrow keys for page navigation
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          // Navigate to previous page
          const currentPageIndex = inspectionPages.findIndex(p => (p.id || p._id) === selectedPage);
          if (currentPageIndex > 0) {
            const prevPage = inspectionPages[currentPageIndex - 1];
            const prevPageId = prevPage.id || prevPage._id;
            setSelectedPage(prevPageId);
            if (prevPage.sections && prevPage.sections.length > 0) {
              const firstSectionId = prevPage.sections[0].id || prevPage.sections[0]._id;
              setSelectedSection(firstSectionId);
            }
          }
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          // Navigate to next page
          const currentPageIndex = inspectionPages.findIndex(p => (p.id || p._id) === selectedPage);
          if (currentPageIndex < inspectionPages.length - 1) {
            const nextPage = inspectionPages[currentPageIndex + 1];
            const nextPageId = nextPage.id || nextPage._id;
            setSelectedPage(nextPageId);
            if (nextPage.sections && nextPage.sections.length > 0) {
              const firstSectionId = nextPage.sections[0].id || nextPage.sections[0]._id;
              setSelectedSection(firstSectionId);
            }
          }
        }
      }

      // Ctrl + Arrow keys for section navigation
      if (e.ctrlKey && !e.altKey && !e.shiftKey && currentPage && currentPage.sections) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          // Navigate to previous section
          const currentSectionIndex = currentPage.sections.findIndex(s => (s.id || s._id) === selectedSection);
          if (currentSectionIndex > 0) {
            const prevSection = currentPage.sections[currentSectionIndex - 1];
            const prevSectionId = prevSection.id || prevSection._id;
            setSelectedSection(prevSectionId);
          }
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          // Navigate to next section
          const currentSectionIndex = currentPage.sections.findIndex(s => (s.id || s._id) === selectedSection);
          if (currentSectionIndex < currentPage.sections.length - 1) {
            const nextSection = currentPage.sections[currentSectionIndex + 1];
            const nextSectionId = nextSection.id || nextSection._id;
            setSelectedSection(nextSectionId);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, inspectionPages, selectedPage, selectedSection, currentPage]);

  // Initialize timer when task is loaded
  const taskInitializedRef = useRef(false);
  const lastTaskIdRef = useRef(null);
  
  useEffect(() => {
    // Reset initialization flag when task ID changes
    if (lastTaskIdRef.current !== currentTask?._id) {
      // Save time for previous task before switching (if timer was active)
      if (lastTaskIdRef.current && isScreenActive) {
        pauseScreenTimer(true);
      }
      
      taskInitializedRef.current = false;
      lastTaskIdRef.current = currentTask?._id;
      
      // Reset timer state when task changes
      accumulatedTimeRef.current = 0;
      sessionStartTimeRef.current = null;
      setAccumulatedTime(0);
      setDisplayTime(0);
      setIsScreenActive(false);
    }
    
    // Always initialize from backend when task is first loaded or task ID changes
    if (currentTask?._id && !taskInitializedRef.current) {
      taskInitializedRef.current = true;
      
      // Always load time from backend when returning to the page
      if (currentTask?.taskMetrics?.timeSpent !== undefined) {
        const timeInSeconds = currentTask.taskMetrics.timeSpent;
        accumulatedTimeRef.current = timeInSeconds;
        setAccumulatedTime(timeInSeconds);
        setDisplayTime(timeInSeconds);
      } else {
        accumulatedTimeRef.current = 0;
        setAccumulatedTime(0);
        setDisplayTime(0);
      }
    }
  }, [currentTask?._id, currentTask?.taskMetrics?.timeSpent, isScreenActive, pauseScreenTimer]);

  // Start/stop timer based on task status (separate effect to avoid resetting timer)
  // CRITICAL FIX: Only depend on status and signature, not on callbacks (they use refs now)
  useEffect(() => {
    // Start timer for in-progress tasks
    if (currentTask?.status === 'in_progress' && !currentTask?.signature && currentTask?.status !== 'completed' && currentTask?.status !== 'archived') {
      if (!isScreenActive) {
        // Small delay to ensure state is set
        const timer = setTimeout(() => {
          startScreenTimer();
        }, 100);
        return () => {
          clearTimeout(timer);
        };
      }
    } else {
      // Stop timer if task is not in progress
      if (isScreenActive) {
        pauseScreenTimer(false); // Don't save to backend here to avoid loops
      }
    }
  }, [currentTask?.status, currentTask?.signature, isScreenActive]); // FIXED: Removed callback dependencies

  // Handle page visibility changes
  // CRITICAL FIX: Use refs for task data to prevent infinite loops
  useEffect(() => {
    const handleVisibilityChange = () => {
      const task = currentTaskRef.current;
      if (document.hidden) {
        pauseScreenTimer(true); // Save to backend when page becomes hidden
      } else if (task?.status === 'in_progress' && !task?.signature && task?.status !== 'completed' && task?.status !== 'archived') {
        startScreenTimer();
      }
    };

    const handleBeforeUnload = () => {
      // Save time synchronously before unload
      if (sessionStartTimeRef.current) {
        const sessionDuration = (Date.now() - sessionStartTimeRef.current) / 1000;
        const totalActiveTimeInSeconds = accumulatedTimeRef.current + sessionDuration;
        
        const task = currentTaskRef.current;
        // Use sendBeacon or synchronous save for beforeunload
        if (task && task.status === 'in_progress' && totalActiveTimeInSeconds > 0) {
          // Save synchronously using navigator.sendBeacon or sync fetch
          const data = JSON.stringify({
            taskId: task._id,
            subLevelId: task.inspectionLevel?.subLevels?.[0]?._id || 'default',
            status: task.status,
            taskMetrics: {
              ...task.taskMetrics,
              timeSpent: totalActiveTimeInSeconds
            }
          });
          
          // Try to save using sendBeacon (works even after page unload starts)
          if (navigator.sendBeacon) {
            const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
            navigator.sendBeacon(
              `${apiBaseUrl}/api/v1/user-tasks/${task._id}/progress/${task.inspectionLevel?.subLevels?.[0]?._id || 'default'}`,
              data
            );
          }
        }
      }
      pauseScreenTimer(false); // Don't save again, already saved above
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Save time when component unmounts (e.g., navigating to another page)
      // This ensures time is saved before component is destroyed
      if (isScreenActive || sessionStartTimeRef.current) {
        pauseScreenTimer(true).catch(err => {
          console.error('Error saving time on unmount:', err);
        });
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isScreenActive]); // FIXED: Removed all callback and currentTask dependencies - they use refs now

  useEffect(() => {
    if (currentTask) {
      calculateScores();

      let pagesToUse = [];

      if (currentTask.inspectionLevel && currentTask.inspectionLevel.pages) {
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

      setInspectionPages(pagesToUse);

      // Only set default page/section if not already set (prevents overriding during auto-updates)
      if (pagesToUse.length > 0 && !selectedPage) {
        const firstPageId = pagesToUse[0]._id || pagesToUse[0].id;
        setSelectedPage(firstPageId);

        if (pagesToUse[0].sections && pagesToUse[0].sections.length > 0 && !selectedSection) {
          const firstSectionId = pagesToUse[0].sections[0]._id || pagesToUse[0].sections[0].id;
          setSelectedSection(firstSectionId);
        }
      }

      // Recalculate completion percentage when task data changes
      setTimeout(() => {
        const newPercentage = calculateTaskCompletionPercentage();
        console.log('Task data updated - new completion percentage:', newPercentage);
      }, 50);
    }
  }, [currentTask]); // Remove calculateTaskCompletionPercentage from dependencies to prevent infinite loop

  useEffect(() => {
    if (currentTask && currentTask.signature) {
      setSignatureImage(currentTask.signature);
    }
  }, [currentTask]);

  // Fetch section comments when section changes
  useEffect(() => {
    if (selectedSection && currentTask?._id) {
      fetchSectionComments(selectedSection);
    }
  }, [selectedSection, currentTask?._id]);

  useEffect(() => {
    if (showSignatureModal && signatureMethod === 'draw' && signatureCanvasRef.current) {
      const canvas = signatureCanvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'black';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
    }
  }, [showSignatureModal, signatureMethod]);

  // Lock body scroll when signature modal is open
  useEffect(() => {
    if (showSignatureModal) {
      // Save current body overflow style
      const originalOverflow = window.getComputedStyle(document.body).overflow;
      const originalPosition = window.getComputedStyle(document.body).position;
      const originalWidth = window.getComputedStyle(document.body).width;
      const scrollY = window.scrollY;
      
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
      
      return () => {
        // Restore original body styles
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.width = originalWidth;
        document.body.style.top = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showSignatureModal]);

  // Periodic save function to backup time data (define BEFORE useEffect)
  // CRITICAL FIX: Use refs instead of currentTask to prevent infinite loops
  const saveTimeToBackend = useCallback(async () => {
    const task = currentTaskRef.current;
    if (!task || task.status === 'completed' || task.signature || task.status === 'archived') {
      return;
    }

    const currentSessionTime = sessionStartTimeRef.current ? (Date.now() - sessionStartTimeRef.current) / 1000 : 0;
    const totalActiveTimeInSeconds = accumulatedTimeRef.current + currentSessionTime; // Keep in seconds

    if (totalActiveTimeInSeconds > 0) {
      try {
        await dispatch(updateUserTaskProgress({
          taskId: task._id,
          subLevelId: task.inspectionLevel?.subLevels?.[0]?._id || 'default',
          status: task.status,
          taskMetrics: {
            ...task.taskMetrics,
            timeSpent: totalActiveTimeInSeconds // Save in seconds
          }
        }));
      } catch (error) {
        console.error('Failed to save time to backend:', error);
      }
    }
  }, [dispatch]); // FIXED: Removed currentTask and sessionStartTime dependencies

  // Set up periodic time saving (every 2 minutes)
  // CRITICAL FIX: Use a ref to track if interval is set up to prevent recreation
  const saveIntervalRef = useRef(null);
  
  useEffect(() => {
    // Clear any existing interval first
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
    }
    
    if (currentTask?.status === 'in_progress' && !currentTask?.signature) {
      saveIntervalRef.current = setInterval(() => {
        saveTimeToBackend();
      }, 120000); // Save every 2 minutes
    }

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }
    };
  }, [currentTask?.status, currentTask?.signature]); // FIXED: Removed saveTimeToBackend dependency since it uses refs

  // Auto-update functionality - DISABLED by default to prevent server overload
  // This interval is kept only for manual enabling by user (via Live toggle) with a longer interval
  // Progress updates are now triggered only when user responds to questions (see handleSaveInspectionResponse)
  useEffect(() => {
    // Cleanup any existing interval first
    if (autoUpdateRef.current) {
      clearInterval(autoUpdateRef.current);
      autoUpdateRef.current = null;
    }

    // Only set up interval if explicitly enabled by user AND task is in progress
    if (autoUpdateEnabled && currentTask && currentTask._id && currentTask.status === 'in_progress') {
      console.log('Setting up progress auto-update every 60 seconds for task:', currentTask._id);

      // Use 60 second interval instead of 5 seconds to reduce server load
      autoUpdateRef.current = setInterval(async () => {
        try {
          // Skip update if user is actively interacting
          if (userActiveRef.current) {
            return;
          }

          // Only recalculate local progress without hitting the server
          // Server updates happen only when user responds to questions
          const newCompletionPercentage = calculateTaskCompletionPercentage();
          
          // Update local scores without API call
          calculateScores();
          
          console.log('Auto-update: Local progress recalculated:', newCompletionPercentage);

        } catch (error) {
          console.error('Auto-update failed:', error);
        }
      }, 60000); // Update every 60 seconds (was 5 seconds)
    }

    // Cleanup function to clear interval
    return () => {
      if (autoUpdateRef.current) {
        clearInterval(autoUpdateRef.current);
        autoUpdateRef.current = null;
      }
    };
  }, [autoUpdateEnabled, currentTask?._id, currentTask?.status]); // Keep dependencies minimal

  // Component cleanup effect
  useEffect(() => {
    return () => {
      // Clear all intervals and timers on unmount
      if (autoUpdateRef.current) {
        clearInterval(autoUpdateRef.current);
        autoUpdateRef.current = null;
      }
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
      // Clear debounced progress update timeout
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
        progressUpdateTimeoutRef.current = null;
      }
      // Clear debounce timers for text inputs
      if (debounceTimersRef.current) {
        Object.values(debounceTimersRef.current).forEach(timer => clearTimeout(timer));
      }
      console.log('UserTaskDetail component unmounted - all timers cleared');
    };
  }, []);

  const isPreInspectionCompleted = () => {
    if (!currentTask?.preInspectionQuestions || currentTask.preInspectionQuestions.length === 0) {
      return true;
    }

    const totalQuestions = currentTask.preInspectionQuestions.length;
    const answeredQuestions = currentTask.preInspectionQuestions.filter(question => {
      const response = currentTask.questionnaireResponses?.[question._id];
      return response !== undefined && response !== null && response !== '';
    }).length;

    return answeredQuestions === totalQuestions;
  };



  const handleStartTask = async () => {
    if (currentTask?.isActive === false || currentTask?.inspectionLevel?.isActive === false) {
      toast.error(t('auth.inspectionInactiveBanner') || 'This inspection is currently inactive and cannot be performed or submitted.');
      return;
    }

    if (scheduledStartLocked) {
      toast.error(t('tasks.lockedUntilStart', { date: formatDateTime(currentTask.startDate) }));
      return;
    }

    try {
      await userTaskService.startTask(taskId);
      toast.success(t('tasks.taskStartedSuccessfully'));

      // Log task start
      await FrontendLogger.logTaskStart(taskId, currentTask?.title || 'Unknown Task');

      dispatch(fetchUserTaskDetails(taskId));
      setActiveTab('inspection');

      // Initialize timer for newly started task
      setAccumulatedTime(0);
      startScreenTimer();
    } catch (error) {
      toast.error(error.response?.data?.message || t('tasks.failedToStartTask'));
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
      toast.error(error.message || t('tasks.failedToAddComment'));
    }
  };

  // Section comment functions
  const fetchSectionComments = async (sectionId) => {
    try {
      const data = await userTaskService.getSectionComments(currentTask._id, sectionId);
      setSectionComments(prev => ({
        ...prev,
        [sectionId]: data.data.comments || []
      }));
    } catch (error) {
      console.error('Error fetching section comments:', error);
    }
  };

  const handleSectionCommentSubmit = async (sectionId) => {
    const commentText = sectionCommentTexts[sectionId];
    if (!commentText?.trim()) return;

    setCommentLoadingStates(prev => ({ ...prev, [sectionId]: true }));

    try {
      const data = await userTaskService.addSectionComment(currentTask._id, sectionId, commentText.trim());

      // Add the new comment to the section comments
      setSectionComments(prev => ({
        ...prev,
        [sectionId]: [...(prev[sectionId] || []), data.data.comment]
      }));

      // Clear the comment text
      setSectionCommentTexts(prev => ({ ...prev, [sectionId]: '' }));

      toast.success(t('tasks.commentAddedSuccessfully'));
    } catch (error) {
      console.error('Error adding section comment:', error);
      toast.error(t('tasks.failedToAddComment'));
    } finally {
      setCommentLoadingStates(prev => ({ ...prev, [sectionId]: false }));
    }
  };

  const handleSectionCommentTextChange = (sectionId, text) => {
    setSectionCommentTexts(prev => ({ ...prev, [sectionId]: text }));
  };

  const handleRefreshProgress = async () => {
    if (!currentTask?.questionnaireResponses || actionLoading) return;

    setRefreshLoading(true);

    try {
      const completionPercentage = calculateTaskCompletionPercentage();

      await dispatch(updateUserTaskProgress({
        taskId: currentTask._id,
        subLevelId: currentTask.inspectionLevel?.subLevels?.[0]?._id || 'default',
        status: currentTask.status,
        taskMetrics: {
          ...currentTask.taskMetrics,
          completionPercentage: completionPercentage
        }
      })).unwrap();

      toast.success(t('tasks.progressUpdatedSuccessfully'));
    } catch (err) {
      toast.error(t('tasks.failedToUpdateProgress'));
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleExportReport = async () => {
    if (!currentTask) return;

    if (!currentTask.signature) {
      setShowSignatureModal(true);
      toast.info(t('tasks.pleaseProvideSignatureBeforeDownloading'));
      return;
    }

    setSelectedReportFormat('excel');
    setDocumentName(`${currentTask?.name || currentTask?.title || 'Inspection'}_EXCEL_${new Date().toISOString().split('T')[0]}`);
    setShowDocumentNamingModal(true);
  };

  const prepareTaskForExport = async () => {
    if (!currentTask) return;

    const completionPercentage = calculateTaskCompletionPercentage();

    if (currentTask.overallProgress !== completionPercentage) {
      await dispatch(updateUserTaskProgress({
        taskId: currentTask._id,
        subLevelId: currentTask.inspectionLevel?.subLevels?.[0]?._id || 'default',
        status: currentTask.status,
        taskMetrics: {
          ...currentTask.taskMetrics,
          completionPercentage: completionPercentage,
          subLevelTimeSpent: { ...(currentTask.taskMetrics?.subLevelTimeSpent || {}) }
        }
      })).unwrap();
    }
  };

  const handleExportClick = () => {
    setShowExportDropdown(!showExportDropdown);
  };

  const handleExportFormat = (format) => {
    setSelectedReportFormat(format);
    setShowExportDropdown(false);
    setDocumentName(`${currentTask?.name || 'Inspection'}_${format.toUpperCase()}_${new Date().toISOString().split('T')[0]}`);
    setShowDocumentNamingModal(true);
  };

  const handleSubmitAndDownloadLater = async () => {
    try {
      toast.loading(t('tasks.submittingInspectionForLaterDownload'));

      // Archive the task without downloading
      await dispatch(archiveTask(currentTask._id)).unwrap();

      // Refresh task data
      await dispatch(fetchUserTaskDetails(currentTask._id));

      toast.dismiss();
      toast.success(t('tasks.inspectionSubmittedSuccessfully'));

    } catch (error) {
      toast.dismiss();
      toast.error(`${t('tasks.failedToSubmitInspection')}: ${error.message || t('common.error')}`);
    }
  };

  const handleConfirmDownload = async (fileName = documentName, language = 'en') => {
    const finalFileName = (fileName || documentName || '').trim();

    if (!finalFileName) {
      toast.error(t('tasks.pleaseEnterDocumentName'));
      return;
    }

    try {
      setShowDocumentNamingModal(false);
      toast.loading(t('tasks.generatingReportFormat', { format: selectedReportFormat.toUpperCase() }));
      await prepareTaskForExport();

      let result;

      switch (selectedReportFormat) {
        case 'excel':
          result = await dispatch(exportTaskReport({
            taskId: currentTask._id,
            format: 'excel',
            fileName: finalFileName,
            language
          })).unwrap();
          break;
        case 'pdf':
          result = await dispatch(exportTaskReport({
            taskId: currentTask._id,
            format: 'pdf',
            fileName: finalFileName,
            language
          })).unwrap();
          break;
        case 'docx':
          result = await dispatch(exportTaskReport({
            taskId: currentTask._id,
            format: 'docx',
            fileName: finalFileName,
            language
          })).unwrap();
          break;
        default:
          throw new Error('Unsupported format');
      }

      toast.dismiss();
      toast.success(t('tasks.reportFormatGeneratedSuccessfully', { format: selectedReportFormat.toUpperCase() }));

      // Here you would handle the actual download with the custom filename
      // For now, we'll use the existing export functionality

    } catch (error) {
      toast.dismiss();
      toast.error(`${t('tasks.failedToGenerateReportFormat', { format: selectedReportFormat.toUpperCase() })}: ${error.message || t('common.error')}`);
    }
  };

  // Refs for handling saves
  const debounceTimersRef = useRef({});
  const pendingSavesRef = useRef(new Set());

  // For text/number inputs - only update local state, API call happens on blur
  const handleInputChange = (questionId, value) => {
    setLocalInputValues(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const getCaptureMetadataFromLocation = useCallback(async (captureType = 'file') => {
    if (!navigator.geolocation) {
      throw new Error('Location services are not available on this device/browser.');
    }

    const detectOS = () => {
      const ua = (navigator.userAgent || '').toLowerCase();
      const platform = (navigator.userAgentData?.platform || navigator.platform || '').toLowerCase();

      if (platform.includes('mac') || ua.includes('mac os')) return 'macos';
      if (platform.includes('win') || ua.includes('windows')) return 'windows';
      if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) return 'ios';
      if (ua.includes('android')) return 'android';
      return 'other';
    };

    const showLocationSetupPopup = ({ permissionState, errorCode }) => {
      const os = detectOS();

      let osSteps = [];
      if (os === 'macos') {
        osSteps = [
          'macOS steps:',
          '1. Open System Settings > Privacy & Security > Location Services.',
          '2. Turn ON Location Services globally.',
          '3. Enable Google Chrome in the app list.',
          '4. If visible, enable Precise Location for Chrome.',
          '5. Quit Chrome fully (Cmd+Q), reopen, and reload this page.'
        ];
      } else if (os === 'windows') {
        osSteps = [
          'Windows steps:',
          '1. Open Settings > Privacy & security > Location.',
          '2. Turn ON Location services.',
          '3. Turn ON "Let desktop apps access your location".',
          '4. Restart Chrome and reload this page.'
        ];
      } else if (os === 'ios') {
        osSteps = [
          'iPhone/iPad steps:',
          '1. Open Settings > Privacy & Security > Location Services.',
          '2. Turn ON Location Services.',
          '3. Open Chrome > Location and set to "While Using the App".',
          '4. Reopen Chrome and reload this page.'
        ];
      } else if (os === 'android') {
        osSteps = [
          'Android steps:',
          '1. Open Settings > Location and turn it ON.',
          '2. Open App permissions > Chrome > Location and Allow.',
          '3. Open Chrome site settings for this site and Allow location.',
          '4. Reload this page.'
        ];
      } else {
        osSteps = [
          'Device steps:',
          '1. Enable system location services.',
          '2. Allow location access for your browser.',
          '3. Reload this page and retry.'
        ];
      }

      let reason = 'Unable to get a valid GPS/location fix.';
      if (permissionState === 'denied') {
        reason = 'Location permission is denied for this site/session.';
      } else if (errorCode === 1 && permissionState === 'granted') {
        reason = 'Browser permission is granted, but geolocation request was denied by the runtime (OS/Chrome).';
      } else if (errorCode === 1) {
        reason = 'Location permission is blocked at runtime.';
      }

      setLocationHelpModal({
        open: true,
        reason,
        permissionState: permissionState || 'unknown',
        errorCode: errorCode ?? null,
        steps: osSteps
      });
    };

    const readPermissionState = async () => {
      try {
        if (!navigator.permissions?.query) return 'unknown';
        const status = await navigator.permissions.query({ name: 'geolocation' });
        return status?.state || 'unknown';
      } catch (permissionError) {
        return 'unknown';
      }
    };

    const getPosition = (options) => new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const getPositionFromWatch = (options) => new Promise((resolve, reject) => {
      let settled = false;
      let watchId = null;
      let latestError = null;
      const timeoutMs = options?.timeout || 12000;

      const finalize = (fn, payload) => {
        if (settled) return;
        settled = true;
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
        }
        fn(payload);
      };

      watchId = navigator.geolocation.watchPosition(
        (pos) => finalize(resolve, pos),
        (err) => {
          latestError = err;
          if (err?.code === 1) {
            finalize(reject, err);
          }
        },
        options
      );

      setTimeout(() => {
        if (!settled) {
          finalize(reject, latestError || { code: 3, message: 'Location watch timed out.' });
        }
      }, timeoutMs);
    });

    const permissionState = await readPermissionState();
    if (permissionState === 'denied') {
      showLocationSetupPopup({ permissionState, errorCode: 1 });
      throw new Error('Location permission is required to save image/signature captures.');
    }

    let position = null;
    let lastError = null;
    const attempts = [
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 300000 }
    ];

    for (const options of attempts) {
      try {
        position = await getPosition(options);
        break;
      } catch (error) {
        console.warn('Geolocation capture failed for attempt', {
          captureType,
          permissionState,
          options,
          code: error?.code,
          message: error?.message
        });
        lastError = error;
        const shouldRetry = error?.code === 2 || error?.code === 3 || (error?.code === 1 && permissionState === 'granted');
        if (!shouldRetry) {
          break;
        }
      }
    }

    if (!position && permissionState === 'granted' && lastError?.code === 1) {
      // Extra retries for intermittent Chrome runtime denials.
      for (let retry = 0; retry < 3 && !position; retry += 1) {
        try {
          position = await getPosition({ enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 });
        } catch (finalError) {
          lastError = finalError || lastError;
          await wait(600);
        }
      }
    }

    if (!position && permissionState === 'granted' && (lastError?.code === 1 || lastError?.code === 2 || lastError?.code === 3)) {
      // Last fallback: watchPosition can recover in cases where getCurrentPosition intermittently fails.
      try {
        position = await getPositionFromWatch({ enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 });
      } catch (watchError) {
        lastError = watchError || lastError;
      }
    }

    if (!position) {
      const cachedLocation = lastKnownLocationRef.current;
      const cacheAgeMs = cachedLocation?.capturedAt
        ? Date.now() - new Date(cachedLocation.capturedAt).getTime()
        : Number.POSITIVE_INFINITY;

      // Use recent known coordinates (<=10 min) to avoid false negatives from transient browser runtime denial.
      if (cachedLocation?.location && cacheAgeMs <= 10 * 60 * 1000) {
        return {
          capturedAt: new Date().toISOString(),
          location: cachedLocation.location,
          locationStatus: 'granted',
          captureType
        };
      }

      if (lastError?.code === 1) {
        if (permissionState === 'granted') {
          // Do not block save when browser permission is granted but runtime intermittently denies geolocation.
          toast('Location coordinates are temporarily unavailable. Saving with timestamp only.', { icon: 'ℹ️' });
          return {
            capturedAt: new Date().toISOString(),
            locationStatus: 'unavailable',
            captureType
          };
        }
        showLocationSetupPopup({ permissionState, errorCode: 1 });
        throw new Error('Location permission is required to save image/signature captures.');
      }
      if (lastError?.code === 2) {
        showLocationSetupPopup({ permissionState, errorCode: 2 });
        throw new Error('Unable to fetch your location. Please enable GPS/location and try again.');
      }
      if (lastError?.code === 3) {
        showLocationSetupPopup({ permissionState, errorCode: 3 });
        throw new Error('Location request timed out. Please try again.');
      }
      showLocationSetupPopup({ permissionState, errorCode: lastError?.code });
      throw new Error('Unable to capture location. Please try again.');
    }

    const metadata = {
      capturedAt: new Date().toISOString(),
      location: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        ...(position.coords.accuracy !== undefined ? { accuracy: position.coords.accuracy } : {})
      },
      locationStatus: 'granted',
      captureType
    };
    lastKnownLocationRef.current = metadata;
    return metadata;
  }, []);

  const getResponseMetadataForQuestion = useCallback((taskData, questionId) => {
    const metadataMap = taskData?.responseMetadata || {};
    const id = String(questionId || '');
    if (!id) return null;

    if (metadataMap[id]) return metadataMap[id];
    if (metadataMap[`q-${id}`]) return metadataMap[`q-${id}`];
    if (metadataMap[`question-${id}`]) return metadataMap[`question-${id}`];

    const fuzzyKey = Object.keys(metadataMap).find((key) =>
      key === id || key.includes(id) || key.endsWith(id)
    );
    return fuzzyKey ? metadataMap[fuzzyKey] : null;
  }, []);

  const formatCaptureMetadata = useCallback((metadata) => {
    if (!metadata || typeof metadata !== 'object') return '';

    const capturedAt = metadata.capturedAt ? new Date(metadata.capturedAt).toLocaleString() : 'N/A';
    const lat = metadata.location?.latitude;
    const lng = metadata.location?.longitude;
    const coordinates = (lat !== undefined && lng !== undefined)
      ? `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`
      : 'N/A';

    return `${capturedAt} | ${coordinates}`;
  }, []);

  // For select/dropdown/radio/checkbox - call API immediately
  const handleOptionChange = (questionId, value) => {
    setLocalInputValues(prev => ({
      ...prev,
      [questionId]: value
    }));
    // Save immediately for option-based inputs
    handleSaveInspectionResponse(questionId, value);
  };

  const handleSaveInspectionResponse = async (questionId, value, options = {}) => {
    if (!currentTask || currentTask.status === 'completed' || currentTask.status === 'archived' || currentTask.isActive === false || currentTask.inspectionLevel?.isActive === false) {
      if (currentTask?.isActive === false || currentTask?.inspectionLevel?.isActive === false) {
        toast.error(t('auth.inspectionInactiveBanner') || 'This inspection is currently inactive and cannot be performed or submitted.');
      }
      return false;
    }

    if (scheduledStartLocked) {
      toast.error(t('tasks.lockedUntilStart', { date: formatDateTime(currentTask.startDate) }));
      return false;
    }

    // CRITICAL FIX: Prevent duplicate saves (race condition protection)
    const normalizedQuestionId = String(questionId);
    if (pendingSavesRef.current.has(normalizedQuestionId)) {
      return false; // Already saving this question
    }

    try {
      pendingSavesRef.current.add(normalizedQuestionId);

      // Store current state before API calls
      const currentPageId = selectedPage;
      const currentSectionId = selectedSection;
      const currentActiveTab = activeTab;
      
      // CRITICAL FIX: Store task data for use in setTimeout to avoid stale closures
      const taskId = currentTask._id;
      const subLevelId = currentTask.inspectionLevel?.subLevels?.[0]?._id || 'default';
      const taskStatus = currentTask.status;
      const taskMetrics = currentTask.taskMetrics;
      const currentOverallProgress = currentTask.overallProgress || 0;

      const currentResponses = currentTask.questionnaireResponses || {};
      const updatedResponses = {
        ...currentResponses,
        [normalizedQuestionId]: value
      };
      const currentResponseMetadata = currentTask.responseMetadata || {};
      let metadataPatch = (options?.responseMetadataPatch && typeof options.responseMetadataPatch === 'object')
        ? { ...options.responseMetadataPatch }
        : {};

      if (options?.captureType) {
        const captureMetadata = await getCaptureMetadataFromLocation(options.captureType);
        metadataPatch = {
          ...metadataPatch,
          [normalizedQuestionId]: captureMetadata
        };
      }

      const updatedResponseMetadata = Object.keys(metadataPatch).length > 0
        ? { ...currentResponseMetadata, ...metadataPatch }
        : currentResponseMetadata;

      // Only make ONE API call to save the questionnaire response
      await dispatch(updateTaskQuestionnaire({
        taskId: taskId,
        questionnaire: {
          responses: updatedResponses,
          responseMetadata: updatedResponseMetadata,
          notes: currentTask.questionnaireNotes || '',
          completed: false
        }
      })).unwrap();

      // Keep UI responsive: avoid blocking overlays and expensive forced refetches.
      toast.success(t('tasks.responseSavedSuccessfully'));

      // Recalculate local scores without API call
      calculateScores();

      // OPTIMIZED: Debounce progress updates to reduce API calls
      // Only update progress if more than 5 seconds have passed since last update
      const now = Date.now();
      const completionPercentage = calculateTaskCompletionPercentage();
      const progressDiff = Math.abs(completionPercentage - currentOverallProgress);

      // Clear any pending progress update
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }

      // Only schedule progress update if there's a significant change (>5%)
      // OR if enough time has passed (10 seconds) since last update
      if (progressDiff > 5 || (now - lastProgressUpdateRef.current > 10000 && progressDiff > 0)) {
        // Debounce progress update by 2 seconds to batch multiple rapid responses
        // CRITICAL FIX: Use captured values instead of currentTask to avoid stale closures
        progressUpdateTimeoutRef.current = setTimeout(async () => {
          try {
            await dispatch(updateUserTaskProgress({
              taskId: taskId,
              subLevelId: subLevelId,
              status: taskStatus,
              taskMetrics: {
                ...taskMetrics,
                completionPercentage: completionPercentage
              }
            })).unwrap();
            lastProgressUpdateRef.current = Date.now();
            console.log('Progress updated to:', completionPercentage);
          } catch (error) {
            console.error('Failed to update progress:', error);
          }
        }, 2000);
      }

      // REMOVED: Unnecessary fetchUserTaskDetails call
      // The questionnaire response is saved, no need to refetch entire task data
      // This was causing extra API calls and potential re-render loops

      // Restore state to prevent UI jumping
      if (currentActiveTab) {
        setActiveTab(currentActiveTab);
      }
      if (currentPageId) {
        setSelectedPage(currentPageId);
      }
      if (currentSectionId) {
        setSelectedSection(currentSectionId);
      }

      return true;

    } catch (error) {
      toast.error(`${t('tasks.failedToSaveResponse')}: ${error.message || t('common.error')}`);
      return false;
    } finally {
      pendingSavesRef.current.delete(normalizedQuestionId);
    }
  };

  const handleStartDrawing = (e) => {
    if (!signatureCanvasRef.current || signatureMethod !== 'draw') return;

    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const handleDrawing = (e) => {
    if (!isDrawing || !signatureCanvasRef.current || signatureMethod !== 'draw') return;

    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleStopDrawing = () => {
    if (!signatureCanvasRef.current || signatureMethod !== 'draw') return;

    setIsDrawing(false);

    const canvas = signatureCanvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    setSignatureImage(dataURL);
  };

  const handleClearSignature = () => {
    if (!signatureCanvasRef.current || signatureMethod !== 'draw') return;

    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSignatureImage(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file format and size (1MB limit) before processing
    const { validateFileWithToast } = await import('../../utils/fileValidation');
    if (!validateFileWithToast(file, toast, t)) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSignatureImage(event.target.result);
    };
    reader.onerror = () => {
      toast.error(t('tasks.failedToReadFile'));
    };
    reader.readAsDataURL(file);
  };

  const handleSignatureUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSaveSignature = async () => {
    if (!signatureImage) {
      toast.error(t('tasks.pleaseProvideSignatureBeforeSaving'));
      return;
    }

    try {
      toast.loading(t('tasks.savingSignature'));

      // Stop timer permanently when task is signed
      const finalSessionTime = sessionStartTimeRef.current ? (Date.now() - sessionStartTimeRef.current) / 1000 : 0;
      const totalActiveTimeInSeconds = accumulatedTimeRef.current + finalSessionTime; // Keep in seconds

      const completionPercentage = calculateTaskCompletionPercentage();
      const signatureMetadata = await getCaptureMetadataFromLocation('question_signature');

      await dispatch(saveTaskSignature({
        taskId: currentTask._id,
        signature: signatureImage,
        signatureMetadata,
        taskMetrics: {
          ...currentTask.taskMetrics,
          completionPercentage: completionPercentage,
          timeSpent: totalActiveTimeInSeconds, // Save in seconds
          subLevelTimeSpent: { ...(currentTask.taskMetrics?.subLevelTimeSpent || {}) }
        }
      })).unwrap();

      // Stop timer permanently
      stopTimerPermanently();

      await dispatch(fetchUserTaskDetails(currentTask._id));

      toast.dismiss();
      toast.success(t('tasks.signatureSavedSuccessfully'));
      setShowSignatureModal(false);

      // Clear signature image after successful save
      setSignatureImage(null);

      // Mark that signature was just saved
      setSignatureJustSaved(true);

      // Directly open the Complete & Archive modal
      setTimeout(() => {
        setShowArchiveModal(true);
      }, 500);
    } catch (error) {
      toast.dismiss();
      toast.error(`${t('tasks.failedToSaveSignature')}: ${error.message || t('common.error')}`);
    }
  };

  // New Save and Submit functionality for compliance completion
  const handleSaveAndSubmit = async () => {
    if (currentTask?.isActive === false || currentTask?.inspectionLevel?.isActive === false) {
      toast.error(t('auth.inspectionInactiveBanner') || 'This inspection is currently inactive and cannot be performed or submitted.');
      return;
    }

    if (!signatureImage) {
      toast.error(t('tasks.pleaseProvideSignatureBeforeSubmitting'));
      return;
    }

    try {
      toast.loading(t('tasks.savingAndSubmittingComplianceData'));

      // Stop timer permanently when task is submitted
      const finalSessionTime = sessionStartTimeRef.current ? (Date.now() - sessionStartTimeRef.current) / 1000 : 0;
      const totalActiveTimeInSeconds = accumulatedTimeRef.current + finalSessionTime; // Keep in seconds

      const completionPercentage = calculateTaskCompletionPercentage();
      const signatureMetadata = await getCaptureMetadataFromLocation('question_signature');

      // First save signature
      await dispatch(saveTaskSignature({
        taskId: currentTask._id,
        signature: signatureImage,
        signatureMetadata,
        taskMetrics: {
          ...currentTask.taskMetrics,
          completionPercentage: completionPercentage,
          timeSpent: totalActiveTimeInSeconds, // Save in seconds
          subLevelTimeSpent: { ...(currentTask.taskMetrics?.subLevelTimeSpent || {}) }
        }
      })).unwrap();

      // Log signature added
      await FrontendLogger.logSignatureAdded(currentTask._id, currentTask.title);

      // Then update task status to completed
      await dispatch(updateUserTaskProgress({
        taskId: currentTask._id,
        subLevelId: currentTask.inspectionLevel?.subLevels?.[0]?._id || 'default',
        status: 'completed',
        taskMetrics: {
          ...currentTask.taskMetrics,
          completionPercentage: 100,
          timeSpent: totalActiveTimeInSeconds, // Save in seconds
          completedAt: new Date().toISOString()
        }
      })).unwrap();

      // Log task completion
      await FrontendLogger.logTaskComplete(currentTask._id, currentTask.title);

      // Stop timer permanently
      stopTimerPermanently();

      // Refresh task data
      await dispatch(fetchUserTaskDetails(currentTask._id));

      toast.dismiss();
      toast.success(t('tasks.complianceDataSubmittedSuccessfully'));
      setShowSignatureModal(false);

      // Clear signature image after successful save
      setSignatureImage(null);

      // Mark that signature was just saved
      setSignatureJustSaved(true);

      // Directly open the Complete & Archive modal
      setTimeout(() => {
        setShowArchiveModal(true);
      }, 500);

    } catch (error) {
      toast.dismiss();
      toast.error(`${t('tasks.failedToSubmitComplianceData')}: ${error.message || t('common.error')}`);
    }
  };

  // CRITICAL FIX: Validate all required questions are answered
  const validateRequiredQuestions = useCallback(() => {
    if (!currentTask || !inspectionPages || inspectionPages.length === 0) {
      return { isValid: false, unansweredQuestions: [] };
    }

    const unansweredQuestions = [];

    inspectionPages.forEach((page, pageIndex) => {
      const pageId = page._id || page.id;
      const pageName = page.title || page.name || `Page ${pageIndex + 1}`;

      if (page.sections) {
        page.sections.forEach(section => {
          if (section.questions) {
            section.questions.forEach(question => {
              // Only check required questions (exclude recommended)
              if (question.requirementType === 'recommended' || question.mandatory === false || question.required === false) {
                return; // Skip recommended/non-mandatory questions
              }

              const questionId = question._id || question.id;
              let hasResponse = false;

              if (currentTask.questionnaireResponses) {
                if (currentTask.questionnaireResponses[questionId] !== undefined) {
                  const response = currentTask.questionnaireResponses[questionId];
                  hasResponse = response !== null && response !== undefined && response !== '';
                } else {
                  const responseKey = Object.keys(currentTask.questionnaireResponses).find(key =>
                    key.includes(questionId) || key.endsWith(questionId)
                  );

                  if (responseKey) {
                    const response = currentTask.questionnaireResponses[responseKey];
                    hasResponse = response !== null && response !== undefined && response !== '';
                  }
                }
              }

              if (!hasResponse) {
                unansweredQuestions.push({
                  questionId,
                  questionText: question.text || question.question || 'Question',
                  pageId,
                  pageName,
                  sectionId: section._id || section.id,
                  sectionName: section.name || 'Section',
                  isRequired: true,
                  isPreInspection: false
                });
              }
            });
          }
        });
      }
    });

    // Also check pre-inspection questions
    if (currentTask.preInspectionQuestions && currentTask.preInspectionQuestions.length > 0) {
      currentTask.preInspectionQuestions.forEach(question => {
        if (question.requirementType === 'recommended' || question.mandatory === false || question.required === false) {
          return; // Skip recommended
        }

        const questionId = question._id || question.id;
        const hasResponse = currentTask.questionnaireResponses &&
          currentTask.questionnaireResponses[questionId] !== undefined &&
          currentTask.questionnaireResponses[questionId] !== null &&
          currentTask.questionnaireResponses[questionId] !== '';

        if (!hasResponse) {
          unansweredQuestions.push({
            questionId,
            questionText: question.text || question.question || 'Question',
            pageId: 'pre-inspection',
            pageName: 'Pre-Inspection',
            sectionId: 'pre-inspection',
            sectionName: 'Pre-Inspection Questions',
            isRequired: true,
            isPreInspection: true
          });
        }
      });
    }

    return {
      isValid: unansweredQuestions.length === 0,
      unansweredQuestions
    };
  }, [currentTask, inspectionPages]);

  const getAllUnansweredQuestions = useCallback(() => {
    if (!currentTask || !inspectionPages || inspectionPages.length === 0) {
      return { required: [], optional: [] };
    }

    const required = [];
    const optional = [];

    inspectionPages.forEach((page, pageIndex) => {
      const pageId = page._id || page.id;
      const pageName = page.title || page.name || `Page ${pageIndex + 1}`;

      if (page.sections) {
        page.sections.forEach(section => {
          const sectionId = section._id || section.id;
          const sectionName = section.name || 'Section';

          if (section.questions) {
            section.questions.forEach(question => {
              const isRequired = !(question.requirementType === 'recommended' || question.mandatory === false || question.required === false);
              const questionId = question._id || question.id;
              let hasResponse = false;

              if (currentTask.questionnaireResponses) {
                if (currentTask.questionnaireResponses[questionId] !== undefined) {
                  const response = currentTask.questionnaireResponses[questionId];
                  hasResponse = response !== null && response !== undefined && response !== '';
                } else {
                  const responseKey = Object.keys(currentTask.questionnaireResponses).find(key =>
                    key.includes(questionId) || key.endsWith(questionId)
                  );
                  if (responseKey) {
                    const response = currentTask.questionnaireResponses[responseKey];
                    hasResponse = response !== null && response !== undefined && response !== '';
                  }
                }
              }

              if (!hasResponse) {
                const item = {
                  questionId,
                  questionText: question.text || question.question || 'Question',
                  pageId,
                  pageName,
                  sectionId,
                  sectionName,
                  isRequired,
                  isPreInspection: false
                };
                if (isRequired) required.push(item);
                else optional.push(item);
              }
            });
          }
        });
      }
    });

    if (currentTask.preInspectionQuestions && currentTask.preInspectionQuestions.length > 0) {
      currentTask.preInspectionQuestions.forEach(question => {
        const isRequired = !(question.requirementType === 'recommended' || question.mandatory === false || question.required === false);
        const questionId = question._id || question.id;
        const hasResponse = currentTask.questionnaireResponses &&
          currentTask.questionnaireResponses[questionId] !== undefined &&
          currentTask.questionnaireResponses[questionId] !== null &&
          currentTask.questionnaireResponses[questionId] !== '';

        if (!hasResponse) {
          const item = {
            questionId,
            questionText: question.text || question.question || 'Question',
            pageId: 'pre-inspection',
            pageName: 'Pre-Inspection',
            sectionId: 'pre-inspection',
            sectionName: 'Pre-Inspection Questions',
            isRequired,
            isPreInspection: true
          };
          if (isRequired) required.push(item);
          else optional.push(item);
        }
      });
    }

    return { required, optional };
  }, [currentTask, inspectionPages]);

  const jumpToQuestion = (item) => {
    setShowUnansweredModal(false);

    if (item.isPreInspection) {
      setActiveTab('pre-inspection');
    } else {
      if (item.pageId && item.pageId !== selectedPage) {
        setSelectedPage(item.pageId);
      }
      if (item.sectionId && item.sectionId !== selectedSection) {
        setSelectedSection(item.sectionId);
      }
      setActiveTab('inspection');
    }

    setTimeout(() => {
      const questionElement = document.querySelector(`[data-question-id="${item.questionId}"]`);
      if (questionElement) {
        questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const originalBg = questionElement.style.backgroundColor;
        questionElement.style.transition = 'all 0.3s ease';
        questionElement.style.backgroundColor = '#fef3c7';
        questionElement.style.boxShadow = '0 0 0 4px #f59e0b';
        setTimeout(() => {
          questionElement.style.backgroundColor = originalBg;
          questionElement.style.boxShadow = 'none';
        }, 2500);
      }
    }, 300);
  };

  const proceedToFinalSubmission = () => {
    setShowUnansweredModal(false);
    setUnansweredRequiredQuestions(new Set());

    // Check task completion percentage first - use the same calculation as the UI
    const dbProgress = currentTask?.overallProgress || 0;
    const calculatedProgress = calculateTaskCompletionPercentage();
    const actualProgress = Math.max(dbProgress, calculatedProgress);

    if (actualProgress < 100) {
      toast.error(
        t('tasks.taskMustBeCompletedBeforeArchiving', { progress: actualProgress }),
        {
          duration: 8000,
          style: {
            maxWidth: '500px',
            whiteSpace: 'pre-line'
          }
        }
      );
      return;
    }

    // Check if task has signature - only show signature modal if no signature exists and signature wasn't just saved
    if (!currentTask?.signature && !signatureJustSaved) {
      setShowSignatureModal(true);
      return;
    }

    // Reset the flag
    setSignatureJustSaved(false);

    // Show confirmation modal
    setShowArchiveModal(true);
  };

  // Handle Complete & Archive functionality
  const handleCompleteAndArchive = async () => {
    if (currentTask?.isActive === false || currentTask?.inspectionLevel?.isActive === false) {
      toast.error(t('auth.inspectionInactiveBanner') || 'This inspection is currently inactive and cannot be performed or submitted.');
      return;
    }

    const { required, optional } = getAllUnansweredQuestions();

    // If there are ANY unanswered questions (required or optional), show the summary confirmation modal
    if (required.length > 0 || optional.length > 0) {
      if (required.length > 0) {
        const unansweredIds = new Set(required.map(q => q.questionId));
        setUnansweredRequiredQuestions(unansweredIds);
      }
      setShowUnansweredModal(true);
      return;
    }

    proceedToFinalSubmission();
  };

  const handleConfirmArchive = async () => {
    try {
      setIsArchiving(true);
      toast.loading(t('tasks.completingAndArchivingInspection'));

      // Archive the task
      await dispatch(archiveTask(currentTask._id)).unwrap();

      // Refresh task data
      await dispatch(fetchUserTaskDetails(currentTask._id));

      toast.dismiss();
      toast.success(t('tasks.inspectionCompletedAndArchivedSuccessfully'));
      setShowArchiveModal(false);

      // Reset signature flag
      setSignatureJustSaved(false);

      // Navigate back to tasks list after a short delay
      setTimeout(() => {
        navigate('/user-tasks');
      }, 2000);

    } catch (error) {
      toast.dismiss();

      // Handle specific error types with user-friendly messages
      let errorMessage = 'Failed to archive task';

      if (error.message) {
        if (error.message.includes('100% completed')) {
          errorMessage = `⚠️ ${error.message}`;
        } else if (error.message.includes('signed before archiving')) {
          errorMessage = '🖊️ Please add your signature before archiving the inspection';
        } else if (error.message.includes('must be started')) {
          errorMessage = '🚀 Please start the inspection before archiving';
        } else {
          errorMessage = `❌ ${error.message}`;
        }
      }

      toast.error(errorMessage, {
        duration: 6000,
        style: {
          maxWidth: '500px',
        }
      });

    } finally {
      setIsArchiving(false);
    }
  };


  const renderQuestionInput = (question, task, onSaveResponse, inputOptions = {}) => {
    const questionId = question._id;
    const response = task.questionnaireResponses?.[questionId];
    const questionCaptureMetadata = getResponseMetadataForQuestion(task, questionId);
    const localValue = localInputValues[questionId];
    const displayValue = localValue !== undefined ? localValue : response;
    const isDisabled = task.status === 'completed' || task.status === 'archived' || task.isActive === false || task.inspectionLevel?.isActive === false || Boolean(inputOptions.disabled);

    let questionType = question.type || question.answerType;

    if (questionType === 'yesno' && question.answerType === 'compliance') {
      questionType = 'compliance';
    } else if (questionType === 'yesno' && (question.options?.includes('Yes') || question.options?.includes('No'))) {
      questionType = 'yesno';
    } else if (questionType === 'multiple_choice') {
      questionType = 'radio';
    } else if (questionType === 'multiple' || questionType === 'checkbox') {
      questionType = 'checkbox';
    }

    switch (questionType) {
      case 'compliance':
        const complianceOptions = question.options?.length > 0
          ? question.options
          : [t('tasks.fullCompliance'), t('tasks.partialCompliance'), t('tasks.nonCompliant'), t('common.notApplicable')];
        const isComplianceUnanswered = unansweredRequiredQuestions.has(questionId) &&
          (question.required !== false && question.mandatory !== false && question.requirementType !== 'recommended') &&
          (!response || response === '');
        return (
          <OptionsContainer
            $isUnanswered={isComplianceUnanswered}
            $isRequired={question.required !== false && question.mandatory !== false && question.requirementType !== 'recommended'}
            data-question-id={questionId}
          >
            {complianceOptions.map((option, optIndex) => (
              <OptionButton
                key={optIndex}
                selected={response === option}
                disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) {
                    // Allow unclicking: if clicking the same option, unselect it
                    const newValue = response === option ? '' : option;
                    onSaveResponse(questionId, newValue);
                    // Clear highlighting when user selects an option
                    if (unansweredRequiredQuestions.has(questionId)) {
                      setUnansweredRequiredQuestions(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(questionId);
                        return newSet;
                      });
                    }
                  }
                }}
              >
                {option}
              </OptionButton>
            ))}
          </OptionsContainer>
        );

      case 'yesno':
        // Respect includeNA property from question (default to true for backward compatibility)
        const includeNA = question.includeNA !== false;
        const yesNoOptions = question.options?.length > 0
          ? question.options
          : includeNA
            ? [t('common.yes'), t('common.no'), t('common.na')]
            : [t('common.yes'), t('common.no')];
        const isYesNoUnanswered = unansweredRequiredQuestions.has(questionId) &&
          (question.required !== false && question.mandatory !== false && question.requirementType !== 'recommended') &&
          (!response || response === '');
        return (
          <OptionsContainer
            $isUnanswered={isYesNoUnanswered}
            $isRequired={question.required !== false && question.mandatory !== false && question.requirementType !== 'recommended'}
            data-question-id={questionId}
          >
            {yesNoOptions.map((option, optIndex) => (
              <OptionButton
                key={optIndex}
                selected={response === option}
                disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) {
                    // Allow unclicking: if clicking the same option, unselect it
                    const newValue = response === option ? '' : option;
                    onSaveResponse(questionId, newValue);
                    // Clear highlighting when user selects an option
                    if (unansweredRequiredQuestions.has(questionId)) {
                      setUnansweredRequiredQuestions(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(questionId);
                        return newSet;
                      });
                    }
                  }
                }}
              >
                {option}
              </OptionButton>
            ))}
          </OptionsContainer>
        );

      case 'radio':
        return (
          <OptionsContainer>
            {question.options && question.options.length > 0 ? question.options.map((option, optIndex) => (
              <OptionButton
                key={optIndex}
                selected={response === option}
                disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) {
                    // Allow unclicking: if clicking the same option, unselect it
                    const newValue = response === option ? '' : option;
                    onSaveResponse(questionId, newValue);
                  }
                }}
              >
                {option}
              </OptionButton>
            )) : (
              <div style={{ color: '#666', fontStyle: 'italic' }}>{t('tasks.noOptionsAvailable')}</div>
            )}
          </OptionsContainer>
        );

      case 'checkbox':
        const selectedOptions = Array.isArray(response) ? response : response ? [response] : [];

        return (
          <CheckboxContainer>
            {question.options && question.options.length > 0 ? question.options.map((option, optIndex) => (
              <CheckboxItem key={optIndex}>
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
                    onSaveResponse(questionId, newSelected);
                  }}
                  disabled={isDisabled}
                />
                {option}
              </CheckboxItem>
            )) : (
              <div style={{ color: '#666', fontStyle: 'italic' }}>{t('tasks.noOptionsAvailable')}</div>
            )}
          </CheckboxContainer>
        );

      case 'select':
      case 'dropdown':
        return (
          <InputContainer>
            <InputGroup>
              <select
                value={response || ''}
                onChange={(e) => !isDisabled && onSaveResponse(questionId, e.target.value)}
                disabled={isDisabled}
              >
                <option value="">Select an option</option>
                {question.options && question.options.map((option, optIndex) => (
                  <option key={optIndex} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </InputGroup>
          </InputContainer>
        );

      case 'file':
        return (
          <InputContainer>
            <InputGroup>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    disabled={isDisabled}
                    onChange={async (e) => {
                      if (isDisabled || !e.target.files || !e.target.files[0]) return;
                      const file = e.target.files[0];

                      // Validate file format and size (1MB limit) before processing
                      const { validateFileWithToast } = await import('../../utils/fileValidation');
                      if (!validateFileWithToast(file, toast, t)) {
                        e.target.value = '';
                        return;
                      }

                      // Convert file to base64 for storage
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target.result;
                        const saved = await onSaveResponse(questionId, base64Data, { captureType: 'file' });
                        if (saved) {
                          toast.success(t('tasks.fileUploadedSuccessfully'));
                        }
                      };
                      reader.onerror = () => {
                        toast.error(t('tasks.failedToReadFile'));
                      };
                      reader.readAsDataURL(file);
                    }}
                    style={{ flex: 1, minWidth: '200px' }}
                  />

                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (isDisabled) return;

                      // Camera capture functionality
                      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                        navigator.mediaDevices.getUserMedia({
                          video: {
                            facingMode: { ideal: 'environment' } // Prefer back camera
                          }
                        })
                          .then(stream => {
                            const video = document.createElement('video');
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');

                            // Create modal for camera preview
                            const modal = document.createElement('div');
                            modal.style.cssText = `
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: rgba(0,0,0,0.9);
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            z-index: 10000;
                          `;

                            video.style.cssText = `
                            max-width: 90%;
                            max-height: 70%;
                            border-radius: 8px;
                          `;

                            const buttonContainer = document.createElement('div');
                            buttonContainer.style.cssText = `
                            display: flex;
                            gap: 16px;
                            margin-top: 20px;
                          `;

                            const captureBtn = document.createElement('button');
                            captureBtn.textContent = '📸 Capture';
                            captureBtn.style.cssText = `
                            padding: 12px 24px;
                            background: #3b82f6;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: 16px;
                            cursor: pointer;
                          `;

                            const cancelBtn = document.createElement('button');
                            cancelBtn.textContent = '❌ Cancel';
                            cancelBtn.style.cssText = `
                            padding: 12px 24px;
                            background: #ef4444;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: 16px;
                            cursor: pointer;
                          `;

                            video.srcObject = stream;
                            video.play();

                            captureBtn.onclick = () => {
                              canvas.width = video.videoWidth;
                              canvas.height = video.videoHeight;
                              ctx.drawImage(video, 0, 0);

                              // Function to process blob with size validation
                              const processBlob = (blob, quality = 0.8) => {
                                if (!blob) {
                                  toast.error(t('tasks.failedToReadFile'));
                                  stream.getTracks().forEach(track => track.stop());
                                  document.body.removeChild(modal);
                                  return;
                                }

                                // If blob is too large, reduce quality and try again
                                if (blob.size > 1024 * 1024) {
                                  if (quality > 0.1) {
                                    // Reduce quality and try again
                                    canvas.toBlob((newBlob) => processBlob(newBlob, quality - 0.15), 'image/jpeg', quality - 0.15);
                                    return;
                                  } else {
                                    // If still too large even at low quality, reduce canvas size
                                    const maxDimension = 1200;
                                    let newWidth = canvas.width;
                                    let newHeight = canvas.height;
                                    
                                    if (newWidth > maxDimension || newHeight > maxDimension) {
                                      const ratio = Math.min(maxDimension / newWidth, maxDimension / newHeight);
                                      newWidth = Math.floor(newWidth * ratio);
                                      newHeight = Math.floor(newHeight * ratio);
                                      
                                      const tempCanvas = document.createElement('canvas');
                                      const tempCtx = tempCanvas.getContext('2d');
                                      tempCanvas.width = newWidth;
                                      tempCanvas.height = newHeight;
                                      tempCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
                                      
                                      tempCanvas.toBlob((resizedBlob) => {
                                        if (resizedBlob && resizedBlob.size <= 1024 * 1024) {
                                          processBlob(resizedBlob, 0.5);
                                        } else {
                                          toast(t('tasks.fileSizeExceedsLimit'), { icon: 'ℹ️' });
                                          stream.getTracks().forEach(track => track.stop());
                                          document.body.removeChild(modal);
                                        }
                                      }, 'image/jpeg', 0.5);
                                      return;
                                    } else {
                                      toast(t('tasks.fileSizeExceedsLimit'), { icon: 'ℹ️' });
                                      stream.getTracks().forEach(track => track.stop());
                                      document.body.removeChild(modal);
                                      return;
                                    }
                                  }
                                }
                                
                                // Convert blob to base64
                                const reader = new FileReader();
                                reader.onload = async (event) => {
                                  const base64Data = event.target.result;
                                  const saved = await onSaveResponse(questionId, base64Data, { captureType: 'file' });
                                  stream.getTracks().forEach(track => track.stop());
                                  document.body.removeChild(modal);
                                  if (saved) {
                                    toast.success(t('tasks.photoCapturedSuccessfully'));
                                  }
                                };
                                reader.onerror = () => {
                                  toast.error(t('tasks.failedToReadFile'));
                                  stream.getTracks().forEach(track => track.stop());
                                  document.body.removeChild(modal);
                                };
                                reader.readAsDataURL(blob);
                              };

                              canvas.toBlob((blob) => processBlob(blob), 'image/jpeg', 0.8);
                            };

                            cancelBtn.onclick = () => {
                              stream.getTracks().forEach(track => track.stop());
                              document.body.removeChild(modal);
                            };

                            buttonContainer.appendChild(captureBtn);
                            buttonContainer.appendChild(cancelBtn);
                            modal.appendChild(video);
                            modal.appendChild(buttonContainer);
                            document.body.appendChild(modal);
                          })
                          .catch(err => {
                            console.error('Camera access denied:', err);
                            toast.error(t('tasks.cameraAccessDenied'));
                          });
                      } else {
                        toast.error(t('tasks.cameraNotSupported'));
                      }
                    }}
                    style={{
                      padding: '8px 16px',
                      background: '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      opacity: isDisabled ? 0.5 : 1
                    }}
                  >
                    📷 {t('tasks.camera')}
                  </button>
                </div>

                {response && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: '#f8fafc',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}>
                    {response.startsWith('data:image/') ? (
                      <div>
                        <div style={{
                          fontSize: '12px',
                          color: '#16a34a',
                          fontWeight: '500',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          ✅ Image uploaded
                        </div>
                        <img
                          src={response}
                          alt="File preview"
                          style={{
                            maxWidth: '200px',
                            maxHeight: '150px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            cursor: 'pointer'
                          }}
                          onClick={() => window.open(response, '_blank')}
                        />
                      </div>
                    ) : response.startsWith('data:') ? (
                      <div>
                        <div style={{
                          fontSize: '12px',
                          color: '#16a34a',
                          fontWeight: '500',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          ✅ File uploaded
                        </div>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = response;
                            link.download = 'uploaded-file';
                            link.click();
                          }}
                          style={{
                            padding: '8px 12px',
                            background: '#0369a1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Download File
                        </button>
                      </div>
                    ) : (
                      <div style={{
                        fontSize: '14px',
                        color: '#16a34a',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        ✅ Uploaded: {response}
                      </div>
                    )}
                    {questionCaptureMetadata && (
                      <div style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#475569'
                      }}>
                        Captured: {formatCaptureMetadata(questionCaptureMetadata)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </InputGroup>
          </InputContainer>
        );

      case 'media':
        return (
          <InputContainer>
            <InputGroup>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (isDisabled) return;

                      // Instant photo/video capture
                      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                        navigator.mediaDevices.getUserMedia({
                          video: {
                            facingMode: { ideal: 'environment' } // Prefer back camera
                          }
                        })
                          .then(stream => {
                            const video = document.createElement('video');
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');

                            // Create modal for camera preview
                            const modal = document.createElement('div');
                            modal.style.cssText = `
                              position: fixed;
                              top: 0;
                              left: 0;
                              width: 100%;
                              height: 100%;
                              background: rgba(0,0,0,0.9);
                              display: flex;
                              flex-direction: column;
                              align-items: center;
                              justify-content: center;
                              z-index: 10000;
                            `;

                            video.style.cssText = `
                              max-width: 90%;
                              max-height: 70%;
                              border-radius: 8px;
                            `;

                            const buttonContainer = document.createElement('div');
                            buttonContainer.style.cssText = `
                              display: flex;
                              gap: 16px;
                              margin-top: 20px;
                            `;

                            const captureBtn = document.createElement('button');
                            captureBtn.textContent = '📸 Capture';
                            captureBtn.style.cssText = `
                              padding: 12px 24px;
                              background: #3b82f6;
                              color: white;
                              border: none;
                              border-radius: 8px;
                              font-size: 16px;
                              cursor: pointer;
                            `;

                            const cancelBtn = document.createElement('button');
                            cancelBtn.textContent = '❌ Cancel';
                            cancelBtn.style.cssText = `
                              padding: 12px 24px;
                              background: #ef4444;
                              color: white;
                              border: none;
                              border-radius: 8px;
                              font-size: 16px;
                              cursor: pointer;
                            `;

                            video.srcObject = stream;
                            video.play();

                            captureBtn.onclick = () => {
                              canvas.width = video.videoWidth;
                              canvas.height = video.videoHeight;
                              ctx.drawImage(video, 0, 0);

                              canvas.toBlob(blob => {
                                const reader = new FileReader();
                                reader.onload = async (event) => {
                                  const base64Data = event.target.result;
                                  const saved = await onSaveResponse(questionId, base64Data, { captureType: 'media' });
                                  if (saved) {
                                    toast.success(t('tasks.photoCapturedSuccessfully'));
                                  }
                                };
                                reader.readAsDataURL(blob);
                                stream.getTracks().forEach(track => track.stop());
                                document.body.removeChild(modal);
                              }, 'image/jpeg', 0.8);
                            };

                            cancelBtn.onclick = () => {
                              stream.getTracks().forEach(track => track.stop());
                              document.body.removeChild(modal);
                            };

                            buttonContainer.appendChild(captureBtn);
                            buttonContainer.appendChild(cancelBtn);
                            modal.appendChild(video);
                            modal.appendChild(buttonContainer);
                            document.body.appendChild(modal);
                          })
                          .catch(err => {
                            console.error('Camera access denied:', err);
                            toast.error(t('tasks.cameraAccessDenied'));
                          });
                      } else {
                        toast.error(t('tasks.cameraNotSupported'));
                      }
                    }}
                    style={{
                      padding: '12px 24px',
                      background: '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      opacity: isDisabled ? 0.5 : 1
                    }}
                  >
                    📷 {t('tasks.camera')}
                  </button>
                </div>

                {response && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: '#f8fafc',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}>
                    {response.startsWith('data:image/') ? (
                      <div>
                        <div style={{
                          fontSize: '12px',
                          color: '#16a34a',
                          fontWeight: '500',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          ✅ {t('tasks.photoCaptured')}
                        </div>
                        <img
                          src={response}
                          alt="Captured media"
                          style={{
                            maxWidth: '200px',
                            maxHeight: '150px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            cursor: 'pointer'
                          }}
                          onClick={() => window.open(response, '_blank')}
                        />
                      </div>
                    ) : (
                      <div style={{
                        fontSize: '14px',
                        color: '#16a34a',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        ✅ {t('tasks.mediaCaptured')}
                      </div>
                    )}
                    {questionCaptureMetadata && (
                      <div style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#475569'
                      }}>
                        Captured: {formatCaptureMetadata(questionCaptureMetadata)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </InputGroup>
          </InputContainer>
        );

      case 'text':
        const isTextUnanswered = unansweredRequiredQuestions.has(questionId) &&
          (question.required !== false && question.mandatory !== false && question.requirementType !== 'recommended') &&
          (!displayValue || displayValue === '');
        return (
          <InputContainer
            $isUnanswered={isTextUnanswered}
            $isRequired={question.required !== false && question.mandatory !== false && question.requirementType !== 'recommended'}
            data-question-id={questionId}
          >
            <InputGroup>
              <input
                type="text"
                placeholder={t('tasks.enterYourResponse')}
                value={displayValue || ''}
                onChange={(e) => {
                  handleInputChange(questionId, e.target.value);
                  // Clear highlighting when user starts typing
                  if (unansweredRequiredQuestions.has(questionId)) {
                    setUnansweredRequiredQuestions(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(questionId);
                      return newSet;
                    });
                  }
                }}
                onBlur={(e) => {
                  // Save on blur (when user unfocuses from field)
                  if (!isDisabled && e.target.value !== undefined) {
                    onSaveResponse(questionId, e.target.value);
                  }
                }}
                disabled={isDisabled}
              />
            </InputGroup>
          </InputContainer>
        );

      case 'number':
        const isNumberUnanswered = unansweredRequiredQuestions.has(questionId) &&
          (question.required !== false && question.mandatory !== false && question.requirementType !== 'recommended') &&
          (!displayValue || displayValue === '');
        return (
          <InputContainer
            $isUnanswered={isNumberUnanswered}
            $isRequired={question.required !== false && question.mandatory !== false && question.requirementType !== 'recommended'}
            data-question-id={questionId}
          >
            <InputGroup>
              <input
                type="number"
                placeholder="Enter a number"
                value={displayValue || ''}
                onChange={(e) => {
                  handleInputChange(questionId, e.target.value);
                  if (unansweredRequiredQuestions.has(questionId)) {
                    setUnansweredRequiredQuestions(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(questionId);
                      return newSet;
                    });
                  }
                }}
                onBlur={(e) => {
                  // Save on blur (when user unfocuses from field)
                  if (!isDisabled && e.target.value !== undefined) {
                    onSaveResponse(questionId, e.target.value);
                  }
                }}
                disabled={isDisabled}
              />
            </InputGroup>
          </InputContainer>
        );

      case 'date':
        const isDateUnanswered = unansweredRequiredQuestions.has(questionId) &&
          (question.required !== false && question.mandatory !== false && question.requirementType !== 'recommended') &&
          (!displayValue || displayValue === '');
        return (
          <InputContainer
            $isUnanswered={isDateUnanswered}
            $isRequired={question.required !== false && question.mandatory !== false && question.requirementType !== 'recommended'}
            data-question-id={questionId}
          >
            <InputGroup>
              <input
                type="date"
                value={displayValue || ''}
                onChange={(e) => {
                  handleInputChange(questionId, e.target.value);
                  if (unansweredRequiredQuestions.has(questionId)) {
                    setUnansweredRequiredQuestions(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(questionId);
                      return newSet;
                    });
                  }
                }}
                onBlur={(e) => {
                  // CRITICAL FIX: Clear debounce timer and save immediately on blur
                  if (debounceTimersRef.current[questionId]) {
                    clearTimeout(debounceTimersRef.current[questionId]);
                    delete debounceTimersRef.current[questionId];
                  }
                  if (!isDisabled && e.target.value !== undefined) {
                    onSaveResponse(questionId, e.target.value);
                  }
                }}
                disabled={isDisabled}
              />
            </InputGroup>
          </InputContainer>
        );

      case 'signature':
        return (
          <InputContainer>
            <div style={{
              border: '2px dashed #e5e7eb',
              borderRadius: '12px',
              padding: '16px',
              background: '#f9fafb',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                marginBottom: '12px',
                fontSize: '14px',
                color: '#6b7280',
                textAlign: 'center'
              }}>
                {isDisabled ? '' : ''}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <SignatureCanvasComponent
                  questionId={questionId}
                  response={response}
                  metadata={questionCaptureMetadata}
                  isDisabled={isDisabled}
                  onSaveResponse={onSaveResponse}
                  formatCaptureMetadata={formatCaptureMetadata}
                />
              </div>
            </div>
          </InputContainer>
        );

      default:
        return (
          <InputContainer>
            <InputGroup>
              <input
                type={questionType === 'number' ? 'number' : questionType === 'date' ? 'date' : 'text'}
                placeholder={`Enter your ${questionType || 'text'} response`}
                value={displayValue || ''}
                onChange={(e) => handleInputChange(questionId, e.target.value)}
                onBlur={(e) => {
                  // CRITICAL FIX: Clear debounce timer and save immediately on blur
                  if (debounceTimersRef.current[questionId]) {
                    clearTimeout(debounceTimersRef.current[questionId]);
                    delete debounceTimersRef.current[questionId];
                  }
                  if (!isDisabled && e.target.value !== undefined) {
                    onSaveResponse(questionId, e.target.value);
                  }
                }}
                disabled={isDisabled}
              />
            </InputGroup>
          </InputContainer>
        );
    }
  };

  const renderPreInspectionQuestionnaire = () => {
    if (!currentTask?.preInspectionQuestions || currentTask.preInspectionQuestions.length === 0) {
      return null;
    }

    return (
      <PreInspectionContainer>
        <Card>
          <PreInspectionHeader>
            <SectionTitle>
              <CheckSquare size={20} />
              {t('tasks.preInspectionQuestionnaire')}
            </SectionTitle>

            <CompletionBadge complete={isPreInspectionCompleted()}>
              {isPreInspectionCompleted() ? (
                <>
                  <CheckCircle size={16} />
                  {t('tasks.completed')}
                </>
              ) : (
                <>
                  <AlertCircle size={16} />
                  {t('tasks.incomplete')}
                </>
              )}
            </CompletionBadge>
          </PreInspectionHeader>

          {scheduledStartLocked && (
            <PreInspectionLockNotice>
              <Clock size={16} />
              {t('tasks.lockedUntilStart', { date: formatDateTime(currentTask.startDate) })}
            </PreInspectionLockNotice>
          )}

          <PreInspectionContent>
            {currentTask.preInspectionQuestions.map((question, index) => (
              <QuestionRow key={index}>
                <QuestionNumber>{index + 1}</QuestionNumber>
                <QuestionContent>
                  <QuestionHeader>
                    <QuestionText>
                      {question.text}
                      {question.required !== false && (
                        <span style={{ color: '#dc2626', marginLeft: '4px', fontWeight: 'bold' }}>*</span>
                      )}
                    </QuestionText>
                    {/* <QuestionBadges>
                      <QuestionBadge type={question.required === false ? 'recommended' : 'mandatory'}>
                        {question.required === false ? 'Optional' : 'Required'}
                      </QuestionBadge>
                    </QuestionBadges> */}
                  </QuestionHeader>

                  {renderQuestionInput(question, currentTask, handleSaveInspectionResponse, {
                    disabled: scheduledStartLocked
                  })}
                </QuestionContent>
              </QuestionRow>
            ))}
          </PreInspectionContent>
        </Card>
      </PreInspectionContainer>
    );
  };

  const renderInspectionInterface = () => {
    if (!inspectionPages || inspectionPages.length === 0) {
      return (
        <EmptyState>
          <AlertCircle size={48} />
          <h3>No Inspection Pages</h3>
          <p>No inspection pages found for this task.</p>
        </EmptyState>
      );
    }

    // Use the currentPage and currentSection defined with useMemo above

    const totalQuestions = currentSection?.questions?.length || 0;
    const answeredQuestions = currentSection?.questions?.filter(q => {
      const questionId = q._id || q.id;
      return currentTask.questionnaireResponses &&
        (currentTask.questionnaireResponses[questionId] !== undefined ||
          Object.keys(currentTask.questionnaireResponses).some(key =>
            key.includes(questionId) || key.endsWith(questionId)
          ));
    }).length || 0;

    return (
      <InspectionContainer>
        <InspectionHeader>
          <div>
            <InspectionTitle>{t('tasks.inspectionQuestionnaire')}</InspectionTitle>
            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
              {t('tasks.completeAllSectionsToFinish')}
            </div>
          </div>

          <InspectionControls>
            {/* Previous Button */}
            <NavigationButton
              disabled={inspectionPages.findIndex(p => (p.id || p._id) === selectedPage) === 0}
              onClick={() => {
                const currentIndex = inspectionPages.findIndex(p => (p.id || p._id) === selectedPage);
                if (currentIndex > 0) {
                  const prevPage = inspectionPages[currentIndex - 1];
                  const prevPageId = prevPage.id || prevPage._id;
                  setSelectedPage(prevPageId);
                  if (prevPage.sections && prevPage.sections.length > 0) {
                    const firstSectionId = prevPage.sections[0].id || prevPage.sections[0]._id;
                    setSelectedSection(firstSectionId);
                  }
                }
              }}
            >
              <ChevronLeft size={16} />
              {t('common.previous')}
            </NavigationButton>

            <DropdownContainer ref={dropdownRef}>
              <DropdownButton
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowPageDropdown(prev => !prev);
                }}
                style={{
                  cursor: 'pointer',
                  opacity: 1,
                  position: 'relative',
                  zIndex: 10002
                }}
                type="button"
              >
                <span>
                  {currentPage ? `${t('common.page')} ${inspectionPages.findIndex(p => (p.id || p._id) === selectedPage) + 1}: ${currentPage.name}` : t('tasks.selectPage')}
                </span>
                <ChevronDown size={16} style={{ transform: showPageDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </DropdownButton>

              {showPageDropdown && (
                <DropdownMenu 
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {inspectionPages && inspectionPages.length > 0 ? (
                    inspectionPages.map((page, index) => {
                      const pageId = page.id || page._id;
                      const pageScore = calculatePageScore(page, currentTask.questionnaireResponses || {});

                      return (
                        <DropdownItem
                          key={pageId}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setSelectedPage(pageId);
                            setShowPageDropdown(false);
                            if (page.sections && page.sections.length > 0) {
                              const firstSectionId = page.sections[0].id || page.sections[0]._id;
                              setSelectedSection(firstSectionId);
                            }
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{`${index + 1}. ${page.name}`}</span>
                            <span style={{
                              fontSize: '12px',
                              color: pageScore.achieved > 0 ? '#27ae60' : '#95a5a6',
                              fontWeight: '600'
                            }}>
                              {pageScore.achieved}/{pageScore.total}
                            </span>
                          </div>
                        </DropdownItem>
                      );
                    })
                  ) : (
                    <DropdownItem>
                      <span>No pages available</span>
                    </DropdownItem>
                  )}
                </DropdownMenu>
              )}
            </DropdownContainer>

            {/* Next Button */}
            <NavigationButton
              disabled={inspectionPages.findIndex(p => (p.id || p._id) === selectedPage) === inspectionPages.length - 1}
              onClick={() => {
                const currentIndex = inspectionPages.findIndex(p => (p.id || p._id) === selectedPage);
                if (currentIndex < inspectionPages.length - 1) {
                  const nextPage = inspectionPages[currentIndex + 1];
                  const nextPageId = nextPage.id || nextPage._id;
                  setSelectedPage(nextPageId);
                  if (nextPage.sections && nextPage.sections.length > 0) {
                    const firstSectionId = nextPage.sections[0].id || nextPage.sections[0]._id;
                    setSelectedSection(firstSectionId);
                  }
                }
              }}
            >
              {t('common.next')}
              <ChevronRight size={16} />
            </NavigationButton>
          </InspectionControls>
        </InspectionHeader>

        <InspectionLayout>
          <NavigationPanel>
            <NavigationHeader>
              <NavigationTitle>
                <Navigation size={16} />
                {t('tasks.sections')}
                <KeyboardShortcutsBadge title={t('tasks.keyboardShortcuts')}>
                  <Info size={12} />
                </KeyboardShortcutsBadge>
              </NavigationTitle>
              <ProgressSummary>
                <span style={{ fontWeight: '600', color: '#3788d8' }}>
                  {currentPage?.sections?.length || 0} {t('tasks.sections')}
                </span>
                <span style={{ color: '#27ae60' }}>
                  {Math.max(currentTask?.overallProgress || 0, taskCompletionPercentage)}% {t('tasks.complete')}
                </span>
              </ProgressSummary>
            </NavigationHeader>

            {/* Section Navigation Controls */}
            {currentPage && currentPage.sections && currentPage.sections.length > 1 && (
              <SectionNavigationControls ref={sectionNavigationRef}>
                {/* Previous and Next Buttons Row */}
                <SectionButtonsRow>
                  {/* Previous Section Button */}
                  <SectionNavigationButton
                    disabled={currentPage.sections.findIndex(s => (s.id || s._id) === selectedSection) === 0}
                    onClick={() => {
                      const currentIndex = currentPage.sections.findIndex(s => (s.id || s._id) === selectedSection);
                      if (currentIndex > 0) {
                        const prevSection = currentPage.sections[currentIndex - 1];
                        const prevSectionId = prevSection.id || prevSection._id;
                        setSelectedSection(prevSectionId);
                        // Announce navigation for screen readers
                        setTimeout(() => {
                          console.log(`Navigated to section: ${prevSection.name}`);
                        }, 100);
                      }
                    }}
                    aria-label={`Go to previous section${currentPage.sections.findIndex(s => (s.id || s._id) === selectedSection) > 0 ? ': ' + currentPage.sections[currentPage.sections.findIndex(s => (s.id || s._id) === selectedSection) - 1]?.name : ''}`}
                  >
                    <ChevronLeft size={14} />
                    {t('tasks.previousSection')}
                  </SectionNavigationButton>

                  {/* Next Section Button */}
                  <SectionNavigationButton
                    disabled={currentPage.sections.findIndex(s => (s.id || s._id) === selectedSection) === currentPage.sections.length - 1}
                    onClick={() => {
                      const currentIndex = currentPage.sections.findIndex(s => (s.id || s._id) === selectedSection);
                      if (currentIndex < currentPage.sections.length - 1) {
                        const nextSection = currentPage.sections[currentIndex + 1];
                        const nextSectionId = nextSection.id || nextSection._id;
                        setSelectedSection(nextSectionId);
                        // Announce navigation for screen readers
                        setTimeout(() => {
                          console.log(`Navigated to section: ${nextSection.name}`);
                        }, 100);
                      }
                    }}
                    aria-label={`Go to next section${currentPage.sections.findIndex(s => (s.id || s._id) === selectedSection) < currentPage.sections.length - 1 ? ': ' + currentPage.sections[currentPage.sections.findIndex(s => (s.id || s._id) === selectedSection) + 1]?.name : ''}`}
                  >
                    {t('tasks.nextSection')}
                    <ChevronRight size={14} />
                  </SectionNavigationButton>
                </SectionButtonsRow>

                {/* Section Counter */}
                <SectionCounter aria-live="polite">
                  {t('tasks.section')} {currentPage.sections.findIndex(s => (s.id || s._id) === selectedSection) + 1} {t('common.of')} {currentPage.sections.length}
                </SectionCounter>
              </SectionNavigationControls>
            )}

            <SectionsNavigation>
              {currentPage && currentPage.sections && currentPage.sections.length > 0 ? (
                currentPage.sections.map((section, idx) => {
                  const sectionId = section.id || section._id;
                  const isActive = selectedSection === sectionId;
                  const sectionScore = calculateSectionScore(section, currentTask.questionnaireResponses || {});

                  return (
                    <SectionNavItem
                      key={sectionId}
                      active={isActive}
                      onClick={() => setSelectedSection(sectionId)}
                      style={{
                        cursor: 'pointer',
                        opacity: 1
                      }}
                    >
                      <SectionTitle2>{`${idx + 1}. ${section.name}`}</SectionTitle2>
                      <SectionScore active={isActive}>
                        <Star size={12} />
                        {sectionScore.achieved}/{sectionScore.total}
                      </SectionScore>
                    </SectionNavItem>
                  );
                })
              ) : (
                <EmptyState>
                  <Info size={32} />
                  <p>No sections available for this page</p>
                </EmptyState>
              )}
            </SectionsNavigation>
          </NavigationPanel>

          <ContentPanel>
            <ContentHeader>
              <ContentTitle>
                {currentSection ? (
                  <>
                    <Target size={18} />
                    {currentSection.name}
                  </>
                ) : (
                  <>
                    <Info size={18} />
                    Select a section to begin
                  </>
                )}
              </ContentTitle>

              {currentSection && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <QuestionCounter>
                    <CheckSquare size={16} />
                    {answeredQuestions} of {totalQuestions} answered
                    <button
                      onClick={() => {
                        const unanswered = getUnansweredQuestionsInSection(currentSection, currentTask.questionnaireResponses || {});
                        if (unanswered.length > 0) {
                          setHighlightUnansweredMode(!highlightUnansweredMode);
                          setCurrentSectionUnansweredQuestions(new Set(unanswered));
                          toast.info(
                            highlightUnansweredMode 
                              ? 'Highlighting disabled' 
                              : `Highlighting ${unanswered.length} unanswered question(s)`,
                            { duration: 2000 }
                          );
                        } else {
                          toast.success('All questions answered!', { duration: 2000 });
                        }
                      }}
                      style={{
                        background: highlightUnansweredMode ? '#3788d8' : 'transparent',
                        color: highlightUnansweredMode ? 'white' : '#64748b',
                        border: highlightUnansweredMode ? 'none' : '1px solid #e2e8f0',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        marginLeft: '4px'
                      }}
                      title={highlightUnansweredMode ? 'Hide unanswered questions' : 'Show unanswered questions'}
                    >
                      <Info size={14} />
                    </button>
                  </QuestionCounter>
                  <ScoreBadge hasResponse={answeredQuestions > 0}>
                    <Award size={14} />
                    {calculateSectionScore(currentSection, currentTask.questionnaireResponses || {}).achieved}/
                    {calculateSectionScore(currentSection, currentTask.questionnaireResponses || {}).total}
                  </ScoreBadge>
                </div>
              )}
            </ContentHeader>

            <QuestionsContent ref={questionsContentRef}>
              {currentSection ? (
                <>
                  {currentSection.questions && currentSection.questions.length > 0 ? (
                    currentSection.questions.map((question, qIndex) => {
                      const questionId = question._id || question.id;
                      let response = currentTask.questionnaireResponses?.[questionId];

                      if (response === undefined) {
                        const responseKey = Object.keys(currentTask.questionnaireResponses || {}).find(key =>
                          key.includes(questionId) || key.endsWith(questionId)
                        );
                        if (responseKey) {
                          response = currentTask.questionnaireResponses[responseKey];
                        }
                      }

                      // CRITICAL FIX: Determine if question is scorable
                      const questionType = question.type || question.answerType;
                      const scorableTypes = ['yesno', 'compliance'];
                      // Exclude non-scorable types: text, number, date, signature, file, media, checkbox, select, multiple_choice
                      const isScorable = scorableTypes.includes(questionType) &&
                        question.requirementType !== 'recommended' &&
                        question.mandatory !== false &&
                        question.required !== false;

                      const maxScore = isScorable ? (question.scoring?.max || 2) : 0;
                      let achievedScore = 0;

                      // CRITICAL FIX: Only calculate score for scorable questions
                      if (isScorable && response !== undefined && response !== null) {
                        // Use template-defined scores if available
                        if (question.scores && typeof question.scores === 'object') {
                          // Get the score for this specific response from the template
                          const responseScore = question.scores[response] || question.scores[response.toString()] || 0;
                          achievedScore = responseScore;
                        } else {
                          // Fallback to old logic if no template scores defined
                          // Only process compliance and yesno types (already filtered above)
                          if (questionType === 'compliance' || questionType === 'yesno') {
                            if (response === 'full_compliance' || response === 'yes' || response === 'Yes' || response === 'Full compliance') {
                              achievedScore = maxScore;
                            } else if (response === 'partial_compliance' || response === 'Partial compliance') {
                              achievedScore = maxScore / 2;
                            }
                          }
                          // REMOVED: All other question types (text, signature, date, number, file, checkbox, multiple)
                          // These should NEVER be scored
                        }
                      }

                      // Check if this question should be highlighted
                      const isHighlighted = highlightUnansweredMode && currentSectionUnansweredQuestions.has(questionId);

                      return (
                        <QuestionCard key={questionId || qIndex} $isHighlighted={isHighlighted}>
                          <QuestionHeader>
                            <QuestionNumber>{qIndex + 1}</QuestionNumber>
                            <QuestionText>
                              {question.text}
                              {question.required !== false && (
                                <span style={{ color: '#dc2626', marginLeft: '4px', fontWeight: 'bold' }}>*</span>
                              )}
                            </QuestionText>

                            <QuestionBadges>
                              {/* <QuestionBadge type={question.required === false ? 'recommended' : 'mandatory'}>
                                {question.required === false ? 'Optional' : 'Required'}
                              </QuestionBadge> */}
                              {/* CRITICAL FIX: Only show score badge for scorable questions */}
                              {isScorable && (
                                <ScoreBadge hasResponse={achievedScore > 0}>
                                  <Star size={14} />
                                  {achievedScore}/{maxScore}
                                </ScoreBadge>
                              )}
                            </QuestionBadges>
                          </QuestionHeader>

                          {renderQuestionInput(question, currentTask, handleSaveInspectionResponse)}
                        </QuestionCard>
                      );
                    })
                  ) : (
                    <EmptyState>
                      <AlertCircle size={32} />
                      <h3>No Questions Found</h3>
                      <p>This section doesn't contain any questions.</p>
                    </EmptyState>
                  )}

                  {/* Section Comments - Always show when section is selected */}
                  <SectionCommentsContainer>
                    <SectionCommentsHeader>
                      <MessageSquare size={18} />
                      {t('tasks.sectionComments')}
                    </SectionCommentsHeader>

                    {/* Existing Comments */}
                    {sectionComments[selectedSection] && sectionComments[selectedSection].length > 0 && (
                      <CommentsList>
                        {sectionComments[selectedSection].map((comment, index) => (
                          <CommentItem key={comment._id || index}>
                            <CommentHeader>
                              <CommentAuthor>
                                {comment.user?.name || t('common.unknownUser')}
                              </CommentAuthor>
                              <CommentDate>
                                {formatDateTime(comment.createdAt)}
                              </CommentDate>
                            </CommentHeader>
                            <CommentContent>
                              {comment.content}
                            </CommentContent>
                          </CommentItem>
                        ))}
                      </CommentsList>
                    )}

                    {/* Add Comment */}
                    {!isArchivedTask && (
                      <CommentInputContainer>
                        <CommentTextarea
                          placeholder={t('tasks.addCommentForSection')}
                          value={sectionCommentTexts[selectedSection] || ''}
                          onChange={(e) => handleSectionCommentTextChange(selectedSection, e.target.value)}
                          disabled={commentLoadingStates[selectedSection]}
                        />
                        <CommentSubmitButton
                          onClick={() => handleSectionCommentSubmit(selectedSection)}
                          disabled={!sectionCommentTexts[selectedSection]?.trim() || commentLoadingStates[selectedSection]}
                        >
                          {commentLoadingStates[selectedSection] ? (
                            <>
                              <Loader size={14} />
                              {t('common.saving') || 'Saving...'}
                            </>
                          ) : (
                            <>
                              <Send size={14} />
                              {t('tasks.comment') || t('common.submit') || 'Comment'}
                            </>
                          )}
                        </CommentSubmitButton>
                      </CommentInputContainer>
                    )}

                    {/* Archived State Message */}
                    {isArchivedTask && (
                      <div style={{
                        textAlign: 'center',
                        padding: '16px',
                        color: '#6b7280',
                        fontStyle: 'italic',
                        fontSize: '14px'
                      }}>
                        {t('tasks.commentsDisabledForArchived')}
                      </div>
                    )}
                  </SectionCommentsContainer>
                </>
              ) : (
                <EmptyState>
                  <Info size={48} />
                  <h3>{t('tasks.selectASection')}</h3>
                  <p>{t('tasks.chooseASectionFromNavigation')}</p>
                </EmptyState>
              )}
            </QuestionsContent>
          </ContentPanel>
        </InspectionLayout>
      </InspectionContainer>
    );
  };

  if (loading || (!error && !currentTask)) {
    return (
      <PageContainer>
        <MainContent>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '60vh',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <LoadingSpinner />
            <div style={{ fontSize: '18px', color: '#1a202c', fontWeight: '600' }}>
              {t('tasks.loadingTaskDetails')}
            </div>
          </div>
        </MainContent>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <MainContent>
          <TopBar>
            <BackButton onClick={() => navigate('/user-tasks')}>
              <ArrowLeft size={18} />
              {t('common.backToTasks')}
            </BackButton>
          </TopBar>
          <Card>
            <EmptyState>
              <AlertTriangle size={48} />
              <h3>{t('tasks.errorLoadingTask')}</h3>
              <p>{error}</p>
            </EmptyState>
          </Card>
        </MainContent>
      </PageContainer>
    );
  }

  if (!currentTask) {
    return (
      <PageContainer>
        <MainContent>
          <TopBar>
            <BackButton onClick={() => navigate('/user-tasks')}>
              <ArrowLeft size={18} />
              {t('common.backToTasks')}
            </BackButton>
          </TopBar>
          <Card>
            <EmptyState>
              <AlertTriangle size={48} />
              <h3>{t('tasks.taskNotFound')}</h3>
              <p>{t('tasks.taskNotFoundDescription')}</p>
            </EmptyState>
          </Card>
        </MainContent>
      </PageContainer>
    );
  }

  const inspectionNameLabel = t('tasks.inspectionName') === 'tasks.inspectionName' ? 'Inspection Name' : t('tasks.inspectionName');
  const templateNameLabel = t('tasks.templateName') === 'tasks.templateName' ? 'Template Name' : t('tasks.templateName');
  const taskDisplayName = currentTask?.title || currentTask?.name || t('common.notApplicable');
  const templateDisplayName =
    (typeof currentTask?.inspectionLevel === 'object' && currentTask?.inspectionLevel?.name) ||
    currentTask?.templateSnapshot?.name ||
    currentTask?.inspectionLevelName ||
    t('common.notApplicable');

  const isTaskInactive = currentTask?.isActive === false || currentTask?.inspectionLevel?.isActive === false;

  return (
    <PageContainer onClick={() => showPageDropdown && setShowPageDropdown(false)}>
      <MainContent>
        <TopBar>
          <TopBarLeftSection>
            <BackButton onClick={() => navigate(-1)}>
              <ArrowLeft size={18} />
              {t('common.backToTasks')}
            </BackButton>

            {autoUpdateEnabled ? (
              <LiveStatusBadge
                onClick={() => setAutoUpdateEnabled(!autoUpdateEnabled)}
                title="Click to toggle auto-update"
              >
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#16a34a',
                  animation: 'pulse 2s infinite'
                }}></div>
                Live (5s)
              </LiveStatusBadge>
            ) : (
              <LiveStatusBadge $paused
                onClick={() => setAutoUpdateEnabled(!autoUpdateEnabled)}
                title="Click to enable auto-update"
              >
                ⏸ Paused
              </LiveStatusBadge>
            )}
          </TopBarLeftSection>

          <QuickActions>
            {/* <QuickActionButton 
                primary
                onClick={handleExportReport}
                disabled={currentTask.status === 'pending'}
              >
                <Download size={16} />
                Export Report
              </QuickActionButton> */}
          </QuickActions>
        </TopBar>

        {isTaskInactive && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #f87171',
            color: '#991b1b',
            padding: '14px 20px',
            borderRadius: '12px',
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontWeight: '600',
            fontSize: '15px'
          }}>
            <AlertCircle size={22} color="#dc2626" />
            <span>{t('auth.inspectionInactiveBanner') || 'This inspection is currently inactive and cannot be performed or submitted.'}</span>
          </div>
        )}

        <TaskHeader>
          {/* <TaskTitle>{taskDisplayName}</TaskTitle> */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {inspectionNameLabel}
              </div>
              <div style={{ fontWeight: '600', color: '#1a202c' }}>
                {taskDisplayName}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {templateNameLabel}
              </div>
              <div style={{ fontWeight: '600', color: '#1a202c' }}>
                {templateDisplayName}
              </div>
            </div>
          </div>
          {currentTask.description && currentTask.description.trim() !== String(taskDisplayName).trim() && (
            <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
              {currentTask.description}
            </p>
          )}

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
            <StatusBadge status={currentTask.status}>
              <StatusIcon status={currentTask.status} />
              {currentTask.status === 'pending' && t('tasks.pending')}
              {currentTask.status === 'in_progress' && t('tasks.inProgress')}
              {currentTask.status === 'completed' && t('tasks.completed')}
              {currentTask.status === 'archived' && t('tasks.archived')}
            </StatusBadge>

            {isTaskInactive && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: '#fee2e2',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#dc2626',
                fontWeight: '600',
                border: '1px solid #f87171'
              }}>
                <AlertCircle size={14} />
                {t('auth.inactive') || 'INACTIVE'}
              </div>
            )}

            {isArchivedTask && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'rgba(55, 136, 216, 0.1)',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#3788d8',
                fontWeight: '600',
                border: '1px solid rgba(55, 136, 216, 0.2)'
              }}>
                <CheckCircle size={14} />
                READ-ONLY MODE
              </div>
            )}

            {currentTask.priority && (
              <PriorityBadge priority={currentTask.priority}>
                <AlertTriangle size={14} />
                {currentTask.priority === 'high' ? t('tasks.high') :
                  currentTask.priority === 'medium' ? t('tasks.medium') :
                    currentTask.priority === 'low' ? t('tasks.low') :
                      currentTask.priority}
              </PriorityBadge>
            )}
          </div>

          {scheduledStartLocked && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              marginBottom: '20px',
              background: 'rgba(245, 158, 11, 0.08)',
              color: '#92400e',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <Clock size={16} />
              {t('tasks.lockedUntilStart', { date: formatDateTime(currentTask.startDate) })}
            </div>
          )}

          <TaskMeta>
            {currentTask.startDate && (
              <MetaCard>
                <MetaLabel>{t('tasks.scheduledStart')}</MetaLabel>
                <MetaValue>
                  <Clock size={18} />
                  {formatDateTime(currentTask.startDate)}
                </MetaValue>
              </MetaCard>
            )}

            {currentTask.dueDate && (
              <MetaCard>
                <MetaLabel>{t('tasks.dueDate')}</MetaLabel>
                <MetaValue>
                  <Calendar size={18} />
                  {formatDate(currentTask.dueDate)}
                </MetaValue>
              </MetaCard>
            )}

            {currentTask.location && (
              <MetaCard>
                <MetaLabel>{t('tasks.location')}</MetaLabel>
                <MetaValue>
                  <MapPin size={18} />
                  {currentTask.location}
                </MetaValue>
              </MetaCard>
            )}

            {currentTask.inspectionType && (
              <MetaCard>
                <MetaLabel>{t('tasks.type')}</MetaLabel>
                <MetaValue>
                  <Clipboard size={18} />
                  {currentTask.inspectionType}
                </MetaValue>
              </MetaCard>
            )}

            <MetaCard>
              <MetaLabel>{t('tasks.progress')}</MetaLabel>
              <MetaValue>
                <TrendingUp size={18} />
                {Math.max(currentTask?.overallProgress || 0, taskCompletionPercentage)}%
              </MetaValue>
            </MetaCard>
          </TaskMeta>
        </TaskHeader>

        <TabsContainer>
          <TabsWrapper>
            <Tab
              active={activeTab === 'overview'}
              onClick={() => {
                userActiveRef.current = true;
                setActiveTab('overview');
                setTimeout(() => userActiveRef.current = false, 1000);
              }}
            >
              <Info size={16} />
              {t('tasks.overview')}
            </Tab>
            {/* {!isArchivedTask && ( */}
            <Tab
              active={activeTab === 'inspection'}
              onClick={() => {
                userActiveRef.current = true;
                setActiveTab('inspection');
                setTimeout(() => userActiveRef.current = false, 1000);
              }}
              disabled={currentTask?.status === 'pending'}
            >
              <CheckSquare size={16} />
              {t('tasks.inspection')}
            </Tab>
            {/* )} */}
            <Tab
              active={activeTab === 'report'}
              onClick={() => {
                userActiveRef.current = true;
                setActiveTab('report');
                setTimeout(() => userActiveRef.current = false, 1000);
              }}
              disabled={currentTask?.status === 'pending'}
            >
              <FileText size={16} />
              {t('tasks.finalReport')}
            </Tab>
          </TabsWrapper>
        </TabsContainer>

        <ContentContainer>
          <MainPanel>
            {activeTab === 'overview' && (
              <>
                <Card>
                  <SectionTitle>
                    <Info size={20} />
                    {t('tasks.taskOverview')}
                  </SectionTitle>

                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                      {t('tasks.taskDetails')}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{t('tasks.createdBy')}</div>
                        <div style={{ fontWeight: '600', color: '#1a202c' }}>
                          {currentTask.createdBy?.name || currentTask.createdBy?.email || currentTask.createdBy || t('common.unknown')}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{t('tasks.assignedTo')}</div>
                        <div style={{ fontWeight: '600', color: '#1a202c' }}>
                          {Array.isArray(currentTask.assignedTo)
                            ? currentTask.assignedTo.map(user => user.name || user.email || user).join(', ')
                            : currentTask.assignedTo?.name || currentTask.assignedTo?.email || currentTask.assignedTo || t('tasks.unassigned')
                          }
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{t('tasks.asset')}</div>
                        <div style={{ fontWeight: '600', color: '#1a202c' }}>
                          {currentTask.asset?.displayName || currentTask.asset?.name || currentTask.asset || t('common.notApplicable')}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{templateNameLabel}</div>
                        <div style={{ fontWeight: '600', color: '#1a202c' }}>
                          {templateDisplayName}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{t('tasks.created')}</div>
                        <div style={{ fontWeight: '600', color: '#1a202c' }}>{formatDate(currentTask.createdAt)}</div>
                      </div>
                      {currentTask.status && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{t('tasks.status')}</div>
                          <div style={{
                            fontWeight: '600',
                            color: currentTask.status === 'completed' ? '#16a34a' :
                              currentTask.status === 'in_progress' ? '#f59e0b' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <StatusIcon status={currentTask.status} />
                            {currentTask.status === 'pending' ? t('tasks.pending') :
                              currentTask.status === 'in_progress' ? t('tasks.inProgress') :
                                currentTask.status === 'completed' ? t('tasks.completed') :
                                  currentTask.status === 'archived' ? t('tasks.archived') :
                                    currentTask.status.charAt(0).toUpperCase() + currentTask.status.slice(1).replace('_', ' ')}
                          </div>
                        </div>
                      )}
                      {currentTask.priority && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{t('tasks.priority')}</div>
                          <div style={{ fontWeight: '600', color: '#1a202c' }}>
                            <PriorityBadge priority={currentTask.priority}>
                              {currentTask.priority === 'high' ? t('tasks.high') :
                                currentTask.priority === 'medium' ? t('tasks.medium') :
                                  currentTask.priority === 'low' ? t('tasks.low') :
                                    currentTask.priority}
                            </PriorityBadge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {renderPreInspectionQuestionnaire()}

                {/* Task Comments Section */}
                {currentTask.comments && currentTask.comments.length > 0 && (
                  <Card style={{ marginTop: '24px' }}>
                    <SectionTitle>
                      <MessageSquare size={20} />
                      {t('tasks.taskComments')}
                    </SectionTitle>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {currentTask.comments.map((comment, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '16px',
                            background: 'rgba(55, 136, 216, 0.05)',
                            borderRadius: '8px',
                            border: '1px solid rgba(55, 136, 216, 0.1)'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                          }}>
                            <span style={{
                              fontWeight: '600',
                              color: '#1a202c',
                              fontSize: '14px'
                            }}>
                              {comment.user?.name || comment.user?.email || comment.user || t('common.unknownUser')}
                            </span>
                            <span style={{
                              fontSize: '12px',
                              color: '#64748b'
                            }}>
                              {formatDate(comment.createdAt || comment.timestamp)}
                            </span>
                          </div>
                          <p style={{
                            margin: 0,
                            color: '#374151',
                            fontSize: '14px',
                            lineHeight: '1.5'
                          }}>
                            {comment.text || comment.content || comment.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Task Metrics Section */}
                {(currentTask.status === 'in_progress' || currentTask.status === 'completed' || currentTask.status === 'archived') && (
                  <Card style={{ marginTop: '24px' }}>
                    <SectionTitle>
                      <BarChart2 size={20} />
                      {t('tasks.taskMetricsProgress')}
                    </SectionTitle>
                    <MetricGrid>
                      <MetricCard $color="blue" $bgColor="rgba(55, 136, 216, 0.1)">
                        <MetricLabel>{t('tasks.overallProgress')}</MetricLabel>
                        <MetricValue $color="#3788d8">
                          {Math.max(currentTask?.overallProgress || 0, taskCompletionPercentage)}%
                        </MetricValue>
                        <MetricDescription>{t('tasks.taskCompletion')}</MetricDescription>
                      </MetricCard>

                      <MetricCard $color="green" $bgColor="rgba(39, 174, 96, 0.1)">
                        <MetricLabel>{t('tasks.complianceScore')}</MetricLabel>
                        <MetricValue $color="#27ae60">
                          {scores.percentage}%
                        </MetricValue>
                        <MetricDescription>
                          {scores.achieved} {t('tasks.of')} {scores.total} {t('tasks.points')}
                        </MetricDescription>
                      </MetricCard>

                      <MetricCard $color="orange" $bgColor="rgba(243, 156, 18, 0.1)">
                        <MetricLabel>{t('tasks.timeSpent')}</MetricLabel>
                        <MetricValue $color="#f39c12" style={{ fontFamily: 'monospace', fontSize: '18px' }}>
                          {currentTask?.status === 'in_progress' && !currentTask?.signature && currentTask?.status !== 'completed' && currentTask?.status !== 'archived' 
                            ? formatTimeFromSeconds(displayTime)
                            : formatTimeSpent((currentTask.taskMetrics?.timeSpent || 0) / 3600)}
                        </MetricValue>
                        <MetricDescription>
                          {currentTask?.status === 'in_progress' && !currentTask?.signature && currentTask?.status !== 'completed' && currentTask?.status !== 'archived' 
                            ? `${formatTimeAsHHMM(displayTime)} - ${t('tasks.liveTimer')}`
                            : t('tasks.totalDuration')}
                        </MetricDescription>
                      </MetricCard>

                      <MetricCard $color="gray" $bgColor="rgba(44, 62, 80, 0.1)">
                        <MetricLabel>{t('tasks.inspectionPages')}</MetricLabel>
                        <MetricValue $color="#2c3e50">
                          {inspectionPages.length}
                        </MetricValue>
                        <MetricDescription>{t('tasks.totalSections')}</MetricDescription>
                      </MetricCard>
                    </MetricGrid>
                  </Card>
                )}

                {(currentTask.status === 'pending' || !currentTask.status) && !isArchivedTask && (
                  <div style={{ textAlign: 'center', margin: '32px 0' }}>
                    <StartTaskButton onClick={handleStartTask} disabled={actionLoading || scheduledStartLocked || isTaskInactive}>
                      {scheduledStartLocked ? <Clock size={20} /> : <Play size={20} />}
                      {scheduledStartLocked ? t('tasks.scheduled') : t('tasks.startInspection')}
                    </StartTaskButton>
                  </div>
                )}

                {currentTask.status === 'in_progress' && !isArchivedTask && (
                  <div style={{ textAlign: 'center', margin: '32px 0' }}>
                    <ContinueButton onClick={() => setActiveTab('inspection')} disabled={actionLoading || isTaskInactive}>
                      <Activity size={20} />
                      {t('tasks.continueInspection')}
                    </ContinueButton>
                  </div>
                )}

                {isArchivedTask && (
                  <div style={{
                    textAlign: 'center',
                    margin: '32px 0',
                    padding: '24px',
                    background: 'rgba(55, 136, 216, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(55, 136, 216, 0.2)'
                  }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#3788d8',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      justifyContent: 'center'
                    }}>
                      <CheckCircle size={20} />
                      Task Completed & Archived
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#64748b',
                      margin: 0
                    }}>
                      This inspection has been completed and archived. All data is now in read-only mode.
                    </p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'inspection' && (
              <>
                <ProgressContainer>
                  <ProgressHeader>
                    <ProgressTitle>
                      <TrendingUp size={20} />
                      {t('tasks.inspectionProgress')}
                    </ProgressTitle>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ProgressValue>
                          {Math.max(currentTask?.overallProgress || 0, taskCompletionPercentage)}%
                          {/* Debug info in development */}
                          {process.env.NODE_ENV === 'development' && (
                            <div style={{ fontSize: '8px', color: '#999', marginTop: '2px' }}>
                              DB: {currentTask?.overallProgress || 0}% | Calc: {taskCompletionPercentage}%
                            </div>
                          )}
                        </ProgressValue>
                        <button
                          onClick={() => setShowProgressDetails(true)}
                          style={{
                            background: 'rgba(55, 136, 216, 0.1)',
                            border: '1px solid rgba(55, 136, 216, 0.3)',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            color: '#3788d8'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(55, 136, 216, 0.2)';
                            e.currentTarget.style.borderColor = '#3788d8';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(55, 136, 216, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(55, 136, 216, 0.3)';
                          }}
                          title="View progress details"
                        >
                          <Info size={16} />
                        </button>
                      </div>

                      {autoUpdateEnabled && (
                        <div style={{
                          fontSize: '10px',
                          color: '#16a34a',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'rgba(34, 197, 94, 0.1)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          <div style={{
                            width: '3px',
                            height: '3px',
                            borderRadius: '50%',
                            background: '#16a34a',
                            animation: 'pulse 2s infinite'
                          }}></div>
                          {t('tasks.live')}
                        </div>
                      )}
                    </div>
                  </ProgressHeader>

                  <ProgressBar progress={Math.max(currentTask?.overallProgress || 0, taskCompletionPercentage)} />
                </ProgressContainer>

                {renderInspectionInterface()}

                {(currentTask.status === 'in_progress' || currentTask.status === 'completed') && (
                  <ScoreCard>
                    <SectionTitle>
                      <Award size={20} />
                      {t('tasks.inspectionScoringSummary')}
                    </SectionTitle>

                    <ScoreGrid>
                      <ScoreItem>
                        <ScoreLabel>{t('tasks.complianceScore')}</ScoreLabel>
                        <ScoreValue>
                          {scores.achieved} / {scores.total}
                          <span style={{ fontSize: '14px', color: '#27ae60', marginLeft: '8px' }}>
                            ({scores.percentage}%)
                          </span>
                        </ScoreValue>
                      </ScoreItem>

                      <ScoreItem>
                        <ScoreLabel>{t('tasks.pagesScored')}</ScoreLabel>
                        <ScoreValue>
                          {inspectionPages.length > 0 ?
                            inspectionPages.reduce((sum, page) => {
                              const pageScore = calculatePageScore(page, currentTask.questionnaireResponses || {});
                              return sum + (pageScore.achieved > 0 ? 1 : 0);
                            }, 0)
                            : 0} / {inspectionPages.length}
                        </ScoreValue>
                      </ScoreItem>

                      <ScoreItem>
                        <ScoreLabel>{t('tasks.completionRate')}</ScoreLabel>
                        <ScoreValue>
                          {Math.max(currentTask?.overallProgress || 0, taskCompletionPercentage)}%
                        </ScoreValue>
                      </ScoreItem>

                      <ScoreItem>
                        <ScoreLabel>{t('tasks.status')}</ScoreLabel>
                        <ScoreValue style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                          <StatusIcon status={currentTask.status} />
                          {currentTask.status === 'pending' ? t('tasks.pending') :
                            currentTask.status === 'in_progress' ? t('tasks.inProgress') :
                              currentTask.status === 'completed' ? t('tasks.completed') :
                                currentTask.status === 'archived' ? t('tasks.archived') :
                                  currentTask.status.charAt(0).toUpperCase() + currentTask.status.slice(1).replace('_', ' ')}
                        </ScoreValue>
                      </ScoreItem>
                    </ScoreGrid>
                  </ScoreCard>
                )}
              </>
            )}

            {activeTab === 'report' && (
              <>
                <ReportSection>
                  <ReportHeader>
                    <ReportTitle>
                      <FileText size={24} />
                      {t('tasks.inspectionFinalReport')}
                    </ReportTitle>

                    {/* <QuickActionButton 
                      primary
                      onClick={handleExportReport}
                      disabled={currentTask?.status === 'pending'}
                    >
                      <Download size={16} />
                      Export Excel
                    </QuickActionButton> */}
                  </ReportHeader>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    <div style={{ background: 'rgba(55, 136, 216, 0.1)', padding: '20px', borderRadius: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#3788d8', marginBottom: '8px', fontWeight: '600' }}>{t('tasks.overallScore')}</div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#3788d8' }}>
                        {scores.percentage}%
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        {scores.achieved} {t('tasks.of')} {scores.total} {t('tasks.points')}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(39, 174, 96, 0.1)', padding: '20px', borderRadius: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#27ae60', marginBottom: '8px', fontWeight: '600' }}>{t('tasks.completion')}</div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#27ae60' }}>
                        {Math.max(currentTask?.overallProgress || 0, taskCompletionPercentage)}%
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        {t('tasks.questionsAnswered')}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(243, 156, 18, 0.1)', padding: '20px', borderRadius: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#f39c12', marginBottom: '8px', fontWeight: '600' }}>{t('tasks.timeSpent')}</div>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#f39c12', fontFamily: 'monospace' }}>
                        {currentTask?.status === 'in_progress' && !currentTask?.signature && currentTask?.status !== 'completed' && currentTask?.status !== 'archived' 
                          ? formatTimeFromSeconds(displayTime)
                          : formatTimeSpent((currentTask.taskMetrics?.timeSpent || 0) / 3600)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        {currentTask?.status === 'in_progress' && !currentTask?.signature && currentTask?.status !== 'completed' && currentTask?.status !== 'archived' 
                          ? `${formatTimeAsHHMM(displayTime)} - ${t('tasks.liveTimer')}`
                          : t('tasks.totalDuration')}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(44, 62, 80, 0.1)', padding: '20px', borderRadius: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#2c3e50', marginBottom: '8px', fontWeight: '600' }}>{t('tasks.pages')}</div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#2c3e50' }}>
                        {inspectionPages.length}
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        {t('tasks.totalSections')}
                      </div>
                    </div>
                  </div>

                  {currentTask?.signature && (
                    <div style={{
                      marginBottom: '24px',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      background: 'rgba(248, 250, 252, 0.75)'
                    }}>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1a202c',
                        marginBottom: '12px'
                      }}>
                        {t('tasks.signature')}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        {typeof currentTask.signature === 'string' && currentTask.signature.startsWith('data:image/') && (
                          <img
                            src={currentTask.signature}
                            alt="Final signature"
                            style={{
                              maxWidth: '220px',
                              maxHeight: '110px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0'
                            }}
                          />
                        )}
                        <div style={{ color: '#374151', fontSize: '13px', lineHeight: '1.7' }}>
                          <div>Signed at: {currentTask?.signedAt ? new Date(currentTask.signedAt).toLocaleString() : 'N/A'}</div>
                          {currentTask?.signatureMetadata && (
                            <div>Captured: {formatCaptureMetadata(currentTask.signatureMetadata)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentTask?.preInspectionQuestions && currentTask.preInspectionQuestions.length > 0 && (
                    <div style={{ marginTop: '32px' }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1a202c',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <CheckSquare size={18} />
                        {t('tasks.preInspectionQuestionnaire')}
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {currentTask.preInspectionQuestions.map((question, index) => (
                          <div
                            key={index}
                            style={{
                              background: 'rgba(248, 250, 252, 0.8)',
                              borderRadius: '12px',
                              padding: '16px',
                              border: '1px solid rgba(226, 232, 240, 0.7)',
                              margin: '6px'
                            }}
                          >
                            <div style={{
                              display: 'flex',
                              gap: '12px',
                              alignItems: 'flex-start'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #3788d8, #2c3e50)',
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '12px',
                                flexShrink: 0
                              }}>
                                {index + 1}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  fontWeight: '600',
                                  color: '#1a202c',
                                  marginBottom: '8px',
                                  fontSize: '14px'
                                }}>
                                  {question.text}
                                  {question.required !== false && (
                                    <span style={{ color: '#dc2626', marginLeft: '4px', fontWeight: 'bold' }}>*</span>
                                  )}
                                </div>
                                <div style={{
                                  fontSize: '14px',
                                  color: '#374151',
                                  background: 'white',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: '1px solid rgba(229, 231, 235, 0.8)'
                                }}>
                                  <strong>{t('tasks.response')}:</strong> {
                                    (() => {
                                      const response = currentTask.questionnaireResponses &&
                                        currentTask.questionnaireResponses[question._id] ?
                                        currentTask.questionnaireResponses[question._id] :
                                        null;
                                      const responseMetadata = getResponseMetadataForQuestion(currentTask, question._id);

                                      if (!response) return t('tasks.notAnswered');

                                      // Handle file responses with preview
                                      if (question.type === 'file' && response) {
                                        if (response.startsWith('data:image/')) {
                                          return (
                                            <div style={{ marginTop: '8px' }}>
                                              <div style={{ marginBottom: '8px', color: '#0369a1', fontSize: '12px' }}>
                                                📎 {t('tasks.imageUploaded')}
                                              </div>
                                              <img
                                                src={response}
                                                alt="Uploaded file"
                                                style={{
                                                  maxWidth: '200px',
                                                  maxHeight: '150px',
                                                  borderRadius: '6px',
                                                  border: '1px solid #e2e8f0',
                                                  cursor: 'pointer'
                                                }}
                                                onClick={() => window.open(response, '_blank')}
                                              />
                                              {responseMetadata && (
                                                <div style={{ marginTop: '8px', color: '#475569', fontSize: '12px' }}>
                                                  Captured: {formatCaptureMetadata(responseMetadata)}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        } else if (response.startsWith('data:')) {
                                          return (
                                            <div style={{ marginTop: '8px' }}>
                                              <div style={{ marginBottom: '8px', color: '#0369a1', fontSize: '12px' }}>
                                                📎 {t('tasks.fileUploaded')}
                                              </div>
                                              <button
                                                onClick={() => {
                                                  const link = document.createElement('a');
                                                  link.href = response;
                                                  link.download = 'uploaded-file';
                                                  link.click();
                                                }}
                                                style={{
                                                  padding: '8px 12px',
                                                  background: '#0369a1',
                                                  color: 'white',
                                                  border: 'none',
                                                  borderRadius: '6px',
                                                  cursor: 'pointer',
                                                  fontSize: '12px'
                                                }}
                                              >
                                                {t('tasks.downloadFile')}
                                              </button>
                                              {responseMetadata && (
                                                <div style={{ marginTop: '8px', color: '#475569', fontSize: '12px' }}>
                                                  Captured: {formatCaptureMetadata(responseMetadata)}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        } else {
                                          return (
                                            <div>
                                              <div>{`📎 ${t('tasks.fileUploaded')}: ${response}`}</div>
                                              {responseMetadata && (
                                                <div style={{ marginTop: '8px', color: '#475569', fontSize: '12px' }}>
                                                  Captured: {formatCaptureMetadata(responseMetadata)}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        }
                                      }

                                      // Handle signature responses with preview
                                      if (question.type === 'signature' && response) {
                                        if (response.startsWith('data:image/')) {
                                          return (
                                            <div style={{ marginTop: '8px' }}>
                                              <div style={{ marginBottom: '8px', color: '#0369a1', fontSize: '12px' }}>
                                                ✍️ {t('tasks.signatureProvided')}
                                              </div>
                                              <img
                                                src={response}
                                                alt="Signature"
                                                style={{
                                                  maxWidth: '200px',
                                                  maxHeight: '100px',
                                                  borderRadius: '6px',
                                                  border: '1px solid #e2e8f0',
                                                  cursor: 'pointer'
                                                }}
                                                onClick={() => window.open(response, '_blank')}
                                              />
                                              {responseMetadata && (
                                                <div style={{ marginTop: '8px', color: '#475569', fontSize: '12px' }}>
                                                  Captured: {formatCaptureMetadata(responseMetadata)}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        } else {
                                          return (
                                            <div>
                                              <div>{`✍️ ${t('tasks.signatureProvided')}`}</div>
                                              {responseMetadata && (
                                                <div style={{ marginTop: '8px', color: '#475569', fontSize: '12px' }}>
                                                  Captured: {formatCaptureMetadata(responseMetadata)}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        }
                                      }

                                      // Default response display
                                      return (
                                        <div>
                                          <div>{response}</div>
                                          {responseMetadata && (
                                            <div style={{ marginTop: '8px', color: '#475569', fontSize: '12px' }}>
                                              Captured: {formatCaptureMetadata(responseMetadata)}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })()
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </ReportSection>

                {/* <ReportSection>
                  <SectionTitle>
                    <Edit size={20} />
                    Inspector Signature
                  </SectionTitle>
                  
                  <SignatureSection>
                    {signatureImage ? (
                      <div style={{ textAlign: 'center' }}>
                        <SignatureImage 
                          src={signatureImage} 
                          alt="Inspector signature"
                        />
                        <SignatureInfo>
                          Signed by: {currentUser?.name || 'Inspector'} on {formatDate(new Date())}
                        </SignatureInfo>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <Edit size={48} color="#64748b" style={{ marginBottom: '16px' }} />
                        <p style={{ 
                          color: '#64748b',
                          fontSize: '16px',
                          marginBottom: '20px'
                        }}>
                          No signature has been added yet.
                        </p>
                        <QuickActionButton 
                          primary
                          onClick={() => setShowSignatureModal(true)}
                        >
                          <Edit size={16} />
                          Add Signature
                        </QuickActionButton>
                      </div>
                    )}
                  </SignatureSection>
                </ReportSection> */}

                {/* Action Buttons Section */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px',
                  marginTop: '32px',
                  padding: '24px',
                  background: 'rgba(248, 250, 252, 0.6)',
                  borderRadius: '16px',
                  border: '1px solid rgba(226, 232, 240, 0.8)'
                }}>

                  {/* Button Row */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>

                    {/* Complete & Archive Button */}
                    {currentTask?.status !== 'archived' && (() => {
                      const actualProgress = Math.max(currentTask?.overallProgress || 0, taskCompletionPercentage);
                      const isProgressComplete = actualProgress >= 100;
                      const isButtonDisabled = currentTask?.status === 'pending' || isArchiving || !isProgressComplete || isTaskInactive;

                      return (
                        <QuickActionButton
                          primary
                          onClick={handleCompleteAndArchive}
                          disabled={isButtonDisabled}
                          style={{
                            padding: '16px 32px',
                            fontSize: '16px',
                            fontWeight: '600',
                            background: isProgressComplete
                              ? 'linear-gradient(135deg, #16a34a, #15803d)'
                              : 'linear-gradient(135deg, #94a3b8, #64748b)',
                            boxShadow: isProgressComplete
                              ? '0 4px 15px rgba(22, 163, 74, 0.4)'
                              : '0 2px 8px rgba(100, 116, 139, 0.2)',
                            border: isProgressComplete
                              ? '1px solid rgba(22, 163, 74, 0.3)'
                              : '1px solid rgba(100, 116, 139, 0.3)',
                            minWidth: '240px',
                            height: '56px',
                            cursor: !isButtonDisabled ? 'pointer' : 'not-allowed'
                          }}
                        >
                          {isArchiving ? (
                            <>
                              <Loader size={20} />
                              {t('tasks.archiving')}
                            </>
                          ) : (
                            <>
                              <CheckCircle size={20} />
                              {t('tasks.completeAndArchive')}
                            </>
                          )}
                        </QuickActionButton>
                      );
                    })()}

                    {/* Download Report Buttons - Only show for archived tasks */}
                    {currentTask?.status === 'archived' && (
                      <>
                        {/* Excel Download */}
                        {/* <QuickActionButton 
                          primary
                          onClick={() => handleDownloadReport('excel')}
                          style={{ 
                            padding: '16px 32px', 
                            fontSize: '16px',
                            fontWeight: '600',
                            background: 'linear-gradient(135deg, #16a34a, #15803d)',
                            boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)',
                            border: '1px solid rgba(22, 163, 74, 0.3)',
                            minWidth: '200px',
                            height: '56px'
                          }}
                        >
                          <Download size={20} />
                          Download Excel
                        </QuickActionButton> */}

                        {/* Export Dropdown */}
                        <ExportButtonContainer className="export-dropdown">
                          <ExportButton onClick={handleExportClick}>
                            <Download size={20} />
                            {t('tasks.downloadReport')}
                            <ChevronDown size={16} />
                          </ExportButton>
                          {showExportDropdown && (
                            <ExportDropdown>
                              <ExportOption onClick={() => handleExportFormat('excel')}>
                                <FileText size={16} />
                                {t('common.exportAsExcel')}
                              </ExportOption>
                              <ExportOption onClick={() => handleExportFormat('docx')}>
                                <FileText size={16} />
                                Word (.docx)
                              </ExportOption>
                              <ExportOption onClick={() => handleExportFormat('pdf')}>
                                <FileText size={16} />
                                {t('common.exportAsPDF')}
                              </ExportOption>
                            </ExportDropdown>
                          )}
                        </ExportButtonContainer>

                        {/* Word Download */}
                        {/* <QuickActionButton 
                          primary
                          onClick={() => handleDownloadReport('docx')}
                          style={{ 
                            padding: '16px 32px', 
                            fontSize: '16px',
                            fontWeight: '600',
                            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                            boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
                            border: '1px solid rgba(37, 99, 235, 0.3)',
                            minWidth: '200px',
                            height: '56px'
                          }}
                        >
                          <Download size={20} />
                          Download Word
                        </QuickActionButton> */}
                      </>
                    )}

                    {/* Submit and Download Later Button - Only show for non-archived completed tasks */}
                    {currentTask?.status === 'completed' && currentTask?.signature && (
                      <QuickActionButton
                        primary
                        onClick={handleSubmitAndDownloadLater}
                        style={{
                          padding: '16px 32px',
                          fontSize: '16px',
                          fontWeight: '600',
                          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                          boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)',
                          border: '1px solid rgba(124, 58, 237, 0.3)',
                          minWidth: '240px',
                          height: '56px'
                        }}
                      >
                        <CheckCircle size={20} />
                        {t('tasks.submitAndDownloadLater')}
                      </QuickActionButton>
                    )}
                  </div>

                  {/* Status Message */}
                  <div style={{ textAlign: 'center' }}>
                    {currentTask?.status === 'archived' ? (
                      <p style={{
                        fontSize: '14px',
                        color: '#16a34a',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        justifyContent: 'center'
                      }}>
                        <CheckCircle size={16} />
                        {t('tasks.inspectionCompletedAndArchived')}
                      </p>
                    ) : (() => {
                      const actualProgress = Math.max(currentTask?.overallProgress || 0, taskCompletionPercentage);
                      const isComplete = actualProgress >= 100;

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                          <p style={{
                            fontSize: '14px',
                            color: isComplete ? '#16a34a' : '#f59e0b',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            justifyContent: 'center'
                          }}>
                            {isComplete ? (
                              <>
                                <CheckCircle size={16} />
                                {t('tasks.inspectionCompleted')} ({actualProgress}%) - {t('tasks.readyToArchive')}
                              </>
                            ) : (
                              <>
                                <Clock size={16} />
                                {t('tasks.progress')}: {actualProgress}% - {t('tasks.completeAllSectionsToArchive')}
                              </>
                            )}
                          </p>
                          {!isComplete && (
                            <p style={{
                              fontSize: '12px',
                              color: '#64748b',
                              fontStyle: 'italic'
                            }}>
                              {t('tasks.completeAllInspectionSectionsToEnableArchiving')}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </>
            )}
          </MainPanel>

          <SidePanel>
            <Card>
              <SectionTitle>
                <BarChart2 size={20} />
                {t('tasks.quickStats')}
              </SectionTitle>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'rgba(55, 136, 216, 0.05)',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>{t('tasks.progress')}</span>
                  <span style={{ fontWeight: '700', color: '#3788d8' }}>
                    {Math.max(currentTask?.overallProgress || 0, taskCompletionPercentage)}%
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'rgba(39, 174, 96, 0.05)',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>{t('tasks.score')}</span>
                  <span style={{ fontWeight: '700', color: '#27ae60' }}>
                    {scores.percentage}%
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'rgba(243, 156, 18, 0.05)',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>{t('tasks.time')}</span>
                  <span style={{ fontWeight: '700', color: '#f39c12', fontFamily: 'monospace', fontSize: '14px' }}>
                    {currentTask?.status === 'in_progress' && !currentTask?.signature && currentTask?.status !== 'completed' && currentTask?.status !== 'archived' 
                      ? formatTimeFromSeconds(displayTime)
                      : formatTimeSpent((currentTask.taskMetrics?.timeSpent || 0) / 3600)}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'rgba(44, 62, 80, 0.05)',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>{t('tasks.pages')}</span>
                  <span style={{ fontWeight: '700', color: '#2c3e50' }}>
                    {inspectionPages.length}
                  </span>
                </div>
              </div>
            </Card>


          </SidePanel>
        </ContentContainer>
      </MainContent>

      {locationHelpModal.open && (
        <ModalOverlay>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Location Access Required</ModalTitle>
              <CloseButton onClick={() => setLocationHelpModal((prev) => ({ ...prev, open: false }))}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <div style={{ color: '#374151', lineHeight: '1.6' }}>
              <p style={{ marginTop: 0, marginBottom: '10px', fontWeight: 600 }}>
                Location is required to save image/signature captures.
              </p>
              <p style={{ marginTop: 0, marginBottom: '6px' }}>
                Reason: {locationHelpModal.reason}
              </p>
              <p style={{ marginTop: 0, marginBottom: '6px' }}>
                Permission state: {locationHelpModal.permissionState}
              </p>
              <p style={{ marginTop: 0, marginBottom: '12px' }}>
                Error code: {locationHelpModal.errorCode ?? 'N/A'}
              </p>

              <div style={{
                padding: '12px',
                borderRadius: '10px',
                background: 'rgba(55, 136, 216, 0.06)',
                border: '1px solid rgba(55, 136, 216, 0.2)'
              }}>
                {locationHelpModal.steps.map((step, index) => (
                  <div
                    key={`${step}-${index}`}
                    style={{
                      fontWeight: index === 0 ? 700 : 400,
                      marginBottom: index === locationHelpModal.steps.length - 1 ? 0 : 6
                    }}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '20px',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '16px'
            }}>
              <QuickActionButton onClick={() => setLocationHelpModal((prev) => ({ ...prev, open: false }))}>
                Close
              </QuickActionButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      {showSignatureModal && !isArchivedTask && (
        <ModalOverlay>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{t('tasks.signFinalReport')}</ModalTitle>
              <CloseButton onClick={() => setShowSignatureModal(false)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <p style={{ marginBottom: '16px', color: '#64748b', fontSize: '14px', flexShrink: 0 }}>
                {t('tasks.pleaseProvideSignature')}
              </p>

              <SignatureTabs style={{ flexShrink: 0 }}>
                <SignatureTab
                  active={signatureMethod === 'draw'}
                  onClick={() => setSignatureMethod('draw')}
                >
                  {t('tasks.drawSignature')}
                </SignatureTab>
                <SignatureTab
                  active={signatureMethod === 'upload'}
                  onClick={() => setSignatureMethod('upload')}
                >
                  {t('tasks.uploadSignature')}
                </SignatureTab>
              </SignatureTabs>

              {signatureMethod === 'draw' ? (
                <SignatureCanvas>
                  <canvas
                    ref={signatureCanvasRef}
                    width={typeof window !== 'undefined' && window.innerWidth <= 480 ? 350 : 500}
                    height={typeof window !== 'undefined' && window.innerWidth <= 480 ? 150 : 200}
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      height: typeof window !== 'undefined' && window.innerWidth <= 480 ? '150px' : '200px',
                      touchAction: 'none'
                    }}
                    onMouseDown={handleStartDrawing}
                    onMouseMove={handleDrawing}
                    onMouseUp={handleStopDrawing}
                    onMouseLeave={handleStopDrawing}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      const touch = e.touches[0];
                      const rect = e.target.getBoundingClientRect();
                      const mouseEvent = {
                        clientX: touch.clientX,
                        clientY: touch.clientY
                      };
                      handleStartDrawing(mouseEvent);
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault();
                      const touch = e.touches[0];
                      const mouseEvent = {
                        clientX: touch.clientX,
                        clientY: touch.clientY
                      };
                      handleDrawing(mouseEvent);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      handleStopDrawing();
                    }}
                  />
                </SignatureCanvas>
              ) : (
                <SignatureCanvas clickable onClick={handleSignatureUpload}>
                  {signatureImage ? (
                    <img
                      src={signatureImage}
                      alt="Uploaded signature"
                      style={{ maxWidth: '100%', maxHeight: '200px' }}
                    />
                  ) : (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      color: '#64748b'
                    }}>
                      <Upload size={40} />
                      <span>{t('tasks.clickToUploadSignatureImage')}</span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </SignatureCanvas>
              )}
            </div>

            <SignatureActions>
              {signatureMethod === 'draw' && (
                <ClearButton onClick={handleClearSignature}>
                  {/* <Rotate3dIcon size={16} /> */}
                  {t('common.clear')}
                </ClearButton>
              )}

              {signatureMethod === 'upload' && (
                <UploadButton onClick={handleSignatureUpload}>
                  <Upload size={16} />
                  {t('tasks.uploadImage')}
                </UploadButton>
              )}

              {/* <SaveButton 
                onClick={handleSaveSignature}
                disabled={!signatureImage}
                style={{ background: '#64748b' }}
              >
                <Save size={16} />
                Save & Continue
              </SaveButton> */}

              <SaveButton
                onClick={handleSaveAndSubmit}
                disabled={!signatureImage}
                style={{
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  marginLeft: '8px',
                  fontWeight: '600'
                }}
              >
                <CheckCircle size={16} />
                {t('tasks.saveAndSubmit')}
              </SaveButton>
            </SignatureActions>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Unanswered Questions Summary Modal */}
      {showUnansweredModal && (() => {
        const { required, optional } = getAllUnansweredQuestions();
        const hasRequired = required.length > 0;

        return (
          <ModalOverlay>
            <ModalContent style={{ maxWidth: '680px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
              <ModalHeader>
                <ModalTitle style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Info size={22} color={hasRequired ? '#dc2626' : '#f59e0b'} />
                  {t('tasks.unansweredQuestionsSummary') || 'Unanswered Questions Summary'}
                </ModalTitle>
                <CloseButton onClick={() => setShowUnansweredModal(false)}>
                  <X size={20} />
                </CloseButton>
              </ModalHeader>

              <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                {hasRequired ? (
                  <div style={{
                    padding: '14px 16px',
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    color: '#991b1b',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    <strong>⚠️ {t('tasks.requiredQuestionsPending') || 'Required Questions Pending'}:</strong>
                    <div style={{ marginTop: '4px' }}>
                      {t('tasks.mustAnswerRequiredQuestions') || `You have ${required.length} required question(s) without a response. Please jump to each question below and provide an answer before completing the inspection.`}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '14px 16px',
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    color: '#92400e',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    <strong>ℹ️ {t('tasks.optionalQuestionsPending') || 'Optional / Recommended Questions Skipped'}:</strong>
                    <div style={{ marginTop: '4px' }}>
                      {t('tasks.canProceedOrJump') || `All required questions have been answered. However, ${optional.length} recommended or optional question(s) were skipped. You can review and answer them, or proceed with submission.`}
                    </div>
                  </div>
                )}

                {hasRequired && (
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={16} />
                      {t('tasks.requiredQuestions') || 'Required Questions'} ({required.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {required.map((item, idx) => (
                        <div key={item.questionId || idx} style={{
                          padding: '14px',
                          background: '#fff',
                          border: '1px solid #fecaca',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#1f2937', marginBottom: '4px', wordBreak: 'break-word' }}>
                              {item.questionText}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <span><strong>Page:</strong> {item.pageName}</span>
                              <span>•</span>
                              <span><strong>Section:</strong> {item.sectionName}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => jumpToQuestion(item)}
                            style={{
                              padding: '8px 14px',
                              background: '#dc2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                              transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#b91c1c'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#dc2626'}
                          >
                            <Target size={14} />
                            {t('tasks.jumpToQuestion') || 'Jump'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {optional.length > 0 && (
                  <div>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#d97706', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Info size={16} />
                      {t('tasks.recommendedOrOptionalQuestions') || 'Recommended / Optional Questions'} ({optional.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {optional.map((item, idx) => (
                        <div key={item.questionId || idx} style={{
                          padding: '14px',
                          background: '#fff',
                          border: '1px solid #fde68a',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#1f2937', marginBottom: '4px', wordBreak: 'break-word' }}>
                              {item.questionText}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <span><strong>Page:</strong> {item.pageName}</span>
                              <span>•</span>
                              <span><strong>Section:</strong> {item.sectionName}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => jumpToQuestion(item)}
                            style={{
                              padding: '8px 14px',
                              background: '#d97706',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                              transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#b45309'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#d97706'}
                          >
                            <Target size={14} />
                            {t('tasks.jumpToQuestion') || 'Jump'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                borderTop: '1px solid #e5e7eb',
                padding: '16px 20px',
                background: '#f8fafc',
                borderBottomLeftRadius: '12px',
                borderBottomRightRadius: '12px'
              }}>
                <QuickActionButton
                  onClick={() => setShowUnansweredModal(false)}
                  style={{ minWidth: '120px' }}
                >
                  {t('common.close') || 'Close'}
                </QuickActionButton>

                {!hasRequired && (
                  <QuickActionButton
                    primary
                    onClick={proceedToFinalSubmission}
                    style={{
                      background: 'linear-gradient(135deg, #16a34a, #15803d)',
                      minWidth: '200px'
                    }}
                  >
                    <CheckSquare size={16} />
                    {t('tasks.proceedWithSubmission') || 'Proceed with Submission'}
                  </QuickActionButton>
                )}
              </div>
            </ModalContent>
          </ModalOverlay>
        );
      })()}

      {/* Archive Confirmation Modal */}
      {showArchiveModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{t('tasks.completeAndArchiveInspection')}</ModalTitle>
              <CloseButton onClick={() => {
                setShowArchiveModal(false);
                setSignatureJustSaved(false);
              }}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <div style={{ padding: '20px 0' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '20px',
                padding: '16px',
                background: 'rgba(22, 163, 74, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(22, 163, 74, 0.2)'
              }}>
                <CheckCircle size={48} color="#16a34a" />
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#16a34a'
                  }}>
                    {t('tasks.readyToComplete')}
                  </h3>
                  <p style={{
                    margin: '4px 0 0 0',
                    color: '#64748b',
                    fontSize: '14px'
                  }}>
                    {t('tasks.inspectionSignedAndReadyToArchive')}
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#374151', lineHeight: '1.6' }}>
                  {t('tasks.byClickingCompleteAndArchive')}
                </p>
                <ul style={{
                  marginTop: '12px',
                  paddingLeft: '24px',
                  color: '#64748b',
                  lineHeight: '1.6'
                }}>
                  <li>{t('tasks.markedAsCompletedAndArchived')}</li>
                  <li>{t('tasks.madeAvailableForReportDownload')}</li>
                  <li>{t('tasks.movedToArchiveSection')}</li>
                  <li>{t('tasks.noLongerEditable')}</li>
                </ul>
              </div>

              <div style={{
                padding: '12px',
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                marginBottom: '20px'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#92400e',
                  fontWeight: '500'
                }}>
                  ⚠️ {t('tasks.thisActionCannotBeUndone')}
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '20px'
            }}>
              <QuickActionButton
                onClick={() => setShowArchiveModal(false)}
                disabled={isArchiving}
              >
                {t('common.cancel')}
              </QuickActionButton>
              <QuickActionButton
                primary
                onClick={handleConfirmArchive}
                disabled={isArchiving}
                style={{
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  minWidth: '160px'
                }}
              >
                {isArchiving ? (
                  <>
                    <Loader size={16} />
                    {t('tasks.archiving')}
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    {t('tasks.completeAndArchive')}
                  </>
                )}
              </QuickActionButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      <DocumentNamingModal
        isOpen={showDocumentNamingModal}
        onClose={() => setShowDocumentNamingModal(false)}
        onExport={handleConfirmDownload}
        exportFormat={selectedReportFormat === 'excel' ? 'xlsx' : selectedReportFormat}
        documentType="Inspection-Report"
        defaultCriteria={['documentType', 'currentDate']}
      />

      {/* Progress Details Modal */}
      {showProgressDetails && (
        <ModalOverlay onClick={() => setShowProgressDetails(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <ModalHeader>
              <ModalTitle>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BarChart2 size={24} />
                  {t('tasks.progressDetails') || 'Progress Details'}
                </div>
              </ModalTitle>
              <CloseButton onClick={() => setShowProgressDetails(false)}>
                <X size={18} />
              </CloseButton>
            </ModalHeader>

            <div style={{ marginBottom: '20px' }}>
              <div style={{
                padding: '16px',
                background: taskCompletionPercentage === 100 ? 'rgba(39, 174, 96, 0.1)' : 'rgba(243, 156, 18, 0.1)',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                  {t('tasks.currentProgress') || 'Current Progress'}
                </div>
                <div style={{ 
                  fontSize: '32px', 
                  fontWeight: '800', 
                  color: taskCompletionPercentage === 100 ? '#27ae60' : '#f39c12' 
                }}>
                  {Math.max(currentTask?.overallProgress || 0, taskCompletionPercentage)}%
                </div>
                <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                  {(() => {
                    const unanswered = getUnansweredQuestionsDetails();
                    const total = unanswered.length + (inspectionPages?.reduce((sum, page) => {
                      return sum + (page.sections?.reduce((sectionSum, section) => {
                        return sectionSum + (section.questions?.filter(q => 
                          q.requirementType !== 'recommended' && q.mandatory !== false && q.required !== false
                        )?.length || 0);
                      }, 0) || 0);
                    }, 0) || 0);
                    const answered = total - unanswered.length;
                    return `${answered} of ${total} required questions answered`;
                  })()}
                </div>
              </div>

              {(() => {
                const unansweredQuestions = getUnansweredQuestionsDetails();
                
                if (unansweredQuestions.length === 0) {
                  return (
                    <div style={{
                      padding: '24px',
                      background: 'rgba(39, 174, 96, 0.1)',
                      borderRadius: '12px',
                      textAlign: 'center'
                    }}>
                      <CheckCircle size={48} style={{ color: '#27ae60', marginBottom: '12px' }} />
                      <div style={{ fontSize: '18px', fontWeight: '600', color: '#27ae60', marginBottom: '8px' }}>
                        {t('tasks.allQuestionsAnswered') || 'All Required Questions Answered!'}
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        {taskCompletionPercentage === 100 
                          ? (t('tasks.readyToComplete') || 'Your inspection is complete and ready for submission.')
                          : (t('tasks.progressCalculating') || 'Progress is being calculated. The display should update to 100% shortly.')}
                      </div>
                    </div>
                  );
                }

                return (
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1a202c',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <AlertCircle size={20} style={{ color: '#f39c12' }} />
                      {t('tasks.unansweredQuestions') || 'Unanswered Required Questions'} ({unansweredQuestions.length})
                    </div>

                    <div style={{ 
                      maxHeight: '400px', 
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      {unansweredQuestions.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '12px 16px',
                            background: 'rgba(243, 156, 18, 0.05)',
                            border: '1px solid rgba(243, 156, 18, 0.2)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onClick={() => {
                            // Navigate to the question
                            const pageIndex = item.pageIndex - 1;
                            if (inspectionPages[pageIndex]) {
                              setSelectedPage(inspectionPages[pageIndex]._id);
                              setActiveTab('inspection');
                              setShowProgressDetails(false);
                              toast.info(`${t('tasks.navigatedTo') || 'Navigated to'}: ${item.pageName} - ${item.sectionName}`);
                            }
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(243, 156, 18, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(243, 156, 18, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(243, 156, 18, 0.05)';
                            e.currentTarget.style.borderColor = 'rgba(243, 156, 18, 0.2)';
                          }}
                        >
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#f39c12', 
                            fontWeight: '600',
                            marginBottom: '4px'
                          }}>
                            {item.pageName} › {item.sectionName}
                          </div>
                          <div style={{ 
                            fontSize: '14px', 
                            color: '#1a202c',
                            lineHeight: '1.5'
                          }}>
                            {item.questionText}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            color: '#64748b',
                            marginTop: '4px',
                            fontStyle: 'italic'
                          }}>
                            {t('tasks.clickToNavigate') || 'Click to navigate to this question'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default UserTaskDetail;
