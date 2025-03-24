import React from 'react';
import styled from 'styled-components';
import Skeleton from '../../components/ui/Skeleton';

const SkeletonContainer = styled.div`
  padding: 24px;
`;

const TreeNodeSkeleton = styled.div`
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
`;

const InspectionLevelTreeSkeleton = () => {
  // Function to generate node with nested children
  const generateNodes = (level = 0, count = 3, maxDepth = 2) => {
    return Array(count).fill().map((_, index) => {
      const hasChildren = level < maxDepth && Math.random() > 0.5;
      const childCount = hasChildren ? Math.floor(Math.random() * 3) + 1 : 0;
      
      return (
        <React.Fragment key={`level-${level}-node-${index}`}>
          <TreeNodeSkeleton 
            level={level} 
            isLastChild={index === count - 1} 
            isRoot={level === 0}
          >
            <NodeContent>
              {level > 0 && <Skeleton.Circle size="16px" />}
              <Skeleton.Circle size="32px" />
              <div style={{ flex: 1 }}>
                <Skeleton.Base width={`${150 - level * 20 + Math.random() * 100}px`} height="16px" margin="0 0 4px 0" />
                <Skeleton.Base width={`${200 - level * 30 + Math.random() * 100}px`} height="12px" />
              </div>
              <Skeleton.Base width="70px" height="24px" radius="12px" />
              <div style={{ display: 'flex', gap: '4px' }}>
                <Skeleton.Circle size="24px" />
                <Skeleton.Circle size="24px" />
                <Skeleton.Circle size="24px" />
              </div>
            </NodeContent>
          </TreeNodeSkeleton>
          
          {hasChildren && (
            <div style={{ marginLeft: 24 }}>
              {generateNodes(level + 1, childCount, maxDepth)}
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <SkeletonContainer>
      {generateNodes()}
    </SkeletonContainer>
  );
};

export default InspectionLevelTreeSkeleton;