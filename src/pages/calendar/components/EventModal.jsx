// src/pages/calendar/components/EventModal.jsx
import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import TaskForm from '../../tasks/components/TaskForm';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0;
    align-items: flex-end;
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-sizing: border-box;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    max-width: 100%;
    max-height: 95vh;
    border-radius: 12px 12px 0 0;
  }

  @media (max-width: 480px) {
    max-width: 100%;
    border-radius: 12px 12px 0 0;
    max-height: 95vh;
  }
`;

const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  border-radius: 12px 12px 0 0;

  @media (max-width: 768px) {
    padding: 20px;
  }

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--color-navy);
  margin: 0;

  @media (max-width: 768px) {
    font-size: 18px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: var(--color-navy);
  }

  svg {
    @media (max-width: 480px) {
      width: 18px;
      height: 18px;
    }
  }
`;

const ModalBody = styled.div`
  padding: 24px;

  @media (max-width: 768px) {
    padding: 20px;
  }

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const EventModal = ({
  isOpen,
  onClose,
  event,
  selectedDate,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSuccess = async (taskData) => {
    if (event?.id) {
      // Update existing event
      await onUpdate({
        ...taskData,
        id: event.id
      });
    } else {
      // Create new event
      await onAdd(taskData);
    }
    onClose();
  };

  const handleDeleteEvent = async () => {
    if (event?.id) {
      await onDelete(event.id);
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleBackdropClick}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {event ? t('calendar.editEvent') : t('calendar.createNewEvent')}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <TaskForm
            task={event}
            onCancel={onClose}
            onSuccess={handleSuccess}
            onDelete={event ? handleDeleteEvent : null}
            isEdit={!!event}
            submitButtonText={event ? t('calendar.updateEvent') : t('calendar.createEvent')}
            isCalendarMode={true}
            initialDeadline={selectedDate}
          />
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EventModal;