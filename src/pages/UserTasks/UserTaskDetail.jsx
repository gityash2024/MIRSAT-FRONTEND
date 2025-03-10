import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  ArrowLeft, Clock, Calendar, Map, AlertTriangle, Edit,
  CheckCircle, XCircle, Activity, PaperclipIcon, Send, 
  Download, Info, CheckSquare, Camera, FileText, Loader,
  Circle, MoreHorizontal
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  fetchUserTaskDetails, 
  updateUserTaskProgress,
  addUserTaskComment 
} from '../../store/slices/userTasksSlice';

const PageContainer = styled.div`
  padding: 24px;
  background-color: #f5f7fb;
  min-height: 100vh;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 16px;
  &:hover {
    color: #333;
  }
`;

const Header = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 8px;
`;

const Description = styled.p`
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
  white-space: pre-wrap;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 24px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
  svg {
    color: #1a237e;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 8px;
  
  ${props => {
    switch(props.status) {
      case 'pending':
        return 'background-color: #fff8e1; color: #f57c00;';
      case 'in_progress':
        return 'background-color: #e1f5fe; color: #0288d1;';
      case 'completed':
        return 'background-color: #e8f5e9; color: #388e3c;';
      case 'incomplete':
        return 'background-color: #ffebee; color: #d32f2f;';
      default:
        return 'background-color: #f5f5f5; color: #616161;';
    }
  }}
`;

const PriorityBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-left: 8px;
  
  ${props => {
    switch(props.priority) {
      case 'high':
        return 'background-color: #ffebee; color: #d32f2f;';
      case 'medium':
        return 'background-color: #fff8e1; color: #f57c00;';
      case 'low':
        return 'background-color: #e8f5e9; color: #2e7d32;';
      default:
        return 'background-color: #f5f5f5; color: #616161;';
    }
  }}
`;

const ProgressSection = styled.div`
  margin-top: 16px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
  
  .progress-fill {
    height: 100%;
    background-color: #1a237e;
    border-radius: 4px;
    width: ${props => props.progress}%;
  }
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .progress-label {
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }
  
  .progress-percentage {
    font-size: 14px;
    font-weight: 600;
    color: #1a237e;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
`;

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InspectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InspectionItem = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const InspectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px;
  background: #f8fafc;
  cursor: pointer;
  user-select: none;
  
  .inspection-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;
    color: #333;
  }
  
  .status-indicator {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${props => {
      switch(props.status) {
        case 'completed': return '#4caf50';
        case 'in_progress': return '#2196f3';
        default: return '#e0e0e0';
      }
    }};
  }
`;

const InspectionContent = styled.div`
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  
  .inspection-description {
    font-size: 14px;
    color: #666;
    margin-bottom: 16px;
  }
