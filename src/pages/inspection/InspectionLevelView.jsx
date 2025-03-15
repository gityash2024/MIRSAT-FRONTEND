import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Layers, Activity, FileText, X, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { inspectionService } from '../../services/inspection.service';
import SubLevelViewModal from './SubLevelViewModal';
import SubLevelEditModal from './SubLevelEditModal';

const ModalOverlay = styled.div`
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

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #333;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

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

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
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

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
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
  margin-left: ${props => props.level * 32}px;
  margin-bottom: 16px;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    left: -16px;
    top: 50%;
    width: 16px;
    height: 2px;
    background: #e2e8f0;
  }

  &:after {
    content: '';
    position: absolute;
    left: -16px;
    top: -8px;
    bottom: ${props => props.isLast ? '50%' : '-8px'};
    width: 2px;
    background: #e2e8f0;
  }

  &:first-child:after {
    top: 50%;
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
  position: relative;
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

const NodeActions = styled.div`
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;

  ${NodeContent}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  padding: 6px;
  background: white;
  border: none;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #1a237e;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
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

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48px 0;
  color: #1a237e;
`;

const NestedHierarchyNode = styled.div`
  margin-left: ${props => props.level * 32}px;
  margin-bottom: 16px;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    left: -16px;
    top: 50%;
    width: 16px;
    height: 2px;
    background: #e2e8f0;
  }

  &:after {
    content: '';
    position: absolute;
    left: -16px;
    top: -8px;
    bottom: ${props => props.isLast ? '50%' : '-8px'};
    width: 2px;
    background: #e2e8f0;
  }

  &:first-child:after {
    top: 50%;
  }
`;

const ExpandCollapseButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  margin-right: 4px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #1a237e;
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  text-align: center;
  color: #dc2626;
  
  h3 {
    font-size: 18px;
    margin-bottom: 8px;
  }
  
  p {
    color: #666;
    margin-bottom: 16px;
  }
`;

