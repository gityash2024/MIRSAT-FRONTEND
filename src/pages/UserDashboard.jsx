import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Calendar, 
  CheckSquare, 
  Clock, 
  AlertCircle,
  ListChecks,
  X,
  User,
  Calendar as CalendarIcon,
  Tag,
  CheckCircle2,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const DashboardContainer = styled.div`
  min-height: 100vh;
  padding: 24px;
  background-color: #f5f7fb;
`;

const WelcomeText = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 32px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  .value {
    font-size: 28px;
    font-weight: 700;
    color: #1a237e;
    margin: 8px 0;
  }

  .label {
    font-size: 14px;
    color: #666;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
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
  color: #1a237e;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TaskItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #f8fafc;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f1f5f9;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .task-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .status-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
  }

  .task-name {
    font-size: 15px;
    font-weight: 500;
    color: #333;
  }

  .task-description {
    font-size: 13px;
    color: #666;
    margin-top: 4px;
  }

  .task-actions {
    display: flex;
    gap: 8px;
  }
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  
  ${props => props.variant === 'primary' ? `
    background: #1a237e;
    color: white;
    
    &:hover {
      background: #151b4f;
    }
  ` : `
    background: #f1f5f9;
    color: #333;
    
    &:hover {
      background: #e2e8f0;
    }
  `}
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  border-left: 4px solid ${props => props.color};
  background: #f8fafc;
  
  .status-label {
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }
  
  .status-count {
    margin-left: auto;
    background: ${props => props.color};
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
  }
`;

const SideModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => (props.isOpen ? 'block' : 'none')};
  z-index: 1000;
`;

const SideModal = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 450px;
  height: 100%;
  background-color: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  transform: translateX(${props => (props.isOpen ? '0' : '100%')});
  transition: transform 0.3s ease-in-out;
  z-index: 1001;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background: #f1f5f9;
    color: #333;
  }
`;

const ModalContent = styled.div`
  padding: 20px;
`;

const TaskDetailSection = styled.div`
  margin-bottom: 24px;
`;

const TaskDetailTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TaskDetailItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
  
  .icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1a237e;
  }
  
  .content {
    flex: 1;
    
    .label {
      font-size: 13px;
      color: #666;
      margin-bottom: 4px;
    }
    
    .value {
      font-size: 15px;
      color: #333;
      font-weight: 500;
    }
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  gap: 6px;
  
  ${props => {
    if (props.status === 'in_progress') {
      return `
        background-color: #e3f2fd;
        color: #1976d2;
      `;
    } else if (props.status === 'pending') {
      return `
        background-color: #fff3e0;
        color: #ed6c02;
      `;
    } else if (props.status === 'completed') {
      return `
        background-color: #e8f5e9;
        color: #2e7d32;
      `;
    } else if (props.status === 'overdue') {
      return `
        background-color: #ffebee;
        color: #d32f2f;
      `;
    }
  }}
`;

const Divider = styled.div`
  height: 1px;
  background-color: #e0e0e0;
  margin: 20px 0;
`;

