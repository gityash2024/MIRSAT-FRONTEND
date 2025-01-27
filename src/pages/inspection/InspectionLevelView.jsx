// src/pages/inspection/InspectionLevelView.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Layers,
  Activity,
  FileText
} from 'lucide-react';

// Styled Components
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

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
`;

const HeaderInfo = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #e3f2fd;
  color: #1a237e;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TitleSection = styled.div``;

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

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  cursor: pointer;
  text-decoration: none;

  ${props => {
    if (props.variant === 'danger') {
      return `
        background: #fee2e2;
        color: #dc2626;
        border: none;
        &:hover {
          background: #fecaca;
        }
      `;
    }
    if (props.variant === 'primary') {
      return `
        background: #1a237e;
        color: white;
        border: none;
        &:hover {
          background: #151b4f;
        }
      `;
    }
    return `
      background: white;
      color: #1a237e;
      border: 1px solid #1a237e;
      &:hover {
        background: #f5f7fb;
      }
    `;
  }}
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LevelHierarchy = styled.div`
  margin-top: 20px;
`;

const HierarchyNode = styled.div`
  position: relative;
  padding-left: ${props => props.level * 24}px;
  margin-bottom: 12px;

  &:before {
    content: '';
    position: absolute;
    left: ${props => (props.level - 1) * 24 + 10}px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${props => props.isLast ? 'transparent' : '#e2e8f0'};
  }

  &:after {
    content: '';
    position: absolute;
    left: ${props => (props.level - 1) * 24 + 10}px;
    top: 20px;
    width: 14px;
    height: 2px;
    background: #e2e8f0;
  }
`;

const NodeContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const NodeIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: ${props => props.background || '#e3f2fd'};
  color: ${props => props.color || '#1a237e'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NodeInfo = styled.div`
  flex: 1;

  h4 {
    font-size: 14px;
    font-weight: 500;
    color: #1a237e;
    margin-bottom: 2px;
  }

  p {
    font-size: 12px;
    color: #666;
  }
`;

const StatsList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StatLabel = styled.span`
  font-size: 13px;
  color: #666;
`;

const StatValue = styled.span`
  font-size: 24px;
  font-weight: 600;
  color: #1a237e;
`;

const TasksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const TaskInfo = styled.div`
  flex: 1;
  
  h4 {
    font-size: 14px;
    font-weight: 500;
    color: #1a237e;
    margin-bottom: 2px;
  }

  p {
    font-size: 12px;
    color: #666;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => 
    props.status === 'completed' ? '#e8f5e9' :
    props.status === 'in_progress' ? '#fff3e0' :
    '#f3e5f5'};
  color: ${props => 
    props.status === 'completed' ? '#2e7d32' :
    props.status === 'in_progress' ? '#ed6c02' :
    '#9c27b0'};
