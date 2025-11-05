// src/pages/calendar/components/EventModal.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
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

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  position: relative;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
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
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 16px 16px 0 16px;
  }
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 17px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
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
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    padding: 0;
  }

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
  padding: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const Form = styled.form`
  display: grid;
  gap: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    gap: 16px;
  }

  @media (max-width: 480px) {
    gap: 16px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-navy);
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 13px;
  }

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  color: var(--color-navy);
  transition: all 0.2s;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 8px 10px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    padding: 8px;
    font-size: 13px;
  }

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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 8px 10px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    padding: 8px;
    font-size: 13px;
  }

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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 8px 10px;
    font-size: 13px;
    min-height: 80px;
  }

  @media (max-width: 480px) {
    padding: 8px;
    font-size: 13px;
    min-height: 80px;
  }

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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    flex-direction: column-reverse;
    align-items: stretch;
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  @media (max-width: 768px) {
    padding: 8px 14px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 13px;
    width: 100%;
    min-width: 0;
  }

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

  svg {
    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 10px;
  }

  @media (max-width: 480px) {
    width: 100%;
    gap: 8px;
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    gap: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 16px;
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
  // Get data from Redux store
  const { users } = useSelector((state) => state.users || { users: [] });
  const { levels } = useSelector((state) => state.inspectionLevels || { levels: { results: [] } });
  const { assets } = useSelector((state) => state.assets || { assets: [] });
  const { loading } = useSelector((state) => state.tasks || { loading: false });

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
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available statuses and priorities
  const statuses = [
    { value: 'pending', label: t('common.pending') },
    { value: 'in_progress', label: t('common.inProgress') },
    { value: 'completed', label: t('common.completed') },
    { value: 'cancelled', label: t('common.cancelled') }
  ];

  const priorities = [
    { value: 'low', label: t('tasks.lowPriority') },
    { value: 'medium', label: t('tasks.mediumPriority') },
    { value: 'high', label: t('tasks.highPriority') },
    { value: 'urgent', label: t('tasks.urgentPriority') }
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
      alert(t('titleRequired'));
      return false;
    }
    if (!formData.deadline) {
      alert(t('deadlineRequired'));
      return false;
    }
    if (!formData.assignedTo) {
      alert(t('selectUserRequired'));
      return false;
    }
    // Validate user ID format (MongoDB ObjectId)
    if (formData.assignedTo && !/^[0-9a-fA-F]{24}$/.test(formData.assignedTo)) {
      alert(t('invalidUserSelection'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        // status: formData.status,
        priority: formData.priority,
        assignedTo: formData.assignedTo,
        inspectionLevel: formData.inspectionLevel,
        asset: formData.asset,
        deadline: formData.deadline,
        location: formData.location
      };

      if (event) {
        await onUpdate({ ...eventData, id: event.id });
      } else {
        await onAdd(eventData);
      }

      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Check if required data is loaded for editing mode
  const isDataLoading = event && (!users?.length || !levels?.results?.length);
  
  if (isDataLoading) {
    return (
      <ModalOverlay onClick={onClose}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>{t('common.loading')}</ModalTitle>
            <CloseButton onClick={onClose}>
              <X size={20} />
            </CloseButton>
          </ModalHeader>
          <ModalBody>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <div>{t('loadingFormData')}</div>
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
            {event ? t('editEvent') : t('createNewEvent')}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>{t('eventTitle')}</Label>
              <Input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('enterEventTitle')}
                required
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label>{t('template')}</Label>
                <Select
                  value={formData.inspectionLevel}
                  onChange={e => {
                    console.log('Template changed to:', e.target.value);
                    setFormData({ ...formData, inspectionLevel: e.target.value });
                  }}
                >
                  <option value="">{t('selectTemplate')}</option>
                  {levels?.results?.filter(level => level.status === 'active').map(level => {
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
                <Label>{t('assignee')} *</Label>
                <Select
                  value={formData.assignedTo}
                  onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                  required
                >
                  <option value="">{t('selectAssignee')}</option>
                  {users?.map(user => (
                    <option key={user._id || user.id} value={user._id || user.id}>
                      {user.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </FormRow>

            <FormRow>
              {/* <FormGroup>
                <Label>{t('common.status')}</Label>
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
              </FormGroup> */}

              <FormGroup>
                <Label>{t('common.priority')}</Label>
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
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>{t('deadline')}</Label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>{t('asset')}</Label>
                <Select
                  value={formData.asset}
                  onChange={e => {
                    console.log('Asset changed to:', e.target.value);
                    setFormData({ ...formData, asset: e.target.value });
                  }}
                >
                  <option value="">{t('selectAsset')}</option>
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
            </FormRow>

              <FormGroup>
              <Label>{t('common.location')}</Label>
                <Input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder={t('enterLocation')}
                />
              </FormGroup>

            <FormGroup>
              <Label>{t('common.description')}</Label>
              <Textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('enterEventDescription')}
              />
            </FormGroup>
          </Form>
        </ModalBody>

        <ModalFooter>
          {event ? (
            <Button type="button" variant="danger" onClick={handleDelete}>
              <Trash2 size={16} style={{ marginRight: '4px' }} />
              {t('deleteEvent')}
            </Button>
          ) : (
            <div /> // Empty div for spacing
          )}
          
          <ButtonGroup>
            <Button type="button" onClick={onClose} disabled={isSubmitting || loading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" onClick={handleSubmit} disabled={isSubmitting || loading}>
              {isSubmitting || loading ? (
                <>
                  <span style={{ marginRight: '8px' }}>⏳</span>
                  {event ? t('updating') : t('creating')}
                </>
              ) : (
                event ? t('updateEvent') : t('createEvent')
              )}
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EventModal;