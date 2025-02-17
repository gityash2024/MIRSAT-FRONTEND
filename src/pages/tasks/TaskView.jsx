import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { 
  ArrowLeft, 
  Edit, 
  Clock, 
  User, 
  Calendar,
  AlertTriangle,
  Send,
  Download,
  Paperclip
} from 'lucide-react';
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

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
`;

const TaskTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 8px;
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
  grid-template-columns: 2fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
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
`;

const Description = styled.p`
  color: #666;
  font-size: 14px;
  line-height: 1.6;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;

  .icon {
    color: #1a237e;
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
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 14px;

  .file-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .download-button {
    padding: 4px 8px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #1a237e;
    transition: all 0.2s;

    &:hover {
      background: #f1f5f9;
    }
  }
`;

const CommentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CommentInput = styled.div`
  display: flex;
  gap: 12px;

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

const SendButton = styled.button`
  padding: 8px 16px;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: flex-end;

  &:hover {
    background: #151b4f;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Comment = styled.div`
  padding: 16px;
  border-radius: 8px;
  background: #f5f7fb;

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
    font-size: 14px;
    color: #666;
    line-height: 1.5;
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #666;
`;

const TaskProgress = styled.div`
  margin-top: 16px;
  
  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .progress-text {
    font-size: 14px;
    color: #666;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;

    .fill {
      height: 100%;
      background: #1a237e;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
  }
`;

const TaskView = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { hasPermission } = usePermissions();
  
  const { currentTask: task, loading } = useSelector((state) => state.tasks);
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

  // const handleDownloadAttachment = async (attachmentId, filename) => {
  //   try {
  //     await dispatch(downloadTaskAttachment({ taskId, attachmentId, filename })).unwrap();
  //   } catch (error) {
  //     toast.error('Failed to download attachment');
  //   }
  // };

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
    return <LoadingState>Loading...</LoadingState>;
  }

  if (!task) {
    return <div>Task not found</div>;
  }

  return (
    <PageContainer>
      <BackButton onClick={() => navigate('/tasks')}>
        <ArrowLeft size={18} />
        Back to Tasks
      </BackButton>

      <TaskHeader>
        <div>
          <TaskTitle>{task.title}</TaskTitle>
          <MetaItem>
            <Clock size={16} className="icon" />
            Created on {new Date(task.createdAt).toLocaleDateString()}
          </MetaItem>
        </div>
        {hasPermission(PERMISSIONS.EDIT_TASKS) && (
          <EditButton onClick={() => navigate(`/tasks/${taskId}/edit`)}>
            <Edit size={16} />
            Edit Task
          </EditButton>
        )}
      </TaskHeader>

      <ContentGrid>
        <MainContent>
          <Card>
            <CardTitle>Description</CardTitle>
            <Description>{task.description}</Description>
            
            {task.attachments?.length > 0 && (
              <AttachmentList>
                <h3>Attachments</h3>
                {task.attachments.map(attachment => (
                  <AttachmentItem key={attachment._id}>
                    <div className="file-info">
                      <Paperclip size={16} />
                      {attachment.filename}
                    </div>
                    <button 
                      className="download-button"
                      // onClick={() => handleDownloadAttachment(attachment._id, attachment.filename)}
                    >
                      <Download size={14} />
                      Download
                    </button>
                  </AttachmentItem>
                ))}
              </AttachmentList>
            )}
            
            <TaskProgress>
              <div className="progress-header">
                <span className="progress-text">Overall Progress</span>
                <span className="progress-text">{task.overallProgress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="fill" 
                  style={{ width: `${task.overallProgress}%` }}
                />
              </div>
            </TaskProgress>
          </Card>

          <Card>
            <CardTitle>Comments</CardTitle>
            <CommentSection>
              <CommentInput>
                <textarea 
                  placeholder="Add a comment..." 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <SendButton 
                  onClick={handleAddComment}
                  disabled={isSubmitting || !newComment.trim()}
                >
                  <Send size={16} />
                  Post
                </SendButton>
              </CommentInput>
              {task.comments?.map(comment => (
                <Comment key={comment._id}>
                  <div className="header">
                    <span className="author">{comment.user.name}</span>
                    <span className="timestamp">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="content">{comment.content}</p>
                </Comment>
              ))}
            </CommentSection>
          </Card>
        </MainContent>

        <div>
          <Card>
            <CardTitle>Task Details</CardTitle>
            <div className="space-y-4">
              <MetaItem>
                <User size={16} className="icon" />
                Assignees:
                {task.assignedTo?.map(user => (
                  <TaskAssignee 
                    key={user._id}
                    assignee={user.name}
                    role={user.role}
                  />
                ))}
              </MetaItem>
              <MetaItem>
                <Calendar size={16} className="icon" />
                Due Date: {new Date(task.deadline).toLocaleDateString()}
              </MetaItem>
              <MetaItem>
                <AlertTriangle size={16} className="icon" />
                Priority: <TaskPriority priority={task.priority} />
              </MetaItem>
              <MetaItem>
                Status: <TaskStatus 
                  status={task.status}
                  onStatusChange={handleStatusUpdate}
                  canUpdate={hasPermission(PERMISSIONS.UPDATE_TASK_STATUS)}
                />
              </MetaItem>
              {task.location && (
                <MetaItem>
                  Location: {task.location}
                </MetaItem>
              )}
            </div>
          </Card>
        </div>
      </ContentGrid>
    </PageContainer>
  );
};

export default TaskView;