const UserDashboard = () => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  const stats = [
    {
      icon: ListChecks,
      value: '5',
      label: 'Assigned Tasks',
      color: '#1976d2',
      bgColor: '#e3f2fd'
    },
    {
      icon: CheckSquare,
      value: '3',
      label: 'Completed Tasks',
      color: '#2e7d32',
      bgColor: '#e8f5e9'
    },
    {
      icon: Clock,
      value: '2',
      label: 'In Progress',
      color: '#ed6c02',
      bgColor: '#fff3e0'
    },
    {
      icon: AlertCircle,
      value: '1',
      label: 'Upcoming Deadlines',
      color: '#d32f2f',
      bgColor: '#ffebee'
    }
  ];

  const recentTasks = [
    { 
      id: 1, 
      name: 'Beach Safety Inspection', 
      description: 'Inspect the safety equipment at North Beach area', 
      status: 'in_progress',
      deadline: '2025-03-10',
      assignee: 'John Doe',
      location: 'North Beach Area',
      priority: 'High',
      detailedDescription: 'Check all lifeguard towers, emergency phones, and first aid kits. Verify that all equipment is in working order and properly stocked. Report any issues that need maintenance attention.',
      checklistItems: [
        { id: 1, text: 'Inspect lifeguard towers', completed: true },
        { id: 2, text: 'Check emergency phones', completed: true },
        { id: 3, text: 'Verify first aid kits', completed: false },
        { id: 4, text: 'Inspect safety signs', completed: false }
      ]
    },
    { 
      id: 2, 
      name: 'Marina Check', 
      description: 'Complete the monthly marina security check', 
      status: 'pending',
      deadline: '2025-03-15',
      assignee: 'Jane Smith',
      location: 'Central Marina',
      priority: 'Medium',
      detailedDescription: 'Perform the standard monthly security check of all marina facilities. This includes checking access points, surveillance systems, and emergency equipment. Document any security concerns or maintenance needs.',
      checklistItems: [
        { id: 1, text: 'Check access control systems', completed: false },
        { id: 2, text: 'Inspect surveillance cameras', completed: false },
        { id: 3, text: 'Test emergency alarms', completed: false },
        { id: 4, text: 'Verify dock security', completed: false }
      ]
    }
  ];

  const taskStatusCounts = [
    { status: 'Pending', count: 2, color: '#f97316' },
    { status: 'In Progress', count: 2, color: '#3b82f6' },
    { status: 'Completed', count: 3, color: '#22c55e' },
    { status: 'Overdue', count: 1, color: '#ef4444' },
  ];

  const openTaskModal = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const closeTaskModal = () => {
    setModalOpen(false);
    setSelectedTask(null);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <CheckCircle2 size={16} />;
      case 'in_progress':
        return <Clock size={16} />;
      case 'pending':
        return <AlertCircle size={16} />;
      case 'overdue':
        return <AlertTriangle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <DashboardContainer>
      <WelcomeText>
        Welcome back, {user?.name || 'User'}
      </WelcomeText>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index}>
            <div 
              className="icon-wrapper" 
              style={{ backgroundColor: stat.bgColor }}
            >
              <stat.icon size={24} color={stat.color} />
            </div>
            <div className="value">{stat.value}</div>
            <div className="label">{stat.label}</div>
          </StatCard>
        ))}
      </StatsGrid>

      <ContentGrid>
        <Card>
          <CardTitle>
            <Calendar size={20} />
            Recent Tasks
          </CardTitle>
          <div>
            {recentTasks.map((task) => (
              <TaskItem key={task.id}>
                <div className="task-info">
                  <div 
                    className="status-icon" 
                    style={{ 
                      background: task.status === 'in_progress' ? '#e3f2fd' : '#fff3e0',
                      color: task.status === 'in_progress' ? '#1976d2' : '#ed6c02'
                    }}
                  >
                    {task.status === 'in_progress' ? 
                      <Clock size={16} /> : 
                      <AlertCircle size={16} />
                    }
                  </div>
                  <div>
                    <div className="task-name">{task.name}</div>
                    <div className="task-description">{task.description}</div>
                  </div>
                </div>
                <div className="task-actions">
                  <ActionButton variant="primary" onClick={() => openTaskModal(task)}>View Details</ActionButton>
                </div>
              </TaskItem>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>
            <ListChecks size={20} />
            Task Status
          </CardTitle>
          <div>
            {taskStatusCounts.map((item, index) => (
              <StatusItem key={index} color={item.color}>
                <div className="status-label">{item.status}</div>
                <div className="status-count">{item.count}</div>
              </StatusItem>
            ))}
          </div>
        </Card>
      </ContentGrid>

      <SideModalOverlay isOpen={modalOpen} onClick={closeTaskModal}>
        <SideModal isOpen={modalOpen} onClick={(e) => e.stopPropagation()}>
          {selectedTask && (
            <>
              <ModalHeader>
                <ModalTitle>{selectedTask.name}</ModalTitle>
                <CloseButton onClick={closeTaskModal}>
                  <X size={20} />
                </CloseButton>
              </ModalHeader>
              <ModalContent>
                <TaskDetailSection>
                  <TaskDetailTitle>Task Details</TaskDetailTitle>
                  <TaskDetailItem>
                    <div className="icon">
                      <AlertCircle size={16} />
                    </div>
                    <div className="content">
                      <div className="label">Status</div>
                      <StatusBadge status={selectedTask.status}>
                        {getStatusIcon(selectedTask.status)}
                        {selectedTask.status === 'in_progress' ? 'In Progress' : 
                         selectedTask.status === 'pending' ? 'Pending' : selectedTask.status}
                      </StatusBadge>
                    </div>
                  </TaskDetailItem>
                  <TaskDetailItem>
                    <div className="icon">
                      <User size={16} />
                    </div>
                    <div className="content">
                      <div className="label">Assignee</div>
                      <div className="value">{selectedTask.assignee}</div>
                    </div>
                  </TaskDetailItem>
                  <TaskDetailItem>
                    <div className="icon">
                      <CalendarIcon size={16} />
                    </div>
                    <div className="content">
                      <div className="label">Deadline</div>
                      <div className="value">{selectedTask.deadline}</div>
                    </div>
                  </TaskDetailItem>
                  <TaskDetailItem>
                    <div className="icon">
                      <MapPin size={16} />
                    </div>
                    <div className="content">
                      <div className="label">Location</div>
                      <div className="value">{selectedTask.location}</div>
                    </div>
                  </TaskDetailItem>
                  <TaskDetailItem>
                    <div className="icon">
                      <Tag size={16} />
                    </div>
                    <div className="content">
                      <div className="label">Priority</div>
                      <div className="value">{selectedTask.priority}</div>
                    </div>
                  </TaskDetailItem>
                </TaskDetailSection>
                
                <Divider />
                
                <TaskDetailSection>
                  <TaskDetailTitle>Description</TaskDetailTitle>
                  <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#444' }}>
                    {selectedTask.detailedDescription}
                  </p>
                </TaskDetailSection>
                
                <Divider />
                
                <TaskDetailSection>
                  <TaskDetailTitle>Checklist</TaskDetailTitle>
                  {selectedTask.checklistItems.map(item => (
                    <div key={item.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      padding: '8px 0',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '4px',
                        border: item.completed ? 'none' : '1px solid #ccc',
                        backgroundColor: item.completed ? '#1a237e' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        {item.completed && <CheckSquare size={12} />}
                      </div>
                      <span style={{ 
                        fontSize: '14px', 
                        color: item.completed ? '#666' : '#333',
                        textDecoration: item.completed ? 'line-through' : 'none'
                      }}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </TaskDetailSection>

                <div style={{ marginTop: '24px' }}>
                  <ActionButton variant="primary" style={{ width: '100%' }}>
                    Update Task
                  </ActionButton>
                </div>
              </ModalContent>
            </>
          )}
        </SideModal>
      </SideModalOverlay>
    </DashboardContainer>
  );
};

export default UserDashboard;