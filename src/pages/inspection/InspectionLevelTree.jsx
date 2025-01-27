// src/pages/inspection/InspectionLevelTree.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Plus, 
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Search,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

// Mock data
const mockTreeData = [
  {
    id: 1,
    name: 'Initial Safety Inspection',
    description: 'First level safety inspection for all facilities',
    type: 'safety',
    children: [
      {
        id: 4,
        name: 'Equipment Check',
        description: 'Verify all safety equipment',
        type: 'safety',
        children: [
          {
            id: 7,
            name: 'Personal Protection Equipment',
            description: 'PPE inspection and inventory',
            type: 'safety',
            children: []
          }
        ]
      },
      {
        id: 5,
        name: 'Protocol Verification',
        description: 'Safety protocol compliance check',
        type: 'safety',
        children: []
      }
    ]
  },
  {
    id: 2,
    name: 'Environmental Compliance',
    description: 'Environmental standards verification',
    type: 'environmental',
    children: [
      {
        id: 6,
        name: 'Emissions Test',
        description: 'Check emission levels',
        type: 'environmental',
        children: []
      }
    ]
  }
];

const TreeNodeComponent = ({ node, level = 0, isLastChild = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <>
      <TreeNode level={level} isLastChild={isLastChild} isRoot={level === 0}>
        <NodeContent>
          {hasChildren && (
            <ToggleButton onClick={() => setIsExpanded(!isExpanded)}>
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
            <ActionButton as={Link} to={`/inspection/${node.id}`}>
              <Eye size={14} />
            </ActionButton>
            <ActionButton as={Link} to={`/inspection/${node.id}/edit`}>
              <Edit size={14} />
            </ActionButton>
            <ActionButton>
              <Trash2 size={14} />
            </ActionButton>
          </NodeActions>
        </NodeContent>
      </TreeNode>
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child, index) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              isLastChild={index === node.children.length - 1}
            />
          ))}
        </div>
      )}
    </>
  );
};

const InspectionLevelTree = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        <ButtonGroup>
          <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} />
            Filters
          </Button>
          <Button variant="primary" as={Link} to="/inspection/create">
            <Plus size={18} />
            Add Level
          </Button>
        </ButtonGroup>
      </ActionBar>

      <TreeCard>
        {mockTreeData.map((node, index) => (
          <TreeNodeComponent
            key={node.id}
            node={node}
            isLastChild={index === mockTreeData.length - 1}
          />
        ))}
      </TreeCard>
    </TreeContainer>
  );
};

export default InspectionLevelTree;