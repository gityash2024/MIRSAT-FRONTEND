import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { 
  ChevronDown, ChevronUp, CheckCircle, XCircle, 
  AlertTriangle, Clock, Loader, FileText,
  PaperclipIcon, MessageSquare, Timer, Image,
  Trash2, Award, BarChart2, HelpCircle, Activity,
  Clipboard, AlertCircle, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { updateUserTaskProgress, uploadTaskAttachment } from '../../../store/slices/userTasksSlice';

const Container = styled.div`
  padding: 16px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
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
    color: #1a237e;
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

const SubLevelTreeContainer = styled.div`
  background: rgba(255, 255, 255, 0.7);
  border-radius: 14px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  margin-bottom: 24px;
`;

const SubLevelItem = styled.div`
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

const SubLevelNestedContainer = styled.div`
  padding-left: ${props => props.level * 20}px;
  margin-top: ${props => props.level > 0 ? '16px' : '0'};
`;

const SubLevelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
`;

const SubLevelTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1a237e;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SubLevelContent = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
`;

const SubLevelDescription = styled.p`
  color: #4b5563;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
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

const ComplianceBadge = styled.span`
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
      case 'full_compliance':
        return 'background-color: rgba(232, 245, 233, 0.8); color: #2e7d32; border: 1px solid rgba(46, 125, 50, 0.2);';
      case 'partial_compliance':
        return 'background-color: rgba(255, 248, 225, 0.8); color: #f57c00; border: 1px solid rgba(245, 124, 0, 0.2);';
      case 'non_compliance':
        return 'background-color: rgba(255, 235, 238, 0.8); color: #d32f2f; border: 1px solid rgba(211, 47, 47, 0.2);';
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

const ReportContainer = styled.div`
  margin-top: 32px;
  background: rgba(237, 242, 247, 0.7);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(226, 232, 240, 0.7);
`;

const ReportTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ReportStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  .label {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 8px;
  }
  
  .value {
    font-size: 18px;
    font-weight: 600;
    color: #1a237e;
  }
`;

const ProgressBar = styled.div`
  height: 8px;
  background-color: rgba(224, 224, 224, 0.6);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 24px;
  
  .fill {
    height: 100%;
    background: linear-gradient(90deg, rgba(26, 35, 126, 0.8), rgba(63, 81, 181, 0.9));
    border-radius: 4px;
    width: ${props => props.progress || 0}%;
  }
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  
  .label {
    font-size: 14px;
    font-weight: 500;
    color: #334155;
  }
  
  .percentage {
    font-size: 14px;
    font-weight: 600;
    color: #1a237e;
  }
`;

const ExportButton = styled(ActionButton)`
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #0d47a1;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15);
  margin-top: 24px;
`;

const StatsContainer = styled.div`
  margin-top: 32px;
  background: rgba(237, 242, 247, 0.7);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(226, 232, 240, 0.7);
`;

const StatTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const ScoringSummary = styled.div`
  background: rgba(237, 246, 255, 0.8);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  border: 1px solid rgba(191, 220, 255, 0.5);
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
    color: #1a237e;
  }
  
  .score-percent {
    font-size: 13px;
    color: ${props => props.percent >= 80 ? '#4caf50' : props.percent >= 50 ? '#ff9800' : '#f44336'};
    margin-left: 4px;
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

const StatusIcon = ({ status, size = 18 }) => {
  switch (status) {
    case 'completed':
    case 'full_compliance':
      return <CheckCircle size={size} color="#388e3c" />;
    case 'failed':
    case 'incomplete':
    case 'non_compliance':
      return <XCircle size={size} color="#d32f2f" />;
    case 'in_progress':
    case 'partial_compliance':
      return <AlertCircle size={size} color="#f57c00" />;
    case 'not_applicable':
      return <HelpCircle size={size} color="#9e9e9e" />;
    case 'pending':
    default:
      return <Clock size={size} color="#f57c00" />;
  }
};

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

const TimeInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
`;

const TimeInput = styled.input`
  width: 80px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  text-align: center;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3f51b5;
  }
  
  /* Hide arrows for number input */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  /* Firefox */
  &[type=number] {
    -moz-appearance: textfield;
  }
