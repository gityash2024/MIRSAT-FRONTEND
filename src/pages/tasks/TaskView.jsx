import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { 
  ArrowLeft, Edit, Clock, User, Calendar, AlertTriangle, 
  Send, Download, Paperclip, BarChart, TrendingUp, Users,
  Circle, ChevronRight, Filter, FileText, HelpCircle, CheckSquare, Database, MapPin,
  Upload, Trash2, Info, Activity, CheckCircle as CheckCircleIcon, XCircle, 
  Award, Star, Target, Zap, BarChart2, PieChart, Eye, EyeOff, Search, 
  RotateCw, Save, Play, Pause, RefreshCcw, List, Grid, Navigation, 
  Maximize2, Minimize2, ChevronDown, Loader, MessageSquare, AlertTriangle as AlertTriangleIcon
} from 'lucide-react';
import { LineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { toast } from 'react-hot-toast';
import TaskStatus from './components/TaskStatus';
import TaskPriority from './components/TaskPriority';
import TaskAssignee from './components/TaskAssignee';
import { getTaskById, addTaskComment, updateTaskStatus, uploadTaskAttachment, deleteTaskAttachment } from '../../store/slices/taskSlice';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../utils/permissions';
import Skeleton from '../../components/ui/Skeleton';

const PageContainer = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderFilters = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  min-width: 200px;
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
  &:hover {
    color: #333;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
  margin: 0 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 8px;
`;

const SubTitle = styled.p`
  color: #666;
  font-size: 14px;
`;

const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid var(--color-navy);
  color: var(--color-navy);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: var(--color-navy);
    color: white;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 24px;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Description = styled.p`
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  
  .icon {
    color: var(--color-navy);
    flex-shrink: 0;
  }
  
  strong {
    color: #374151;
    margin-right: 4px;
  }
`;

// Enhanced components for inspection progress
const ProgressSection = styled.div`
  margin-top: 20px;
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
  margin: 0;
`;

const ProgressValue = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: var(--color-navy);
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-navy), #3b82f6);
    border-radius: 8px;
    transition: width 0.6s ease;
  }
`;

const InspectionLevelsContainer = styled.div`
  margin-top: 20px;
`;

const LevelItem = styled.div`
  padding: 16px;
  margin-bottom: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  
  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e0;
  }
`;

const LevelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const LevelName = styled.h5`
  font-size: 14px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
`;

const LevelStatus = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  
  ${props => {
    switch(props.status) {
      case 'completed':
        return 'background: #dcfce7; color: #166534;';
      case 'in_progress':
        return 'background: #dbeafe; color: #1e40af;';
      case 'pending':
        return 'background: #fef3c7; color: #92400e;';
      default:
        return 'background: #f3f4f6; color: #6b7280;';
    }
  }}
`;

const SubLevelsList = styled.div`
  margin-left: 20px;
  margin-top: 12px;
`;

const SubLevelItem = styled.div`
  padding: 8px 12px;
  margin-bottom: 8px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  font-size: 13px;
  color: #374151;
  
  &:hover {
    background: #f9fafb;
  }
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

const AnalyticsCard = styled.div`
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e2e8f0;
  
  ${props => {
    switch(props.type) {
      case 'progress':
        return 'background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #1e40af;';
      case 'completion':
        return 'background: linear-gradient(135deg, #dcfce7, #bbf7d0); color: #166534;';
      case 'time':
        return 'background: linear-gradient(135deg, #fef3c7, #fde68a); color: #92400e;';
      case 'quality':
        return 'background: linear-gradient(135deg, #f3e8ff, #e9d5ff); color: #7c3aed;';
      default:
        return 'background: #f8fafc; color: #374151;';
    }
  }}
`;

const AnalyticsValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  margin: 8px 0;
`;

const AnalyticsLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ChartContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  border: 1px solid #e2e8f0;
`;

const ChartTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 16px;
  text-align: center;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
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

const MilestoneTimeline = styled.div`
  margin-top: 20px;
  position: relative;
  padding-left: 24px;
  &:before {
    content: '';
    position: absolute;
    left: 7px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #e2e8f0;
  }
`;

const MilestoneItem = styled.div`
  position: relative;
  padding: 16px 0;
  &:not(:last-child) {
    border-bottom: 1px solid #f1f5f9;
  }
`;

const MilestoneContent = styled.div`
  margin-left: 8px;
`;

const MilestoneHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const MilestoneTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: #333;
`;

const MilestoneDot = styled.div`
  position: absolute;
  left: -24px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${({ status }) => 
    status === 'completed' ? '#10b981' : 
    status === 'in_progress' ? '#3b82f6' : 
    '#e2e8f0'};
  border: 2px solid white;
`;

const MilestoneStatus = styled.span`
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  background: ${({ status }) => 
    status === 'completed' ? '#ecfdf5' : 
    status === 'in_progress' ? '#eff6ff' : 
    '#f8fafc'};
  color: ${({ status }) => 
    status === 'completed' ? '#10b981' : 
    status === 'in_progress' ? '#3b82f6' : 
    '#64748b'};
`;

const MilestoneDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 8px 0;
`;

const MilestoneProgress = styled.div`
  margin-top: 12px;
`;

const AssigneeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const AssigneeName = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: #333;
`;

const AssigneeStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;

const ChartCard = styled(Card)`
  height: 340px;
`;

const CommentSection = styled.div`
  margin-top: 24px;
`;

const CommentInput = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  textarea {
    flex: 1;
    padding: 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    min-height: 80px;
    resize: vertical;
    &:focus {
      outline: none;
      border-color: var(--color-navy);
    }
  }
`;
const AssigneeProgress = styled.div`
  margin-top: 24px;
`;

const AssigneeCard = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
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

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${props => props.$variant === 'danger' ? '#ef4444' : 
               props.$variant === 'secondary' ? 'white' : 'var(--color-navy)'};
  color: ${props => props.$variant === 'secondary' ? 'var(--color-navy)' : 'white'};
  border: ${props => props.$variant === 'secondary' ? '1px solid var(--color-navy)' : 'none'};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$variant === 'danger' ? '#dc2626' : 
                props.$variant === 'secondary' ? '#f8fafc' : '#151b4f'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const QuestionsCard = styled(Card)`
  margin-bottom: 24px;
`;

const QuestionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const QuestionItem = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 3px solid var(--color-navy);
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const QuestionText = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
`;

const QuestionType = styled.span`
  background: #e3f2fd;
  color: var(--color-navy);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const QuestionOptions = styled.div`
  margin-top: 8px;
  font-size: 14px;
  color: #666;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  margin-right: 8px;
  border-radius: 4px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
`;

// Add TaskViewSkeleton component
const TaskViewSkeleton = () => (
  <PageContainer>
    <Header>
      <HeaderTop>
        <BackButton disabled>
          <Skeleton.Circle size="18px" />
          <Skeleton.Base width="100px" height="16px" />
        </BackButton>
        <HeaderContent>
          <Skeleton.Base width="70%" height="28px" margin="0 0 8px 0" />
          <Skeleton.Base width="40%" height="16px" />
        </HeaderContent>
        <Skeleton.Button width="120px" height="40px" />
      </HeaderTop>
      
      <HeaderFilters>
        <Skeleton.Circle size="16px" />
        <Skeleton.Base width="200px" height="38px" radius="6px" />
      </HeaderFilters>
    </Header>

    <ContentGrid>
      <MainContent>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Skeleton.Circle size="20px" />
            <Skeleton.Base width="120px" height="20px" />
          </div>
          <Skeleton.Base width="90%" height="60px" margin="0 0 24px 0" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {Array(3).fill().map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Skeleton.Circle size="16px" />
                <Skeleton.Base width="80%" height="24px" />
              </div>
            ))}
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Skeleton.Circle size="20px" />
              <Skeleton.Base width="150px" height="20px" />
            </div>
            <Skeleton.Base width="100%" height="200px" radius="8px" />
          </div>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Skeleton.Circle size="20px" />
              <Skeleton.Base width="180px" height="20px" />
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {Array(3).fill().map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                  <Skeleton.Circle size="40px" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Skeleton.Base width="120px" height="16px" />
                      <Skeleton.Base width="80px" height="14px" />
                    </div>
                    <Skeleton.Base width="100%" height="40px" />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <Skeleton.Base width="85%" height="42px" radius="8px" />
              <Skeleton.Button width="15%" height="42px" />
            </div>
          </div>
        </Card>
      </MainContent>
      
      <Sidebar>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Skeleton.Circle size="20px" />
            <Skeleton.Base width="120px" height="20px" />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            {Array(3).fill().map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Skeleton.Circle size="16px" />
                <Skeleton.Base width="70%" height="16px" />
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', marginTop: '24px' }}>
            <Skeleton.Circle size="20px" />
            <Skeleton.Base width="140px" height="20px" />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            {Array(2).fill().map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Skeleton.Circle size="16px" />
                <Skeleton.Base width={`${120 + Math.random() * 60}px`} height="16px" />
              </div>
            ))}
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <Skeleton.Base width="100%" height="150px" radius="8px" />
          </div>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Skeleton.Circle size="20px" />
              <Skeleton.Base width="150px" height="20px" />
            </div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {Array(3).fill().map((_, i) => (
                <Skeleton.Base key={i} width="100%" height="32px" radius="16px" />
              ))}
            </div>
          </div>
        </Card>
      </Sidebar>
    </ContentGrid>
  </PageContainer>
);

