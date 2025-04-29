import React, { useState } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';

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
  width: 450px;
  max-width: 90vw;
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
  color: var(--color-navy);
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

  ${props => props.variant === 'danger' ? `
    background: #fee2e2;
    color: #dc2626;
    border: none;

    &:hover {
      background: #fecaca;
    }
  ` : props.variant === 'primary' ? `
    background: var(--color-navy);
    color: white;
    border: none;

    &:hover {
      background: #151b4f;
    }
  ` : `
    background: white;
    color: var(--color-navy);
    border: 1px solid var(--color-navy);

    &:hover {
      background: #f5f7fb;
    }
  `}

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const useDeleteConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [itemId, setItemId] = useState(null);
  const [callback, setCallback] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showDeleteConfirmation = (id, onDelete) => {
    setItemId(id);
    setCallback(() => onDelete);
    setIsOpen(true);
  };

  const hideDeleteConfirmation = () => {
    setIsOpen(false);
    setItemId(null);
    setCallback(null);
  };

  const handleConfirm = async () => {
    if (callback && itemId) {
      setIsDeleting(true);
      try {
        await callback(itemId);
      } catch (error) {
        console.error('Delete operation failed:', error);
      } finally {
        setIsDeleting(false);
        hideDeleteConfirmation();
      }
    }
  };

  const DeleteConfirmationModal = () => {
    if (!isOpen) return null;

    return (
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Confirm Deletion</ModalTitle>
            <ModalCloseButton onClick={hideDeleteConfirmation} disabled={isDeleting}>
              <X size={20} />
            </ModalCloseButton>
          </ModalHeader>
          <p>Are you sure you want to delete this item? This action cannot be undone.</p>
          <ModalActions>
            <Button onClick={hideDeleteConfirmation} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalOverlay>
    );
  };

  return {
    showDeleteConfirmation,
    hideDeleteConfirmation,
    DeleteConfirmationModal
  };
};

export default useDeleteConfirmation;