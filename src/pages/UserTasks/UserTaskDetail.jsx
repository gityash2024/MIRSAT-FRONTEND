import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  ArrowLeft, Clock, Calendar, Map, AlertTriangle, Edit,
  CheckCircle, XCircle, Activity, PaperclipIcon, Send, 
  Download, Info, CheckSquare, Camera, FileText, Loader,
  Circle, MoreHorizontal, Timer, PlayCircle, PauseCircle,
  File, ChevronUp, ChevronDown, MessageSquare
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
import Skeleton from '../../components/ui/Skeleton';

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

const Button = styled.button`
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

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  margin-top: 24px;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #4b5563;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.5);
  padding: 10px 14px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.7);
  }
  
  svg {
    color: #1a237e;
    flex-shrink: 0;
  }
  
  strong {
    font-weight: 600;
  }
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

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
  
  @media (min-width: 1024px) {
    grid-template-columns: 3fr 1fr;
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

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #1a237e;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 16px;
  
  svg {
    color: #3f51b5;
    filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
  }
  
  @media (min-width: 768px) {
    font-size: 20px;
  }
`;

const InspectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

const InspectionItem = styled.div`
  border: 1px solid rgba(229, 231, 235, 0.7);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 15px;
  margin-left: ${props => props.indent ? `${props.indent * 24}px` : '0'};
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  
  &:hover {
    border-color: rgba(199, 210, 254, 0.8);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
  }
`;

const InspectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 18px 20px;
  background: rgba(249, 250, 251, 0.8);
  cursor: pointer;
  user-select: none;
  transition: background 0.3s ease;
  
  &:hover {
    background: rgba(241, 245, 249, 0.9);
  }
  
  .inspection-title {
    display: flex;
    align-items: center;
    gap: 14px;
    font-weight: 500;
    color: #333;
  }
  
  .status-indicator {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${props => {
      switch(props.status) {
        case 'completed': return 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)';
        case 'in_progress': return 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)';
        default: return 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)';
      }
    }};
    transition: all 0.3s ease;
    border: 2px solid white;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const InspectionContent = styled.div`
  padding: 20px;
  border-top: 1px solid rgba(229, 231, 235, 0.7);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
  
  .inspection-description {
    font-size: 14px;
    color: #4b5563;
    line-height: 1.6;
    margin-bottom: 20px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.8);
  }
`;

const StatusButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const StatusButton = styled.button`
  padding: 12px 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  
  ${props => {
    switch(props.status) {
      case 'pending':
        return `
          background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
          color: #424242;
          border: 1px solid rgba(224, 224, 224, 0.7);
          &:hover { 
            background: linear-gradient(135deg, #eeeeee 0%, #e0e0e0 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
          }
        `;
      case 'in_progress':
        return `
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          color: #0069c0;
          border: 1px solid rgba(33, 150, 243, 0.3);
          &:hover { 
            background: linear-gradient(135deg, #bbdefb 0%, #90caf9 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 14px rgba(33, 150, 243, 0.12);
          }
        `;
      case 'completed':
        return `
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          color: #2e7d32;
          border: 1px solid rgba(76, 175, 80, 0.3);
          &:hover { 
            background: linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 14px rgba(76, 175, 80, 0.12);
          }
        `;
      default:
        return `
          background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
          color: #424242;
          border: 1px solid rgba(224, 224, 224, 0.7);
          &:hover { 
            background: linear-gradient(135deg, #eeeeee 0%, #e0e0e0 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
          }
        `;
    }
  }}
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  svg {
    flex-shrink: 0;
  }
`;

const NotesSection = styled.div`
  margin-top: 24px;
  
  .notes-label {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;
  }
  
  textarea {
    width: 100%;
    padding: 14px;
    border: 1px solid rgba(229, 231, 235, 0.8);
    border-radius: 12px;
    font-size: 14px;
    min-height: 110px;
    resize: vertical;
    margin-bottom: 16px;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(5px);
    color: #333; /* Ensure text is visible */
    
    &:focus {
      outline: none;
      border-color: #1a237e;
      box-shadow: 0 0 0 4px rgba(26, 35, 126, 0.1);
      background: rgba(255, 255, 255, 0.9);
    }
  }
`;

const SubmitButton = styled.button`
  padding: 12px 18px;
  background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.2);
  
  &:hover {
    background: linear-gradient(135deg, #151b4f 0%, #2c3889 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(26, 35, 126, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(26, 35, 126, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 4px 12px rgba(26, 35, 126, 0.1);
  }
  
  svg {
    flex-shrink: 0;
  }
`;

const PhotoUploadContainer = styled.div`
  margin-top: 24px;
  
  .photos-label {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;
  }
  
  .upload-area {
    border: 2px dashed rgba(209, 213, 219, 0.7);
    border-radius: 14px;
    padding: 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(5px);
    
    &:hover {
      border-color: #1a237e;
      background: rgba(255, 255, 255, 0.7);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
    }
    
    p {
      font-size: 14px;
      color: #6b7280;
      margin-top: 10px;
      font-weight: 500;
    }
  }
  
  input[type="file"] {
    display: none;
  }
`;

const PhotoPreviewsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 20px;
`;

const PhotoPreview = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  transform: perspective(800px) rotateY(0deg);
  
  &:hover {
    transform: perspective(800px) rotateY(5deg) translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1);
    
    img {
      transform: scale(1.08);
    }
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  .remove-button {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 14px;
    border: none;
    transition: all 0.3s ease;
    backdrop-filter: blur(3px);
    
    &:hover {
      background: rgba(0, 0, 0, 0.9);
      transform: scale(1.1);
    }
  }
`;

const CommentSection = styled.div`
  margin-top: 28px;
`;

const CommentInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 28px;
  background: rgba(255, 255, 255, 0.6);
  padding: 20px;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
  }
  
  textarea {
    padding: 14px;
    border: 1px solid rgba(229, 231, 235, 0.8);
    border-radius: 12px;
    font-size: 14px;
    min-height: 90px;
    resize: vertical;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.7);
    color: #333; /* Ensure text is visible */
    
    &:focus {
      outline: none;
      border-color: #1a237e;
      box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
      background: rgba(255, 255, 255, 0.9);
    }
  }
  
  .button-row {
    display: flex;
    justify-content: flex-end;
  }
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Comment = styled.div`
  background: rgba(248, 250, 252, 0.8);
  border-radius: 14px;
  padding: 18px;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  
  &:hover {
    transform: translateY(-3px) scale(1.01);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    background: rgba(248, 250, 252, 0.9);
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .author {
    font-weight: 600;
    color: #333;
    background: rgba(255, 255, 255, 0.6);
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 13px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .timestamp {
    font-size: 12px;
    color: #6b7280;
    background: rgba(255, 255, 255, 0.4);
    padding: 3px 8px;
    border-radius: 12px;
  }
  
  .content {
    color: #4b5563;
    font-size: 14px;
    line-height: 1.6;
    background: rgba(255, 255, 255, 0.5);
    padding: 12px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.6);
  }
`;

const ProgressWidget = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 220px;
  position: relative;
  margin-bottom: 28px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  transition: all 0.4s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    background: rgba(255, 255, 255, 0.6);
  }
  
  .progress-circle {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    background: ${props => `conic-gradient(#1a237e ${props.progress}%, #f1f5f9 ${props.progress}% 100%)`};
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    transform: none;
    
    &:hover {
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }
    
    &::before {
      content: '';
      position: absolute;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: white;
      box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.1);
    }
  }
  
  .progress-text {
    position: absolute;
    font-size: 28px;
    font-weight: 700;
    color: #1a237e;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    z-index: 2;
  }
  
  .progress-label {
    margin-top: 18px;
    font-size: 15px;
    color: #4b5563;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.6);
    padding: 4px 12px;
    border-radius: 20px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  }
`;

const TaskMetrics = styled.div`
  margin-top: 24px;
