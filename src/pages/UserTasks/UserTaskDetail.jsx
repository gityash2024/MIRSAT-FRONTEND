import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { format, differenceInSeconds } from 'date-fns';
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
  ChevronDown,
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
`;

const MainContent = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  animation: ${fadeIn} 0.6s ease-out;
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
`;

const QuickActions = styled.div`
  display: flex;
  gap: 12px;
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
`;

const TaskMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 24px;
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
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
    border-color: rgba(55, 136, 216, 0.3);
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
  
  ${props => {
    switch(props.status) {
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
  
  ${props => {
    switch(props.priority) {
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
`;

const TabsWrapper = styled.div`
  display: flex;
  gap: 4px;
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
  
  ${props => props.active ? css`
    background: linear-gradient(135deg, #3788d8, #2c3e50);
    color: white;
    transform: translateY(-2px);
    box-shadow: 
      0 4px 15px rgba(55, 136, 216, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(55, 136, 216, 0.3);
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
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 30px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.4),
      0 2px 6px rgba(0, 0, 0, 0.1);
    border-color: rgba(55, 136, 216, 0.3);
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
  
  svg {
    color: #3788d8;
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
  overflow: hidden;
  min-height: 80vh;
  margin: 6px;
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
`;

const InspectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
`;

const InspectionControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DropdownContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
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
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  z-index: 9999;
  max-height: 300px;
  overflow-y: auto;
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
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 
      0 6px 20px rgba(55, 136, 216, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
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
`;

const InspectionLayout = styled.div`
  display: flex;
  height: calc(80vh - 80px);
  
  @media (max-width: 1200px) {
    flex-direction: column;
    height: auto;
  }
`;

const NavigationPanel = styled.div`
  width: 320px;
  border-right: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(248, 250, 252, 0.8);
  display: flex;
  flex-direction: column;
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.3);
  
  @media (max-width: 1200px) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    max-height: 300px;
  }
`;

const NavigationHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
`;

const SectionNavigationControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(248, 250, 252, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  gap: 8px;
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
`;

const SectionCounter = styled.div`
  flex: 1;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #1a202c;
  background: rgba(255, 255, 255, 0.8);
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionsNavigation = styled.div`
  padding: 16px;
  overflow-y: auto;
`;

const SectionNavItem = styled.div`
  padding: 12px 16px;
  margin: 6px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  ${props => props.active ? css`
    background: linear-gradient(135deg, #3788d8, #2c3e50);
    color: white;
    transform: translateX(4px);
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
      transform: translateX(2px);
      border-color: rgba(55, 136, 216, 0.3);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
  `}
`;

const SectionTitle2 = styled.div`
  font-weight: 600;
  font-size: 14px;
  flex: 1;
`;

const SectionScore = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(55, 136, 216, 0.2)'};
  border: 1px solid ${props => props.active ? 'rgba(255, 255, 255, 0.3)' : 'rgba(55, 136, 216, 0.3)'};
`;

const ContentPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
`;

const QuestionCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 24px;
  margin: 6px 0 20px 0;
  border: 2px solid rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  position: relative;
  
  &:hover {
    border-color: rgba(55, 136, 216, 0.4);
    transform: translateY(-2px);
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
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
`;

const QuestionText = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  flex: 1;
  line-height: 1.5;
`;

const QuestionBadges = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
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
`;

const InputContainer = styled.div`
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

const CommentItem = styled.div`
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 16px;
  margin: 6px 0;
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 4px 15px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
    border-color: rgba(55, 136, 216, 0.3);
  }
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const CommentAuthor = styled.div`
  font-weight: 600;
  color: #1a202c;
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
`;

const ScoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
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
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 4px 15px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
    border-color: rgba(55, 136, 216, 0.3);
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
`;

const PageScoresContainer = styled.div`
  margin-top: 24px;
  background: rgba(248, 250, 252, 0.9);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
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
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 4px 15px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
    border-color: rgba(55, 136, 216, 0.3);
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
  z-index: 1000;
  backdrop-filter: blur(8px);
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.4);
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
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
  
  &:hover {
    border-color: ${props => props.clickable ? '#3788d8' : '#e5e7eb'};
    background: ${props => props.clickable ? 'rgba(55, 136, 216, 0.05)' : '#f9fafb'};
  }
  
  canvas {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

const SignatureActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
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

const calculateSectionScore = (section, responses) => {
  if (!section || !section.questions || !responses) {
    return { total: 0, achieved: 0, percentage: 0 };
  }
  
  let totalPossible = 0;
  let totalAchieved = 0;
  
  section.questions.forEach(question => {
    if (question.mandatory === false || question.required === false) return;
    
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
      
      const questionType = question.type || question.answerType;
      
      if (questionType === 'compliance' || questionType === 'yesno') {
        if (response === 'full_compliance' || response === 'yes' || response === 'Yes' || response === 'Full compliance') {
          totalAchieved += (maxScore * weight);
        } else if (response === 'partial_compliance' || response === 'Partial compliance') {
          totalAchieved += (maxScore / 2 * weight);
        }
      } else if (questionType === 'checkbox' || questionType === 'multiple') {
        if (Array.isArray(response) && response.length > 0) {
          totalAchieved += (maxScore * weight);
        }
      } else if (questionType === 'file') {
        if (response && response.trim() !== '') {
          totalAchieved += (maxScore * weight);
        }
      } else if (questionType === 'text' || questionType === 'signature') {
        if (response && response?.trim() !== '') {
          totalAchieved += (maxScore * weight);
        }
      } else if (questionType === 'number' || questionType === 'date') {
        if (response) {
          totalAchieved += (maxScore * weight);
        }
      } else {
        if (response && (typeof response === 'string' ? response.trim() !== '' : true)) {
          totalAchieved += (maxScore * weight);
        }
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
const SignatureCanvasComponent = React.memo(({ questionId, response, isDisabled, onSaveResponse }) => {
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

  const handleSaveSignature = useCallback(() => {
    if (!signaturePadRef.current) return;

    if (signaturePadRef.current.isEmpty()) {
      toast.error('Please provide a signature before saving');
      return;
    }

    const dataURL = signaturePadRef.current.toDataURL('image/png');
    onSaveResponse(questionId, dataURL);
    setShowSignatureModal(false);
    toast.success('Signature saved successfully');
  }, [questionId, onSaveResponse]);

  const handleDeleteSignature = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onSaveResponse(questionId, '');
    toast.success('Signature removed');
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
        {isDisabled ? 'Signature' : 'Digital Signature Required'}
      </div>

      {/* Signature Display or Button */}
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
            ✅ Signature Captured
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
        <div style={{ 
          border: '2px dashed #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          background: '#f9fafb',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '16px'
          }}>
            No signature provided
          </div>
          
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
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              ✏️ Add Signature
            </button>
          )}
        </div>
      )}

      {/* Signature Modal */}
      {showSignatureModal && (
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
                Cancel
              </button>
              <SaveButton type="button" onClick={handleSaveSignature}>
                Save Signature
              </SaveButton>
            </SignatureActions>
          </ModalContent>
        </ModalOverlay>
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
  const commentBoxRef = useRef(null);
  const timerRef = useRef(null);
  const signatureCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [commentText, setCommentText] = useState('');
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureImage, setSignatureImage] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState('draw');
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [showDocumentNamingModal, setShowDocumentNamingModal] = useState(false);
  const [selectedReportFormat, setSelectedReportFormat] = useState(null);
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
  const [responseLoading, setResponseLoading] = useState(false);
  const [localInputValues, setLocalInputValues] = useState({});
  
  // Section comments state
  const [sectionComments, setSectionComments] = useState({});
  const [sectionCommentTexts, setSectionCommentTexts] = useState({});
  const [commentLoadingStates, setCommentLoadingStates] = useState({});
  
  // Enhanced time tracking state
  const [isScreenActive, setIsScreenActive] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const sessionTimerRef = useRef(null);
  
  // Auto-update functionality
  const autoUpdateRef = useRef(null);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  
  // Track user interactions to prevent auto-update interference
  const userActiveRef = useRef(false);
  
  // Refs for focus management
  const sectionNavigationRef = useRef(null);
  const pageNavigationRef = useRef(null);
  
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
  
  // Log auto-update status
  useEffect(() => {
    console.log('Auto-update enabled:', autoUpdateEnabled);
  }, [autoUpdateEnabled]);

  const {
    currentTask,
    loading,
    error,
    actionLoading
  } = useSelector((state) => state.userTasks);

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
              totalQuestions++;
              
              const questionId = question._id || question.id;
              let hasResponse = false;
              
              if (taskToUse.questionnaireResponses) {
                if (taskToUse.questionnaireResponses[questionId] !== undefined) {
                  hasResponse = true;
                } else {
                  const responseKey = Object.keys(taskToUse.questionnaireResponses).find(key => 
                    key.includes(questionId) || key.endsWith(questionId)
                  );
                  
                  if (responseKey) {
                    hasResponse = true;
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

  // Add readonly mode check for archived tasks
  const isArchivedTask = currentTask?.status === 'archived';

  // Switch to Overview tab if on Inspection tab for archived tasks
  // useEffect(() => {
  //   if (isArchivedTask && activeTab === 'inspection') {
  //     setActiveTab('overview');
  //   }
  // }, [isArchivedTask, activeTab]);

  // Define timer functions BEFORE useEffects that use them
  const startScreenTimer = useCallback(() => {
    if (currentTask?.status === 'completed' || currentTask?.signature) {
      return; // Don't start timer for completed tasks
    }
    
    if (!isScreenActive && currentTask?.status === 'in_progress') {
      setIsScreenActive(true);
      setSessionStartTime(Date.now());
      
      sessionTimerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
  }, [currentTask, isScreenActive]);
  
  const pauseScreenTimer = useCallback(() => {
    if (isScreenActive) {
      setIsScreenActive(false);
      
      if (sessionStartTime) {
        const sessionDuration = (Date.now() - sessionStartTime) / 1000; // in seconds
        setAccumulatedTime(prev => prev + sessionDuration);
        setSessionStartTime(null);
      }
      
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
    }
  }, [isScreenActive, sessionStartTime]);

  const stopTimerPermanently = useCallback(() => {
    pauseScreenTimer();
    // Save final time to backend when task is completed
    if (currentTask && (accumulatedTime > 0 || sessionStartTime)) {
      const finalSessionTime = sessionStartTime ? (Date.now() - sessionStartTime) / 1000 : 0;
      const totalActiveTime = (accumulatedTime + finalSessionTime) / 3600; // Convert to hours
      
      // Update task metrics with final time
      dispatch(updateUserTaskProgress({
        taskId: currentTask._id,
        subLevelId: currentTask.inspectionLevel?.subLevels?.[0]?._id || 'default',
        status: currentTask.status,
        taskMetrics: {
          ...currentTask.taskMetrics,
          timeSpent: totalActiveTime
        }
      }));
         }
   }, [pauseScreenTimer, currentTask, accumulatedTime, sessionStartTime, dispatch]);

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

  // Initialize timer and setup screen visibility tracking
  useEffect(() => {
    if (currentTask?.taskMetrics?.timeSpent) {
      setTimer(currentTask.taskMetrics.timeSpent * 3600);
      setAccumulatedTime(currentTask.taskMetrics.timeSpent * 3600); // Convert hours to seconds
    }
    
    // Start timer for in-progress tasks
    if (currentTask?.status === 'in_progress' && !currentTask?.signature) {
      startScreenTimer();
    }
    
    // Add page visibility listeners
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseScreenTimer();
      } else if (currentTask?.status === 'in_progress' && !currentTask?.signature) {
        startScreenTimer();
      }
    };
    
    const handleBeforeUnload = () => {
      pauseScreenTimer();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      pauseScreenTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentTask]);

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
  
  // Periodic save function to backup time data (define BEFORE useEffect)
  const saveTimeToBackend = useCallback(async () => {
    if (!currentTask || currentTask.status === 'completed' || currentTask.signature) {
      return;
    }
    
    const currentSessionTime = sessionStartTime ? (Date.now() - sessionStartTime) / 1000 : 0;
    const totalActiveTime = (accumulatedTime + currentSessionTime) / 3600; // Convert to hours
    
    if (totalActiveTime > 0) {
      try {
        await dispatch(updateUserTaskProgress({
          taskId: currentTask._id,
          subLevelId: currentTask.inspectionLevel?.subLevels?.[0]?._id || 'default',
          status: currentTask.status,
          taskMetrics: {
            ...currentTask.taskMetrics,
            timeSpent: totalActiveTime
          }
        }));
      } catch (error) {
        console.error('Failed to save time to backend:', error);
      }
    }
  }, [currentTask, accumulatedTime, sessionStartTime, dispatch]);
  
  // Set up periodic time saving (every 2 minutes)
  useEffect(() => {
    if (currentTask?.status === 'in_progress' && !currentTask?.signature) {
      const saveInterval = setInterval(() => {
        saveTimeToBackend();
      }, 120000); // Save every 2 minutes
      
      return () => clearInterval(saveInterval);
    }
  }, [currentTask, saveTimeToBackend]);

  // Auto-update functionality - update progress and scores every 5 seconds
  useEffect(() => {
    // Cleanup any existing interval first
    if (autoUpdateRef.current) {
      clearInterval(autoUpdateRef.current);
      autoUpdateRef.current = null;
    }

    if (autoUpdateEnabled && currentTask && currentTask._id) {
      console.log('Setting up progress auto-update every 5 seconds for task:', currentTask._id);
      
      autoUpdateRef.current = setInterval(async () => {
        try {
          // Skip update if user is actively interacting
          if (userActiveRef.current) {
            console.log('Skipping auto-update - user is active');
            return;
          }
          
          console.log('Auto-updating progress and scores... Current progress:', currentTask.overallProgress);
          
          // Store current UI state BEFORE any updates
          const currentPageId = selectedPage;
          const currentSectionId = selectedSection;
          const currentActiveTab = activeTab;
          
          // Fetch latest task data silently
          const updatedTask = await dispatch(fetchUserTaskDetails(currentTask._id));
          console.log('Updated task progress:', updatedTask?.payload?.overallProgress);
          console.log('Fresh task data has', Object.keys(updatedTask?.payload?.questionnaireResponses || {}).length, 'responses');
          
          // Force recalculate completion percentage using fresh task data
          const newCompletionPercentage = calculateTaskCompletionPercentage(updatedTask?.payload);
          console.log('Recalculated completion percentage with fresh data:', newCompletionPercentage);
          
          // Always update if there's any difference, even small ones
          if (updatedTask?.payload && newCompletionPercentage !== (updatedTask.payload.overallProgress || 0)) {
            console.log('Updating task progress from', updatedTask.payload.overallProgress, 'to', newCompletionPercentage);
            
            try {
              await dispatch(updateUserTaskProgress({
                taskId: currentTask._id,
                subLevelId: currentTask.inspectionLevel?.subLevels?.[0]?._id || 'default',
                status: currentTask.status,
                taskMetrics: {
                  ...currentTask.taskMetrics,
                  completionPercentage: newCompletionPercentage
                }
              }));
              
              console.log('Progress update successful');
              // DO NOT fetch task details again immediately to prevent progress reset
              
            } catch (error) {
              console.error('Failed to update progress:', error);
            }
          } else {
            console.log('No progress update needed - values match');
          }
          
          // Restore UI state to prevent tab switching (only if user hasn't changed it)
          setTimeout(() => {
            if (!userActiveRef.current) {
              if (currentActiveTab && currentActiveTab !== activeTab) {
                setActiveTab(currentActiveTab);
              }
              if (currentPageId && currentPageId !== selectedPage) {
                setSelectedPage(currentPageId);
              }
              if (currentSectionId && currentSectionId !== selectedSection) {
                setSelectedSection(currentSectionId);
              }
              
              // Update scores and recalculate everything using fresh data
              calculateScores(updatedTask?.payload);
              
              // Force recalculate completion percentage with updated data
              const refreshedPercentage = calculateTaskCompletionPercentage(updatedTask?.payload);
              console.log('Auto-update: Refreshed completion percentage:', refreshedPercentage);
            }
          }, 100);
          
        } catch (error) {
          console.error('Auto-update failed:', error);
        }
      }, 5000); // Update every 5 seconds
    }

    // Cleanup function to clear interval
    return () => {
      if (autoUpdateRef.current) {
        console.log('Clearing auto-update interval on cleanup');
        clearInterval(autoUpdateRef.current);
        autoUpdateRef.current = null;
      }
    };
      }, [autoUpdateEnabled, currentTask?._id]); // Keep dependencies minimal

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
    try {
      await userTaskService.startTask(taskId);
      toast.success('Task started successfully!');
      dispatch(fetchUserTaskDetails(taskId));
      setActiveTab('inspection');
      
      // Initialize timer for newly started task
      setAccumulatedTime(0);
      startScreenTimer();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start task');
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
      
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding section comment:', error);
      toast.error('Failed to add comment');
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
      
      toast.success('Progress updated successfully');
    } catch (err) {
      toast.error('Failed to update progress');
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleExportReport = async () => {
    if (!currentTask) return;
    
    if (!currentTask.signature) {
      setShowSignatureModal(true);
      toast.info('Please provide your signature before downloading the report.');
      return;
    }
    
    try {
      toast.loading('Generating report...');
      
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
      
      const result = await dispatch(exportTaskReport({ 
        taskId: currentTask._id, 
        format: 'excel' 
      })).unwrap();
      
      toast.dismiss();
      toast.success('Report exported successfully');
      
      return result;
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed to export report: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDownloadReport = (format) => {
    setSelectedReportFormat(format);
    setDocumentName(`${currentTask?.name || 'Inspection'}_${format.toUpperCase()}_${new Date().toISOString().split('T')[0]}`);
    setShowDocumentNamingModal(true);
  };

  const handleSubmitAndDownloadLater = async () => {
    try {
      toast.loading('Submitting inspection for later download...');
      
      // Archive the task without downloading
      await dispatch(archiveTask(currentTask._id)).unwrap();
      
      // Refresh task data
      await dispatch(fetchUserTaskDetails(currentTask._id));
      
      toast.dismiss();
      toast.success('Inspection submitted successfully! You can download reports later from the archived tasks.');
      
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed to submit inspection: ${error.message || 'Unknown error'}`);
    }
  };

  const handleConfirmDownload = async () => {
    if (!documentName.trim()) {
      toast.error('Please enter a document name');
      return;
    }

    try {
      setShowDocumentNamingModal(false);
      toast.loading(`Generating ${selectedReportFormat.toUpperCase()} report...`);
      
      let result;
      
      switch (selectedReportFormat) {
        case 'excel':
          result = await dispatch(exportTaskReport({ 
            taskId: currentTask._id, 
            format: 'excel' 
          })).unwrap();
          break;
        case 'pdf':
          result = await dispatch(exportTaskReport({ 
            taskId: currentTask._id, 
            format: 'pdf' 
          })).unwrap();
          break;
        case 'docx':
          // For DOCX, you'll need to implement DOCX generation in the backend
          result = await dispatch(exportTaskReport({ 
            taskId: currentTask._id, 
            format: 'docx' 
          })).unwrap();
          break;
        default:
          throw new Error('Unsupported format');
      }
      
      toast.dismiss();
      toast.success(`${selectedReportFormat.toUpperCase()} report generated successfully`);
      
      // Here you would handle the actual download with the custom filename
      // For now, we'll use the existing export functionality
      
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed to generate ${selectedReportFormat.toUpperCase()} report: ${error.message || 'Unknown error'}`);
    }
  };

  const handleInputChange = (questionId, value) => {
    setLocalInputValues(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSaveInspectionResponse = async (questionId, value) => {
    if (!currentTask || currentTask.status === 'completed') {
      return;
    }
    
    try {
      setResponseLoading(true);
      
      // Store current state before API calls
      const currentPageId = selectedPage;
      const currentSectionId = selectedSection;
      const currentActiveTab = activeTab;
      
      const currentResponses = currentTask.questionnaireResponses || {};
      const updatedResponses = {
        ...currentResponses,
        [questionId]: value
      };
      
      const result = await dispatch(updateTaskQuestionnaire({
        taskId: currentTask._id,
        questionnaire: {
          responses: updatedResponses,
          notes: currentTask.questionnaireNotes || '',
          completed: false
        }
      })).unwrap();
      
      toast.success('Response saved successfully');
      
      const completionPercentage = calculateTaskCompletionPercentage();
      
      if (Math.abs(completionPercentage - (currentTask.overallProgress || 0)) > 2) {
        await dispatch(updateUserTaskProgress({
          taskId: currentTask._id,
          subLevelId: currentTask.inspectionLevel?.subLevels?.[0]?._id || 'default',
          status: currentTask.status,
          taskMetrics: {
            ...currentTask.taskMetrics,
            completionPercentage: completionPercentage
          }
        })).unwrap();
      }
      
      // Refresh task details while preserving UI state
      await dispatch(fetchUserTaskDetails(currentTask._id));
      calculateScores();
      
      // Restore state immediately to prevent UI jumping
      if (currentActiveTab) {
        setActiveTab(currentActiveTab);
      }
      
      if (currentPageId) {
        setSelectedPage(currentPageId);
      }
      
      if (currentSectionId) {
        setSelectedSection(currentSectionId);
      }
      
    } catch (error) {
      toast.error(`Failed to save response: ${error.message || 'Unknown error'}`);
    } finally {
      setResponseLoading(false);
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setSignatureImage(event.target.result);
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
      toast.error('Please provide a signature before saving');
      return;
    }
    
    try {
      toast.loading('Saving signature...');
      
      // Stop timer permanently when task is signed
      const finalSessionTime = sessionStartTime ? (Date.now() - sessionStartTime) / 1000 : 0;
      const totalActiveTime = (accumulatedTime + finalSessionTime) / 3600; // Convert to hours
      
      const completionPercentage = calculateTaskCompletionPercentage();
      
      await dispatch(saveTaskSignature({
        taskId: currentTask._id,
        signature: signatureImage,
        taskMetrics: {
          ...currentTask.taskMetrics,
          completionPercentage: completionPercentage,
          timeSpent: totalActiveTime, // Save final active time
          subLevelTimeSpent: { ...(currentTask.taskMetrics?.subLevelTimeSpent || {}) }
        }
      })).unwrap();
      
      // Stop timer permanently
      stopTimerPermanently();
      
      await dispatch(fetchUserTaskDetails(currentTask._id));
      
      toast.dismiss();
      toast.success('Signature saved successfully');
      setShowSignatureModal(false);
      
      setTimeout(() => {
        handleExportReport();
      }, 500);
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed to save signature: ${error.message || 'Unknown error'}`);
    }
  };

  // New Save and Submit functionality for compliance completion
  const handleSaveAndSubmit = async () => {
    if (!signatureImage) {
      toast.error('Please provide a signature before submitting');
      return;
    }
    
    try {
      toast.loading('Saving and submitting compliance data...');
      
      // Stop timer permanently when task is submitted
      const finalSessionTime = sessionStartTime ? (Date.now() - sessionStartTime) / 1000 : 0;
      const totalActiveTime = (accumulatedTime + finalSessionTime) / 3600; // Convert to hours
      
      const completionPercentage = calculateTaskCompletionPercentage();
      
      // First save signature
      await dispatch(saveTaskSignature({
        taskId: currentTask._id,
        signature: signatureImage,
        taskMetrics: {
          ...currentTask.taskMetrics,
          completionPercentage: completionPercentage,
          timeSpent: totalActiveTime,
          subLevelTimeSpent: { ...(currentTask.taskMetrics?.subLevelTimeSpent || {}) }
        }
      })).unwrap();
      
      // Then update task status to completed
      await dispatch(updateUserTaskProgress({
        taskId: currentTask._id,
        subLevelId: currentTask.inspectionLevel?.subLevels?.[0]?._id || 'default',
        status: 'completed',
        taskMetrics: {
          ...currentTask.taskMetrics,
          completionPercentage: 100,
          timeSpent: totalActiveTime,
          completedAt: new Date().toISOString()
        }
      })).unwrap();
      
      // Stop timer permanently
      stopTimerPermanently();
      
      // Refresh task data
      await dispatch(fetchUserTaskDetails(currentTask._id));
      
      toast.dismiss();
      toast.success('Compliance data submitted successfully! Inspection completed.');
      setShowSignatureModal(false);
      
      // Auto-export report after successful submission
      setTimeout(() => {
        handleExportReport();
      }, 1000);
      
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed to submit compliance data: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle Complete & Archive functionality
  const handleCompleteAndArchive = async () => {
    // Check task completion percentage first - use the same calculation as the UI
    const dbProgress = currentTask?.overallProgress || 0;
    const calculatedProgress = calculateTaskCompletionPercentage();
    const actualProgress = Math.max(dbProgress, calculatedProgress);
    
    if (actualProgress < 100) {
      toast.error(
        `⚠️ Task must be 100% completed before archiving.\n\nCurrent progress: ${actualProgress}%\n\nPlease complete all inspection sections to proceed.`,
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

    // Check if task has signature
    if (!currentTask?.signature && !signatureImage) {
      setShowSignatureModal(true);
      return;
    }

    // Show confirmation modal
    setShowArchiveModal(true);
  };

  const handleConfirmArchive = async () => {
    try {
      setIsArchiving(true);
      toast.loading('Completing and archiving inspection...');

      // Archive the task
      await dispatch(archiveTask(currentTask._id)).unwrap();

      // Refresh task data
      await dispatch(fetchUserTaskDetails(currentTask._id));

      toast.dismiss();
      toast.success('🎉 Inspection completed and archived successfully!');
      setShowArchiveModal(false);

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


  const renderQuestionInput = (question, task, onSaveResponse) => {
    const questionId = question._id;
    const response = task.questionnaireResponses?.[questionId];
    const localValue = localInputValues[questionId];
    const displayValue = localValue !== undefined ? localValue : response;
    const isDisabled = task.status === 'completed' || task.status === 'archived';
    
    let questionType = question.type || question.answerType;
    
    if (questionType === 'yesno' && question.answerType === 'compliance') {
      questionType = 'compliance';
    } else if (questionType === 'yesno' && (question.options?.includes('Yes') || question.options?.includes('No'))) {
      questionType = 'yesno';
    } else if (questionType === 'multiple_choice') {
      questionType = 'radio';
    } else if (questionType === 'multiple') {
      questionType = 'checkbox';
    }
    
    switch (questionType) {
      case 'compliance':
        const complianceOptions = question.options?.length > 0 
          ? question.options 
          : ['Full compliance', 'Partial compliance', 'Non-compliant', 'Not applicable'];
        
        return (
          <OptionsContainer>
            {complianceOptions.map((option, optIndex) => (
              <OptionButton 
                key={optIndex}
                selected={response === option}
                disabled={isDisabled}
                onClick={() => !isDisabled && onSaveResponse(questionId, option)}
              >
                {option}
              </OptionButton>
            ))}
          </OptionsContainer>
        );
        
      case 'yesno':
        const yesNoOptions = question.options?.length > 0 
          ? question.options 
          : ['Yes', 'No', 'N/A'];
        
        return (
          <OptionsContainer>
            {yesNoOptions.map((option, optIndex) => (
              <OptionButton 
                key={optIndex}
                selected={response === option}
                disabled={isDisabled}
                onClick={() => !isDisabled && onSaveResponse(questionId, option)}
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
                onClick={() => !isDisabled && onSaveResponse(questionId, option)}
              >
                {option}
              </OptionButton>
            )) : (
              <div style={{ color: '#666', fontStyle: 'italic' }}>No options available</div>
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
              <div style={{ color: '#666', fontStyle: 'italic' }}>No options available</div>
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
                onBlur={(e) => !isDisabled && onSaveResponse(questionId, e.target.value)}
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
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    disabled={isDisabled}
                    onChange={async (e) => {
                      if (isDisabled || !e.target.files || !e.target.files[0]) return;
                      const file = e.target.files[0];
                      
                      // Convert file to base64 for storage
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64Data = event.target.result;
                        onSaveResponse(questionId, base64Data);
                        toast.success('File uploaded successfully!');
                      };
                      reader.onerror = () => {
                        toast.error('Failed to read file');
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
                            
                            canvas.toBlob(blob => {
                              const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                              const filename = `inspection-photo-${timestamp}.jpg`;
                              
                              onSaveResponse(questionId, filename);
                              stream.getTracks().forEach(track => track.stop());
                              document.body.removeChild(modal);
                              
                              toast.success('Photo captured successfully!');
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
                          toast.error('Camera access denied. Please allow camera permissions.');
                        });
                      } else {
                        toast.error('Camera not supported on this device');
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
                    📷 Camera
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
                  </div>
                )}
              </div>
            </InputGroup>
          </InputContainer>
        );
        
      case 'text':
        return (
          <InputContainer>
            <InputGroup>
              <input
                type="text"
                placeholder="Enter your response"
                value={displayValue || ''}
                onChange={(e) => handleInputChange(questionId, e.target.value)}
                onBlur={(e) => !isDisabled && onSaveResponse(questionId, e.target.value)}
                disabled={isDisabled}
              />
            </InputGroup>
          </InputContainer>
        );
        
      case 'number':
        return (
          <InputContainer>
            <InputGroup>
              <input
                type="number"
                placeholder="Enter a number"
                value={displayValue || ''}
                onChange={(e) => handleInputChange(questionId, e.target.value)}
                onBlur={(e) => !isDisabled && onSaveResponse(questionId, e.target.value)}
                disabled={isDisabled}
              />
            </InputGroup>
          </InputContainer>
        );
        
      case 'date':
        return (
          <InputContainer>
            <InputGroup>
              <input
                type="date"
                value={displayValue || ''}
                onChange={(e) => handleInputChange(questionId, e.target.value)}
                onBlur={(e) => !isDisabled && onSaveResponse(questionId, e.target.value)}
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
                  isDisabled={isDisabled}
                  onSaveResponse={onSaveResponse}
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
                onBlur={(e) => !isDisabled && onSaveResponse(questionId, e.target.value)}
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
              Pre-Inspection Questionnaire
            </SectionTitle>
            
            <CompletionBadge complete={isPreInspectionCompleted()}>
              {isPreInspectionCompleted() ? (
                <>
                  <CheckCircle size={16} />
                  Completed
                </>
              ) : (
                <>
                  <AlertCircle size={16} />
                  Incomplete
                </>
              )}
            </CompletionBadge>
          </PreInspectionHeader>
          
          <PreInspectionContent>
            {currentTask.preInspectionQuestions.map((question, index) => (
              <QuestionRow key={index}>
                <QuestionNumber>{index + 1}</QuestionNumber>
                <QuestionContent>
                  <QuestionHeader>
                    <QuestionText>
                      {question.text}
                      {question.requirementType !== 'recommended' && (
                        <span style={{ color: '#dc2626', marginLeft: '4px', fontWeight: 'bold' }}>*</span>
                      )}
                    </QuestionText>
                    <QuestionBadges>
                      <QuestionBadge type={question.requirementType === 'recommended' ? 'recommended' : 'mandatory'}>
                        {question.requirementType === 'recommended' ? 'Recommended' : 'Mandatory'}
                      </QuestionBadge>
                    </QuestionBadges>
                  </QuestionHeader>
                  
                  {renderQuestionInput(question, currentTask, handleSaveInspectionResponse)}
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
            <InspectionTitle>Inspection Questionnaire</InspectionTitle>
            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
              Complete all sections to finish the inspection
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
              Previous
            </NavigationButton>

            <DropdownContainer>
              <DropdownButton 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPageDropdown(!showPageDropdown);
                }}
                style={{ 
                  cursor: 'pointer',
                  opacity: 1
                }}
              >
                <span>
                  {currentPage ? `Page ${inspectionPages.findIndex(p => (p.id || p._id) === selectedPage) + 1}: ${currentPage.name}` : 'Select Page'}
                </span>
                <ChevronDown size={16} />
              </DropdownButton>
              
              {showPageDropdown && (
                <DropdownMenu>
                  {inspectionPages.map((page, index) => {
                    const pageId = page.id || page._id;
                    const pageScore = calculatePageScore(page, currentTask.questionnaireResponses || {});
                    
                    return (
                      <DropdownItem
                        key={pageId}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPage(pageId);
                          setShowPageDropdown(false);
                          if (page.sections && page.sections.length > 0) {
                            const firstSectionId = page.sections[0].id || page.sections[0]._id;
                            setSelectedSection(firstSectionId);
                          }
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
                  })}
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
                    const firstSectionId = nextPage.sections[0].id || nextPage.sections[0].id;
                    setSelectedSection(firstSectionId);
                  }
                }
              }}
            >
              Next
              <ChevronRight size={16} />
            </NavigationButton>
          </InspectionControls>
        </InspectionHeader>
        
        <InspectionLayout>
          <NavigationPanel>
            <NavigationHeader>
              <NavigationTitle>
                <Navigation size={16} />
                Sections
                <KeyboardShortcutsBadge title="Keyboard Shortcuts: Alt+← → for pages, Ctrl+← → for sections">
                  <Info size={12} />
                </KeyboardShortcutsBadge>
              </NavigationTitle>
              <ProgressSummary>
                <span style={{ fontWeight: '600', color: '#3788d8' }}>
                  {currentPage?.sections?.length || 0} Sections
                </span>
                <span style={{ color: '#27ae60' }}>
                  {Math.max(currentTask?.overallProgress || 0, taskCompletionPercentage)}% Complete
                </span>
              </ProgressSummary>
            </NavigationHeader>
            
            {/* Section Navigation Controls */}
            {currentPage && currentPage.sections && currentPage.sections.length > 1 && (
              <SectionNavigationControls ref={sectionNavigationRef}>
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
                  Previous Section
                </SectionNavigationButton>

                {/* Section Counter */}
                <SectionCounter aria-live="polite">
                  Section {currentPage.sections.findIndex(s => (s.id || s._id) === selectedSection) + 1} of {currentPage.sections.length}
                </SectionCounter>

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
                  Next Section
                  <ChevronRight size={14} />
                </SectionNavigationButton>
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
                  </QuestionCounter>
                  <ScoreBadge hasResponse={answeredQuestions > 0}>
                    <Award size={14} />
                    {calculateSectionScore(currentSection, currentTask.questionnaireResponses || {}).achieved}/
                    {calculateSectionScore(currentSection, currentTask.questionnaireResponses || {}).total}
                  </ScoreBadge>
                </div>
              )}
            </ContentHeader>
            
            <QuestionsContent>
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
                      
                      const maxScore = question.scoring?.max || 2;
                      let achievedScore = 0;
                      
                      if (response !== undefined && response !== null) {
                        const questionType = question.type || question.answerType;
                        
                        if (questionType === 'compliance' || questionType === 'yesno') {
                          if (response === 'full_compliance' || response === 'yes' || response === 'Yes' || response === 'Full compliance') {
                            achievedScore = maxScore;
                          } else if (response === 'partial_compliance' || response === 'Partial compliance') {
                            achievedScore = maxScore / 2;
                          }
                        } else if (questionType === 'checkbox' || questionType === 'multiple') {
                          if (Array.isArray(response) && response.length > 0) {
                            achievedScore = maxScore;
                          }
                        } else if (['file', 'text', 'signature', 'number', 'date'].includes(questionType)) {
                          if (response && (typeof response === 'string' ? response.trim() !== '' : true)) {
                            achievedScore = maxScore;
                          }
                        } else {
                          if (response && (typeof response === 'string'? response.trim() !== '' : true)) {
                            achievedScore = maxScore;
                          }
                        }
                      }
                      
                      return (
                        <QuestionCard key={questionId || qIndex}>
                          <QuestionHeader>
                            <QuestionNumber>{qIndex + 1}</QuestionNumber>
                            <QuestionText>
                              {question.text}
                              {question.requirementType !== 'recommended' && (
                                <span style={{ color: '#dc2626', marginLeft: '4px', fontWeight: 'bold' }}>*</span>
                              )}
                            </QuestionText>
                            
                            <QuestionBadges>
                              <QuestionBadge type={question.requirementType === 'recommended' ? 'recommended' : 'mandatory'}>
                                {question.requirementType === 'recommended' ? 'Recommended' : 'Mandatory'}
                              </QuestionBadge>
                              <ScoreBadge hasResponse={achievedScore > 0}>
                                <Star size={14} />
                                {achievedScore}/{maxScore}
                              </ScoreBadge>
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
                  <div style={{ 
                    marginTop: '32px',
                    padding: '20px',
                    background: 'rgba(55, 136, 216, 0.02)',
                    borderRadius: '12px',
                    border: '1px solid rgba(55, 136, 216, 0.1)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      marginBottom: '16px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1a202c'
                    }}>
                      <MessageSquare size={18} />
                      Section Comments
                    </div>
                    
                    {/* Existing Comments */}
                    {sectionComments[selectedSection] && sectionComments[selectedSection].length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        {sectionComments[selectedSection].map((comment, index) => (
                          <div key={comment._id || index} style={{
                            marginBottom: '12px',
                            padding: '12px',
                            background: 'white',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '8px'
                            }}>
                              <span style={{ 
                                fontWeight: '600', 
                                color: '#374151',
                                fontSize: '14px'
                              }}>
                                {comment.user?.name || 'Unknown User'}
                              </span>
                              <span style={{ 
                                fontSize: '12px', 
                                color: '#6b7280'
                              }}>
                                {formatDateTime(comment.createdAt)}
                              </span>
                            </div>
                            <div style={{ 
                              color: '#374151',
                              lineHeight: '1.5'
                            }}>
                              {comment.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Add Comment */}
                    {!isArchivedTask && (
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                          <textarea
                            placeholder="Add a comment for this section..."
                            value={sectionCommentTexts[selectedSection] || ''}
                            onChange={(e) => handleSectionCommentTextChange(selectedSection, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontFamily: 'inherit',
                              resize: 'vertical',
                              minHeight: '80px'
                            }}
                            disabled={commentLoadingStates[selectedSection]}
                          />
                        </div>
                        <button
                          onClick={() => handleSectionCommentSubmit(selectedSection)}
                          disabled={!sectionCommentTexts[selectedSection]?.trim() || commentLoadingStates[selectedSection]}
                          style={{
                            padding: '12px 20px',
                            background: (!sectionCommentTexts[selectedSection]?.trim() || commentLoadingStates[selectedSection]) 
                              ? '#9ca3af' 
                              : 'linear-gradient(135deg, #3788d8, #2980b9)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: (!sectionCommentTexts[selectedSection]?.trim() || commentLoadingStates[selectedSection]) 
                              ? 'not-allowed' 
                              : 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            minWidth: '100px',
                            justifyContent: 'center'
                          }}
                        >
                          {commentLoadingStates[selectedSection] ? (
                            <>
                              <div style={{
                                width: '14px',
                                height: '14px',
                                border: '2px solid transparent',
                                borderTop: '2px solid white',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                              }} />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Send size={16} />
                              Comment
                            </>
                          )}
                        </button>
                      </div>
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
                        Comments are disabled for archived tasks
                      </div>
                    )}
                                      </div>
                  </>
              ) : (
                <EmptyState>
                  <Info size={48} />
                  <h3>Select a Section</h3>
                  <p>Choose a section from the navigation panel to view and answer questions.</p>
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
              Loading task details...
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
              Back to Tasks
            </BackButton>
          </TopBar>
          <Card>
            <EmptyState>
              <AlertTriangle size={48} />
              <h3>Error Loading Task</h3>
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
              Back to Tasks
            </BackButton>
          </TopBar>
          <Card>
            <EmptyState>
              <AlertTriangle size={48} />
              <h3>Task Not Found</h3>
              <p>The task you are looking for does not exist.</p>
            </EmptyState>
          </Card>
        </MainContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer onClick={() => showPageDropdown && setShowPageDropdown(false)}>
      <MainContent>
        <TopBar>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            Back to Tasks
          </BackButton>
          
          <QuickActions>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {autoUpdateEnabled ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '8px 12px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#16a34a',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
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
                </div>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '8px 12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#dc2626',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
                onClick={() => setAutoUpdateEnabled(!autoUpdateEnabled)}
                title="Click to enable auto-update"
                >
                  ⏸ Paused
                </div>
              )}
              
              {/* <QuickActionButton 
                primary
                onClick={handleExportReport}
                disabled={currentTask.status === 'pending'}
              >
                <Download size={16} />
                Export Report
              </QuickActionButton> */}
            </div>
          </QuickActions>
        </TopBar>
        
        <TaskHeader>
          <TaskTitle>{currentTask.name}</TaskTitle>
          {currentTask.description && (
            <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
              {currentTask.description}
            </p>
          )}
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
            <StatusBadge status={currentTask.status}>
              <StatusIcon status={currentTask.status} />
              {currentTask.status === 'pending' && 'Pending'}
              {currentTask.status === 'in_progress' && 'In Progress'}
              {currentTask.status === 'completed' && 'Completed'}
              {currentTask.status === 'archived' && 'Archived'}
            </StatusBadge>
            
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
                {currentTask.priority}
              </PriorityBadge>
            )}
          </div>
          
          <TaskMeta>
            {currentTask.dueDate && (
              <MetaCard>
                <MetaLabel>Due Date</MetaLabel>
                <MetaValue>
                  <Calendar size={18} />
                  {formatDate(currentTask.dueDate)}
                </MetaValue>
              </MetaCard>
            )}
            
            {currentTask.location && (
              <MetaCard>
                <MetaLabel>Location</MetaLabel>
                <MetaValue>
                  <MapPin size={18} />
                  {currentTask.location}
                </MetaValue>
              </MetaCard>
            )}
            
            {currentTask.inspectionType && (
              <MetaCard>
                <MetaLabel>Type</MetaLabel>
                <MetaValue>
                  <Clipboard size={18} />
                  {currentTask.inspectionType}
                </MetaValue>
              </MetaCard>
            )}
            
            <MetaCard>
              <MetaLabel>Progress</MetaLabel>
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
              Overview
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
                Inspection
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
              Final Report
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
                    Task Overview
                  </SectionTitle>
                  
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                      Task Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Created By</div>
                        <div style={{ fontWeight: '600', color: '#1a202c' }}>
                          {currentTask.createdBy?.name || currentTask.createdBy?.email || currentTask.createdBy || 'Unknown'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Assigned To</div>
                        <div style={{ fontWeight: '600', color: '#1a202c' }}>
                          {Array.isArray(currentTask.assignedTo) 
                            ? currentTask.assignedTo.map(user => user.name || user.email || user).join(', ')
                            : currentTask.assignedTo?.name || currentTask.assignedTo?.email || currentTask.assignedTo || 'Unassigned'
                          }
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Asset</div>
                        <div style={{ fontWeight: '600', color: '#1a202c' }}>
                          {currentTask.asset?.displayName || currentTask.asset?.name || currentTask.asset || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Created</div>
                        <div style={{ fontWeight: '600', color: '#1a202c' }}>{formatDate(currentTask.createdAt)}</div>
                      </div>
                      {currentTask.status && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Status</div>
                          <div style={{ 
                            fontWeight: '600', 
                            color: currentTask.status === 'completed' ? '#16a34a' : 
                                   currentTask.status === 'in_progress' ? '#f59e0b' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <StatusIcon status={currentTask.status} />
                            {currentTask.status.charAt(0).toUpperCase() + currentTask.status.slice(1).replace('_', ' ')}
                          </div>
                        </div>
                      )}
                      {currentTask.priority && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Priority</div>
                          <div style={{ fontWeight: '600', color: '#1a202c' }}>
                            <PriorityBadge priority={currentTask.priority}>
                              {currentTask.priority}
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
                      Task Comments
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
                              {comment.user?.name || comment.user?.email || comment.user || 'Unknown User'}
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
                      Task Metrics & Progress
                    </SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                      <div style={{ 
                        background: 'rgba(55, 136, 216, 0.1)', 
                        padding: '20px', 
                        borderRadius: '12px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '12px', color: '#3788d8', marginBottom: '8px', fontWeight: '600' }}>OVERALL PROGRESS</div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#3788d8' }}>
                          {Math.max(currentTask?.overallProgress || 0, taskCompletionPercentage)}%
                        </div>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                          Task completion
                        </div>
                      </div>
                      
                      <div style={{ 
                        background: 'rgba(39, 174, 96, 0.1)', 
                        padding: '20px', 
                        borderRadius: '12px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '12px', color: '#27ae60', marginBottom: '8px', fontWeight: '600' }}>COMPLIANCE SCORE</div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#27ae60' }}>
                          {scores.percentage}%
                        </div>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                          {scores.achieved} of {scores.total} points
                        </div>
                      </div>
                      
                      <div style={{ 
                        background: 'rgba(243, 156, 18, 0.1)', 
                        padding: '20px', 
                        borderRadius: '12px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '12px', color: '#f39c12', marginBottom: '8px', fontWeight: '600' }}>TIME SPENT</div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#f39c12' }}>
                          {formatTimeSpent(currentTask.taskMetrics?.timeSpent || 0)}
                        </div>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                          Total duration
                        </div>
                      </div>
                      
                      <div style={{ 
                        background: 'rgba(44, 62, 80, 0.1)', 
                        padding: '20px', 
                        borderRadius: '12px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '12px', color: '#2c3e50', marginBottom: '8px', fontWeight: '600' }}>INSPECTION PAGES</div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#2c3e50' }}>
                          {inspectionPages.length}
                        </div>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                          Total sections
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
                
                {(currentTask.status === 'pending' || !currentTask.status) && !isArchivedTask && (
                  <div style={{ textAlign: 'center', margin: '32px 0' }}>
                    <StartTaskButton onClick={handleStartTask} disabled={actionLoading}>
                      <Play size={20} />
                      Start Inspection
                    </StartTaskButton>
                  </div>
                )}
                
                {currentTask.status === 'in_progress' && !isArchivedTask && (
                  <div style={{ textAlign: 'center', margin: '32px 0' }}>
                    <ContinueButton onClick={() => setActiveTab('inspection')} disabled={actionLoading}>
                      <Activity size={20} />
                      Continue Inspection
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
                      Inspection Progress
                    </ProgressTitle>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <ProgressValue>
                        {Math.max(currentTask?.overallProgress || 0, taskCompletionPercentage)}%
                        {/* Debug info in development */}
                        {process.env.NODE_ENV === 'development' && (
                          <div style={{ fontSize: '8px', color: '#999', marginTop: '2px' }}>
                            DB: {currentTask?.overallProgress || 0}% | Calc: {taskCompletionPercentage}%
                          </div>
                        )}
                      </ProgressValue>
                      
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
                          Live
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
                      Inspection Scoring Summary
                    </SectionTitle>
                    
                    <ScoreGrid>
                      <ScoreItem>
                        <ScoreLabel>Compliance Score</ScoreLabel>
                        <ScoreValue>
                          {scores.achieved} / {scores.total}
                          <span style={{ fontSize: '14px', color: '#27ae60', marginLeft: '8px' }}>
                            ({scores.percentage}%)
                          </span>
                        </ScoreValue>
                      </ScoreItem>
                      
                      <ScoreItem>
                        <ScoreLabel>Pages Scored</ScoreLabel>
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
                        <ScoreLabel>Completion Rate</ScoreLabel>
                        <ScoreValue>
                          {Math.max(currentTask?.overallProgress || 0, taskCompletionPercentage)}%
                        </ScoreValue>
                      </ScoreItem>
                      
                      <ScoreItem>
                        <ScoreLabel>Status</ScoreLabel>
                        <ScoreValue style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                          <StatusIcon status={currentTask.status} />
                          {currentTask.status.charAt(0).toUpperCase() + currentTask.status.slice(1).replace('_', ' ')}
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
                      Inspection Final Report
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
                      <div style={{ fontSize: '12px', color: '#3788d8', marginBottom: '8px', fontWeight: '600' }}>OVERALL SCORE</div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#3788d8' }}>
                        {scores.percentage}%
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        {scores.achieved} of {scores.total} points
                      </div>
                    </div>
                    
                    <div style={{ background: 'rgba(39, 174, 96, 0.1)', padding: '20px', borderRadius: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#27ae60', marginBottom: '8px', fontWeight: '600' }}>COMPLETION</div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#27ae60' }}>
                        {Math.max(currentTask?.overallProgress || 0, taskCompletionPercentage)}%
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        Questions answered
                      </div>
                    </div>
                    
                    <div style={{ background: 'rgba(243, 156, 18, 0.1)', padding: '20px', borderRadius: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#f39c12', marginBottom: '8px', fontWeight: '600' }}>TIME SPENT</div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#f39c12' }}>
                        {formatTimeSpent(currentTask.taskMetrics?.timeSpent || 0)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        Total duration
                      </div>
                    </div>
                    
                    <div style={{ background: 'rgba(44, 62, 80, 0.1)', padding: '20px', borderRadius: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#2c3e50', marginBottom: '8px', fontWeight: '600' }}>PAGES</div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#2c3e50' }}>
                        {inspectionPages.length}
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        Total sections
                      </div>
                    </div>
                  </div>
                  
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
                        Pre-Inspection Questionnaire
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
                                  {question.requirementType !== 'recommended' && (
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
                                  <strong>Response:</strong> {
                                    (() => {
                                      const response = currentTask.questionnaireResponses && 
                                        currentTask.questionnaireResponses[question._id] ? 
                                        currentTask.questionnaireResponses[question._id] : 
                                        null;
                                      
                                      if (!response) return 'Not answered';
                                      
                                      // Handle file responses with preview
                                      if (question.type === 'file' && response) {
                                        if (response.startsWith('data:image/')) {
                                          return (
                                            <div style={{ marginTop: '8px' }}>
                                              <div style={{ marginBottom: '8px', color: '#0369a1', fontSize: '12px' }}>
                                                📎 Image uploaded
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
                                            </div>
                                          );
                                        } else if (response.startsWith('data:')) {
                                          return (
                                            <div style={{ marginTop: '8px' }}>
                                              <div style={{ marginBottom: '8px', color: '#0369a1', fontSize: '12px' }}>
                                                📎 File uploaded
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
                                          );
                                        } else {
                                          return `📎 File uploaded: ${response}`;
                                        }
                                      }
                                      
                                      // Handle signature responses with preview
                                      if (question.type === 'signature' && response) {
                                        if (response.startsWith('data:image/')) {
                                          return (
                                            <div style={{ marginTop: '8px' }}>
                                              <div style={{ marginBottom: '8px', color: '#0369a1', fontSize: '12px' }}>
                                                ✍️ Signature provided
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
                                            </div>
                                          );
                                        } else {
                                          return '✍️ Signature provided';
                                        }
                                      }
                                      
                                      // Default response display
                                      return response;
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
                      const isButtonDisabled = currentTask?.status === 'pending' || isArchiving || !isProgressComplete;
                      
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
                              Archiving...
                            </>
                          ) : (
                            <>
                              <CheckCircle size={20} />
                              Complete & Archive
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
                        
                        {/* Excel Download */}
                        <QuickActionButton 
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
                          Download Report
                        </QuickActionButton>
                        
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
                        Submit & Download Later
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
                        Inspection completed and archived - Reports are ready for download
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
                                Inspection completed ({actualProgress}%) - Ready to archive
                              </>
                            ) : (
                              <>
                                <Clock size={16} />
                                Progress: {actualProgress}% - Complete all sections to archive
                              </>
                            )}
                          </p>
                          {!isComplete && (
                            <p style={{ 
                              fontSize: '12px', 
                              color: '#64748b', 
                              fontStyle: 'italic'
                            }}>
                              Complete all inspection sections to enable archiving
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
                Quick Stats
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
                  <span style={{ fontSize: '14px', color: '#64748b' }}>Progress</span>
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
                  <span style={{ fontSize: '14px', color: '#64748b' }}>Score</span>
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
                  <span style={{ fontSize: '14px', color: '#64748b' }}>Time</span>
                  <span style={{ fontWeight: '700', color: '#f39c12' }}>
                    {formatTimeSpent(currentTask.taskMetrics?.timeSpent || 0)}
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
                  <span style={{ fontSize: '14px', color: '#64748b' }}>Pages</span>
                  <span style={{ fontWeight: '700', color: '#2c3e50' }}>
                    {inspectionPages.length}
                  </span>
                </div>
              </div>
            </Card>
            

          </SidePanel>
        </ContentContainer>
      </MainContent>
      
      {responseLoading && (
        <LoadingIndicator>
          <Loader size={16} />
          Saving response...
        </LoadingIndicator>
      )}
      
      {showSignatureModal && !isArchivedTask && (
        <ModalOverlay>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Sign Final Report</ModalTitle>
              <CloseButton onClick={() => setShowSignatureModal(false)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            
            <div>
              <p style={{ marginBottom: '20px', color: '#64748b', fontSize: '14px' }}>
                Please provide your signature to complete the inspection report.
              </p>
              
              <SignatureTabs>
                <SignatureTab 
                  active={signatureMethod === 'draw'} 
                  onClick={() => setSignatureMethod('draw')}
                >
                  Draw Signature
                </SignatureTab>
                <SignatureTab 
                  active={signatureMethod === 'upload'} 
                  onClick={() => setSignatureMethod('upload')}
                >
                  Upload Signature
                </SignatureTab>
              </SignatureTabs>
              
              {signatureMethod === 'draw' ? (
                <SignatureCanvas>
                  <canvas 
                    ref={signatureCanvasRef}
                    width="500" 
                    height="200"
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
                      <span>Click to upload signature image</span>
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
                  Clear
                </ClearButton>
              )}
              
              {signatureMethod === 'upload' && (
                <UploadButton onClick={handleSignatureUpload}>
                  <Upload size={16} />
                  Upload Image
                </UploadButton>
              )}
              
              <SaveButton 
                onClick={handleSaveSignature}
                disabled={!signatureImage}
                style={{ background: '#64748b' }}
              >
                <Save size={16} />
                Save & Continue
              </SaveButton>
              
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
                Save & Submit
              </SaveButton>
            </SignatureActions>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Archive Confirmation Modal */}
      {showArchiveModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Complete & Archive Inspection</ModalTitle>
              <CloseButton onClick={() => setShowArchiveModal(false)}>
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
                    Ready to Complete
                  </h3>
                  <p style={{ 
                    margin: '4px 0 0 0', 
                    color: '#64748b', 
                    fontSize: '14px' 
                  }}>
                    This inspection has been signed and is ready to be archived.
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#374151', lineHeight: '1.6' }}>
                  By clicking "Complete & Archive", this inspection will be:
                </p>
                <ul style={{ 
                  marginTop: '12px', 
                  paddingLeft: '24px', 
                  color: '#64748b',
                  lineHeight: '1.6'
                }}>
                  <li>Marked as completed and archived</li>
                  <li>Made available for report download</li>
                  <li>Moved to the Archive section in your tasks list</li>
                  <li>No longer editable</li>
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
                  ⚠️ This action cannot be undone. Please ensure all inspection work is complete.
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
                Cancel
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
                    Archiving...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Complete & Archive
                  </>
                )}
              </QuickActionButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Document Naming Modal */}
      {showDocumentNamingModal && (
        <ModalOverlay>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Customize Report Filename</ModalTitle>
              <CloseButton onClick={() => setShowDocumentNamingModal(false)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            
            <div style={{ padding: '20px 0' }}>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#374151', lineHeight: '1.6', marginBottom: '16px' }}>
                  Customize the filename for your {selectedReportFormat?.toUpperCase()} report:
                </p>
                
                <div style={{ 
                  padding: '16px', 
                  background: 'rgba(55, 136, 216, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(55, 136, 216, 0.2)',
                  marginBottom: '16px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#3788d8'
                  }}>
                    <Info size={16} />
                    Available Variables
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Use: <code style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: '4px' }}>{'{date}'}</code>, <code style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: '4px' }}>{'{time}'}</code>, <code style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: '4px' }}>{'{taskName}'}</code>, <code style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: '4px' }}>{'{inspector}'}</code>
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Report Filename
                </label>
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Enter custom filename"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'all 0.3s ease'
                  }}
                />
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6b7280', 
                  marginTop: '4px' 
                }}>
                  Don't include the file extension (.{selectedReportFormat})
                </div>
              </div>
              
              <div style={{ 
                padding: '12px', 
                background: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  Preview:
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#374151', 
                  fontWeight: '500',
                  fontFamily: 'monospace'
                }}>
                  {documentName || 'filename'}.{selectedReportFormat}
                </div>
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
                onClick={() => setShowDocumentNamingModal(false)}
              >
                Cancel
              </QuickActionButton>
              <QuickActionButton 
                primary
                onClick={handleConfirmDownload}
                style={{ 
                  background: 'linear-gradient(135deg, #3788d8, #2c3e50)',
                  minWidth: '160px'
                }}
              >
                <Download size={16} />
                Download Report
              </QuickActionButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default UserTaskDetail;