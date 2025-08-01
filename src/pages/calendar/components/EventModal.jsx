// src/pages/calendar/components/EventModal.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { X, Trash2 } from 'lucide-react';

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
  max-width: 800px;
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
  color: var(--color-navy);
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
    color: var(--color-navy);
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
  color: var(--color-navy);
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  color: var(--color-navy);
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--color-navy);
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  color: var(--color-navy);
  background: white;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--color-navy);
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const Textarea = styled.textarea`
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  color: var(--color-navy);
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--color-navy);
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
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
  // Get data from Redux store
  const { users } = useSelector((state) => state.users || { users: [] });
  const { levels } = useSelector((state) => state.inspectionLevels || { levels: { results: [] } });
  const { assets } = useSelector((state) => state.assets || { assets: [] });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    assignedTo: '',
    inspectionLevel: '',
    asset: '',
    deadline: '',
    location: ''
  });

  // Available statuses and priorities
  const statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  useEffect(() => {
    if (event) {
      console.log('EventModal editing event:', event);
      console.log('Available levels:', levels?.results);
      console.log('Available assets:', assets);
      console.log('Available users:', users);

      setFormData({
        title: event.title || '',
        description: event.description || '',
        status: event.status || 'pending',
        priority: event.priority || 'medium',
        assignedTo: event.assignedTo || '',
        inspectionLevel: event.inspectionLevel || '',
        asset: event.asset || '',
        deadline: event.deadline || '',
        location: event.location || ''
      });
      
      console.log('Form data set to:', {
        title: event.title || '',
        description: event.description || '',
        status: event.status || 'pending',
        priority: event.priority || 'medium',
        assignedTo: event.assignedTo || '',
        inspectionLevel: event.inspectionLevel || '',
        asset: event.asset || '',
        deadline: event.deadline || '',
        location: event.location || ''
      });
    } else if (selectedDate) {
      console.log('EventModal creating new event for date:', selectedDate);

      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        assignedTo: '',
        inspectionLevel: '',
        asset: '',
        deadline: selectedDate.toISOString().split('T')[0],
        location: ''
      });
    }
  }, [event, selectedDate, levels, assets, users]);

  const handleDelete = () => {
    if (event && event.id) {
      onDelete(event.id);
      onClose();
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      alert('Title is required');
      return false;
    }
    if (!formData.deadline) {
      alert('Deadline is required');
      return false;
    }
    if (!formData.assignedTo) {
      alert('Please select a user to assign this task to');
      return false;
    }
    // Validate user ID format (MongoDB ObjectId)
    if (formData.assignedTo && !/^[0-9a-fA-F]{24}$/.test(formData.assignedTo)) {
      alert('Invalid user selection. Please select a valid user.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const eventData = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      assignedTo: formData.assignedTo,
      inspectionLevel: formData.inspectionLevel,
      asset: formData.asset,
      deadline: formData.deadline,
      location: formData.location
    };

    if (event) {
      onUpdate({ ...eventData, id: event.id });
    } else {
      onAdd(eventData);
    }

    onClose();
  };

  if (!isOpen) return null;

  // Check if required data is loaded for editing mode
  const isDataLoading = event && (!users?.length || !levels?.results?.length);
  
  if (isDataLoading) {
    return (
      <ModalOverlay onClick={onClose}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>Loading...</ModalTitle>
            <CloseButton onClick={onClose}>
              <X size={20} />
            </CloseButton>
          </ModalHeader>
          <ModalBody>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <div>Loading form data...</div>
            </div>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    );
  }

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
                <Label>Template</Label>
                <Select
                  value={formData.inspectionLevel}
                  onChange={e => {
                    console.log('Template changed to:', e.target.value);
                    setFormData({ ...formData, inspectionLevel: e.target.value });
                  }}
                >
                  <option value="">Select Template</option>
                  {levels?.results?.map(level => {
                    const isSelected = level._id === formData.inspectionLevel;
                    console.log(`Template option: ${level.name} (${level._id}) - Selected: ${isSelected}`);
                    return (
                    <option key={level._id} value={level._id}>
                      {level.name}
                    </option>
                    );
                  })}
                </Select>
                {/* Debug info */}
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Current value: {formData.inspectionLevel || 'None'} | 
                  Options: {levels?.results?.length || 0}
                </small>
              </FormGroup>

              <FormGroup>
                <Label>Assignee *</Label>
                <Select
                  value={formData.assignedTo}
                  onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                  required
                >
                  <option value="">Select Assignee (Required)</option>
                  {users?.map(user => (
                    <option key={user._id || user.id} value={user._id || user.id}>
                      {user.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <FormGroup>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  required
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <FormGroup>
                <Label>Deadline</Label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Asset</Label>
                <Select
                  value={formData.asset}
                  onChange={e => {
                    console.log('Asset changed to:', e.target.value);
                    setFormData({ ...formData, asset: e.target.value });
                  }}
                >
                  <option value="">Select Asset (Optional)</option>
                  {assets?.map(asset => {
                    const assetId = asset._id || asset.id;
                    const isSelected = assetId === formData.asset;
                    console.log(`Asset option: ${asset.displayName || asset.uniqueId} (${assetId}) - Selected: ${isSelected}`);
                    return (
                      <option key={assetId} value={assetId}>
                        {asset.displayName || asset.uniqueId} - {asset.type}
                      </option>
                    );
                  })}
                </Select>
                {/* Debug info */}
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Current value: {formData.asset || 'None'} | 
                  Options: {assets?.length || 0}
                </small>
              </FormGroup>
            </div>

              <FormGroup>
              <Label>Location</Label>
                <Input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location"
                />
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