`;

const MetricCard = styled.div`
  background: rgba(248, 250, 252, 0.7);
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 14px;
  transition: all 0.35s cubic-bezier(0.21, 0.6, 0.35, 1);
  border: 1px solid rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
  transform: perspective(800px) rotateY(0deg);
  
  &:hover {
    background: rgba(248, 250, 252, 0.85);
    transform: perspective(800px) rotateY(5deg) translateY(-3px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
  }
  
  .metric-label {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 10px;
    font-weight: 500;
  }
  
  .metric-value {
    font-size: 20px;
    font-weight: 700;
    color: #1a237e;
    display: flex;
    align-items: center;
    gap: 10px;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  }
`;

const SubLevelTimeItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(237, 242, 247, 0.7);
  font-size: 14px;
  transition: all 0.25s ease;
  background: rgba(255, 255, 255, 0.5);
  
  &:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: translateX(4px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  &:first-child {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }
  
  &:last-child {
    border-bottom: none;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }
  
  .sublevel-name {
    font-weight: 500;
    color: #333;
  }
  
  .time-spent {
    color: #1a237e;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.7);
    padding: 2px 8px;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
`;

const AttachmentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 18px;
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  background: rgba(248, 250, 252, 0.7);
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.03);
  
  &:hover {
    background: rgba(248, 250, 252, 0.9);
    transform: translateY(-3px) scale(1.01);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  }
  
  .file-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .file-name {
    font-size: 14px;
    color: #333;
    font-weight: 500;
  }
  
  a {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 10px;
    background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
    color: white;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 3px 8px rgba(26, 35, 126, 0.15);
    
    &:hover {
      background: linear-gradient(135deg, #151b4f 0%, #2c3889 100%);
      transform: translateY(-2px);
      box-shadow: 0 5px 12px rgba(26, 35, 126, 0.2);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 5px rgba(26, 35, 126, 0.15);
    }
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

const ReportButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  margin-top: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.15);
  
  &:hover {
    background: linear-gradient(135deg, #151b4f 0%, #2c3889 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(26, 35, 126, 0.2);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(26, 35, 126, 0.15);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const QuestionsContainer = styled.div`
  background: rgba(255, 255, 255, 0.7);
  border-radius: 14px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  margin-bottom: 24px;
`;

const QuestionItem = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(230, 232, 240, 0.8);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const QuestionText = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const QuestionOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
`;

const OptionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: ${props => props.selected ? 
    'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' : 
    'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'};
  color: ${props => props.selected ? '#2e7d32' : '#333'};
  box-shadow: ${props => props.selected ? 
    '0 2px 8px rgba(76, 175, 80, 0.15)' : 
    '0 1px 3px rgba(0, 0, 0, 0.05)'};
  
  &:hover {
    background: ${props => props.selected ? 
      'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' : 
      'linear-gradient(135deg, #f1f5f9 0%, #e5e7eb 100%)'};
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ComplianceButton = styled(OptionButton)`
  background: ${props => {
    if (props.selected) {
      switch(props.value) {
        case 'full_compliance': return 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)';
        case 'partial_compliance': return 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)';
        case 'non_compliance': return 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)';
        default: return 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
      }
    }
    return 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
  }};
  
  color: ${props => {
    if (props.selected) {
      switch(props.value) {
        case 'full_compliance': return '#2e7d32';
        case 'partial_compliance': return '#e65100';
        case 'non_compliance': return '#c62828';
        default: return '#333';
      }
    }
    return '#333';
  }};
  
  border: 1px solid ${props => {
    if (props.selected) {
      switch(props.value) {
        case 'full_compliance': return 'rgba(76, 175, 80, 0.3)';
        case 'partial_compliance': return 'rgba(255, 152, 0, 0.3)';
        case 'non_compliance': return 'rgba(244, 67, 54, 0.3)';
        default: return 'rgba(0, 0, 0, 0.1)';
      }
    }
    return 'rgba(0, 0, 0, 0.1)';
  }};
  
  box-shadow: ${props => {
    if (props.selected) {
      switch(props.value) {
        case 'full_compliance': return '0 2px 8px rgba(76, 175, 80, 0.15)';
        case 'partial_compliance': return '0 2px 8px rgba(255, 152, 0, 0.15)';
        case 'non_compliance': return '0 2px 8px rgba(244, 67, 54, 0.15)';
        default: return '0 1px 3px rgba(0, 0, 0, 0.05)';
      }
    }
    return '0 1px 3px rgba(0, 0, 0, 0.05)';
  }};
`;

const TaskFlowContainer = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
`;

const TaskStep = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  margin-bottom: 28px;
  border: 1px solid rgba(255, 255, 255, 0.8);
`;

const StepHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 16px;
`;

const StepTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1a237e;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: #3f51b5;
  }
`;

const StepContent = styled.div``;

const StepActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 28px;
`;

const StepDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin: 0 6px;
  background: ${props => props.active ? '#1a237e' : 'rgba(0, 0, 0, 0.1)'};
  transition: all 0.3s ease;
`;

const FinalSubmitButton = styled(SubmitButton)`
  margin-top: 28px;
  width: 100%;
  padding: 16px;
  font-size: 16px;
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
  
  &:hover {
    background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
    box-shadow: 0 6px 16px rgba(76, 175, 80, 0.3);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #9e9e9e 0%, #757575 100%);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    cursor: not-allowed;
  }
`;

const NotesInput = styled.div`
  position: relative;
  margin-bottom: 20px;
  
  textarea {
    width: 100%;
    padding: 14px;
    border: 1px solid rgba(229, 231, 235, 0.8);
    border-radius: 12px;
    font-size: 14px;
    min-height: 110px;
    resize: vertical;
    background: rgba(255, 255, 255, 0.9);
    color: #333; /* Ensure text is visible */
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: #1a237e;
      box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
    }
  }
  
  label {
    position: absolute;
    top: -10px;
    left: 12px;
    background: white;
    padding: 0 8px;
    font-size: 14px;
    font-weight: 600;
    color: #1a237e;
    border-radius: 4px;
  }
`;

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

// Add UserTaskDetailSkeleton component
const UserTaskDetailSkeleton = () => (
  <PageContainer>
    <BackButton disabled>
      <Skeleton.Circle size="18px" />
      <Skeleton.Base width="100px" height="16px" />
    </BackButton>
    
    {/* Header skeleton */}
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
    
    {/* Tabs skeleton */}
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
    
    {/* Main content skeleton */}
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.85)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(26, 35, 126, 0.08)'
    }}>
      <Skeleton.Base width="200px" height="24px" margin="0 0 16px 0" />
      
      {/* Task details */}
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
      
      {/* Sublevels skeleton */}
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

// Add the main component that was missing
const UserTaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('details');
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedSubLevels, setExpandedSubLevels] = useState({});
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [subLevelNotes, setSubLevelNotes] = useState({});
  const [exportingReport, setExportingReport] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState(null);
  
  const { currentTask, taskDetailsLoading, error } = useSelector(state => state.userTasks);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (taskId) {
      dispatch(fetchUserTaskDetails(taskId));
    }
  }, [taskId, dispatch]);

  useEffect(() => {
    if (currentTask) {
      setTimeSpent(currentTask.timeSpent || 0);
      
      // Initialize sublevel notes
      if (currentTask.subLevels) {
        const initialNotes = {};
        currentTask.subLevels.forEach(subLevel => {
          initialNotes[subLevel._id] = subLevel.notes || '';
        });
        setSubLevelNotes(initialNotes);
      }
      
      // Load comments
      if (currentTask.comments) {
        setComments(currentTask.comments);
      }
    }
  }, [currentTask]);
  
  // Check if questionnaire data was passed from the questionnaire page
  useEffect(() => {
    if (location.state?.questionnaireCompleted) {
      setQuestionnaireData({
        responses: location.state.responses,
        subLevelId: location.state.subLevelId,
        notes: location.state.notes
      });
    }
  }, [location.state]);
  
  const toggleSubLevel = (subLevelId) => {
    setExpandedSubLevels(prev => ({
      ...prev,
      [subLevelId]: !prev[subLevelId]
    }));
  };

  const handleStartTask = async () => {
    try {
      await dispatch(updateUserTaskProgress({
        taskId,
        data: { status: 'in_progress' }
      })).unwrap();
      startTimer();
      toast.success('Task started');
    } catch (error) {
      toast.error('Failed to start task');
    }
  };

  const handleCompleteTask = async () => {
    try {
      await dispatch(updateUserTaskProgress({
        taskId,
        data: { status: 'completed' }
      })).unwrap();
      stopTimer();
      toast.success('Task completed');
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const handleUpdateSubLevel = async (subLevelId, status) => {
    try {
      await dispatch(updateUserTaskProgress({
        taskId,
        subLevelId,
        data: { 
          status,
          notes: subLevelNotes[subLevelId] || ''
        }
      })).unwrap();
      toast.success(`Sub-level ${status === 'completed' ? 'completed' : 'started'}`);
    } catch (error) {
      toast.error('Failed to update sub-level');
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;
    
    setSubmitting(true);
    try {
      await dispatch(addUserTaskComment({
        taskId,
        comment
      })).unwrap();
      setComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const startTimer = () => {
    if (!timerRunning) {
      setTimerRunning(true);
      const interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    }
  };

  const stopTimer = () => {
    if (timerRunning) {
      clearInterval(timerInterval);
      setTimerRunning(false);
      setTimerInterval(null);
    }
  };

  const handleExportReport = async () => {
    setExportingReport(true);
    try {
      const response = await dispatch(exportTaskReport(taskId)).unwrap();
      
      // Create a blob from the data
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a link and click it
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `task-report-${taskId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setExportingReport(false);
    }
  };

  const calculateProgress = () => {
    if (!currentTask || !currentTask.subLevels || currentTask.subLevels.length === 0) {
      return 0;
    }
    
    const totalSubLevels = currentTask.subLevels.length;
    const completedSubLevels = currentTask.subLevels.filter(
      subLevel => subLevel.status === 'completed'
    ).length;
    
    return Math.round((completedSubLevels / totalSubLevels) * 100);
  };

  const renderSubLevelTree = (subLevels, parentId = null, level = 0) => {
    if (!subLevels) return null;
    
    const filteredSubLevels = subLevels.filter(
      subLevel => subLevel.parentId === parentId
    );
    
    return filteredSubLevels.map(subLevel => (
      <React.Fragment key={subLevel._id}>
        <InspectionItem indent={level}>
          <InspectionHeader 
            onClick={() => toggleSubLevel(subLevel._id)}
            status={subLevel.status}
          >
            <div className="inspection-title">
              <div className="status-indicator" />
              {subLevel.title}
            </div>
            {expandedSubLevels[subLevel._id] ? 
              <ChevronUp size={20} /> : 
              <ChevronDown size={20} />
            }
          </InspectionHeader>
          
          {expandedSubLevels[subLevel._id] && (
            <InspectionContent>
              {subLevel.description && (
                <div className="inspection-description">
                  {subLevel.description}
                </div>
              )}
              
              <NotesSection>
                <div className="notes-label">Notes:</div>
                <textarea 
                  placeholder="Add your notes about this inspection level..."
                  value={subLevelNotes[subLevel._id] || ''}
                  onChange={(e) => setSubLevelNotes(prev => ({
                    ...prev,
                    [subLevel._id]: e.target.value
                  }))}
                />
              </NotesSection>
              
              <StatusButtonGroup>
                {subLevel.status !== 'in_progress' && (
                  <StatusButton 
                    status="in_progress"
                    onClick={() => handleUpdateSubLevel(subLevel._id, 'in_progress')}
                  >
                    <Activity size={18} />
                    Start This Section
                  </StatusButton>
                )}
                
                {subLevel.status !== 'completed' && (
                  <StatusButton 
                    status="completed"
                    onClick={() => handleUpdateSubLevel(subLevel._id, 'completed')}
                  >
                    <CheckCircle size={18} />
                    Mark as Completed
                  </StatusButton>
                )}
              </StatusButtonGroup>
            </InspectionContent>
          )}
        </InspectionItem>
        
        {/* Render children recursively */}
        {renderSubLevelTree(subLevels, subLevel._id, level + 1)}
      </React.Fragment>
    ));
  };

  if (taskDetailsLoading) {
    return <UserTaskDetailSkeleton />;
  }

  if (error) {
    return (
      <PageContainer>
        <BackButton onClick={() => navigate('/user-tasks')}>
          <ArrowLeft size={18} />
          Back to Tasks
        </BackButton>
        
        <Card>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            padding: '40px 20px',
            gap: '16px'
          }}>
            <AlertTriangle size={48} color="#d32f2f" />
            <h2 style={{ color: '#d32f2f', fontSize: '20px' }}>Error Loading Task</h2>
            <p style={{ textAlign: 'center', color: '#666' }}>{error}</p>
          </div>
        </Card>
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
        
        <Card>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            padding: '40px 20px',
            gap: '16px'
          }}>
            <AlertTriangle size={48} color="#f57c00" />
            <h2 style={{ color: '#f57c00', fontSize: '20px' }}>Task Not Found</h2>
            <p style={{ textAlign: 'center', color: '#666' }}>The requested task could not be found.</p>
          </div>
        </Card>
      </PageContainer>
    );
  }

  const progress = calculateProgress();

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
            
            <MetaGrid>
              <MetaItem>
                <Calendar size={18} />
                <div>Due: <strong>{formatDate(currentTask.deadline)}</strong></div>
              </MetaItem>
              
              <MetaItem>
                <Map size={18} />
                <div>Location: <strong>{currentTask.location || 'Not specified'}</strong></div>
              </MetaItem>
              
              <MetaItem>
                <StatusIcon status={currentTask.status} />
                <div>Status: 
                  <StatusBadge status={currentTask.status}>
                    {currentTask.status === 'in_progress' ? 'In Progress' : 
                      currentTask.status.charAt(0).toUpperCase() + currentTask.status.slice(1)}
                  </StatusBadge>
                </div>
              </MetaItem>
              
              <MetaItem>
                <Activity size={18} />
                <div>Priority: 
                  <PriorityBadge priority={currentTask.priority}>
                    {currentTask.priority.charAt(0).toUpperCase() + currentTask.priority.slice(1)}
                  </PriorityBadge>
                </div>
              </MetaItem>
            </MetaGrid>
          </TitleSection>
        </HeaderContent>
      </Header>
      
      {timerRunning && (
        <TimerWidget>
          <Timer size={20} />
          {formatTime(timeSpent)}
          <div className="timer-controls">
            {timerRunning ? (
              <button className="timer-button pause" onClick={stopTimer}>
                <PauseCircle size={24} />
              </button>
            ) : (
              <button className="timer-button play" onClick={startTimer}>
                <PlayCircle size={24} />
              </button>
            )}
          </div>
        </TimerWidget>
      )}
      
      <ContentGrid>
        <div>
          <Card>
            <CardTitle>
              <CheckSquare size={22} />
              Task Details
            </CardTitle>
            
            <ProgressSection>
              <ProgressHeader>
                <div className="progress-label">Progress</div>
                <div className="progress-percentage">{progress}%</div>
              </ProgressHeader>
              <ProgressBar progress={progress}>
                <div className="progress-fill" />
              </ProgressBar>
            </ProgressSection>
            
            <ButtonGroup>
              {currentTask.status === 'pending' && (
                <Button onClick={handleStartTask}>
                  <PlayCircle size={18} />
                  Start Task
                </Button>
              )}
              
              {currentTask.status === 'in_progress' && (
                <Button onClick={handleCompleteTask}>
                  <CheckCircle size={18} />
                  Complete Task
                </Button>
              )}
              
              {currentTask.status !== 'pending' && !timerRunning && (
                <Button onClick={startTimer}>
                  <PlayCircle size={18} />
                  Resume Timer
                </Button>
              )}
              
              <Button onClick={handleExportReport} disabled={exportingReport}>
                <FileText size={18} />
                Export Report
              </Button>
            </ButtonGroup>
            
            <InspectionList>
              <CardTitle style={{ marginTop: '32px' }}>
                <Map size={22} />
                Inspection Areas
              </CardTitle>
              
              {currentTask.subLevels && currentTask.subLevels.length > 0 ? (
                renderSubLevelTree(currentTask.subLevels)
              ) : (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: '#666',
                  background: 'rgba(248, 250, 252, 0.7)',
                  borderRadius: '12px'
                }}>
                  No inspection areas defined for this task
                </div>
              )}
            </InspectionList>
          </Card>
          
          <Card>
            <CardTitle>
              <MessageSquare size={22} />
              Comments
            </CardTitle>
            
            <CommentSection>
              <CommentInput>
                <textarea 
                  placeholder="Add a comment about this task..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="button-row">
                  <Button 
                    onClick={handleCommentSubmit}
                    disabled={submitting || !comment.trim()}
                  >
                    <Send size={16} />
                    Post Comment
                  </Button>
                </div>
              </CommentInput>
              
              <CommentList>
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <Comment key={index}>
                      <div className="header">
                        <div className="author">{comment.createdBy?.name || 'Anonymous'}</div>
                        <div className="timestamp">{formatDateTime(comment.createdAt)}</div>
                      </div>
                      <div className="content">{comment.text}</div>
                    </Comment>
                  ))
                ) : (
                  <div style={{ 
                    padding: '20px', 
                    textAlign: 'center', 
                    color: '#666',
                    background: 'rgba(248, 250, 252, 0.7)',
                    borderRadius: '12px'
                  }}>
                    No comments yet
                  </div>
                )}
              </CommentList>
            </CommentSection>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardTitle>
              <Activity size={22} />
              Task Progress
            </CardTitle>
            
            <ProgressWidget progress={progress}>
              <div className="progress-circle">
                <div className="progress-text">{progress}%</div>
              </div>
              <div className="progress-label">Task Completion</div>
            </ProgressWidget>
            
            <TaskMetrics>
              <CardTitle>
                <Clock size={22} />
                Task Metrics
              </CardTitle>
              
              <MetricCard>
                <div className="metric-label">Time Spent</div>
                <div className="metric-value">
                  <Timer size={18} />
                  {formatTime(timeSpent)}
                </div>
              </MetricCard>
              
              {currentTask.subLevels && currentTask.subLevels.length > 0 && (
                <MetricCard>
                  <div className="metric-label">Areas Progress</div>
                  <div style={{ 
                    marginTop: '12px',
                    border: '1px solid rgba(237, 242, 247, 0.7)',
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}>
                    {currentTask.subLevels.map((subLevel, index) => (
                      <SubLevelTimeItem key={index}>
                        <div className="sublevel-name">{subLevel.title}</div>
                        <div className="time-spent">
                          {subLevel.status === 'completed' ? 
                            <CheckCircle size={14} color="#2e7d32" /> : 
                            subLevel.status === 'in_progress' ?
                              <Activity size={14} color="#0069c0" /> :
                              <Clock size={14} color="#757575" />
                          }
                        </div>
                      </SubLevelTimeItem>
                    ))}
                  </div>
                </MetricCard>
              )}
            </TaskMetrics>
            
            {currentTask.attachments && currentTask.attachments.length > 0 && (
              <>
                <CardTitle style={{ marginTop: '28px' }}>
                  <PaperclipIcon size={22} />
                  Attachments
                </CardTitle>
                
                <AttachmentList>
                  {currentTask.attachments.map((attachment, index) => (
                    <AttachmentItem key={index}>
                      <div className="file-info">
                        <File size={18} />
                        <div className="file-name">{attachment.name || 'Document'}</div>
                      </div>
                      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                        <Download size={16} />
                        Download
                      </a>
                    </AttachmentItem>
                  ))}
                </AttachmentList>
              </>
            )}
          </Card>
        </div>
      </ContentGrid>
      
      {submitting && (
        <LoadingOverlay>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Loader size={40} color="#1a237e" />
            <div style={{ color: '#1a237e', fontWeight: '600' }}>Saving changes...</div>
          </div>
        </LoadingOverlay>
      )}
      
      {exportingReport && (
        <LoadingOverlay>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Loader size={40} color="#1a237e" />
            <div style={{ color: '#1a237e', fontWeight: '600' }}>Generating report...</div>
          </div>
        </LoadingOverlay>
      )}
    </PageContainer>
  );
};

export default UserTaskDetail;