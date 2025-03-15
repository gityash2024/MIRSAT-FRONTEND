import React from 'react';
import styled from 'styled-components';
import { X, Layers } from 'lucide-react';

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
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
  display: flex;
  align-items: center;
  gap: 8px;
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

const SubLevelDetails = styled.div`
  margin-bottom: 24px;
`;

const DetailItem = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 4px;
`;

const DetailValue = styled.div`
  font-size: 16px;
  color: #333;
`;

const NestedSubLevels = styled.div`
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
`;

const NestedTitle = styled.h4`
  font-size: 16px;
  font-weight: 500;
  color: #1a237e;
  margin-bottom: 16px;
`;

const SubLevelItem = styled.div`
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid #e2e8f0;
  
  h5 {
    font-size: 14px;
    font-weight: 500;
    color: #1a237e;
    margin-bottom: 4px;
  }
  
  p {
    font-size: 13px;
    color: #64748b;
    margin: 0;
  }
`;

const FooterActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  background: #1a237e;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: #151b4f;
  }
`;

const SubLevelViewModal = ({ subLevel, onClose }) => {
  if (!subLevel) return null;
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <Layers size={20} />
            Sub Level Details
          </ModalTitle>
          <ModalCloseButton onClick={onClose}>
            <X size={20} />
          </ModalCloseButton>
        </ModalHeader>
        
        <SubLevelDetails>
          <DetailItem>
            <DetailLabel>Name</DetailLabel>
            <DetailValue>{subLevel.name}</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Description</DetailLabel>
            <DetailValue>{subLevel.description}</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Order</DetailLabel>
            <DetailValue>{subLevel.order !== undefined ? subLevel.order : 'N/A'}</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Status</DetailLabel>
            <DetailValue>
              {subLevel.isCompleted ? 'Completed' : 'Pending'}
            </DetailValue>
          </DetailItem>
          
          {subLevel.completedAt && (
            <DetailItem>
              <DetailLabel>Completed At</DetailLabel>
              <DetailValue>
                {new Date(subLevel.completedAt).toLocaleString()}
              </DetailValue>
            </DetailItem>
          )}
        </SubLevelDetails>
        
        {subLevel.subLevels && subLevel.subLevels.length > 0 && (
          <NestedSubLevels>
            <NestedTitle>Nested Sub Levels</NestedTitle>
            {subLevel.subLevels.map((nested, index) => (
              <SubLevelItem key={nested._id || index}>
                <h5>{nested.name}</h5>
                <p>{nested.description}</p>
              </SubLevelItem>
            ))}
          </NestedSubLevels>
        )}
        
        <FooterActions>
          <Button onClick={onClose}>Close</Button>
        </FooterActions>
      </ModalContent>
    </ModalOverlay>
  );
};

export default SubLevelViewModal;