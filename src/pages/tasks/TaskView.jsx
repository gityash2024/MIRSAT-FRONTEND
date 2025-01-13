// src/pages/tasks/TaskView.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Clock, 
  User, 
  Calendar,
  AlertTriangle,
  Send
} from 'lucide-react';
import TaskStatus from './components/TaskStatus';
import TaskPriority from './components/TaskPriority';

const PageContainer = styled.div`
  padding: 24px;
`;
const mockTasks = [
  {
    id: 1,
    title: 'Beach Safety Inspection - Zone A',
    description: 'Conduct comprehensive safety inspection of Zone A beach area, including lifeguard equipment, warning signs, and emergency response facilities.',
    assignee: 'John Doe',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2024-01-20',
    created: '2024-01-15',
    type: 'Safety Inspection',
    comments: [
      {
        id: 1,
        author: 'Jane Smith',
        content: 'Initial equipment check completed. Some life jackets need replacement.',
        timestamp: '2024-01-16 09:30'
      },
      {
        id: 2,
        author: 'John Doe',
        content: 'Ordered new life jackets, should arrive by tomorrow.',
        timestamp: '2024-01-16 10:15'
      }
    ]
  },
  {
    id: 2,
    title: 'Marina Equipment Verification - Dock B',
    description: 'Verify all equipment at Dock B including mooring lines, cleats, and power pedestals.',
    assignee: 'Jane Smith',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '2024-01-22',
    created: '2024-01-14',
    type: 'Equipment Check',
    comments: []
  },
  {
    id: 3,
    title: 'Safety Training Documentation Review',
    description: 'Review and update all safety training documentation for compliance with new regulations.',
    assignee: 'Mike Johnson',
    priority: 'High',
    status: 'Under Review',
    dueDate: '2024-01-18',
    created: '2024-01-12',
    type: 'Documentation Review',
    comments: []
  },
  {
    id: 4,
    title: 'Emergency Response Training - Staff Group A',
    description: 'Conduct emergency response training session for Staff Group A.',
    assignee: 'Sarah Williams',
    priority: 'Medium',
    status: 'Completed',
    dueDate: '2024-01-15',
    created: '2024-01-10',
    type: 'Training',
    comments: []
  },
  {
    id: 5,
    title: 'Beach Cleanliness Inspection - Zone B',
    description: 'Inspect Zone B beach area for cleanliness and environmental compliance.',
    assignee: 'John Doe',
    priority: 'Low',
    status: 'In Progress',
    dueDate: '2024-01-21',
    created: '2024-01-16',
    type: 'Safety Inspection',
    comments: []
  },
  {
    id: 6,
    title: 'Lifeguard Equipment Maintenance',
    description: 'Perform routine maintenance on all lifeguard equipment at main tower.',
    assignee: 'Mike Johnson',
    priority: 'High',
    status: 'Pending',
    dueDate: '2024-01-23',
    created: '2024-01-16',
    type: 'Equipment Check',
    comments: []
  },
  {
    id: 7,
    title: 'Water Quality Testing - North Beach',
    description: 'Conduct water quality tests at North Beach sampling points.',
    assignee: 'Jane Smith',
    priority: 'Medium',
    status: 'In Progress',
    dueDate: '2024-01-19',
    created: '2024-01-15',
    type: 'Safety Inspection',
    comments: []
  },
  {
    id: 8,
    title: 'Marina Security Protocol Update',
    description: 'Review and update marina security protocols based on recent assessment.',
    assignee: 'Sarah Williams',
    priority: 'High',
    status: 'Under Review',
    dueDate: '2024-01-25',
    created: '2024-01-17',
    type: 'Documentation Review',
    comments: []
  
  }
];
const Header = styled.div`
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

const TaskView = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    // In a real app, this would be an API call
    const foundTask = mockTasks.find(t => t.id === parseInt(taskId));
    setTask(foundTask);
  }, [taskId]);

  if (!task) {
    return <div>Loading...</div>;
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: task.comments.length + 1,
      author: 'Current User', // In real app, get from auth context
      content: newComment,
      timestamp: new Date().toLocaleString()
    };

    setTask(prev => ({
      ...prev,
      comments: [...prev.comments, comment]
    }));
    setNewComment('');
  };

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
            Created on {task.created}
          </MetaItem>
        </div>
        <EditButton onClick={() => navigate(`/tasks/${taskId}/edit`)}>
          <Edit size={16} />
          Edit Task
        </EditButton>
      </TaskHeader>

      <ContentGrid>
        <MainContent>
          <Card>
            <CardTitle>Description</CardTitle>
            <Description>{task.description}</Description>
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
                <SendButton onClick={handleAddComment}>
                  <Send size={16} />
                  Post
                </SendButton>
              </CommentInput>
              {task.comments.map(comment => (
                <Comment key={comment.id}>
                  <div className="header">
                    <span className="author">{comment.author}</span>
                    <span className="timestamp">{comment.timestamp}</span>
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
                Assignee: {task.assignee}
              </MetaItem>
              <MetaItem>
                <Calendar size={16} className="icon" />
                Due Date: {task.dueDate}
              </MetaItem>
              <MetaItem>
                <AlertTriangle size={16} className="icon" />
                Priority: <TaskPriority priority={task.priority} />
              </MetaItem>
              <MetaItem>
                Status: <TaskStatus status={task.status} />
              </MetaItem>
            </div>
          </Card>
        </div>
      </ContentGrid>
    </PageContainer>
  );
};

export default TaskView;