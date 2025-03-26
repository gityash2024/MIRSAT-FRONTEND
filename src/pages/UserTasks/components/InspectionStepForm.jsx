import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { 
  ChevronDown, ChevronUp, CheckCircle, XCircle, 
  AlertTriangle, Clock, Loader, FileText,
  PaperclipIcon, MessageSquare, Timer, Image,
  Trash2
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
        return 'background-color: rgba(232, 245, 233, 0.8); color: #2e7d32; border: 1px solid rgba(46, 125, 50, 0.2);';
      case 'failed':
      case 'incomplete':
        return 'background-color: rgba(255, 235, 238, 0.8); color: #d32f2f; border: 1px solid rgba(211, 47, 47, 0.2);';
      case 'in_progress':
        return 'background-color: rgba(227, 242, 253, 0.8); color: #0277bd; border: 1px solid rgba(2, 119, 189, 0.2);';
      default:
        return 'background-color: rgba(245, 245, 245, 0.8); color: #616161; border: 1px solid rgba(97, 97, 97, 0.2);';
    }
  }}
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

const FailButton = styled(ActionButton)`
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  color: #c62828;
  box-shadow: 0 2px 8px rgba(229, 57, 53, 0.15);
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
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const StatusIcon = ({ status, size = 18 }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle size={size} color="#388e3c" />;
    case 'failed':
    case 'incomplete':
      return <XCircle size={size} color="#d32f2f" />;
    case 'in_progress':
      return <Timer size={size} color="#0277bd" />;
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

const AttachmentList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.8);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  position: relative;
`;

const RemoveButton = styled.button`
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(211, 47, 47, 0.3);
  color: #d32f2f;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 6px;
  padding: 0;
  
  &:hover {
    background: #ffebee;
  }
`;

const PhotoPreviewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
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

const InspectionStepForm = ({ task, onUpdateProgress, onExportReport }) => {
  const dispatch = useDispatch();
  const [expandedSubLevels, setExpandedSubLevels] = useState({});
  const [loading, setLoading] = useState({});
  const [notes, setNotes] = useState({});
  const [timeSpent, setTimeSpent] = useState({});
  const [photos, setPhotos] = useState({});
  const [activeTimers, setActiveTimers] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRefs = useRef({});
  const timerRefs = useRef({});
  
  // Initialize from existing task data
  useEffect(() => {
    if (task && task.progress && task.progress.length > 0) {
      const notesObj = {};
      const timeObj = {};
      const photosObj = {};
      
      task.progress.forEach(p => {
        if (p && p.subLevelId) {
          const id = typeof p.subLevelId === 'string' 
            ? p.subLevelId 
            : (p.subLevelId._id || p.subLevelId.id || p.subLevelId);
          
          notesObj[id] = p.notes || '';
          timeObj[id] = p.timeSpent || 0;
          photosObj[id] = p.photos || [];
        }
      });
      
      setNotes(notesObj);
      setTimeSpent(timeObj);
      setPhotos(photosObj);
      
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
  
  const handleUpdateSubLevel = async (subLevelId, status) => {
    // Validate inputs if completing
    if (status === 'completed') {
      const subLevelNotes = notes[subLevelId] || '';
      const subLevelPhotos = photos[subLevelId] || [];
      
      // Check if inspection level requires photos
      if (task.inspectionLevel?.completionCriteria?.requiredPhotos && 
         (!subLevelPhotos || subLevelPhotos.length === 0)) {
        toast.error('Please add at least one photo before completing this item');
        return;
      }
      
      // Check if inspection level requires notes
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
      
      toast.success(`Sublevel marked as ${status}`);
      if (onUpdateProgress) onUpdateProgress(updatedTask);
      
      // Stop timer if running
      if (activeTimers[subLevelId]) {
        stopTimer(subLevelId);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update sublevel status');
    } finally {
      setLoading(prev => ({ ...prev, [subLevelId]: false }));
    }
  };
  
  // Get progress status for a specific sublevel
  const getSubLevelStatus = (subLevelId) => {
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
          const isCompleted = status === 'completed';
          const isFailed = status === 'failed' || status === 'incomplete';
          const isInProgress = status === 'in_progress';
          const isTaskCompleted = task && task.status === 'completed';
          
          const subLevelNotes = notes[subLevel._id] || '';
          const subLevelPhotos = photos[subLevel._id] || [];
          const subLevelTime = timeSpent[subLevel._id] || 0;
          
          return (
            <SubLevelItem key={subLevel._id}>
              <SubLevelHeader onClick={() => toggleSubLevel(subLevel._id)}>
                <SubLevelTitle>
                  <StatusIcon status={status} />
                  {subLevel.name || 'Unnamed'}
                </SubLevelTitle>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <StatusBadge status={status}>
                    {status === 'completed' ? 'Completed' : 
                     status === 'failed' || status === 'incomplete' ? 'Failed' : 
                     status === 'in_progress' ? 'In Progress' : 'Pending'}
                  </StatusBadge>
                  {hasChildren && (isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
                </div>
              </SubLevelHeader>
              
              {isExpanded && (
                <SubLevelContent>
                  {subLevel.description && (
                    <SubLevelDescription>{subLevel.description}</SubLevelDescription>
                  )}
                  
                  {!isTaskCompleted && !isCompleted && !isFailed && (
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
                          <FileInputLabel>
                            <Image size={16} />
                            Upload Photo
                            <FileInput 
                              type="file" 
                              accept="image/*"
                              ref={el => fileInputRefs.current[subLevel._id] = el}
                              onChange={(e) => handleFileChange(subLevel._id, e)}
                            />
                          </FileInputLabel>
                          
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
                          onClick={() => handleUpdateSubLevel(subLevel._id, 'completed')}
                          disabled={loading[subLevel._id]}
                        >
                          {loading[subLevel._id] ? <Loader size={16} /> : <CheckCircle size={16} />}
                          Mark as Completed
                        </CompleteButton>
                        <FailButton 
                          onClick={() => handleUpdateSubLevel(subLevel._id, 'failed')}
                          disabled={loading[subLevel._id]}
                        >
                          {loading[subLevel._id] ? <Loader size={16} /> : <XCircle size={16} />}
                          Mark as Failed
                        </FailButton>
                      </ButtonGroup>
                    </>
                  )}
                  
                  {(isCompleted || isFailed || isInProgress) && (
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
      <Title>Inspection Performance</Title>
      
      {(!subLevels || subLevels.length === 0) ? (
        <NoSubLevelsMessage>
          <AlertTriangle size={48} color="#f59e0b" />
          <h3>No Inspection Levels</h3>
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
              <StatTitle>Task Completion Statistics</StatTitle>
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