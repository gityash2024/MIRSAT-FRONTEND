// src/pages/calendar/components/EventModal.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Trash2 } from 'lucide-react';
import { eventTypes, eventStatuses, assignees } from '../mockData';

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
  width: 100%;
  max-width: 600px;
  position: relative;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #1a237e;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const Form = styled.form`
  display: grid;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #1a237e;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  color: #1a237e;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #1a237e;
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  color: #1a237e;
  background: white;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #1a237e;
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const Textarea = styled.textarea`
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  color: #1a237e;
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #1a237e;
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const ModalFooter = styled.div`
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${props => {
    if (props.variant === 'danger') {
      return `
        background: #fee2e2;
        color: #dc2626;
        border: none;

        &:hover {
          background: #fecaca;
        }
      `;
    }
    return props.variant === 'primary' ? `
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
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
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
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    assignee: '',
    status: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    description: ''
  });

  useEffect(() => {
    if (event) {
      const startDateTime = new Date(event.start);
      const endDateTime = new Date(event.end);

      setFormData({
        title: event.title,
        type: event.type,
        assignee: event.assignee,
        status: event.status,
        startDate: startDateTime.toISOString().split('T')[0],
        startTime: startDateTime.toTimeString().slice(0, 5),
        endDate: endDateTime.toISOString().split('T')[0],
        endTime: endDateTime.toTimeString().slice(0, 5),
        description: event.description || ''
      });
    } else if (selectedDate) {
      const defaultEndTime = new Date(selectedDate);
      defaultEndTime.setHours(defaultEndTime.getHours() + 1);

      setFormData({
        title: '',
        type: '',
        assignee: '',
        status: 'pending',
        startDate: selectedDate.toISOString().split('T')[0],
        startTime: selectedDate.toTimeString().slice(0, 5),
        endDate: defaultEndTime.toISOString().split('T')[0],
        endTime: defaultEndTime.toTimeString().slice(0, 5),
        description: ''
      });
    }
  }, [event, selectedDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const eventData = {
      title: formData.title,
      type: formData.type,
      assignee: formData.assignee,
      status: formData.status,
      start: new Date(`${formData.startDate}T${formData.startTime}`).toISOString(),
      end: new Date(`${formData.endDate}T${formData.endTime}`).toISOString(),
      description: formData.description,
      backgroundColor: '#1a237e',
      borderColor: '#1a237e'
    };

    if (event) {
      onUpdate({ ...eventData, id: event.id });
    } else {
      onAdd(eventData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (event && event.id) {
      onDelete(event.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {event ? 'Edit Event' : 'Create New Event'}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Event Title</Label>
              <Input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter event title"
                required
              />
            </FormGroup>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <FormGroup>
                <Label>Event Type</Label>
                <Select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="">Select Type</option>
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Assignee</Label>
                <Select
                  value={formData.assignee}
                  onChange={e => setFormData({ ...formData, assignee: e.target.value })}
                  required
                >
                  <option value="">Select Assignee</option>
                  {assignees.map(assignee => (
                    <option key={assignee.value} value={assignee.value}>
                      {assignee.label}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <FormGroup>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </FormGroup>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <FormGroup>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </FormGroup>
            </div>

            <FormGroup>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <option value="">Select Status</option>
                {eventStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter event description"
              />
            </FormGroup>
          </Form>
        </ModalBody>

        <ModalFooter>
          {event ? (
            <Button type="button" variant="danger" onClick={handleDelete}>
              <Trash2 size={16} style={{ marginRight: '4px' }} />
              Delete Event
            </Button>
          ) : (
            <div /> // Empty div for spacing
          )}
          
          <ButtonGroup>
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" onClick={handleSubmit}>
              {event ? 'Update Event' : 'Create Event'}
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EventModal;