import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  ArrowLeft, Clock, Calendar, Map, AlertTriangle, Edit,
  CheckCircle, XCircle, Activity, PaperclipIcon, Send, 
  Download, Info, CheckSquare, Camera, FileText, Loader,
  Circle, MoreHorizontal, Timer, PlayCircle, PauseCircle,
  File
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

const UserTaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const fileInputRef = useRef(null);
  
  const { currentTask, taskDetailsLoading, actionLoading, error } = useSelector(state => state.userTasks);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedItems, setExpandedItems] = useState({});
  const [selectedSubLevel, setSelectedSubLevel] = useState(null);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const [activeTimer, setActiveTimer] = useState(null);
  const [timers, setTimers] = useState({});
  const timerIntervalRef = useRef(null);
  
  const [currentResponses, setCurrentResponses] = useState({});
  const [inspectionStarted, setInspectionStarted] = useState(false);
  const [activeSubLevelId, setActiveSubLevelId] = useState(null);
  const [questionsCompleted, setQuestionsCompleted] = useState(false);
  const [finalSubmitDisabled, setFinalSubmitDisabled] = useState(true);
  const [questionnaireShown, setQuestionnaireShown] = useState(false);

  useEffect(() => {
    if (taskId) {
      dispatch(fetchUserTaskDetails(taskId));
    }
    
    return () => {
      setExpandedItems({});
      setSelectedSubLevel(null);
      setNotes('');
      setPhotos([]);
      setNewComment('');
      clearInterval(timerIntervalRef.current);
    };
  }, [taskId, dispatch]);

  // Check for questionnaire responses from location state
  useEffect(() => {
    if (location.state?.questionnaireCompleted && location.state?.responses) {
      setQuestionsCompleted(true);
      setCurrentResponses(location.state.responses);
      
      // Save questionnaire responses to the task
      if (taskId) {
        dispatch(updateTaskQuestionnaire({
          taskId,
          data: {
            responses: location.state.responses,
            completed: true
          }
        })).unwrap();
      }
      
      if (location.state?.subLevelId) {
        setActiveSubLevelId(location.state.subLevelId);
        setSelectedSubLevel(location.state.subLevelId);
      }
      
      setCurrentStep(2);
      setInspectionStarted(true);
    }
  }, [location.state, taskId, dispatch]);

  useEffect(() => {
    if (currentTask?.progress) {
      const initialTimers = {};
      currentTask.progress.forEach(progress => {
        initialTimers[progress.subLevelId] = {
          elapsed: progress.timeSpent || 0,
          running: false
        };
      });
      setTimers(initialTimers);
      
      const allCompleted = checkAllItemsCompleted(currentTask);
      setFinalSubmitDisabled(!allCompleted);
      setIsCompleted(currentTask.status === 'completed');
      
      // Check if questionnaire has been completed before
      if (currentTask.questionnaireCompleted) {
        setQuestionsCompleted(true);
        setCurrentResponses(currentTask.questionnaireResponses || {});
      }
    }
  }, [currentTask]);

  useEffect(() => {
    if (activeTimer) {
      timerIntervalRef.current = setInterval(() => {
        setTimers(prev => ({
          ...prev,
          [activeTimer]: {
            ...prev[activeTimer],
            elapsed: (prev[activeTimer]?.elapsed || 0) + 1
          }
        }));
      }, 1000);
    }
    
    return () => {
      clearInterval(timerIntervalRef.current);
    };
  }, [activeTimer]);

  const checkAllItemsCompleted = (task) => {
    if (!task || !task.inspectionLevel || !task.inspectionLevel.subLevels) return false;
    
    const getAllSubLevelIds = (subLevels) => {
      let ids = [];
      if (!subLevels || !Array.isArray(subLevels)) return ids;
      
      for (const sl of subLevels) {
        ids.push(sl._id.toString());
        if (sl.subLevels && Array.isArray(sl.subLevels)) {
          ids = [...ids, ...getAllSubLevelIds(sl.subLevels)];
        }
      }
      return ids;
    };
    
    const allSubLevelIds = getAllSubLevelIds(task.inspectionLevel.subLevels);
    
    const completedProgress = task.progress.filter(p => 
      p.status === 'completed' && allSubLevelIds.includes(p.subLevelId)
    );
    
    return completedProgress.length === allSubLevelIds.length;
  };

  const toggleExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    const validFiles = files.filter(file => 
      file.type.match('image.*') && file.size <= 5 * 1024 * 1024
    );
    
    if (validFiles.length !== files.length) {
      toast.error('Some files were rejected. Images must be under 5MB.');
    }
    
    const newPhotos = [...photos];
    
    for (const file of validFiles) {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPhotos.push({
          file,
          preview: reader.result
        });
        setPhotos([...newPhotos]);
      };
      reader.readAsDataURL(file);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const startInspection = () => {
    // Check if questionnaire is required and hasn't been completed
    if (currentTask?.questions && 
        currentTask.questions.length > 0 && 
        !currentTask.questionnaireCompleted && 
        !questionsCompleted &&
        !questionnaireShown) {
      setCurrentStep(1);
      setQuestionnaireShown(true);
    } else {
      setCurrentStep(2);
      setInspectionStarted(true);
    }
  };

  const selectSubLevel = (subLevelId) => {
    setActiveSubLevelId(subLevelId);
    setSelectedSubLevel(subLevelId);
    handleStartTimer(subLevelId);
    
    if (currentTask && currentTask.progress) {
      const progressItem = currentTask.progress.find(p => p.subLevelId === subLevelId);
      if (progressItem) {
        setNotes(progressItem.notes || '');
      } else {
        setNotes('');
      }
    }
    
    setPhotos([]);
  };

  const handleStartTimer = (subLevelId) => {
    if (activeTimer) {
      handleStopTimer();
    }
    
    setActiveTimer(subLevelId);
    setTimers(prev => ({
      ...prev,
      [subLevelId]: {
        elapsed: prev[subLevelId]?.elapsed || 0,
        running: true
      }
    }));
  };

  const handleStopTimer = () => {
    if (activeTimer) {
      setTimers(prev => ({
        ...prev,
        [activeTimer]: {
          ...prev[activeTimer],
          running: false
        }
      }));
      setActiveTimer(null);
    }
  };

  const handleStatusChange = async (status) => {
    if (!selectedSubLevel) return;
    
    setIsSubmitting(true);
    
    try {
      handleStopTimer();
      
      let uploadedPhotos = [];
      
      if (photos.length > 0) {
        for (const photo of photos) {
          if (photo.file) {
            try {
              const uploadedData = await userTaskService.uploadTaskAttachment(taskId, photo.file);
              if (uploadedData.success && uploadedData.data) {
                uploadedPhotos.push(uploadedData.data.url);
              }
            } catch (error) {
              console.error('Failed to upload photo:', error);
            }
          }
        }
      }
      
      const subLevelResponses = Object.keys(currentResponses)
        .filter(key => key.startsWith(`${selectedSubLevel}-`))
        .map(key => {
          const questionId = key.split('-')[1];
          return {
            questionId,
            answer: currentResponses[key],
            timestamp: new Date()
          };
        });
      
      await dispatch(updateUserTaskProgress({
        taskId,
        subLevelId: selectedSubLevel,
        data: {
          status,
          notes,
          photos: uploadedPhotos,
          timeSpent: timers[selectedSubLevel]?.elapsed || 0,
          responses: subLevelResponses
        }
      })).unwrap();
      
      setNotes('');
      setPhotos([]);
      setSelectedSubLevel(null);
      setActiveSubLevelId(null);
      toast.success(`Item marked as ${status.replace('_', ' ')}`);
      
      const updatedTask = await dispatch(fetchUserTaskDetails(taskId)).unwrap();
      const allCompleted = checkAllItemsCompleted(updatedTask);
      setFinalSubmitDisabled(!allCompleted);
      
    } catch (error) {
      toast.error('Failed to update task status: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await dispatch(addUserTaskComment({ 
        taskId, 
        content: newComment 
      })).unwrap();
      
      setNewComment('');
    } catch (error) {
      toast.error('Failed to add comment: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuestionResponse = (questionId, value) => {
    setCurrentResponses(prev => ({
      ...prev,
      [`${activeSubLevelId || 'general'}-${questionId}`]: value
    }));
  };

  const submitQuestionnaire = async () => {
    const requiredQuestions = currentTask.questions.filter(q => q.required);
    const allRequiredAnswered = requiredQuestions.every(q => 
      currentResponses[`${activeSubLevelId || 'general'}-${q.id}`] || 
      currentResponses[`${activeSubLevelId || 'general'}-${q._id}`]
    );
    
    if (!allRequiredAnswered) {
      toast.error('Please answer all required questions');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await dispatch(updateTaskQuestionnaire({
        taskId,
        data: {
          responses: currentResponses,
          completed: true
        }
      })).unwrap();
      
      setQuestionsCompleted(true);
      setCurrentStep(2);
      setInspectionStarted(true);
    } catch (error) {
      toast.error('Failed to save questionnaire: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportReport = async () => {
    try {
      setIsSubmitting(true);
      
      await dispatch(exportTaskReport({
        taskId,
        format: 'pdf'
      })).unwrap();
      
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      await dispatch(updateUserTaskProgress({
        taskId,
        data: {
          status: 'completed',
          finalSubmit: true
        }
      })).unwrap();
      
      setIsCompleted(true);
      toast.success('Task completed successfully');
      
      handleExportReport();
      
    } catch (error) {
      toast.error('Failed to submit task: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubLevelStatus = (subLevelId) => {
    if (!currentTask || !currentTask.progress) return 'pending';
    
    const progressItem = currentTask.progress.find(p => 
      p.subLevelId === subLevelId
    );
    
    return progressItem ? progressItem.status : 'pending';
  };

  const getSubLevelNotes = (subLevelId) => {
    if (!currentTask || !currentTask.progress) return '';
    
    const progressItem = currentTask.progress.find(p => 
      p.subLevelId === subLevelId
    );
    
    return progressItem && progressItem.notes ? progressItem.notes : '';
  };

  const renderSubLevels = (subLevel, depth = 0) => {
    if (!subLevel) return null;
    
    const subLevelId = subLevel._id;
    const isExpanded = expandedItems[subLevelId];
    const status = getSubLevelStatus(subLevelId);
    const notes = getSubLevelNotes(subLevelId);
    const isSelected = selectedSubLevel === subLevelId;
    const timerData = timers[subLevelId] || { elapsed: 0, running: false };
    
    return (
      <React.Fragment key={subLevelId}>
        <InspectionItem indent={depth}>
          <InspectionHeader 
            onClick={() => toggleExpand(subLevelId)}
            status={status}
          >
            <div className="inspection-title">
  <div className="status-indicator" />
  {subLevel.name}
  {subLevel.subLevels && subLevel.subLevels.length > 0 && (
    <span style={{ 
      marginLeft: '8px', 
      fontSize: '12px', 
      background: 'rgba(26, 35, 126, 0.1)', 
      padding: '2px 6px', 
      borderRadius: '12px',
      color: '#1a237e',
      fontWeight: '600'
    }}>
      {subLevel.subLevels.length} subtask{subLevel.subLevels.length !== 1 ? 's' : ''}
    </span>
  )}
</div>
            
            <StatusBadge status={status}>
              <StatusIcon status={status} size={14} />
              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </StatusBadge>
          </InspectionHeader>
          
          {isExpanded && (
            <InspectionContent>
              <div className="inspection-description">
                {subLevel.description}
              </div>
              
              {(status === 'in_progress' || timerData.elapsed > 0) && (
                <TimerWidget>
                  <Timer size={20} />
                  <span>{formatTime(timerData.elapsed)}</span>
                  <div className="timer-controls">
                    {activeTimer === subLevelId ? (
                      <button 
                        className="timer-button pause" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStopTimer();
                        }}
                      >
                        <PauseCircle size={20} />
                      </button>
                    ) : status !== 'completed' && (
                      <button 
                        className="timer-button play" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartTimer(subLevelId);
                          setSelectedSubLevel(subLevelId);
                        }}
                      >
                        <PlayCircle size={20} />
                      </button>
                    )}
                  </div>
                </TimerWidget>
              )}
              
              {notes && (
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>Notes:</div>
                  <div style={{ 
                    padding: '14px', 
                    background: 'rgba(248, 250, 252, 0.8)', 
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: '#4b5563',
                    lineHeight: '1.6',
                    border: '1px solid rgba(255, 255, 255, 0.7)',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                    backdropFilter: 'blur(5px)'
                  }}>
                    {notes}
                  </div>
                </div>
              )}
              
              {status !== 'completed' && (
                <>
                  <StatusButtonGroup>
                    {status === 'pending' && !isSelected && (
                      <StatusButton 
                        status="in_progress"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectSubLevel(subLevelId);
                        }}
                      >
                        <PlayCircle size={16} />
                        Start Inspection
                      </StatusButton>
                    )}
                    
                    {isSelected && (
                      <>
                        <StatusButton 
                          status="pending"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStopTimer();
                            setSelectedSubLevel(null);
                            setActiveSubLevelId(null);
                          }}
                        >
                          Cancel
                        </StatusButton>
                        
                        <StatusButton 
                          status="in_progress"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange('in_progress');
                          }}
                          disabled={isSubmitting || status === 'in_progress'}
                        >
                          <Activity size={16} />
                          Save Progress
                        </StatusButton>
                        
                        <StatusButton 
                          status="completed"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange('completed');
                          }}
                          disabled={isSubmitting}
                        >
                          <CheckCircle size={16} />
                          Mark as Completed
                        </StatusButton>
                      </>
                    )}
                  </StatusButtonGroup>
                  
                  {isSelected && (
                    <>
                      <NotesSection>
                        <div className="notes-label">Add Notes</div>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add details about the inspection item..."
                        />
                      </NotesSection>
                      
                      <PhotoUploadContainer>
                        <div className="photos-label">Add Photos</div>
                        <div 
                          className="upload-area"
                          onClick={() => fileInputRef.current.click()}
                        >
                          <Camera size={28} color="#1a237e" />
                          <p>Click to upload photos</p>
                        </div>
                        <input 
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                        />
                        
                        {photos.length > 0 && (
                          <PhotoPreviewsContainer>
                            {photos.map((photo, index) => (
                              <PhotoPreview key={index}>
                                <img src={photo.preview} alt="Preview" />
                                <button 
                                  className="remove-button"
                                  onClick={() => removePhoto(index)}
                                >
                                  ×
                                </button>
                              </PhotoPreview>
                            ))}
                          </PhotoPreviewsContainer>
                        )}
                      </PhotoUploadContainer>
                    </>
                  )}
                </>
              )}
            </InspectionContent>
          )}
        </InspectionItem>

        {isExpanded && subLevel.subLevels && subLevel.subLevels.length > 0 && (
          <div style={{ marginLeft: `${depth * 28 + 28}px`, marginTop: '16px', marginBottom: '16px' }}>
            {subLevel.subLevels.map(childSubLevel => 
              renderSubLevels(childSubLevel, depth + 1)
            )}
          </div>
        )}
      </React.Fragment>
    );
  };

  const renderTaskOverview = () => {
    return (
      <TaskStep>
        <StepHeader>
          <StepTitle>
            <Info size={22} />
            Task Overview
          </StepTitle>
        </StepHeader>
        
        <StepContent>
          <Description>{currentTask.description}</Description>
          
          <MetaGrid>
            <MetaItem>
              <Calendar size={18} className="icon" />
              <strong>Due Date:</strong> {formatDate(currentTask.deadline)}
            </MetaItem>
            
            <MetaItem>
              <AlertTriangle size={18} className="icon" />
              <strong>Priority:</strong>
              <PriorityBadge priority={currentTask.priority}>
                {currentTask.priority.charAt(0).toUpperCase() + currentTask.priority.slice(1)}
              </PriorityBadge>
            </MetaItem>
            
            {currentTask.location && (
              <MetaItem>
                <Map size={18} className="icon" />
                <strong>Location:</strong> {currentTask.location}
              </MetaItem>
            )}
            
            <MetaItem>
              <Info size={18} className="icon" />
              <strong>Inspection Type:</strong> {currentTask.inspectionLevel?.type || 'N/A'}
            </MetaItem>
          </MetaGrid>
          
          <ProgressSection>
            <ProgressHeader>
              <div className="progress-label">Overall Progress</div>
              <div className="progress-percentage">{currentTask.overallProgress || 0}%</div>
            </ProgressHeader>
            <ProgressBar progress={currentTask.overallProgress || 0}>
              <div className="progress-fill" />
            </ProgressBar>
          </ProgressSection>
          
          <StepActions>
            <Button onClick={() => startInspection()}>
              <PlayCircle size={18} />
              Start Inspection
            </Button>
          </StepActions>
        </StepContent>
      </TaskStep>
    );
  };

  const renderQuestionnaire = () => {
    return (
      <TaskStep>
        <StepHeader>
          <StepTitle>
            <CheckSquare size={22} />
            Pre-Inspection Questionnaire
          </StepTitle>
        </StepHeader>
        
        <StepContent>
          <QuestionsContainer>
            {currentTask.questions && currentTask.questions.map((question, index) => (
              <QuestionItem key={question._id || question.id || index}>
                <QuestionText>
                  {index + 1}. {question.text} {question.required && <span style={{ color: 'red' }}>*</span>}
                </QuestionText>
                
                <QuestionOptions>
                  {question.answerType === 'yesNo' && (
                    <>
                      <OptionButton
                        selected={currentResponses[`${activeSubLevelId || 'general'}-${question._id || question.id}`] === 'yes'}
                        onClick={() => handleQuestionResponse(question._id || question.id, 'yes')}
                      >
                        Yes
                      </OptionButton>
                      <OptionButton
                        selected={currentResponses[`${activeSubLevelId || 'general'}-${question._id || question.id}`] === 'no'}
                        onClick={() => handleQuestionResponse(question._id || question.id, 'no')}
                      >
                        No
                      </OptionButton>
                      <OptionButton
                        selected={currentResponses[`${activeSubLevelId || 'general'}-${question._id || question.id}`] === 'na'}
                        onClick={() => handleQuestionResponse(question._id || question.id, 'na')}
                      >
                        N/A
                      </OptionButton>
                    </>
                  )}
                  
                  {question.answerType === 'compliance' && (
                    <>
                      <ComplianceButton
                        selected={currentResponses[`${activeSubLevelId || 'general'}-${question._id || question.id}`] === 'full_compliance'}
                        onClick={() => handleQuestionResponse(question._id || question.id, 'full_compliance')}
                        value="full_compliance"
                      >
                        Full Compliance
                      </ComplianceButton>
                      <ComplianceButton
                        selected={currentResponses[`${activeSubLevelId || 'general'}-${question._id || question.id}`] === 'partial_compliance'}
                        onClick={() => handleQuestionResponse(question._id || question.id, 'partial_compliance')}
                        value="partial_compliance"
                      >
                        Partial Compliance
                      </ComplianceButton>
                      <ComplianceButton
                        selected={currentResponses[`${activeSubLevelId || 'general'}-${question._id || question.id}`] === 'non_compliance'}
                        onClick={() => handleQuestionResponse(question._id || question.id, 'non_compliance')}
                        value="non_compliance"
                      >
                        Non Compliance
                      </ComplianceButton>
                    </>
                  )}
                  
                  {question.answerType === 'custom' && question.options && question.options.length > 0 && (
                    <>
                      {question.options.map((option, optionIndex) => (
                        <OptionButton
                          key={optionIndex}
                          selected={currentResponses[`${activeSubLevelId || 'general'}-${question._id || question.id}`] === option}
                          onClick={() => handleQuestionResponse(question._id || question.id, option)}
                        >
                          {option}
                        </OptionButton>
                      ))}
                    </>
                  )}
                </QuestionOptions>
              </QuestionItem>
            ))}
          </QuestionsContainer>
          
          <StepActions>
            <Button onClick={() => setCurrentStep(0)}>
              Back
            </Button>
            <Button onClick={submitQuestionnaire} disabled={isSubmitting}>
              <CheckCircle size={18} />
              Submit & Start Inspection
            </Button>
          </StepActions>
        </StepContent>
      </TaskStep>
    );
  };

  const renderInspection = () => {
    return (
      <TaskStep>
        <StepHeader>
          <StepTitle>
            <CheckSquare size={22} />
            Inspection Items
          </StepTitle>
        </StepHeader>
        
        <StepContent>
          <InspectionList>
            {currentTask.inspectionLevel?.subLevels?.map(item => 
              renderSubLevels(item)
            )}
          </InspectionList>
          
          <StepActions>
            <Button onClick={() => setCurrentStep(0)}>
              Back to Overview
            </Button>
          </StepActions>
          
          {!isCompleted && (
            <FinalSubmitButton 
              onClick={handleFinalSubmit}
              disabled={finalSubmitDisabled || isSubmitting}
            >
              <CheckCircle size={20} />
              Final Submit
            </FinalSubmitButton>
          )}
          
          {isCompleted && (
            <FinalSubmitButton 
              onClick={handleExportReport}
              disabled={isSubmitting}
            >
              <File size={20} />
              Export Report
            </FinalSubmitButton>
          )}
        </StepContent>
      </TaskStep>
    );
  };

  if (taskDetailsLoading && !currentTask) {
    return (
      <PageContainer>
        <BackButton onClick={() => navigate('/user-tasks')}>
          <ArrowLeft size={18} />
          Back to Tasks
        </BackButton>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Loader size={32} color="#1a237e" />
        </div>
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
        <Card>
          <CardTitle>Error</CardTitle>
          <p>{error}</p>
          <SubmitButton 
            style={{ marginTop: '18px' }}
            onClick={() => dispatch(fetchUserTaskDetails(taskId))}
          >
            Try Again
          </SubmitButton>
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
          <CardTitle>Task Not Found</CardTitle>
          <p>The requested task could not be found.</p>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {actionLoading && (
        <LoadingOverlay>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <Loader size={44} color="#1a237e" />
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a237e' }}>Processing...</div>
          </div>
        </LoadingOverlay>
      )}
      
      <BackButton onClick={() => navigate('/user-tasks')}>
        <ArrowLeft size={18} />
        Back to Tasks
      </BackButton>
      
      <Header>
        <HeaderContent>
          <TitleSection>
            <Title>{currentTask.title}</Title>
          </TitleSection>
          
          <StatusBadge status={currentTask.status}>
            <StatusIcon status={currentTask.status} />
            {currentTask.status.charAt(0).toUpperCase() + currentTask.status.slice(1).replace('_', ' ')}
          </StatusBadge>
        </HeaderContent>
      </Header>
      
      <TaskFlowContainer>
        <StepIndicator>
          <StepDot active={currentStep === 0} />
          {currentTask.questions && currentTask.questions.length > 0 && (
            <StepDot active={currentStep === 1} />
          )}
          <StepDot active={currentStep === 2} />
        </StepIndicator>
        
        {currentStep === 0 && renderTaskOverview()}
        {currentStep === 1 && renderQuestionnaire()}
        {currentStep === 2 && renderInspection()}
        
        {currentStep === 2 && (
          <ContentGrid>
            <Card>
              <CardTitle>
                <FileText size={22} />
                Comments
              </CardTitle>
              
              <CommentInput>
                <textarea 
                  placeholder="Add a comment about this task..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="button-row">
                  <SubmitButton 
                    onClick={handleAddComment}
                    disabled={isSubmitting || !newComment.trim()}
                  >
                    <Send size={16} />
                    Post Comment
                  </SubmitButton>
                </div>
              </CommentInput>
              
              <CommentList>
                {currentTask.comments?.map((comment, index) => (
                  <Comment key={index}>
                    <div className="header">
                      <span className="author">{comment.user?.name || 'Inspector'}</span>
                      <span className="timestamp">{formatDateTime(comment.createdAt)}</span>
                    </div>
                    <p className="content">{comment.content}</p>
                  </Comment>
                ))}
                
                {(!currentTask.comments || currentTask.comments.length === 0) && (
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: '14px', 
                    textAlign: 'center', 
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(5px)'
                  }}>
                    No comments yet
                  </p>
                )}
              </CommentList>
            </Card>
            
            <div>
              <Card>
                <CardTitle>
                  <Activity size={22} />
                  Task Progress
                </CardTitle>
                
                <ProgressWidget progress={currentTask.overallProgress || 0}>
                  <div className="progress-circle" />
                  <div className="progress-text">{currentTask.overallProgress || 0}%</div>
                  <div className="progress-label">Overall Completion</div>
                </ProgressWidget>
                
                <TaskMetrics>
                  <MetricCard>
                    <div className="metric-label">Time Spent</div>
                    <div className="metric-value">
                      <Clock size={18} color="#1976d2" />
                      {currentTask.taskMetrics?.timeSpent || 0} hours
                    </div>
                  </MetricCard>
                  
                  <MetricCard>
                    <div className="metric-label">Items Completed</div>
                    <div className="metric-value">
                      <CheckCircle size={18} color="#388e3c" />
                      {currentTask.taskMetrics?.userProgress || 0} of {currentTask.taskMetrics?.totalSubTasks || 0}
                    </div>
                  </MetricCard>
                  
                  <MetricCard>
                    <div className="metric-label">Your Completion Rate</div>
                    <div className="metric-value">
                      <Activity size={18} color="#f57c00" />
                      {currentTask.taskMetrics?.completionRate || 0}%
                    </div>
                  </MetricCard>
                </TaskMetrics>
                
                {currentTask.status === 'completed' && (
                  <ReportButton 
                    onClick={handleExportReport}
                    disabled={isSubmitting}
                  >
                    <File size={18} />
                    Export Inspection Report
                  </ReportButton>
                )}
              </Card>
              
              <Card style={{ marginTop: '24px' }}>
                <CardTitle>
                  <PaperclipIcon size={22} />
                  Attachments
                </CardTitle>
                
                {currentTask.attachments?.length > 0 ? (
                  <AttachmentList>
                    {currentTask.attachments.map((attachment, index) => (
                      <AttachmentItem key={index}>
                        <div className="file-info">
                          <PaperclipIcon size={18} color="#1a237e" />
                          <span className="file-name">{attachment.filename}</span>
                        </div>
                        <a 
                          href={attachment.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Download size={14} />
                          Download
                        </a>
                      </AttachmentItem>
                    ))}
                  </AttachmentList>
                ) : (
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: '14px', 
                    textAlign: 'center', 
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(5px)'
                  }}>
                    No attachments available
                  </p>
                )}
              </Card>
            </div>
          </ContentGrid>
        )}
      </TaskFlowContainer>
    </PageContainer>
  );
};

export default UserTaskDetail;