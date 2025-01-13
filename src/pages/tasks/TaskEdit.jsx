// src/pages/tasks/TaskEdit.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TaskForm from './components/TaskForm';

const PageContainer = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 24px;
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

const FormContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

// Dialog for confirming changes
const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DialogContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const DialogTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
`;

const DialogText = styled.p`
  color: #666;
  font-size: 14px;
  margin-bottom: 24px;
`;

const DialogButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const DialogButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;

  ${props => props.variant === 'primary' ? `
    background: #1a237e;
    color: white;
    border: none;

    &:hover {
      background: #151b4f;
    }
  ` : `
    background: white;
    color: #666;
    border: 1px solid #e0e0e0;

    &:hover {
      background: #f5f5f5;
    }
  `}
`;

const TaskEdit = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(null);

  useEffect(() => {
    // In a real app, this would be an API call
    const foundTask = mockTasks.find(t => t.id === parseInt(taskId));
    setTask(foundTask);
  }, [taskId]);

  const handleSubmit = (formData) => {
    // Store the changes temporarily and show confirmation dialog
    setPendingChanges(formData);
    setShowConfirmDialog(true);
  };

  const handleConfirmChanges = () => {
    // In a real app, this would be an API call to update the task
    console.log('Saving changes:', pendingChanges);
    
    // Update local state
    setTask(prev => ({
      ...prev,
      ...pendingChanges
    }));

    // Close dialog and navigate back
    setShowConfirmDialog(false);
    navigate(`/tasks/${taskId}`);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    setPendingChanges(null);
  };

  if (!task) {
    return <div>Loading...</div>;
  }

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate(`/tasks/${taskId}`)}>
          <ArrowLeft size={18} />
          Back to Task
        </BackButton>
        <PageTitle>Edit Task</PageTitle>
        <SubTitle>Update task details and information</SubTitle>
      </Header>

      <FormContainer>
        <TaskForm 
          initialData={task}
          onSubmit={handleSubmit}
          submitButtonText="Save Changes"
        />
      </FormContainer>

      {showConfirmDialog && (
        <DialogOverlay>
          <DialogContent>
            <DialogTitle>Confirm Changes</DialogTitle>
            <DialogText>
              Are you sure you want to save these changes? This action cannot be undone.
            </DialogText>
            <DialogButtons>
              <DialogButton onClick={handleCancel}>
                Cancel
              </DialogButton>
              <DialogButton variant="primary" onClick={handleConfirmChanges}>
                Save Changes
              </DialogButton>
            </DialogButtons>
          </DialogContent>
        </DialogOverlay>
      )}
    </PageContainer>
  );
};

export default TaskEdit;