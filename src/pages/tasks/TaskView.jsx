import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { 
  ArrowLeft, Edit, Clock, User, Calendar, AlertTriangle, 
  Send, Download, Paperclip, BarChart, TrendingUp, Users,
  Circle, ChevronRight
} from 'lucide-react';
import { LineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import TaskStatus from './components/TaskStatus';
import TaskPriority from './components/TaskPriority';
import TaskAssignee from './components/TaskAssignee';
import { getTaskById, addTaskComment, updateTaskStatus } from '../../store/slices/taskSlice';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../utils/permissions';

const PageContainer = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
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

const InspectionTimeline = styled.div`
  margin-top: 20px;
`;

const TimelineItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  position: relative;
  &:not(:last-child):before {
    content: '';
    position: absolute;
    left: 7px;
    top: 28px;
    bottom: 0;
    width: 2px;
    background: ${props => props.completed ? '#1a237e' : '#e2e8f0'};
  }
`;

const TimelineDot = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.completed ? '#1a237e' : '#e2e8f0'};
  flex-shrink: 0;
`;

const TimelineContent = styled.div`
  flex: 1;
  .title {
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
  }
  .description {
    font-size: 14px;
    color: #666;
  }
`;

const ChartCard = styled(Card)`
  height: 320px;
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

const TaskView = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { hasPermission } = usePermissions();
  
  let { currentTask: task, loading } = useSelector((state) => state.tasks);
  task = task?.data;
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (taskId) {
      dispatch(getTaskById(taskId));
    }
  }, [taskId, dispatch]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await dispatch(addTaskComment({ id: taskId, content: newComment })).unwrap();
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await dispatch(updateTaskStatus({
        id: taskId,
        status: newStatus,
        comment: `Status updated to ${newStatus}`
      })).unwrap();
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div>Loading...</div>
      </PageContainer>
    );
  }

  if (!task) {
    return (
      <PageContainer>
        <div>Task not found</div>
      </PageContainer>
    );
  }

  const progressData = Array.from({ length: 7 }, (_, i) => ({
    name: `Week ${i + 1}`,
    progress: Math.floor(Math.random() * 100)
  }));

  const inspectionData = task.inspectionLevel?.subLevels?.map(level => ({
    name: level.name,
    completed: level.isCompleted ? 100 : 0
  })) || [];

  return (
    <PageContainer>
      <Header>
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
                <User size={16} className="icon" />
                <strong>Assignees:</strong>
                <TaskAssignee assignees={task.assignedTo || []} maxDisplay={3} />
              </MetaItem>
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

            <StatsGrid>
              <StatCard>
                <div className="label">Overall Progress</div>
                <div className="value">{task.overallProgress || 0}%</div>
                <ProgressBar>
                  <div className="fill" style={{ width: `${task.overallProgress || 0}%` }} />
                </ProgressBar>
              </StatCard>
              <StatCard>
                <div className="label">Sub-levels</div>
                <div className="value">
                  {task.inspectionLevel?.subLevels?.filter(sl => sl.isCompleted).length || 0}/
                  {task.inspectionLevel?.subLevels?.length || 0}
                </div>
              </StatCard>
              <StatCard>
                <div className="label">Time Spent</div>
                <div className="value">0 hrs</div>
              </StatCard>
            </StatsGrid>
          </Card>

          <ChartCard>
            <CardTitle>Progress Over Time</CardTitle>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="progress" stroke="#1a237e" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard>
            <CardTitle>Inspection Level Completion</CardTitle>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsBarChart data={inspectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#1a237e" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </ChartCard>
        </MainContent>

        <div>
          <Card>
            <CardTitle>Inspection Milestones</CardTitle>
            <InspectionTimeline>
              {task.inspectionLevel?.subLevels?.map((level, index) => (
                <TimelineItem key={level._id} completed={level.isCompleted}>
                  <TimelineDot completed={level.isCompleted} />
                  <TimelineContent>
                    <div className="title">{level.name}</div>
                    <div className="description">{level.description}</div>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </InspectionTimeline>
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

          <Card style={{ marginTop: '24px' }}>
            <CardTitle>Comments</CardTitle>
            <CommentSection>
              <CommentInput>
                <textarea 
                  placeholder="Add a comment..." 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button 
                  onClick={handleAddComment}
                  disabled={isSubmitting || !newComment.trim()}
                >
                  <Send size={16} />
                  Post
                </Button>
              </CommentInput>

              <CommentList>
                {task.comments?.map((comment, index) => (
                  <Comment key={index}>
                    <div className="header">
                      <span className="author">{comment.user?.name}</span>
                      <span className="timestamp">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="content">{comment.content}</p>
                  </Comment>
                ))}
                {(!task.comments || task.comments.length === 0) && (
                  <p>No comments yet</p>
                )}
              </CommentList>
            </CommentSection>
          </Card>
        </div>
      </ContentGrid>
    </PageContainer>
  );
};

export default TaskView;