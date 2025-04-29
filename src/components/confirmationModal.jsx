import React from 'react';
import styled from 'styled-components';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

const Overlay = styled(AlertDialog.Overlay)`
  background-color: rgba(0, 0, 0, 0.4);
  position: fixed;
  inset: 0;
  animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
`;

const Content = styled(AlertDialog.Content)`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 450px;
  max-height: 85vh;
  padding: 24px;
  animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);

  &:focus {
    outline: none;
  }
`;

const Title = styled(AlertDialog.Title)`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 8px;
`;

const Description = styled(AlertDialog.Description)`
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.5;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.variant === 'danger' ? `
    background: #dc3545;
    color: white;
    border: none;

    &:hover {
      background: #c82333;
    }
  ` : `
    background: white;
    color: #666;
    border: 1px solid #e0e0e0;

    &:hover {
      background: #f8f9fa;
    }
  `}
`;

export const useDeleteConfirmation = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState(null);
  const [onConfirm, setOnConfirm] = React.useState(null);

  const showDeleteConfirmation = (item, confirmCallback) => {
    setItemToDelete(item);
    setOnConfirm(() => confirmCallback);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(itemToDelete);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setItemToDelete(null);
    setOnConfirm(null);
  };

  return {
    isOpen,
    showDeleteConfirmation,
    handleConfirm,
    handleCancel,
    DeleteConfirmationModal: () => (
      <AlertDialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialog.Portal>
          <Overlay />
          <Content>
            <Title>Confirm Deletion</Title>
            <Description>
              Are you sure you want to delete this template? This action cannot be undone.
            </Description>
            <ButtonContainer>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirm}>
                Delete
              </Button>
            </ButtonContainer>
          </Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    )
  };
};

export default useDeleteConfirmation;