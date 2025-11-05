import React from 'react';
import styled from 'styled-components';
import { X, AlertTriangle } from 'lucide-react';
import { Z_INDEX } from '../../utils/zIndex';

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
  z-index: ${Z_INDEX.CONFIRMATION_MODAL};
  padding: 20px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    align-items: flex-end;
  }
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
  box-sizing: border-box;

  @media (max-width: 768px) {
    max-width: 100%;
    border-radius: 12px 12px 0 0;
  }

  @media (max-width: 480px) {
    max-width: 100%;
    border-radius: 12px 12px 0 0;
    max-height: 85vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 20px 20px 0 20px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    padding: 16px 16px 0 16px;
    margin-bottom: 12px;
  }
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 17px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    gap: 6px;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 768px) {
      width: 18px;
      height: 18px;
    }

    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.2s;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    padding: 0;
  }

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }

  svg {
    @media (max-width: 480px) {
      width: 18px;
      height: 18px;
    }
  }
`;

const ModalBody = styled.div`
  padding: 0 24px 24px 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0 20px 20px 20px;
  }

  @media (max-width: 480px) {
    padding: 0 16px 16px 16px;
  }
`;

const ModalMessage = styled.p`
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 24px 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    font-size: 13px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 16px;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    gap: 10px;
  }

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: 8px;

    button {
      width: 100%;
      justify-content: center;
    }
  }
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
  white-space: nowrap;
  flex-shrink: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 14px;
    min-width: 70px;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 13px;
    width: 100%;
    min-width: 0;
  }

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