`;

const StatusButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const StatusButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  ${props => {
    switch(props.status) {
      case 'pending':
        return `
          background: #f5f5f5;
          color: #666;
          border: 1px solid #e0e0e0;
          &:hover { background: #eeeeee; }
        `;
      case 'in_progress':
        return `
          background: #e3f2fd;
          color: #1976d2;
          border: 1px solid #bbdefb;
          &:hover { background: #bbdefb; }
        `;
      case 'completed':
        return `
          background: #e8f5e9;
          color: #388e3c;
          border: 1px solid #c8e6c9;
          &:hover { background: #c8e6c9; }
        `;
      default:
        return `
          background: #f5f5f5;
          color: #666;
          border: 1px solid #e0e0e0;
          &:hover { background: #eeeeee; }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const NotesSection = styled.div`
  margin-top: 16px;
  
  .notes-label {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
  }
  
  textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    min-height: 100px;
    resize: vertical;
    margin-bottom: 16px;
    
    &:focus {
      outline: none;
      border-color: #1a237e;
      box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
    }
  }
`;

const SubmitButton = styled.button`
  padding: 8px 16px;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #151b4f;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PhotoUploadContainer = styled.div`
  margin-top: 16px;
  
  .photos-label {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
  }
  
  .upload-area {
    border: 2px dashed #e0e0e0;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      border-color: #1a237e;
    }
    
    p {
      font-size: 14px;
      color: #666;
      margin-top: 8px;
    }
  }
  
  input[type="file"] {
    display: none;
  }
`;

const PhotoPreviewsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;

const PhotoPreview = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .remove-button {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 12px;
    border: none;
  }
`;

const CommentSection = styled.div`
  margin-top: 24px;
`;

const CommentInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  
  textarea {
    padding: 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    min-height: 80px;
    resize: vertical;
    
    &:focus {
      outline: none;
      border-color: #1a237e;
      box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
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
  gap: 16px;
`;

const Comment = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .author {
    font-weight: 500;
    color: #333;
  }
  
  .timestamp {
    font-size: 12px;
    color: #666;
  }
  
  .content {
    color: #666;
    font-size: 14px;
    line-height: 1.5;
  }
`;

const ProgressWidget = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 200px;
  position: relative;
  margin-bottom: 24px;
  
  .progress-circle {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: conic-gradient(
      #1a237e ${props => props.progress}%, 
      #f1f5f9 ${props => props.progress}% 100%
    );
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &::before {
      content: '';
      position: absolute;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: white;
    }
  }
  
  .progress-text {
    position: absolute;
    font-size: 24px;
    font-weight: 700;
    color: #1a237e;
  }
  
  .progress-label {
    margin-top: 16px;
    font-size: 14px;
    color: #666;
  }
`;

const TaskMetrics = styled.div`
  margin-top: 24px;
`;

const MetricCard = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  
  .metric-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }
  
  .metric-value {
    font-size: 18px;
    font-weight: 600;
    color: #1a237e;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const AttachmentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  
  .file-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .file-name {
    font-size: 14px;
    color: #333;
  }
  
  a {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 4px;
    background: #1a237e;
    color: white;
    text-decoration: none;
    font-size: 12px;
    
    &:hover {
      background: #151b4f;
    }
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
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

const UserTaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  
  const { currentTask, taskDetailsLoading, actionLoading, error } = useSelector(state => state.userTasks);
  
  const [expandedItems, setExpandedItems] = useState({});
  const [selectedSubLevel, setSelectedSubLevel] = useState(null);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (taskId) {
      dispatch(fetchUserTaskDetails(taskId));
    }
    
    return () => {
      // Reset state when component unmounts
      setExpandedItems({});
      setSelectedSubLevel(null);
      setNotes('');
      setPhotos([]);
      setNewComment('');
    };
  }, [taskId, dispatch]);

  const toggleExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Simple validation
    const validFiles = files.filter(file => 
      file.type.match('image.*') && file.size <= 5 * 1024 * 1024 // 5MB limit
    );
    
    if (validFiles.length !== files.length) {
      toast.error('Some files were rejected. Images must be under 5MB.');
    }
    
    // Convert to base64 for preview
    const newPhotos = [...photos];
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPhotos.push({
          file,
          preview: e.target.result
        });
        setPhotos([...newPhotos]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleStatusChange = async (status) => {
    if (!selectedSubLevel) return;
    
    setIsSubmitting(true);
    
    try {
      // Create an array of photo URLs (would typically be uploaded to a server)
      const photoUrls = photos.map((photo, index) => 
        `photo_${Date.now()}_${index}.jpg` // This is a placeholder
      );
      
      await dispatch(updateUserTaskProgress({
        taskId,
        subLevelId: selectedSubLevel,
        data: {
          status,
          notes,
          photos: photoUrls
        }
      })).unwrap();
      
      // Reset form state
      setNotes('');
      setPhotos([]);
      setSelectedSubLevel(null);
    } catch (error) {
      console.error('Failed to update status:', error);
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
      console.error('Failed to add comment:', error);
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

  if (taskDetailsLoading && !currentTask) {
    return (
      <PageContainer>
        <BackButton onClick={() => navigate('/user-tasks')}>
          <ArrowLeft size={18} />
          Back to Tasks
        </BackButton>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Loader size={30} color="#1a237e" />
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
            style={{ marginTop: '16px' }}
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
          <Loader size={40} color="#1a237e" />
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
            <Description>{currentTask.description}</Description>
          </TitleSection>
          
          <StatusBadge status={currentTask.status}>
            <StatusIcon status={currentTask.status} />
            {currentTask.status.charAt(0).toUpperCase() + currentTask.status.slice(1).replace('_', ' ')}
          </StatusBadge>
        </HeaderContent>
        
        <MetaGrid>
          <MetaItem>
            <Calendar size={16} />
            <strong>Due Date:</strong> {formatDate(currentTask.deadline)}
          </MetaItem>
          
          <MetaItem>
            <AlertTriangle size={16} />
            <strong>Priority:</strong>
            <PriorityBadge priority={currentTask.priority}>
              {currentTask.priority.charAt(0).toUpperCase() + currentTask.priority.slice(1)}
            </PriorityBadge>
          </MetaItem>
          
          {currentTask.location && (
            <MetaItem>
              <Map size={16} />
              <strong>Location:</strong> {currentTask.location}
            </MetaItem>
          )}
          
          <MetaItem>
            <Info size={16} />
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
      </Header>
      
      <ContentGrid>
        <div>
          <Card>
            <CardTitle>
              <CheckSquare size={20} />
              Inspection Items
            </CardTitle>
            
            <InspectionList>
              {currentTask.inspectionLevel?.subLevels?.map((item) => {
                const itemId = item._id;
                const isExpanded = expandedItems[itemId];
                const status = getSubLevelStatus(itemId);
                const existingNotes = getSubLevelNotes(itemId);
                const isSelected = selectedSubLevel === itemId;
                
                return (
                  <InspectionItem key={itemId}>
                    <InspectionHeader 
                      onClick={() => toggleExpand(itemId)}
                      status={status}
                    >
                      <div className="inspection-title">
                        <div className="status-indicator" />
                        {item.name}
                      </div>
                      
                      <StatusBadge status={status}>
                        <StatusIcon status={status} size={14} />
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                      </StatusBadge>
                    </InspectionHeader>
                    
                    {isExpanded && (
                      <InspectionContent>
                        <div className="inspection-description">
                          {item.description}
                        </div>
                        
                        {existingNotes && (
                          <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontWeight: 500, marginBottom: '4px' }}>Notes:</div>
                            <div style={{ 
                              padding: '12px', 
                              background: '#f5f5f5', 
                              borderRadius: '8px',
                              fontSize: '14px'
                            }}>
                              {existingNotes}
                            </div>
                          </div>
                        )}
                        
                        {status !== 'completed' && (
                          <>
                            <StatusButtonGroup>
                              <StatusButton 
                                status={isSelected && status === 'pending' ? 'in_progress' : 'in_progress'}
                                onClick={() => setSelectedSubLevel(isSelected ? null : itemId)}
                              >
                                {isSelected ? 'Cancel' : 'Update Status'}
                              </StatusButton>
                              
                              {isSelected && (
                                <>
                                  <StatusButton 
                                    status="in_progress"
                                    onClick={() => handleStatusChange('in_progress')}
                                    disabled={isSubmitting || status === 'in_progress'}
                                  >
                                    <Activity size={16} />
                                    Mark as In Progress
                                  </StatusButton>
                                  
                                  <StatusButton 
                                    status="completed"
                                    onClick={() => handleStatusChange('completed')}
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
                                    <Camera size={24} color="#1a237e" />
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
                );
              })}
            </InspectionList>
          </Card>
          
          <Card>
            <CardTitle>
              <FileText size={20} />
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
                    <span className="author">{comment.user?.name || 'User'}</span>
                    <span className="timestamp">{formatDateTime(comment.createdAt)}</span>
                  </div>
                  <p className="content">{comment.content}</p>
                </Comment>
              ))}
              
              {(!currentTask.comments || currentTask.comments.length === 0) && (
                <p style={{ color: '#666', fontSize: '14px', textAlign: 'center' }}>
                  No comments yet
                </p>
              )}
            </CommentList>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardTitle>
              <Activity size={20} />
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
                  <Clock size={16} color="#1976d2" />
                  {currentTask.taskMetrics?.timeSpent || 0} hours
                </div>
              </MetricCard>
              
              <MetricCard>
                <div className="metric-label">Items Completed</div>
                <div className="metric-value">
                  <CheckCircle size={16} color="#388e3c" />
                  {currentTask.taskMetrics?.userProgress || 0} of {currentTask.taskMetrics?.totalSubTasks || 0}
                </div>
              </MetricCard>
              
              <MetricCard>
                <div className="metric-label">Your Completion Rate</div>
                <div className="metric-value">
                  <Activity size={16} color="#f57c00" />
                  {currentTask.taskMetrics?.completionRate || 0}%
                </div>
              </MetricCard>
            </TaskMetrics>
          </Card>
          
          <Card>
            <CardTitle>
              <PaperclipIcon size={20} />
              Attachments
            </CardTitle>
            
            {currentTask.attachments?.length > 0 ? (
              <AttachmentList>
                {currentTask.attachments.map((attachment, index) => (
                  <AttachmentItem key={index}>
                    <div className="file-info">
                      <PaperclipIcon size={16} color="#1a237e" />
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
              <p style={{ color: '#666', fontSize: '14px', textAlign: 'center' }}>
                No attachments available
              </p>
            )}
          </Card>
          
          <Card>
            <CardTitle>
              <Clock size={20} />
              Status History
            </CardTitle>
            
            {currentTask.statusHistory?.length > 0 ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px' 
              }}>
                {currentTask.statusHistory.map((status, index) => (
                  <div 
                    key={index}
                    style={{
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: '4px'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px' 
                      }}>
                        <StatusIcon status={status.status} size={16} />
                        <span style={{ fontWeight: 500 }}>
                          {status.status.charAt(0).toUpperCase() + status.status.slice(1).replace('_', ' ')}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {formatDateTime(status.timestamp)}
                      </span>
                    </div>
                    
                    {status.comment && (
                      <div style={{ marginTop: '4px', color: '#666' }}>
                        {status.comment}
                      </div>
                    )}
                    
                    <div style={{ 
                      marginTop: '4px', 
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      By: {status.changedBy?.name || 'User'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#666', fontSize: '14px', textAlign: 'center' }}>
                No status changes recorded
              </p>
            )}
          </Card>
        </div>
      </ContentGrid>
    </PageContainer>
  );
};

export default UserTaskDetail;