`;

const PhotoPreviewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
  position: relative;
`;

const PhotoPreview = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: scale(1.05);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .remove-button {
    position: absolute;
    top: 4px;
    right: 4px;
    background: rgba(255, 255, 255, 0.8);
    border: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #d32f2f;
    
    &:hover {
      background: white;
    }
  }
`;

const PhotoLightbox = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  img {
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
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
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 20px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.4);
    }
  }
`;

// New fixed-position wrapper for image upload
const ImageUploadWrapper = styled.div`
  position: relative;
  min-height: 120px;
  margin-bottom: 12px;
`;

const InspectionStepForm = ({ task, onUpdateProgress, onExportReport }) => {
  const dispatch = useDispatch();
  const [expandedSubLevels, setExpandedSubLevels] = useState({});
  const [loading, setLoading] = useState({});
  const [notes, setNotes] = useState({});
  const [timeSpent, setTimeSpent] = useState({});
  const [photos, setPhotos] = useState({});
  const [activeTimers, setActiveTimers] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [complianceStatus, setComplianceStatus] = useState({});
  const [uploadingPhotos, setUploadingPhotos] = useState({});
  const [scores, setScores] = useState({
    total: 0,
    achieved: 0,
    percentage: 0,
    areas: []
  });
  
  const fileInputRefs = useRef({});
  const timerRefs = useRef({});
  
  // Initialize from existing task data
  useEffect(() => {
    if (task && task.progress && task.progress.length > 0) {
      const notesObj = {};
      const timeObj = {};
      const photosObj = {};
      const complianceObj = {};
      
      task.progress.forEach(p => {
        if (p && p.subLevelId) {
          const id = typeof p.subLevelId === 'string' 
            ? p.subLevelId 
            : (p.subLevelId._id || p.subLevelId.id || p.subLevelId);
          
          notesObj[id] = p.notes || '';
          timeObj[id] = p.timeSpent || 0;
          photosObj[id] = p.photos || [];
          complianceObj[id] = p.status || 'pending';
        }
      });
      
      setNotes(notesObj);
      setTimeSpent(timeObj);
      setPhotos(photosObj);
      setComplianceStatus(complianceObj);
      
      // Auto-expand the first level
      if (task.inspectionLevel?.subLevels?.length > 0) {
        const firstLevelId = task.inspectionLevel.subLevels[0]?._id;
        if (firstLevelId) {
          setExpandedSubLevels(prev => ({
            ...prev,
            [firstLevelId]: true
          }));
        }
      }
      
      // Calculate scores
      calculateScores();
    }
  }, [task]);
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timerRefs.current).forEach(timer => {
        if (timer) clearInterval(timer);
      });
    };
  }, []);
  
  const calculateScores = () => {
    if (!task || !task.progress) return;
    
    let totalPoints = 0;
    let achievedPoints = 0;
    const assessmentAreas = {};
    
    // First, organize into assessment areas
    if (task.inspectionLevel && task.inspectionLevel.subLevels) {
      const processSubLevels = (subLevels, areaName = 'General') => {
        subLevels.forEach(subLevel => {
          if (!subLevel) return;
          
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
          
          // Find matching progress item
          const progressItem = task.progress.find(p => 
            p.subLevelId && p.subLevelId.toString() === subLevel._id.toString()
          );
          
          if (progressItem) {
            const isMandatory = subLevel.mandatory !== false;
            
            if (isMandatory) {
              // Each mandatory item is worth 2 points
              assessmentAreas[currentArea].totalPoints += 2;
              
              // Scoring based on status
              if (progressItem.status === 'completed' || progressItem.status === 'full_compliance') {
                assessmentAreas[currentArea].achievedPoints += 2;
              } else if (progressItem.status === 'in_progress' || progressItem.status === 'partial_compliance') {
                assessmentAreas[currentArea].achievedPoints += 1;
              }
              
              // Add to total score counts
              totalPoints += 2;
              if (progressItem.status === 'completed' || progressItem.status === 'full_compliance') {
                achievedPoints += 2;
              } else if (progressItem.status === 'in_progress' || progressItem.status === 'partial_compliance') {
                achievedPoints += 1;
              }
              
              // Add to items list
              assessmentAreas[currentArea].items.push({
                id: subLevel._id,
                name: subLevel.name,
                status: progressItem.status,
                points: progressItem.status === 'completed' || progressItem.status === 'full_compliance' ? 2 : 
                        progressItem.status === 'in_progress' || progressItem.status === 'partial_compliance' ? 1 : 0,
                maxPoints: 2
              });
            }
          }
          
          // Process nested sub-levels
          if (subLevel.subLevels && subLevel.subLevels.length > 0) {
            processSubLevels(subLevel.subLevels, currentArea);
          }
        });
      };
      
      processSubLevels(task.inspectionLevel.subLevels);
    }
    
    // Convert assessment areas to array format
    const areasList = Object.values(assessmentAreas).map(area => ({
      name: area.name,
      score: area.achievedPoints,
      maxScore: area.totalPoints,
      percentage: area.totalPoints > 0 ? (area.achievedPoints / area.totalPoints) * 100 : 0,
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
    if (!task) return { subLevels: [], progress: [] };
    
    // Ensure inspectionLevel exists and has subLevels
    const inspectionLevel = task.inspectionLevel || {};
    const subLevels = inspectionLevel.subLevels || [];
    const progress = task.progress || [];
    
    return { subLevels, progress };
  };
  
  const { subLevels, progress } = getInspectionData();
  
  const toggleSubLevel = (subLevelId) => {
    setExpandedSubLevels(prev => ({
      ...prev,
      [subLevelId]: !prev[subLevelId]
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
  
  // Flatten the hierarchical structure for easier display
  const flattenSubLevels = (subLevels, parentName = '', level = 0) => {
    if (!subLevels || !Array.isArray(subLevels) || subLevels.length === 0) return [];
    
    let result = [];
    
    for (const subLevel of subLevels) {
      if (!subLevel) continue;
      
      const path = parentName ? `${parentName} > ${subLevel.name || 'Unnamed'}` : (subLevel.name || 'Unnamed');
      
      result.push({
        ...subLevel,
        level,
        path,
        status: getSubLevelStatus(subLevel._id)
      });
      
      if (subLevel.subLevels && subLevel.subLevels.length > 0) {
        result = [...result, ...flattenSubLevels(subLevel.subLevels, path, level + 1)];
      }
    }
    
    return result;
  };
  
  const flattenedSubLevels = flattenSubLevels(subLevels);
  
  const renderSubLevelTree = (subLevels, parentId = null, level = 0) => {
    if (!subLevels || !Array.isArray(subLevels) || subLevels.length === 0) return null;
    
    return (
      <SubLevelNestedContainer level={level}>
        {subLevels.map((subLevel) => {
          if (!subLevel) return null;
          
          const hasChildren = subLevel.subLevels && subLevel.subLevels.length > 0;
          const isExpanded = expandedSubLevels[subLevel._id];
          const status = getSubLevelStatus(subLevel._id);
          const isCompleted = status === 'completed' || status === 'full_compliance';
          const isFailed = status === 'failed' || status === 'incomplete' || status === 'non_compliance';
          const isPartial = status === 'in_progress' || status === 'partial_compliance';
          const isNotApplicable = status === 'not_applicable';
          const isTaskCompleted = task && task.status === 'completed';
          const isMandatory = subLevel.mandatory !== false;
          
          const subLevelNotes = notes[subLevel._id] || '';
          const subLevelPhotos = photos[subLevel._id] || [];
          const subLevelTime = timeSpent[subLevel._id] || 0;
          const isUploading = uploadingPhotos[subLevel._id] || false;
          
          return (
            <SubLevelItem key={subLevel._id}>
              <SubLevelHeader onClick={() => toggleSubLevel(subLevel._id)}>
                <SubLevelTitle>
                  <StatusIcon status={status} />
                  {subLevel.name || 'Unnamed'}
                  <MandatoryBadge mandatory={isMandatory}>
                    {isMandatory ? 'Mandatory' : 'Recommended'}
                  </MandatoryBadge>
                </SubLevelTitle>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <StatusBadge status={status}>
                    {status === 'completed' || status === 'full_compliance' ? 'Full Compliance' : 
                     status === 'failed' || status === 'incomplete' || status === 'non_compliance' ? 'Non-Compliance' : 
                     status === 'in_progress' || status === 'partial_compliance' ? 'Partial Compliance' : 
                     status === 'not_applicable' ? 'Not Applicable' : 'Pending'}
                  </StatusBadge>
                  {hasChildren && (isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
                </div>
              </SubLevelHeader>
              
              {isExpanded && (
                <SubLevelContent>
                  {subLevel.description && (
                    <SubLevelDescription>{subLevel.description}</SubLevelDescription>
                  )}
                  
                  {!isTaskCompleted && (
                    <>
                      <ActionInput>
                        <div>
                          <MessageSquare size={16} color="#1a237e" />
                          <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: '500' }}>Notes</span>
                          <CommentInput 
                            placeholder="Add your inspection notes here..."
                            value={subLevelNotes}
                            onChange={(e) => handleNoteChange(subLevel._id, e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <PaperclipIcon size={16} color="#1a237e" />
                          <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: '500' }}>Photos</span>
                          
                          {/* Fixed size container for uploads to prevent shifting */}
                          <ImageUploadWrapper>
                            <FileInputLabel>
                              <Image size={16} />
                              Upload Photo
                              <FileInput 
                                type="file" 
                                accept="image/*"
                                ref={el => fileInputRefs.current[subLevel._id] = el}
                                onChange={(e) => handleFileChange(subLevel._id, e)}
                                disabled={isUploading}
                              />
                            </FileInputLabel>
                            
                            {isUploading && (
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                marginTop: '10px',
                                color: '#1a237e'
                              }}>
                                <Loader size={16} />
                                <span>Uploading...</span>
                              </div>
                            )}
                            
                            {subLevelPhotos.length > 0 && (
                              <PhotoPreviewContainer>
                                {subLevelPhotos.map((photo, idx) => (
                                  <PhotoPreview key={idx} onClick={() => setPhotoPreview(photo)}>
                                    <img src={photo} alt={`Photo ${idx + 1}`} />
                                    <button 
                                      className="remove-button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removePhoto(subLevel._id, photo);
                                      }}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </PhotoPreview>
                                ))}
                              </PhotoPreviewContainer>
                            )}
                          </ImageUploadWrapper>
                        </div>
                        
                        <TimeInputContainer>
                          <Timer size={16} color="#1a237e" />
                          <span style={{ fontSize: '14px', fontWeight: '500' }}>Time Spent (hours):</span>
                          <TimeInput 
                            type="number" 
                            min="0" 
                            step="0.01"
                            value={activeTimers[subLevel._id] ? subLevelTime.toFixed(2) : (subLevelTime.toFixed(2) || "0.00")}
                            onChange={(e) => handleTimeChange(subLevel._id, e.target.value)}
                            readOnly={activeTimers[subLevel._id]}
                          />
                          {activeTimers[subLevel._id] ? (
                            <ActionButton 
                              onClick={() => stopTimer(subLevel._id)}
                              style={{ backgroundColor: '#ffebee', color: '#d32f2f' }}
                            >
                              Stop Timer
                            </ActionButton>
                          ) : (
                            <ActionButton 
                              onClick={() => startTimer(subLevel._id)}
                              style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}
                            >
                              Start Timer
                            </ActionButton>
                          )}
                        </TimeInputContainer>
                      </ActionInput>
                      
                      <ButtonGroup>
                        <CompleteButton 
                          onClick={() => handleComplianceChange(subLevel._id, 'full_compliance')}
                          disabled={loading[subLevel._id]}
                        >
                          {loading[subLevel._id] ? <Loader size={16} /> : <CheckCircle size={16} />}
                          Full Compliance
                        </CompleteButton>
                        <PartialButton 
                          onClick={() => handleComplianceChange(subLevel._id, 'partial_compliance')}
                          disabled={loading[subLevel._id]}
                        >
                          {loading[subLevel._id] ? <Loader size={16} /> : <AlertCircle size={16} />}
                          Partial Compliance
                        </PartialButton>
                        <FailButton 
                          onClick={() => handleComplianceChange(subLevel._id, 'non_compliance')}
                          disabled={loading[subLevel._id]}
                        >
                          {loading[subLevel._id] ? <Loader size={16} /> : <XCircle size={16} />}
                          Non-Compliance
                        </FailButton>
                        <NAButton 
                          onClick={() => handleComplianceChange(subLevel._id, 'not_applicable')}
                          disabled={loading[subLevel._id]}
                        >
                          {loading[subLevel._id] ? <Loader size={16} /> : <HelpCircle size={16} />}
                          Not Applicable
                        </NAButton>
                      </ButtonGroup>
                    </>
                  )}
                  
                  {(isCompleted || isFailed || isPartial || isNotApplicable) && (
                    <>
                      {subLevelNotes && (
                        <div style={{ marginTop: '16px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                            <MessageSquare size={14} style={{ marginRight: '6px' }} />
                            Notes:
                          </div>
                          <div style={{ 
                            padding: '12px', 
                            background: 'rgba(248, 250, 252, 0.7)', 
                            borderRadius: '8px',
                            fontSize: '14px'
                          }}>
                            {subLevelNotes}
                          </div>
                        </div>
                      )}
                      
                      {subLevelPhotos.length > 0 && (
                        <div style={{ marginTop: '16px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                            <PaperclipIcon size={14} style={{ marginRight: '6px' }} />
                            Photos:
                          </div>
                          <PhotoPreviewContainer>
                            {subLevelPhotos.map((photo, idx) => (
                              <PhotoPreview key={idx} onClick={() => setPhotoPreview(photo)}>
                                <img src={photo} alt={`Photo ${idx + 1}`} />
                              </PhotoPreview>
                            ))}
                          </PhotoPreviewContainer>
                        </div>
                      )}
                      
                      {subLevelTime > 0 && (
                        <div style={{ marginTop: '16px', fontSize: '14px' }}>
                          <Timer size={14} style={{ marginRight: '6px' }} />
                          Time Spent: <strong>{subLevelTime.toFixed(2)} hours</strong>
                        </div>
                      )}
                    </>
                  )}
                  
                  {hasChildren && renderSubLevelTree(subLevel.subLevels, subLevel._id, level + 1)}
                </SubLevelContent>
              )}
            </SubLevelItem>
          );
        })}
      </SubLevelNestedContainer>
    );
  };
  
  // Calculate progress based on completed sublevels
  const overallProgress = task ? (task.overallProgress || 0) : 0;
  const isTaskCompleted = task && task.status === 'completed';
  
  // Render the photo lightbox if a photo is selected
  const renderPhotoLightbox = () => {
    if (!photoPreview) return null;
    
    return (
      <PhotoLightbox onClick={() => setPhotoPreview(null)}>
        <img src={photoPreview} alt="Enlarged preview" onClick={(e) => e.stopPropagation()} />
        <button className="close-button" onClick={() => setPhotoPreview(null)}>✕</button>
      </PhotoLightbox>
    );
  };
  
  return (
    <Container>
      <Title>
        <Activity size={20} />
        Inspection Performance
      </Title>
      
      {/* Scoring summary */}
      <ScoringSummary>
        <StatTitle>
          <Award size={20} />
          Compliance Scoring Summary
        </StatTitle>
        
        <ScoreGrid>
          <ScoreItem percent={scores.percentage}>
            <div className="score-label">Overall Compliance</div>
            <div className="score-value">
              {scores.achieved} / {scores.total}
              <span className="score-percent">({scores.percentage}%)</span>
            </div>
          </ScoreItem>
          
          <ScoreItem>
            <div className="score-label">Checkpoints</div>
            <div className="score-value">
              {task?.progress?.length || 0} Total
            </div>
          </ScoreItem>
          
          <ScoreItem>
            <div className="score-label">Status</div>
            <div className="score-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <StatusIcon status={task?.status || 'pending'} size={16} />
              {task?.status === 'completed' ? 'Completed' : 
               task?.status === 'in_progress' ? 'In Progress' : 'Pending'}
            </div>
          </ScoreItem>
        </ScoreGrid>
        
        <ScoringCriteria>
          <div className="criteria-item full">
            <CheckCircle size={14} /> Full Compliance: 2 points
          </div>
          <div className="criteria-item partial">
            <AlertCircle size={14} /> Partial Compliance: 1 point
          </div>
          <div className="criteria-item non">
            <XCircle size={14} /> Non-Compliance: 0 points
          </div>
          <div className="criteria-item na">
            <HelpCircle size={14} /> Not Applicable: Excluded
          </div>
        </ScoringCriteria>
        
        {/* Assessment areas section */}
        {scores.areas.length > 0 && (
          <AssessmentSection>
            <AssessmentTitle>
              <Clipboard size={18} />
              Assessment Areas
            </AssessmentTitle>
            <AssessmentTable>
              <thead>
                <tr>
                  <th>Area</th>
                  <th>Score</th>
                  <th>Compliance Rate</th>
                </tr>
              </thead>
              <tbody>
                {scores.areas.map((area, index) => (
                  <tr key={index}>
                    <td>{area.name}</td>
                    <td>{area.score} / {area.maxScore}</td>
                    <td>{Math.round(area.percentage)}%</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold', background: 'rgba(26, 35, 126, 0.05)' }}>
                  <td>Overall</td>
                  <td>{scores.achieved} / {scores.total}</td>
                  <td>{scores.percentage}%</td>
                </tr>
              </tbody>
            </AssessmentTable>
          </AssessmentSection>
        )}
      </ScoringSummary>
      
      {(!subLevels || subLevels.length === 0) ? (
        <NoSubLevelsMessage>
          <AlertTriangle size={48} color="#f59e0b" />
          <h3>No Template</h3>
          <p>There are no inspection levels defined for this task.</p>
        </NoSubLevelsMessage>
      ) : (
        <>
          <SubLevelTreeContainer>
            {renderSubLevelTree(subLevels)}
          </SubLevelTreeContainer>
          
          <ProgressBar progress={overallProgress}>
            <div className="fill"></div>
          </ProgressBar>
          
          <ProgressInfo>
            <span className="label">Overall Progress</span>
            <span className="percentage">{overallProgress}%</span>
          </ProgressInfo>
          
          {isTaskCompleted && (
            <StatsContainer>
              <StatTitle>
                <Activity size={20} />
                Task Completion Statistics
              </StatTitle>
              <StatGrid>
                <StatCard>
                  <div className="label">Total Sub-levels</div>
                  <div className="value">{progress?.length || 0}</div>
                </StatCard>
                <StatCard>
                  <div className="label">Completion Rate</div>
                  <div className="value">{overallProgress}%</div>
                </StatCard>
                <StatCard>
                  <div className="label">Time Spent</div>
                  <div className="value">{task.taskMetrics?.timeSpent || 0} hrs</div>
                </StatCard>
                <StatCard>
                  <div className="label">Overall Score</div>
                  <div className="value">{scores.achieved} / {scores.total}</div>
                </StatCard>
              </StatGrid>
              
              {onExportReport && (
                <ExportButton onClick={onExportReport}>
                  <FileText size={16} />
                  Export Inspection Report
                </ExportButton>
              )}
            </StatsContainer>
          )}
        </>
      )}
      
      {renderPhotoLightbox()}
    </Container>
  );
};

export default InspectionStepForm;