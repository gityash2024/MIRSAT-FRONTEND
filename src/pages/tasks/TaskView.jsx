import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { 
  ArrowLeft, Edit, Clock, User, Calendar, AlertTriangle, 
  Send, Download, Paperclip, BarChart, TrendingUp, Users,
  Circle, ChevronRight, Filter, FileText, HelpCircle, CheckSquare
} from 'lucide-react';
import { LineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import TaskStatus from './components/TaskStatus';
import TaskPriority from './components/TaskPriority';
import TaskAssignee from './components/TaskAssignee';
import { getTaskById, addTaskComment, updateTaskStatus } from '../../store/slices/taskSlice';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../utils/permissions';
import Skeleton from '../../components/ui/Skeleton';

const PageContainer = styled.div`
  padding: 24px;
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
  color: #1a237e;
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
  border: 1px solid #1a237e;
  color: #1a237e;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    background: #f5f7fb;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
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
  width: 350px;
  flex-shrink: 0;
  
  @media (max-width: 1024px) {
    width: 100%;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Description = styled.div`
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-line;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 24px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
  .icon {
    color: #1a237e;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 24px;
`;

const StatCard = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  .label {
    font-size: 12px;
    color: #666;
  }
  .value {
    font-size: 24px;
    font-weight: 600;
    color: #1a237e;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
  .fill {
    height: 100%;
    background: #1a237e;
    border-radius: 4px;
    transition: width 0.3s ease;
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
      border-color: #1a237e;
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
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  background: #1a237e;
  color: white;
  border: none;
  cursor: pointer;
  &:hover {
    background: #151b4f;
  }
  &:disabled {
    opacity: 0.7;
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
  border-left: 3px solid #1a237e;
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
  color: #1a237e;
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
  
  const { currentTask: task, loading } = useSelector((state) => state.tasks);
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getTaskById(taskId));
  }, [dispatch, taskId]);

  // Debug effect to check what data is received
  useEffect(() => {
    if (task) {
      console.log('Task data received:', task);
      console.log('Task comments:', task.comments);
      console.log('Task inspection data:', task.inspectionLevel);
    }
  }, [task]);

  const handleAddComment = async () => {
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

  if (loading || !task) {
    return <TaskViewSkeleton />;
  }

  const getSubLevelStatus = (subLevelId) => {
    if (!task || !task.progress) return 'pending';
    const progressItem = task.progress.find(p => p && p.subLevelId === subLevelId);
    return progressItem?.status || 'pending';
  };

  const calculateAssigneeProgress = (assigneeId) => {
    if (!task || !task.progress || !task.inspectionLevel) {
      return { completed: 0, inProgress: 0, total: 0, percentage: 0 };
    }
    
    const assigneeProgress = task.progress.filter(p => p && p.completedBy && p.completedBy._id === assigneeId);
    const completed = assigneeProgress?.filter(p => p.status === 'completed').length || 0;
    const inProgress = assigneeProgress?.filter(p => p.status === 'in_progress').length || 0;
    const total = Array.isArray(task.inspectionLevel?.subLevels) ? task.inspectionLevel.subLevels.length : 0;
    
    return {
      completed,
      inProgress,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  // Safe check for inspectionData to avoid errors
  let inspectionData = [];
  if (task && task.inspectionLevel && Array.isArray(task.inspectionLevel.subLevels)) {
    inspectionData = task.inspectionLevel.subLevels.map(level => ({
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

  // Ensure all required data is available before rendering
  const hasValidTask = task && typeof task === 'object';
  const hasValidComments = Array.isArray(task?.comments);
  const hasValidSubLevels = Array.isArray(task?.inspectionLevel?.subLevels);
  const hasValidAttachments = Array.isArray(task?.attachments);
  
  // Debug info
  console.log('Task validation:', { 
    hasValidTask, hasValidComments, hasValidSubLevels, hasValidAttachments 
  });
  
  // If task is fetched but somehow invalid, show an error
  if (task && !hasValidTask) {
    return (
      <PageContainer>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <h2 style={{ color: '#1a237e', marginBottom: '16px' }}>Task Data Error</h2>
          <p style={{ marginBottom: '24px' }}>There was an issue loading the task data. The data format is invalid.</p>
          <Button onClick={() => navigate('/tasks')}>
            <ArrowLeft size={18} />
            Back to Tasks
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <HeaderTop>
          <BackButton onClick={() => navigate('/tasks')}>
            <ArrowLeft size={18} />
            Back to Tasks
          </BackButton>
          <HeaderContent>
            <PageTitle>{task.title}</PageTitle>
            <SubTitle>Task Details and Progress</SubTitle>
          </HeaderContent>
          {hasPermission(PERMISSIONS.EDIT_TASKS) && (
            <EditButton onClick={() => navigate(`/tasks/${taskId}/edit`)}>
              <Edit size={16} />
              Edit Task
            </EditButton>
          )}
        </HeaderTop>
        
        <HeaderFilters>
          <Filter size={16} />
          <FilterSelect 
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
          >
            <option value="all">All Assignees</option>
            {task.assignedTo?.map(user => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </FilterSelect>
        </HeaderFilters>
      </Header>

      <ContentGrid>
        <MainContent>
          <Card>
            <CardTitle>
              <BarChart size={20} />
              Overview
            </CardTitle>
            <Description>{task.description}</Description>

            <MetaGrid>
              <MetaItem>
                <Calendar size={16} className="icon" />
                <strong>Due Date:</strong>
                {new Date(task.deadline).toLocaleDateString()}
              </MetaItem>
              <MetaItem>
                <AlertTriangle size={16} className="icon" />
                <strong>Priority:</strong>
                <TaskPriority priority={task.priority} />
              </MetaItem>
              <MetaItem>
                <Clock size={16} className="icon" />
                <strong>Status:</strong>
                <TaskStatus 
                  status={task.status}
                  onStatusChange={handleStatusUpdate}
                  canUpdate={hasPermission(PERMISSIONS.UPDATE_TASK_STATUS)}
                />
              </MetaItem>
            </MetaGrid>

            <AssigneeProgress>
              {selectedAssignee !== 'all' && task.assignedTo?.map(assignee => {
                if (assignee._id === selectedAssignee) {
                  const progress = calculateAssigneeProgress(assignee._id);
                  return (
                    <AssigneeCard key={assignee._id}>
                      <AssigneeHeader>
                        <AssigneeName>{assignee.name}</AssigneeName>
                        <span>{progress.percentage}% Complete</span>
                      </AssigneeHeader>
                      <AssigneeStats>
                        <StatCard>
                          <div className="label">Completed</div>
                          <div className="value">{progress.completed}</div>
                        </StatCard>
                        <StatCard>
                          <div className="label">In Progress</div>
                          <div className="value">{progress.inProgress}</div>
                        </StatCard>
                        <StatCard>
                          <div className="label">Total</div>
                          <div className="value">{progress.total}</div>
                        </StatCard>
                      </AssigneeStats>
                      <ProgressBar>
                        <div 
                          className="fill" 
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </ProgressBar>
                    </AssigneeCard>
                  );
                }
                return null;
              })}
            </AssigneeProgress>
          </Card>

        

          <ChartCard>
            <CardTitle>Inspection Progress</CardTitle>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsBarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#1a237e" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </ChartCard>
          <Card style={{ marginTop: '24px' }}>
            <CardTitle>Comments</CardTitle>
            <CommentSection>
              <CommentInput>
                <textarea 
                  placeholder="Add a comment..." 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button 
                  onClick={handleAddComment}
                  disabled={isSubmitting || !comment.trim()}
                >
                  <Send size={16} />
                  Post
                </Button>
              </CommentInput>

              <CommentList>
                {Array.isArray(task.comments) && task.comments.length > 0 ? (
                  task.comments.map((comment, index) => (
                    <Comment key={index}>
                      <div className="header">
                        <span className="author">{comment.user?.name || 'Anonymous'}</span>
                        <span className="timestamp">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="content">{comment.content}</p>
                    </Comment>
                  ))
                ) : (
                  <p>No comments yet</p>
                )}
              </CommentList>
            </CommentSection>
          </Card>
        </MainContent>

        <div>
          <Card>
            <CardTitle>Inspection Milestones</CardTitle>
            <MilestoneTimeline>
              {task.inspectionLevel?.subLevels?.map((level) => {
                const status = getSubLevelStatus(level._id);
                return (
                  <MilestoneItem key={level._id}>
                    <MilestoneDot status={status} />
                    <MilestoneContent>
                      <MilestoneHeader>
                        <MilestoneTitle>{level.name}</MilestoneTitle>
                        <MilestoneStatus status={status}>
                          {status.replace('_', ' ')}
                        </MilestoneStatus>
                      </MilestoneHeader>
                      <MilestoneDescription>
                        {level.description}
                      </MilestoneDescription>
                      {status !== 'pending' && (
                        <MilestoneProgress>
                          <ProgressBar>
                            <div 
                              className="fill" 
                              style={{ 
                                width: status === 'completed' ? '100%' : '50%',
                                background: status === 'completed' ? '#10b981' : '#3b82f6'
                              }} 
                            />
                          </ProgressBar>
                        </MilestoneProgress>
                      )}
                    </MilestoneContent>
                  </MilestoneItem>
                );
              })}
            </MilestoneTimeline>
          </Card>

          <Card style={{ marginTop: '24px' }}>
            <CardTitle>Attachments</CardTitle>
            {task.attachments?.length > 0 ? (
              task.attachments.map((attachment, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px',
                    background: '#f8fafc',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Paperclip size={16} />
                    <span>{attachment.filename}</span>
                  </div>
                  <a 
                    href={attachment.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: '#1a237e',
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: '14px'
                    }}
                  >
                    <Download size={16} />
                    Download
                  </a>
                </div>
              ))
            ) : (
              <p style={{ color: '#666', fontSize: '14px' }}>No attachments</p>
            )}
          </Card>
        </div>
      </ContentGrid>
    </PageContainer>
  );
};

export default TaskView;