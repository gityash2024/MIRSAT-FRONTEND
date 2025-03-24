import React from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.6;
  }
`;

const SkeletonBase = styled.div`
  background-color: #e2e8f0;
  border-radius: ${props => props.radius || '4px'};
  display: inline-block;
  line-height: 1;
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '20px'};
  margin: ${props => props.margin || '0'};
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

// Badge skeleton
const Badge = styled(SkeletonBase)`
  display: inline-block;
  padding: ${props => props.padding || '0'};
  width: ${props => props.width || '80px'};
  height: ${props => props.height || '24px'};
  border-radius: ${props => props.radius || '12px'};
`;

// Text skeleton with multiple lines
const TextBlock = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TextLine = styled(SkeletonBase)`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '16px'};
`;

// Avatar/circular skeleton
const Circle = styled(SkeletonBase)`
  border-radius: 50%;
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
`;

// Rectangle/card skeleton
const Rectangle = styled(SkeletonBase)`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '100px'};
`;

// Table row skeleton
const TableRow = styled.div`
  display: flex;
  gap: ${props => props.gap || '16px'};
  margin-bottom: ${props => props.marginBottom || '12px'};
`;

const TableCell = styled(SkeletonBase)`
  flex: ${props => props.flex || '1'};
  height: ${props => props.height || '20px'};
`;

// Form field skeleton
const FormField = styled.div`
  width: 100%;
  margin-bottom: ${props => props.marginBottom || '16px'};
`;

const FormLabel = styled(SkeletonBase)`
  width: ${props => props.width || '30%'};
  height: 14px;
  margin-bottom: 8px;
`;

const FormInput = styled(SkeletonBase)`
  width: 100%;
  height: ${props => props.height || '40px'};
`;

// Card skeleton
const CardSkeleton = styled.div`
  width: 100%;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #edf2f7;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  background: white;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const CardTitle = styled(SkeletonBase)`
  height: 24px;
  width: ${props => props.width || '60%'};
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// Button skeleton
const Button = styled(SkeletonBase)`
  height: ${props => props.height || '36px'};
  width: ${props => props.width || '120px'};
  border-radius: 6px;
`;

const Skeleton = {
  Base: SkeletonBase,
  Badge,
  Text: ({ lines = 1, lastLineWidth = '70%', ...props }) => (
    <TextBlock>
      {Array(lines)
        .fill()
        .map((_, i) => (
          <TextLine 
            key={i} 
            width={i === lines - 1 && lines > 1 ? lastLineWidth : '100%'} 
            {...props} 
          />
        ))}
    </TextBlock>
  ),
  Circle,
  Rectangle,
  Table: {
    Row: TableRow,
    Cell: TableCell
  },
  Form: {
    Field: FormField,
    Label: FormLabel,
    Input: FormInput
  },
  Card: {
    Wrapper: CardSkeleton,
    Header: CardHeader,
    Title: CardTitle,
    Body: CardBody
  },
  Button
};

export default Skeleton; 