const InspectionLevelView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [level, setLevel] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState({});
  
  // States for sublevel modals
  const [selectedSubLevel, setSelectedSubLevel] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchInspectionLevel();
  }, [id]);

  const fetchInspectionLevel = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inspectionService.getInspectionLevel(id);
      setLevel(data);

      const expandedState = {};
      const initExpandedState = (subLevels, prefix = '') => {
        if (!subLevels || !Array.isArray(subLevels)) return;
        
        subLevels.forEach((node, index) => {
          const nodeId = prefix ? `${prefix}.${index}` : `${index}`;
          expandedState[nodeId] = true;
          if (node.subLevels && node.subLevels.length > 0) {
            initExpandedState(node.subLevels, nodeId);
          }
        });
      };
      
      if (data.subLevels) {
        initExpandedState(data.subLevels);
      }
      
      setExpandedNodes(expandedState);
    } catch (error) {
      console.error('Error fetching inspection level:', error);
      setError(error.message || 'Failed to load inspection level');
      toast.error('Failed to load inspection level');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await inspectionService.deleteInspectionLevel(id);
      toast.success('Inspection level deleted successfully');
      navigate('/inspection');
    } catch (error) {
      console.error('Error deleting inspection level:', error);
      toast.error(error.message || 'Failed to delete inspection level');
    } finally {
      setShowDeleteModal(false);
      setLoading(false);
    }
  };

  const toggleNodeExpanded = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };
  
  // Find a sublevel by path (e.g., "0.1.2")
  const findSubLevelByPath = (path) => {
    if (!level || !level.subLevels) return null;
    
    const indices = path.split('.');
    let currentLevel = level.subLevels;
    let currentNode = null;
    
    for (const index of indices) {
      if (!currentLevel[index]) return null;
      currentNode = currentLevel[index];
      currentLevel = currentNode.subLevels || [];
    }
    
    return currentNode;
  };
  
  // Handle sublevel view action
  const handleViewSubLevel = (path) => {
    const subLevel = findSubLevelByPath(path);
    if (subLevel) {
      setSelectedSubLevel(subLevel);
      setShowViewModal(true);
    }
  };
  
  // Handle sublevel edit action
  const handleEditSubLevel = (path) => {
    const subLevel = findSubLevelByPath(path);
    if (subLevel) {
      setSelectedSubLevel(subLevel);
      setShowEditModal(true);
    }
  };
  
  // Update sublevel after edit
  const handleUpdateSubLevel = async (updatedSubLevel) => {
    try {
      setLoading(true);
      await inspectionService.updateSubLevel(id, updatedSubLevel._id, updatedSubLevel);
      toast.success('Sub level updated successfully');
      setShowEditModal(false);
      fetchInspectionLevel(); // Refresh data
    } catch (error) {
      console.error('Error updating sub level:', error);
      toast.error(error.message || 'Failed to update sub level');
    } finally {
      setLoading(false);
    }
  };

  const renderHierarchy = (nodes, parentLevel = 0, parentId = '') => {
    if (!nodes || !Array.isArray(nodes)) return null;
    
    return nodes.map((node, index) => {
      const nodeId = parentId ? `${parentId}.${index}` : `${index}`;
      const hasChildren = node.subLevels && node.subLevels.length > 0;
      const isExpanded = expandedNodes[nodeId];
      
      return (
        <React.Fragment key={node._id || index}>
          <NestedHierarchyNode level={parentLevel} isLast={index === nodes.length - 1}>
            <NodeContent>
              {hasChildren && (
                <ExpandCollapseButton onClick={() => toggleNodeExpanded(nodeId)}>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </ExpandCollapseButton>
              )}
              <NodeIcon>
                <Layers size={16} />
              </NodeIcon>
              <NodeInfo>
                <h4>{node.name}</h4>
                <p>{node.description}</p>
              </NodeInfo>
              <NodeActions>
                <ActionButton 
                  onClick={() => handleViewSubLevel(nodeId)}
                  disabled={loading}
                >
                  <Info size={14} />
                </ActionButton>
                <ActionButton 
                  onClick={() => handleEditSubLevel(nodeId)}
                  disabled={loading}
                >
                  <Edit size={14} />
                </ActionButton>
              </NodeActions>
            </NodeContent>
          </NestedHierarchyNode>
          
          {hasChildren && isExpanded && (
            <div style={{ marginLeft: 32 }}>
              {renderHierarchy(node.subLevels, parentLevel + 1, nodeId)}
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner>
          <div className="spinner"></div>
          <p>Loading inspection level...</p>
        </LoadingSpinner>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorContainer>
          <h3>Error Loading Inspection Level</h3>
          <p>{error}</p>
          <Button onClick={() => navigate('/inspection')}>
            <ArrowLeft size={18} />
            Back to Inspection Levels
          </Button>
        </ErrorContainer>
      </PageContainer>
    );
  }

  if (!level) {
    return (
      <PageContainer>
        <ErrorContainer>
          <h3>Inspection Level Not Found</h3>
          <p>The inspection level you're looking for doesn't exist or has been removed</p>
          <Button onClick={() => navigate('/inspection')}>
            <ArrowLeft size={18} />
            Back to Inspection Levels
          </Button>
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {showDeleteModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Delete Inspection Level</ModalTitle>
              <ModalCloseButton onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </ModalCloseButton>
            </ModalHeader>
            <p>Are you sure you want to delete this inspection level? This action cannot be undone.</p>
            <ModalActions>
              <Button onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete} disabled={loading}>Delete</Button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
      
      {showViewModal && selectedSubLevel && (
        <SubLevelViewModal 
          subLevel={selectedSubLevel} 
          onClose={() => setShowViewModal(false)} 
        />
      )}
      
      {showEditModal && selectedSubLevel && (
        <SubLevelEditModal 
          subLevel={selectedSubLevel} 
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateSubLevel}
          loading={loading}
        />
      )}

      <BackButton onClick={() => navigate('/inspection')} disabled={loading}>
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
          <Button 
            as={Link} 
            to={`/inspection/${id}/edit`}
            disabled={loading}
          >
            <Edit size={16} />
            Edit Level
          </Button>
          <Button 
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            disabled={loading}
          >
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
              {renderHierarchy(level.subLevels || [])}
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
                <StatValue>{level.metrics?.completedTasks || 0}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Active Inspectors</StatLabel>
                <StatValue>{level.metrics?.activeInspectors || 0}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Avg. Completion Time</StatLabel>
                <StatValue>{level.metrics?.avgCompletionTime || '0h'}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Compliance Rate</StatLabel>
                <StatValue>{level.metrics?.complianceRate || '0%'}</StatValue>
              </StatCard>
            </StatsList>
          </Card>

          <Card style={{ marginTop: '24px' }}>
            <CardTitle>
              <FileText size={18} />
              Assigned Tasks
            </CardTitle>
            {level.assignedTasks && level.assignedTasks.length > 0 ? (
              <TasksList>
                {level.assignedTasks.map(task => (
                  <TaskItem key={task._id || `task-${Math.random()}`}>
                    <NodeIcon background="#f0f9ff" color="#0284c7">
                      <FileText size={16} />
                    </NodeIcon>
                    <TaskInfo>
                      <h4>{task.title}</h4>
                      <p>{task.description}</p>
                    </TaskInfo>
                    <StatusBadge status={task.status || 'pending'}>
                      {task.status ? (task.status.charAt(0).toUpperCase() + task.status.slice(1)) : 'Pending'}
                    </StatusBadge>
                  </TaskItem>
                ))}
              </TasksList>
            ) : (
              <p>No tasks assigned</p>
            )}
          </Card>
        </div>
      </ContentGrid>
    </PageContainer>
  );
};

export default InspectionLevelView;