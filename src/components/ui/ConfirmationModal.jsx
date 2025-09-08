import React from 'react';
import styled from 'styled-components';
import { X, AlertTriangle } from 'lucide-react';

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
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const ModalBody = styled.div`
  padding: 0 24px 24px 24px;
`;

const ModalMessage = styled.p`
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 24px 0;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  min-width: 80px;

  ${props => props.variant === 'primary' ? `
    background: #dc2626;
    color: white;
    border-color: #dc2626;

    &:hover {
      background: #b91c1c;
      border-color: #b91c1c;
    }

    &:active {
      background: #991b1b;
    }
  ` : props.variant === 'secondary' ? `
    background: white;
    color: #374151;
    border-color: #d1d5db;

    &:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }

    &:active {
      background: #f3f4f6;
    }
  ` : ''}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  showIcon = true,
  loading = false
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>
            {showIcon && <AlertTriangle size={20} color="#dc2626" />}
            {title}
          </ModalTitle>
          <CloseButton onClick={handleCancel}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <ModalMessage>{message}</ModalMessage>
          
          <ModalActions>
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button
              variant={confirmVariant}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Processing...' : confirmText}
            </Button>
          </ModalActions>
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ConfirmationModal;