const TaskView = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { hasPermission } = usePermissions();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [sublevelsModal, setSublevelsModal] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [preInspectionModalOpen, setPreInspectionModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  
  const { currentTask: task, loading, error } = useSelector((state) => state.tasks);

  // Utility function to safely access nested properties
  const getTaskDataOrDefault = (taskObj, path, defaultValue = '') => {
    try {
      if (!taskObj) return defaultValue;
      
      const keys = path.split('.');
      let value = taskObj;
      
      for (const key of keys) {
        if (value === null || value === undefined) return defaultValue;
        value = value[key];
      }
      
      return value === null || value === undefined ? defaultValue : value;
    } catch (error) {
      console.error(`Error accessing path ${path}:`, error);
      return defaultValue;
    }
  };

  useEffect(() => {
    if (taskId && taskId !== 'undefined') {
      dispatch(getTaskById(taskId));
    }
  }, [dispatch, taskId]);

  // Set initial assignee when task loads
  useEffect(() => {
    if (task && task.assignedTo && task.assignedTo.length > 0) {
      // setSelectedAssignee(task.assignedTo[0]._id || task.assignedTo[0].id); // Removed as per edit hint
    }
  }, [task]);

  // Debug effect to check what data is received
  useEffect(() => {
    if (task) {
      console.log('Task data received:', task);
      console.log('Task assignedTo:', task.assignedTo);
      console.log('Task asset:', task.asset);
      console.log('Task comments:', task.comments);
      console.log('Task inspection data:', task.inspectionLevel);
    }
  }, [task]);

  const handleAddComment = async () => {
    if (!taskId) {
      toast.error('Task ID is missing');
      return;
    }
    
    if (!comment.trim()) return;
    
    try {
      setIsSubmitting(true);
      console.log('Adding comment with params:', { id: taskId, content: comment });
      const result = await dispatch(addTaskComment({ 
        id: taskId, 
        content: comment 
      })).unwrap();
      console.log('Comment added result:', result);
      setComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!taskId) {
      toast.error('Task ID is missing');
      return;
    }
    
    try {
      console.log('Updating status with params:', { id: taskId, status: newStatus });
      const result = await dispatch(updateTaskStatus({ 
        id: taskId, 
        status: newStatus 
      })).unwrap();
      console.log('Status update result:', result);
      toast.success('Task status updated successfully');
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleFileUpload = async (event) => {
    if (!taskId) {
      toast.error('Task ID is missing');
      return;
    }
    
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setUploadingFile(true);
      console.log('Uploading files:', files.length);
      
      await dispatch(uploadTaskAttachment({ 
        id: taskId, 
        files 
      })).unwrap();
      
      // Refresh task data to show the new attachment
      dispatch(getTaskById(taskId));
      toast.success('Files uploaded successfully');
      
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files. Please try again.');
    } finally {
      setUploadingFile(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!taskId || !attachmentId) {
      toast.error('Task ID or Attachment ID is missing');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this attachment?')) return;
    
    try {
      await dispatch(deleteTaskAttachment({
        id: taskId,
        attachmentId
      })).unwrap();
      
      toast.success('Attachment deleted successfully');
      // Refresh task data
      dispatch(getTaskById(taskId));
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('Failed to delete attachment');
    }
  };

  // Show loading skeleton while task is being fetched
  if (loading && !task) {
    return (
      <PageContainer>
        <Header>
          <HeaderTop>
            <BackButton disabled>
              <ArrowLeft size={18} />
              Back to Tasks
            </BackButton>
            <HeaderContent>
              <Skeleton.Base width="300px" height="32px" />
              <Skeleton.Base width="200px" height="20px" style={{ marginTop: '8px' }} />
            </HeaderContent>
          </HeaderTop>
        </Header>
        
        <ContentGrid>
          <MainContent>
            <Card>
              <Skeleton.Base width="100%" height="200px" />
            </Card>
          </MainContent>
          
          <Sidebar>
            <Card>
              <Skeleton.Base width="100%" height="150px" />
            </Card>
          </Sidebar>
        </ContentGrid>
      </PageContainer>
    );
  }

  // Show error state if task failed to load
  if (error && !task) {
    return (
      <PageContainer>
        <Header>
          <HeaderTop>
            <BackButton onClick={() => navigate('/tasks')}>
              <ArrowLeft size={18} />
              Back to Tasks
            </BackButton>
            <HeaderContent>
              <PageTitle>Error Loading Task</PageTitle>
              <SubTitle>Unable to load task details</SubTitle>
            </HeaderContent>
          </HeaderTop>
        </Header>
        
        <ContentGrid>
          <MainContent>
            <Card>
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <AlertTriangle size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
                <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>Failed to Load Task</h3>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>
                  {error || 'An error occurred while loading the task details.'}
                </p>
                <button
                  onClick={() => dispatch(getTaskById(taskId))}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--color-navy)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Try Again
                </button>
              </div>
            </Card>
          </MainContent>
        </ContentGrid>
      </PageContainer>
    );
  }

  // Show not found state if task doesn't exist
  if (!loading && !task) {
    return (
      <PageContainer>
        <Header>
          <HeaderTop>
            <BackButton onClick={() => navigate('/tasks')}>
              <ArrowLeft size={18} />
              Back to Tasks
            </BackButton>
            <HeaderContent>
              <PageTitle>Task Not Found</PageTitle>
              <SubTitle>The requested task could not be found</SubTitle>
            </HeaderContent>
          </HeaderTop>
        </Header>
        
        <ContentGrid>
          <MainContent>
            <Card>
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <HelpCircle size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
                <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>Task Not Found</h3>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>
                  The task you're looking for doesn't exist or has been removed.
                </p>
                <button
                  onClick={() => navigate('/tasks')}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--color-navy)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Back to Tasks
                </button>
              </div>
            </Card>
          </MainContent>
        </ContentGrid>
      </PageContainer>
    );
  }

  // Extract task data from the response
  const taskData = task.data || task;
  
  // Check for valid task data properties
  const hasValidTaskData = taskData && typeof taskData === 'object';
  const hasValidAssignees = Array.isArray(taskData.assignedTo);
  const hasValidAsset = taskData.asset && typeof taskData.asset === 'object';
  const hasValidComments = Array.isArray(taskData.comments);
  const hasValidSubLevels = Array.isArray(taskData.inspectionLevel?.subLevels);
  const hasValidAttachments = Array.isArray(taskData.attachments);

  // These helper functions need to be defined AFTER taskData is initialized
  const getSubLevelStatus = (subLevelId) => {
    if (!taskData || !taskData.progress) return 'pending';
    const progressItem = taskData.progress.find(p => p && p.subLevelId === subLevelId);
    return progressItem?.status || 'pending';
  };

  const calculateAssigneeProgress = (assigneeId) => {
    if (!taskData || !taskData.progress || !taskData.inspectionLevel) {
      return { completed: 0, inProgress: 0, total: 0, percentage: 0 };
    }
    
    const assigneeProgress = taskData.progress.filter(p => p && p.completedBy && p.completedBy._id === assigneeId);
    const completed = assigneeProgress?.filter(p => p.status === 'completed').length || 0;
    const inProgress = assigneeProgress?.filter(p => p.status === 'in_progress').length || 0;
    const total = Array.isArray(taskData.inspectionLevel?.subLevels) ? taskData.inspectionLevel.subLevels.length : 0;
    
    return {
      completed,
      inProgress,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  // Safe check for inspectionData to avoid errors
  let inspectionData = [];
  if (taskData && taskData.inspectionLevel && Array.isArray(taskData.inspectionLevel.subLevels)) {
    inspectionData = taskData.inspectionLevel.subLevels.map(level => ({
      name: level.name || 'Unnamed',
      completed: getSubLevelStatus(level._id) === 'completed' ? 100 : 
                getSubLevelStatus(level._id) === 'in_progress' ? 50 : 0
    }));
  }

  // Make sure we have at least some data for the chart to avoid errors
  const chartData = inspectionData.length > 0 ? inspectionData : [{ name: 'No Data', completed: 0 }];

  const renderQuestionType = (type) => {
    switch(type) {
      case 'yesNo':
        return 'Yes/No/NA';
      case 'compliance':
        return 'Compliance Levels';
      case 'custom':
        return 'Custom Options';
      default:
        return type;
    }
  };
  
  // Debug info
  console.log('Task validation:', { 
    hasValidTask: hasValidTaskData, 
    hasValidComments, 
    hasValidSubLevels, 
    hasValidAttachments 
  });

  return (
    <PageContainer>
      <Header>
        <HeaderTop>
          <BackButton onClick={() => navigate('/tasks')}>
            <ArrowLeft size={18} />
            Back to Tasks
          </BackButton>
          <HeaderContent>
            <PageTitle>{getTaskDataOrDefault(taskData, 'title', 'Untitled Task')}</PageTitle>
            <SubTitle>Task Details and Progress</SubTitle>
          </HeaderContent>
          {hasPermission(PERMISSIONS.TASKS.EDIT_TASKS) && (
            <EditButton onClick={() => navigate(`/tasks/${taskId}/edit`)}>
              <Edit size={16} />
              Edit Task
            </EditButton>
          )}
        </HeaderTop>
      </Header>

      <ContentGrid>
        <MainContent>
          {/* Task Overview Card */}
          <Card>
            <CardTitle>
              <BarChart size={20} />
              Task Overview
            </CardTitle>
            
            {/* Task Summary Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '16px', 
              marginBottom: '24px',
              padding: '0 16px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #3788d8 0%, #2c5aa0 100%)',
                padding: '20px',
                borderRadius: '12px',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>TASK ID</div>
                <div style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'monospace' }}>
                  {taskId}
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #27ae60 0%, #1e8449 100%)',
                padding: '20px',
                borderRadius: '12px',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>TOTAL SECTIONS</div>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>
                  {taskData.inspectionLevel?.subLevels ? taskData.inspectionLevel.subLevels.length : 0}
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                padding: '20px',
                borderRadius: '12px',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>TOTAL QUESTIONS</div>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>
                  {taskData.inspectionLevel?.subLevels ? 
                    taskData.inspectionLevel.subLevels.reduce((total, level) => 
                      total + (level.questions ? level.questions.length : 0), 0
                    ) : 0}
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                padding: '20px',
                borderRadius: '12px',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>COMMENTS</div>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>
                  {taskData.comments ? taskData.comments.length : 0}
                </div>
              </div>
            </div>
            <Description>{getTaskDataOrDefault(taskData, 'description', 'No description provided')}</Description>

            <MetaGrid>
              <MetaItem>
                <Calendar size={16} className="icon" />
                <strong>Due Date:</strong>
                {taskData.deadline ? new Date(taskData.deadline).toLocaleDateString() : 'No deadline set'}
              </MetaItem>
              <MetaItem>
                <AlertTriangle size={16} className="icon" />
                <strong>Priority:</strong>
                <TaskPriority priority={getTaskDataOrDefault(taskData, 'priority', 'medium')} />
              </MetaItem>
              <MetaItem>
                <Clock size={16} className="icon" />
                <strong>Status:</strong>
                <TaskStatus 
                  status={getTaskDataOrDefault(taskData, 'status', 'pending')}
                  onStatusChange={handleStatusUpdate}
                  canUpdate={hasPermission(PERMISSIONS.UPDATE_TASK_STATUS)}
                />
              </MetaItem>
              <MetaItem>
                <Users size={16} className="icon" />
                <strong>Assigned To:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {taskData.assignedTo && taskData.assignedTo.length > 0 ? (
                    taskData.assignedTo.map(user => (
                      <span key={user._id || user.id} style={{ 
                        background: '#f1f5f9',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#475569'
                      }}>
                        {user.name || user.email || 'Unknown'}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#94a3b8' }}>Unassigned</span>
                  )}
                </div>
              </MetaItem>
              {taskData.asset && (
                <MetaItem>
                  <MapPin size={16} className="icon" />
                  <strong>Asset:</strong>
                  <span>{taskData.asset.displayName || taskData.asset.name || 'Unknown Asset'}</span>
                </MetaItem>
              )}
              <MetaItem>
                <User size={16} className="icon" />
                <strong>Created By:</strong>
                <span>{taskData.createdBy?.name || taskData.createdBy?.email || 'Unknown'}</span>
              </MetaItem>
              {taskData.createdAt && (
                <MetaItem>
                  <Clock size={16} className="icon" />
                  <strong>Created On:</strong>
                  <span>{new Date(taskData.createdAt).toLocaleDateString()}</span>
                </MetaItem>
              )}
            </MetaGrid>
          </Card>

          {/* Enhanced Inspection Progress Card */}
          {taskData.inspectionLevel && (
            <Card>
              <CardTitle>
                <CheckSquare size={20} />
                Inspection Overview
              </CardTitle>
              
              <div style={{ padding: '16px' }}>
                <h4 style={{ marginBottom: '16px', color: 'var(--color-navy)' }}>
                  Template: {taskData.inspectionLevel.name || 'Unknown Template'}
                </h4>
                
                {/* Task Metrics - Simplified */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ 
                    background: 'rgba(55, 136, 216, 0.1)', 
                    padding: '20px', 
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: '#3788d8', marginBottom: '8px', fontWeight: '600' }}>TASK STATUS</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#3788d8' }}>
                      {getTaskDataOrDefault(taskData, 'status', 'pending').charAt(0).toUpperCase() + 
                       getTaskDataOrDefault(taskData, 'status', 'pending').slice(1).replace('_', ' ')}
                    </div>
                  </div>
                  
                  <div style={{ 
                    background: 'rgba(39, 174, 96, 0.1)', 
                    padding: '20px', 
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: '#27ae60', marginBottom: '8px', fontWeight: '600' }}>PRIORITY</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#27ae60' }}>
                      {getTaskDataOrDefault(taskData, 'priority', 'medium').charAt(0).toUpperCase() + 
                       getTaskDataOrDefault(taskData, 'priority', 'medium').slice(1)}
                    </div>
                  </div>
                  
                  <div style={{ 
                    background: 'rgba(243, 156, 18, 0.1)', 
                    padding: '20px', 
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: '#f39c12', marginBottom: '8px', fontWeight: '600' }}>CREATED BY</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#f39c12' }}>
                      {taskData.createdBy?.name || taskData.createdBy?.email || 'Unknown'}
                    </div>
                  </div>
                  
                  <div style={{ 
                    background: 'rgba(44, 62, 80, 0.1)', 
                    padding: '20px', 
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: '#2c3e50', marginBottom: '8px', fontWeight: '600' }}>ASSIGNEES</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50' }}>
                      {taskData.assignedTo && taskData.assignedTo.length > 0 ? taskData.assignedTo.length : 0} Users
                    </div>
                  </div>
                </div>

                {/* Inspection Level Information */}
                {taskData.inspectionLevel?.subLevels && taskData.inspectionLevel.subLevels.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <h4 style={{ marginBottom: '16px', color: 'var(--color-navy)' }}>
                      Inspection Template Details
                    </h4>
                    <div style={{ 
                      background: '#f8fafc', 
                      padding: '16px', 
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                        <strong>Total Sections:</strong> {taskData.inspectionLevel.subLevels.length}
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        <strong>Template:</strong> {taskData.inspectionLevel.name || 'Unknown Template'}
                      </div>
                      {taskData.inspectionLevel.description && (
                        <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
                          <strong>Description:</strong> {taskData.inspectionLevel.description}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Detailed Inspection Levels and Questions Card */}
          {taskData.inspectionLevel?.subLevels && taskData.inspectionLevel.subLevels.length > 0 && (
            <Card>
              <CardTitle>
                <List size={20} />
                Inspection Levels & Questions
              </CardTitle>
              <div style={{ padding: '16px' }}>
                {taskData.inspectionLevel.subLevels.map((level, levelIndex) => (
                  <div key={level._id || levelIndex} style={{ 
                    marginBottom: '24px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    {/* Level Header */}
                    <div style={{
                      background: 'linear-gradient(135deg, #3788d8 0%, #2c5aa0 100%)',
                      color: 'white',
                      padding: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                          {levelIndex + 1}. {level.name || 'Unnamed Level'}
                        </h4>
                        {level.description && (
                          <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
                            {level.description}
                          </p>
                        )}
                      </div>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '8px 12px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        {getSubLevelStatus(level._id || levelIndex) === 'completed' ? '✅ Completed' :
                         getSubLevelStatus(level._id || levelIndex) === 'in_progress' ? '🔄 In Progress' : '⏳ Pending'}
                      </div>
                    </div>

                    {/* Level Questions */}
                    {level.questions && level.questions.length > 0 && (
                      <div style={{ padding: '16px' }}>
                        <h5 style={{ 
                          marginBottom: '16px', 
                          color: 'var(--color-navy)',
                          fontSize: '16px',
                          fontWeight: '600'
                        }}>
                          Questions ({level.questions.length})
                        </h5>
                        
                        {level.questions.map((question, questionIndex) => (
                          <div key={question._id || questionIndex} style={{
                            marginBottom: '16px',
                            padding: '16px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}>
                            {/* Question Header */}
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              marginBottom: '12px'
                            }}>
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  color: '#1a202c',
                                  marginBottom: '8px'
                                }}>
                                  Q{questionIndex + 1}. {question.text || 'Question text not available'}
                                </div>
                                {question.description && (
                                  <div style={{
                                    fontSize: '14px',
                                    color: '#64748b',
                                    lineHeight: '1.5'
                                  }}>
                                    {question.description}
                                  </div>
                                )}
                                <div style={{
                                  fontSize: '12px',
                                  color: '#94a3b8',
                                  marginTop: '8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}>
                                  <span>Type: {renderQuestionType(question.type || 'text')}</span>
                                  {question.required && (
                                    <span style={{ color: '#ef4444' }}>• Required</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Question Response */}
                            {question.response && (
                              <div style={{
                                marginTop: '16px',
                                padding: '12px',
                                background: 'rgba(39, 174, 96, 0.1)',
                                borderRadius: '6px',
                                border: '1px solid rgba(39, 174, 96, 0.2)'
                              }}>
                                <div style={{
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  color: '#27ae60',
                                  marginBottom: '8px'
                                }}>
                                  Response:
                                </div>
                                <div style={{
                                  fontSize: '14px',
                                  color: '#1a202c',
                                  lineHeight: '1.5'
                                }}>
                                  {question.response.text || question.response.value || question.response || 'Response recorded'}
                                </div>
                                {question.response.completedBy && (
                                  <div style={{
                                    fontSize: '12px',
                                    color: '#64748b',
                                    marginTop: '8px',
                                    fontStyle: 'italic'
                                  }}>
                                    Answered by: {question.response.completedBy.name || question.response.completedBy.email || 'Unknown'}
                                  </div>
                                )}
                                {question.response.completedAt && (
                                  <div style={{
                                    fontSize: '12px',
                                    color: '#64748b',
                                    marginTop: '4px',
                                    fontStyle: 'italic'
                                  }}>
                                    Completed: {new Date(question.response.completedAt).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Question Status */}
                            <div style={{
                              marginTop: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <span style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#64748b'
                              }}>
                                Status:
                              </span>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                background: question.response ? 'rgba(39, 174, 96, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: question.response ? '#27ae60' : '#ef4444'
                              }}>
                                {question.response ? '✅ Completed' : '⏳ Pending'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Level Progress Summary */}
                    <div style={{
                      background: '#f1f5f9',
                      padding: '12px 16px',
                      borderTop: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        Level Progress
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        <span style={{ color: '#3788d8' }}>
                          {level.questions ? 
                            level.questions.filter(q => q.response).length : 0
                          } / {level.questions ? level.questions.length : 0}
                        </span>
                        <span style={{ color: '#64748b' }}>
                          questions completed
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Progress and Scoring Summary Card */}
          {taskData.inspectionLevel && (
            <Card>
              <CardTitle>
                <Award size={20} />
                Progress & Scoring Summary
              </CardTitle>
              <div style={{ padding: '16px' }}>
                {/* Overall Progress Metrics */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '16px', 
                  marginBottom: '24px' 
                }}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #3788d8 0%, #2c5aa0 100%)', 
                    padding: '20px', 
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: 'white'
                  }}>
                    <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>OVERALL PROGRESS</div>
                    <div style={{ fontSize: '24px', fontWeight: '700' }}>
                      {taskData.inspectionLevel.subLevels ? 
                        Math.round((taskData.inspectionLevel.subLevels.filter(level => 
                          getSubLevelStatus(level._id || level.id) === 'completed'
                        ).length / taskData.inspectionLevel.subLevels.length) * 100) : 0}%
                    </div>
                  </div>
                  
                  <div style={{ 
                    background: 'linear-gradient(135deg, #27ae60 0%, #1e8449 100%)', 
                    padding: '20px', 
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: 'white'
                  }}>
                    <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>COMPLETED LEVELS</div>
                    <div style={{ fontSize: '24px', fontWeight: '700' }}>
                      {taskData.inspectionLevel.subLevels ? 
                        taskData.inspectionLevel.subLevels.filter(level => 
                          getSubLevelStatus(level._id || level.id) === 'completed'
                        ).length : 0}
                    </div>
                  </div>
                  
                  <div style={{ 
                    background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)', 
                    padding: '20px', 
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: 'white'
                  }}>
                    <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>IN PROGRESS</div>
                    <div style={{ fontSize: '24px', fontWeight: '700' }}>
                      {taskData.inspectionLevel.subLevels ? 
                        taskData.inspectionLevel.subLevels.filter(level => 
                          getSubLevelStatus(level._id || level.id) === 'in_progress'
                        ).length : 0}
                    </div>
                  </div>
                  
                  <div style={{ 
                    background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)', 
                    padding: '20px', 
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: 'white'
                  }}>
                    <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>PENDING</div>
                    <div style={{ fontSize: '24px', fontWeight: '700' }}>
                      {taskData.inspectionLevel.subLevels ? 
                        taskData.inspectionLevel.subLevels.filter(level => 
                          getSubLevelStatus(level._id || level.id) === 'pending'
                        ).length : 0}
                    </div>
                  </div>
                </div>

                {/* Detailed Progress Breakdown */}
                {taskData.inspectionLevel.subLevels && taskData.inspectionLevel.subLevels.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <h4 style={{ marginBottom: '16px', color: 'var(--color-navy)' }}>
                      Level-by-Level Breakdown
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {taskData.inspectionLevel.subLevels.map((level, levelIndex) => {
                        const levelStatus = getSubLevelStatus(level._id || level.id);
                        const completedQuestions = level.questions ? 
                          level.questions.filter(q => q.response).length : 0;
                        const totalQuestions = level.questions ? level.questions.length : 0;
                        const levelProgress = totalQuestions > 0 ? 
                          Math.round((completedQuestions / totalQuestions) * 100) : 0;
                        
                        return (
                          <div key={level._id || levelIndex} style={{
                            padding: '16px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '12px'
                            }}>
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  color: '#1a202c'
                                }}>
                                  {levelIndex + 1}. {level.name || 'Unnamed Level'}
                                </div>
                                <div style={{
                                  fontSize: '14px',
                                  color: '#64748b',
                                  marginTop: '4px'
                                }}>
                                  {completedQuestions} of {totalQuestions} questions completed
                                </div>
                              </div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px'
                              }}>
                                <div style={{
                                  fontSize: '18px',
                                  fontWeight: '700',
                                  color: levelStatus === 'completed' ? '#27ae60' : 
                                         levelStatus === 'in_progress' ? '#f39c12' : '#95a5a6'
                                }}>
                                  {levelProgress}%
                                </div>
                                <div style={{
                                  padding: '6px 12px',
                                  borderRadius: '16px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  background: levelStatus === 'completed' ? 'rgba(39, 174, 96, 0.1)' :
                                             levelStatus === 'in_progress' ? 'rgba(243, 156, 18, 0.1)' :
                                             'rgba(149, 165, 166, 0.1)',
                                  color: levelStatus === 'completed' ? '#27ae60' :
                                         levelStatus === 'in_progress' ? '#f39c12' : '#95a5a6'
                                }}>
                                  {levelStatus === 'completed' ? '✅ Completed' :
                                   levelStatus === 'in_progress' ? '🔄 In Progress' : '⏳ Pending'}
                                </div>
                              </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div style={{
                              width: '100%',
                              height: '8px',
                              background: '#e2e8f0',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${levelProgress}%`,
                                height: '100%',
                                background: levelStatus === 'completed' ? '#27ae60' :
                                           levelStatus === 'in_progress' ? '#f39c12' : '#95a5a6',
                                transition: 'width 0.3s ease'
                              }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Pre-Inspection Questions Card */}
          {taskData.preInspectionQuestions && taskData.preInspectionQuestions.length > 0 && (
            <Card>
              <CardTitle>
                <Database size={20} />
                Pre-Inspection Questions
              </CardTitle>
              <div style={{ padding: '16px' }}>
                {taskData.preInspectionQuestions.map((question, index) => (
                  <div key={index} style={{ 
                    marginBottom: '16px',
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '6px'
                  }}>
                    <strong style={{ color: 'var(--color-navy)' }}>
                      {index + 1}. {question.text || 'Question text not available'}
                    </strong>
                    {question.description && (
                      <p style={{ marginTop: '8px', color: '#64748b', fontSize: '14px' }}>
                        {question.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Task Responses and Answers Card */}
          {taskData.responses && taskData.responses.length > 0 && (
            <Card>
              <CardTitle>
                <HelpCircle size={20} />
                Task Responses & Answers
              </CardTitle>
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {taskData.responses.map((response, index) => (
                    <div key={index} style={{
                      padding: '16px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1a202c',
                            marginBottom: '8px'
                          }}>
                            Response #{index + 1}
                          </div>
                          {response.question && (
                            <div style={{
                              fontSize: '14px',
                              color: '#64748b',
                              marginBottom: '8px',
                              fontStyle: 'italic'
                            }}>
                              <strong>Question:</strong> {response.question}
                            </div>
                          )}
                          <div style={{
                            fontSize: '14px',
                            color: '#1a202c',
                            lineHeight: '1.5'
                          }}>
                            <strong>Answer:</strong> {response.answer || response.value || response.text || 'Response recorded'}
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: '8px'
                        }}>
                          {response.score !== undefined && (
                            <div style={{
                              padding: '6px 12px',
                              background: 'rgba(39, 174, 96, 0.1)',
                              borderRadius: '16px',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#27ae60'
                            }}>
                              Score: {response.score}
                            </div>
                          )}
                          {response.status && (
                            <div style={{
                              padding: '6px 12px',
                              borderRadius: '16px',
                              fontSize: '12px',
                              fontWeight: '600',
                              background: response.status === 'completed' ? 'rgba(39, 174, 96, 0.1)' :
                                         response.status === 'in_progress' ? 'rgba(243, 156, 18, 0.1)' :
                                         'rgba(149, 165, 166, 0.1)',
                              color: response.status === 'completed' ? '#27ae60' :
                                     response.status === 'in_progress' ? '#f39c12' : '#95a5a6'
                            }}>
                              {response.status === 'completed' ? '✅ Completed' :
                               response.status === 'in_progress' ? '🔄 In Progress' : '⏳ Pending'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {response.completedBy && (
                        <div style={{
                          fontSize: '12px',
                          color: '#64748b',
                          marginTop: '12px',
                          paddingTop: '12px',
                          borderTop: '1px solid #e2e8f0'
                        }}>
                          <strong>Answered by:</strong> {response.completedBy.name || response.completedBy.email || 'Unknown'}
                          {response.completedAt && (
                            <span style={{ marginLeft: '16px' }}>
                              <strong>on:</strong> {new Date(response.completedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Enhanced Comments Card */}
          <Card>
            <CardTitle>
              <MessageSquare size={20} />
              Comments & Notes
            </CardTitle>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!comment.trim() || isSubmitting}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--color-navy)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {isSubmitting ? 'Adding...' : 'Add Comment'}
                </button>
              </div>
              
              {taskData.comments && taskData.comments.length > 0 ? (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {taskData.comments.map((comment, index) => (
                    <div key={index} style={{ 
                      padding: '16px',
                      marginBottom: '12px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: '8px' 
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3788d8 0%, #2c5aa0 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>
                            {(comment.user?.name || comment.user?.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ 
                              fontSize: '14px', 
                              fontWeight: '600',
                              color: '#1a202c'
                            }}>
                              {comment.user?.name || comment.user?.email || 'Unknown User'}
                            </div>
                            <div style={{ 
                              fontSize: '12px', 
                              color: '#64748b' 
                            }}>
                              {comment.user?.role || 'User'}
                            </div>
                          </div>
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#64748b',
                          textAlign: 'right'
                        }}>
                          <div>{new Date(comment.createdAt || comment.timestamp).toLocaleDateString()}</div>
                          <div>{new Date(comment.createdAt || comment.timestamp).toLocaleTimeString()}</div>
                        </div>
                      </div>
                      
                      <div style={{
                        fontSize: '14px',
                        color: '#1a202c',
                        lineHeight: '1.6',
                        marginBottom: '8px'
                      }}>
                        {comment.content || comment.text || comment.message || 'Comment content'}
                      </div>
                      
                      {comment.attachments && comment.attachments.length > 0 && (
                        <div style={{
                          marginTop: '12px',
                          paddingTop: '12px',
                          borderTop: '1px solid #e2e8f0'
                        }}>
                          <div style={{
                            fontSize: '12px',
                            color: '#64748b',
                            marginBottom: '8px'
                          }}>
                            Attachments ({comment.attachments.length}):
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {comment.attachments.map((attachment, attIndex) => (
                              <div key={attIndex} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 10px',
                                background: '#f1f5f9',
                                borderRadius: '6px',
                                fontSize: '12px',
                                color: '#475569'
                              }}>
                                <Paperclip size={14} />
                                <span>{attachment.filename || 'File'}</span>
                                <button
                                  onClick={() => window.open(attachment.url, '_blank')}
                                  style={{
                                    padding: '2px 6px',
                                    background: '#3788d8',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '10px'
                                  }}
                                >
                                  View
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                  <div style={{ fontSize: '16px', marginBottom: '8px' }}>No comments yet</div>
                  <div style={{ fontSize: '14px' }}>Be the first to add a comment to this task!</div>
                </div>
              )}
            </div>
          </Card>
        </MainContent>
        
        <Sidebar>
          {/* Attachments Card */}
          <Card>
            <CardTitle>
              <Paperclip size={20} />
              Attachments
            </CardTitle>
            <div style={{ padding: '16px' }}>
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                multiple
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  background: 'var(--color-navy)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: '16px'
                }}
              >
                {uploadingFile ? 'Uploading...' : 'Upload Files'}
              </button>
              
              {taskData.attachments && taskData.attachments.length > 0 ? (
                <div>
                  {taskData.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px',
                        marginBottom: '8px',
                        background: '#f8fafc',
                        borderRadius: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} />
                        <span style={{ fontSize: '14px' }}>
                          {attachment.filename || 'Unnamed file'}
                        </span>
                      </div>
                      <button
                        onClick={() => window.open(attachment.url, '_blank')}
                        style={{
                          padding: '4px 8px',
                          background: '#e2e8f0',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  No attachments found
                </div>
              )}
            </div>
          </Card>
        </Sidebar>
      </ContentGrid>
    </PageContainer>
  );
};

export default TaskView;