`;

// Mock data
const mockLevel = {
  id: 1,
  name: 'Initial Safety Inspection',
  description: 'First level safety inspection for all facilities',
  type: 'Safety',
  createdAt: '2024-01-15',
  stats: {
    completedTasks: 145,
    activeInspectors: 12,
    avgCompletionTime: '4.2h',
    compliance: '92%'
  },
  hierarchy: [
    {
      id: 1,
      name: 'Equipment Check',
      description: 'Initial verification of all safety equipment',
      subLevels: [
        {
          id: 4,
          name: 'Personal Protection Equipment',
          description: 'Check all PPE items'
        },
        {
          id: 5,
          name: 'Emergency Equipment',
          description: 'Verify emergency response equipment'
        }
      ]
    },
    {
      id: 2,
      name: 'Safety Protocol Verification',
      description: 'Review and verify safety protocols',
      subLevels: []
    },
    {
      id: 3,
      name: 'Documentation Review',
      description: 'Review all safety documentation',
      subLevels: []
    }
  ],
  recentTasks: [
    {
      id: 1,
      name: 'Marina Safety Equipment Inspection',
      assignee: 'John Doe',
      status: 'completed',
      date: '2024-01-15'
    },
    {
      id: 2,
      name: 'Beach Safety Protocol Review',
      assignee: 'Jane Smith',
      status: 'in_progress',
      date: '2024-01-16'
    },
    {
      id: 3,
      name: 'Emergency Response Equipment Check',
      assignee: 'Mike Johnson',
      status: 'pending',
      date: '2024-01-17'
    }
  ]
};

const InspectionLevelView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [level, setLevel] = useState(null);

  useEffect(() => {
    setLevel(mockLevel);
  }, [id]);

  if (!level) {
    return <div>{'Loading...'}</div>;
  }

  const renderHierarchy = (nodes, level = 1, parentPath = []) => {
    return nodes.map((node, index) => {
      const isLast = index === nodes.length - 1;
      const currentPath = [...parentPath, node.id];
      
      return (
        <React.Fragment key={node.id}>
          <HierarchyNode level={level} isLast={isLast}>
            <NodeContent>
              <NodeIcon>
                <Layers size={16} />
              </NodeIcon>
              <NodeInfo>
                <h4>{node.name}</h4>
                <p>{node.description}</p>
              </NodeInfo>
            </NodeContent>
          </HierarchyNode>
          {node.subLevels && node.subLevels.length > 0 && 
            renderHierarchy(node.subLevels, level + 1, currentPath)}
        </React.Fragment>
      );
    });
  };

  return (
    <PageContainer>
      <BackButton onClick={() => navigate('/inspection')}>
        <ArrowLeft size={18} />
        Back to Inspection Levels
      </BackButton>

      <Header>
        <HeaderInfo>
          <IconWrapper>
            <Layers size={24} />
          </IconWrapper>
          <TitleSection>
            <PageTitle>{level.name}</PageTitle>
            <SubTitle>{level.description}</SubTitle>
          </TitleSection>
        </HeaderInfo>

        <ButtonGroup>
          <Button as={Link} to={`/inspection/${id}/edit`}>
            <Edit size={16} />
            Edit Level
          </Button>
          <Button variant="danger">
            <Trash2 size={16} />
            Delete Level
          </Button>
        </ButtonGroup>
      </Header>

      <ContentGrid>
        <div>
          <Card>
            <CardTitle>
              <Activity size={18} />
              Level Hierarchy
            </CardTitle>
            <LevelHierarchy>
              {renderHierarchy(level.hierarchy)}
            </LevelHierarchy>
          </Card>
        </div>

        <div>
          <Card>
            <CardTitle>
              <Activity size={18} />
              Performance Metrics
            </CardTitle>
            <StatsList>
              <StatCard>
                <StatLabel>Completed Tasks</StatLabel>
                <StatValue>{level.stats.completedTasks}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Active Inspectors</StatLabel>
                <StatValue>{level.stats.activeInspectors}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Avg. Completion Time</StatLabel>
                <StatValue>{level.stats.avgCompletionTime}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Compliance Rate</StatLabel>
                <StatValue>{level.stats.compliance}</StatValue>
              </StatCard>
            </StatsList>
          </Card>

          <Card style={{ marginTop: '24px' }}>
            <CardTitle>
              <FileText size={18} />
              Recent Tasks
            </CardTitle>
            <TasksList>
              {level.recentTasks.map(task => (
                <TaskItem key={task.id}>
                  <NodeIcon background="#f0f9ff" color="#0284c7">
                    <FileText size={16} />
                  </NodeIcon>
                  <TaskInfo>
                    <h4>{task.name}</h4>
                    <p>Assigned to {task.assignee}</p>
                  </TaskInfo>
                  <StatusBadge status={task.status}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </StatusBadge>
                </TaskItem>
              ))}
            </TasksList>
          </Card>
        </div>
      </ContentGrid>
    </PageContainer>
  );
};

export default InspectionLevelView;