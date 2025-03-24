import React from 'react';
import styled from 'styled-components';
import Skeleton from '../../components/ui/Skeleton';

const SkeletonContainer = styled.div`
  display: grid;
  gap: 16px;
`;

const SkeletonCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.hasContent ? '16px' : '0'};
`;

const HeaderLeft = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 8px;
`;

const CardContent = styled.div`
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
`;

const SubLevelItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 8px;
  gap: 12px;
`;

const LevelListSkeleton = () => {
  return (
    <SkeletonContainer>
      {Array(5).fill().map((_, i) => {
        const hasNestedContent = Math.random() > 0.5;
        
        return (
          <SkeletonCard key={i}>
            <CardHeader hasContent={hasNestedContent}>
              <HeaderLeft>
                <Skeleton.Circle size="40px" />
                <div>
                  <Skeleton.Base width={`${180 + Math.random() * 100}px`} height="18px" margin="0 0 8px 0" />
                  <Skeleton.Base width={`${220 + Math.random() * 80}px`} height="14px" />
                </div>
              </HeaderLeft>
              <HeaderRight>
                <Skeleton.Circle size="32px" />
                <Skeleton.Circle size="32px" />
                <Skeleton.Circle size="32px" />
                <Skeleton.Circle size="24px" />
              </HeaderRight>
            </CardHeader>
            
            {hasNestedContent && (
              <CardContent>
                {Array(Math.floor(Math.random() * 3) + 1).fill().map((_, j) => (
                  <SubLevelItem key={j} style={{ marginLeft: `${Math.floor(Math.random() * 2) * 20}px` }}>
                    <Skeleton.Circle size="32px" />
                    <Skeleton.Base width={`${120 + Math.random() * 100}px`} height="16px" />
                  </SubLevelItem>
                ))}
              </CardContent>
            )}
          </SkeletonCard>
        );
      })}
    </SkeletonContainer>
  );
};

export default LevelListSkeleton;