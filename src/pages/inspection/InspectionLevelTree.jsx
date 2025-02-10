import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useOutletContext } from 'react-router-dom';
import { ChevronRight, ChevronDown, Layers, Plus, Edit, Eye, Trash2, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import InspectionLevelFilters from './InspectionLevelFilters';

const TreeContainer = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SubTitle = styled.p`
  color: #666;
  font-size: 14px;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;

  input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.3s;

    &:focus {
      outline: none;
      border-color: #1a237e;
      box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
    }
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }
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

  ${props => props.variant === 'primary' ? `
    background: #1a237e;
    color: white;
    border: none;

    &:hover {
      background: #151b4f;
    }
  ` : `
    background: white;
    color: #1a237e;
    border: 1px solid #1a237e;

    &:hover {
      background: #f5f7fb;
    }
  `}

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const TreeCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const TreeNode = styled.div`
  position: relative;
  padding-left: ${props => props.level * 24}px;
  margin-bottom: 12px;

  &:before {
    content: '';
    position: absolute;
    left: ${props => (props.level - 1) * 24 + 10}px;
    top: 0;
    bottom: ${props => props.isLastChild ? '50%' : '0'};
    width: 2px;
    background: ${props => props.isRoot ? 'transparent' : '#e2e8f0'};
  }

  &:after {
    content: '';
    position: absolute;
    left: ${props => (props.level - 1) * 24 + 10}px;
    top: 20px;
    width: 14px;
    height: 2px;
    background: ${props => props.isRoot ? 'transparent' : '#e2e8f0'};
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
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    border-color: #1a237e;
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    color: #1a237e;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
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

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.type === 'safety' ? '#e8f5e9' : 
    props.type === 'environmental' ? '#e3f2fd' : 
    props.type === 'operational' ? '#fff3e0' : '#f3e5f5'};
  color: ${props => props.type === 'safety' ? '#2e7d32' : 
    props.type === 'environmental' ? '#1565c0' : 
    props.type === 'operational' ? '#ed6c02' : '#9c27b0'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 0;
  color: #666;

  h3 {
    font-size: 18px;
    margin-bottom: 8px;
    color: #1a237e;
  }

  p {
    margin-bottom: 16px;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48px 0;
  color: #1a237e;
`;

const TreeNodeComponent = ({ node, level = 0, isLastChild = false, loading, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.subLevels && node.subLevels.length > 0;

  return (
    <>
      <TreeNode level={level} isLastChild={isLastChild} isRoot={level === 0}>
        <NodeContent>
          {hasChildren && (
            <ToggleButton 
              onClick={() => setIsExpanded(!isExpanded)}
              disabled={loading}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </ToggleButton>
          )}
          <NodeIcon>
            <Layers size={16} />
          </NodeIcon>
          <NodeInfo>
            <h4>{node.name}</h4>
            <p>{node.description}</p>
          </NodeInfo>
          <StatusBadge type={node.type}>
            {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
          </StatusBadge>
          <NodeActions>
            <ActionButton 
              as={Link} 
              to={`/inspection/${node._id}`}
              disabled={loading}
            >
              <Eye size={14} />
            </ActionButton>
            <ActionButton 
              as={Link} 
              to={`/inspection/${node._id}/edit`}
              disabled={loading}
            >
              <Edit size={14} />
            </ActionButton>
            <ActionButton
              onClick={() => onDelete(node._id)}
              disabled={loading}
            >
              <Trash2 size={14} />
            </ActionButton>
          </NodeActions>
        </NodeContent>
      </TreeNode>
      {hasChildren && isExpanded && (
        <div>
          {node.subLevels.map((child, index) => (
            <TreeNodeComponent
              key={child._id}
              node={child}
              level={level + 1}
              isLastChild={index === node.subLevels.length - 1}
              loading={loading}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </>
  );
};

const InspectionLevelTree = () => {
  const { loading, setLoading, handleError, inspectionService } = useOutletContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: [],
    status: [],
    priority: []
  });
  const [treeData, setTreeData] = useState([]);

  useEffect(() => {
    fetchInspectionLevels();
  }, [filters]);

  const fetchInspectionLevels = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        search: searchTerm
      };
      const response = await inspectionService.getInspectionLevels(params);
      setTreeData(response.results || []);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.key === 'Enter') {
      fetchInspectionLevels();
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inspection level?')) {
      return;
    }

    try {
      setLoading(true);
      await inspectionService.deleteInspectionLevel(id);
      toast.success('Inspection level deleted successfully');
      fetchInspectionLevels();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <TreeContainer>
      <Header>
        <PageTitle>
          <Layers size={24} />
          Inspection Level Hierarchy
        </PageTitle>
        <SubTitle>View and manage the complete inspection level structure</SubTitle>
      </Header>

      <ActionBar>
        <SearchBox>
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search inspection levels..."
            value={searchTerm}
            onChange={handleSearch}
            onKeyPress={(e) => e.key === 'Enter' && fetchInspectionLevels()}
            disabled={loading}
          />
        </SearchBox>

        <ButtonGroup>
          <Button 
            variant="secondary" 
            onClick={() => setShowFilters(!showFilters)}
            disabled={loading}
          >
            <Filter size={18} />
            Filters
          </Button>
          <Button 
            variant="primary" 
            as={Link} 
            to="/inspection/create"
            disabled={loading}
          >
            <Plus size={18} />
            Add Level
          </Button>
        </ButtonGroup>
      </ActionBar>

      {showFilters && (
        <InspectionLevelFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
          loading={loading}
        />
      )}

      <TreeCard>
        {loading ? (
          <LoadingSpinner>Loading...</LoadingSpinner>
        ) : treeData.length === 0 ? (
          <EmptyState>
            <h3>No Inspection Levels Found</h3>
            <p>Create your first inspection level to get started</p>
            <Button 
              variant="primary" 
              as={Link} 
              to="/inspection/create"
            >
              <Plus size={18} />
              Add Level
            </Button>
          </EmptyState>
        ) : (
          treeData.map((node, index) => (
            <TreeNodeComponent
              key={node._id}
              node={node}
              isLastChild={index === treeData.length - 1}
              loading={loading}
              onDelete={handleDelete}
            />
          ))
        )}
      </TreeCard>
    </TreeContainer>
  );
};

export default InspectionLevelTree;