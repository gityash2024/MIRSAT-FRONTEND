import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Upload, Users, X, File, Plus, Minus, Trash2, Check, ExternalLink, User, Tag, ChevronDown, ChevronUp, Database } from 'lucide-react';
import { statusOptions, priorityOptions } from '../../../constants/taskOptions';
import { createTask, updateTask, uploadTaskAttachment } from '../../../store/slices/taskSlice';
import { toast } from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Spinner from '../../../components/ui/Spinner';
import PopoverMenu from '../../../components/ui/PopoverMenu';
import Switch from '../../../components/ui/Switch';
import DatePicker from '../../../components/ui/DatePicker';
import { fetchUsers } from '../../../store/slices/userSlice';
import { fetchInspectionLevels } from '../../../store/slices/inspectionLevelSlice';
import { fetchAssets } from '../../../store/slices/assetSlice';
import Skeleton from '../../../components/ui/Skeleton';

const Form = styled.form`
  display: grid;
  gap: 24px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
  &:focus {
    outline: none;
    border-color: #1a237e;
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  transition: all 0.3s;
  &:focus {
    outline: none;
    border-color: #1a237e;
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: all 0.3s;
  &:focus {
    outline: none;
    border-color: #1a237e;
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const MultiSelect = styled.div`
  position: relative;
`;

const MultiSelectHeader = styled.div`
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  flex-wrap: wrap;
`;

const SelectedItem = styled.span`
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    color: #64748b;
    &:hover {
      color: #dc2626;
    }
  }
`;

const MultiSelectDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const Option = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: #f1f5f9;
  }
`;

const ToggleSwitch = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const ToggleIndicator = styled.div`
  position: relative;
  width: 40px;
  height: 20px;
  background: ${props => props.checked ? '#1a237e' : '#e0e0e0'};
  border-radius: 20px;
  padding: 2px;
  transition: all 0.3s;
  &::before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    transition: all 0.3s;
    transform: translateX(${props => props.checked ? '20px' : '0'});
  }
`;

const AttachmentSection = styled.div`
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s;
  &:hover {
    border-color: #1a237e;
  }
`;

const AttachmentInput = styled.input`
  display: none;
`;

const AttachmentList = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 4px;
  position: relative;
  button {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #64748b;
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    &:hover {
      color: #dc2626;
    }
  }
`;

const AttachmentProgress = styled.div`
  width: 100%;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
`;

const ProgressBar = styled.div`
  width: ${props => props.progress}%;
  height: 100%;
  background: #1a237e;
  transition: width 0.3s ease;
`;

const ErrorMessage = styled.span`
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
`;

const ButtonGroup = styled.div`
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
  ${props => props.variant === 'primary' ? `
    background: #1a237e;
    color: white;
    border: none;
    &:hover {
      background: #151b4f;
    }
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  ` : `
    background: white;
    color: #1a237e;
    border: 1px solid #1a237e;
    &:hover {
      background: #f5f7fb;
    }
  `}
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const UserSelection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
`;

const UserList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
`;

const UserTag = styled.span`
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #dc2626;
  &:hover {
    color: #b91c1c;
  }
`;

const UserPickerButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  &:hover {
    color: #1a237e;
  }
`;

const UserDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 100%;
`;

const UserOption = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #f1f5f9;
  }
  
  ${props => props.selected && `
    background: #e0e0e0;
  `}
  
  span {
    flex: 1;
  }
`;

const AdvancedToggle = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  &:hover {
    color: #1a237e;
  }
`;

const AttachmentUpload = styled.div`
  margin-top: 16px;
  text-align: center;
`;

const UploadButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  &:hover {
    color: #1a237e;
  }
  ${props => props.disabled && `
    opacity: 0.7;
    cursor: not-allowed;
  `}
`;

const AttachmentActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #64748b;
  &:hover {
    color: #1a237e;
  }
`;

// Create a TaskFormSkeleton component
const TaskFormSkeleton = () => (
  <div style={{ display: 'grid', gap: '24px' }}>
    {/* Title field */}
    <Skeleton.Form.Field>
      <Skeleton.Form.Label width="80px" />
      <Skeleton.Form.Input height="42px" />
    </Skeleton.Form.Field>
    
    {/* Description field */}
    <Skeleton.Form.Field>
      <Skeleton.Form.Label width="100px" />
      <Skeleton.Form.Input height="120px" />
    </Skeleton.Form.Field>
    
    {/* Priority and Deadline row */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
      <Skeleton.Form.Field>
        <Skeleton.Form.Label width="70px" />
        <Skeleton.Form.Input height="42px" />
      </Skeleton.Form.Field>
      <Skeleton.Form.Field>
        <Skeleton.Form.Label width="80px" />
        <Skeleton.Form.Input height="42px" />
      </Skeleton.Form.Field>
    </div>
    
    {/* Location field */}
    <Skeleton.Form.Field>
      <Skeleton.Form.Label width="80px" />
      <Skeleton.Form.Input height="42px" />
    </Skeleton.Form.Field>
    
    {/* Assigned Users field */}
    <Skeleton.Form.Field>
      <Skeleton.Form.Label width="130px" />
      <Skeleton.Form.Input height="60px" />
    </Skeleton.Form.Field>
    
    {/* Template row */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
      <Skeleton.Form.Field>
        <Skeleton.Form.Label width="150px" />
        <Skeleton.Form.Input height="42px" />
      </Skeleton.Form.Field>
      <div></div>
    </div>
    
    {/* Toggle switch */}
    <Skeleton.Form.Field>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Skeleton.Base width="40px" height="20px" radius="20px" />
        <Skeleton.Base width="50px" height="16px" />
      </div>
    </Skeleton.Form.Field>
    
    {/* Advanced Options button */}
    <Skeleton.Base width="140px" height="24px" />
    
    {/* Button group */}
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
      <Skeleton.Button width="90px" />
      <Skeleton.Button width="90px" />
    </div>
  </div>
);

const TaskForm = ({ 
  initialData = {}, 
  onCancel, 
  submitButtonText = 'Save',
  isSubmitting: propIsSubmitting = false,
  usersProp = [],
  inspectionLevelsProp = [],
  isEdit = false
}) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const userDropdownRef = useRef(null);
  const stateUsers = useSelector(state => state.users.users);
  const stateInspectionLevels = useSelector(state => state.inspectionLevels?.levels?.results);
  const usersLoading = useSelector(state => state.users.loading);
  const inspectionLevelsLoading = useSelector(state => state.inspectionLevels?.loading);
  const { assets = [] } = useSelector(state => state.assets || { assets: [] });
  
  const initialLoading = (usersProp.length === 0 && usersLoading) || 
                         (inspectionLevelsProp.length === 0 && inspectionLevelsLoading);

  let users = usersProp.length > 0 ? usersProp : stateUsers;
  users = users?.filter(user => user.role === 'inspector');
  const inspectionLevels = inspectionLevelsProp.length > 0 ? inspectionLevelsProp : stateInspectionLevels;

  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    assignedTo: initialData.assignedTo?.map(user => typeof user === 'object' ? user._id : user) || [],
    status: initialData.status || 'pending',
    priority: initialData.priority || 'medium',
    deadline: initialData.deadline ? new Date(initialData.deadline) : null,
    location: initialData.location || '',
    inspectionLevel: initialData.inspectionLevel?._id || initialData.inspectionLevel || '',
    asset: initialData.asset?._id || initialData.asset || '',
    isActive: initialData.isActive !== undefined ? initialData.isActive : true,
    attachments: initialData.attachments || []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(propIsSubmitting);
  const [errors, setErrors] = useState({});
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [showAdvanced, setShowAdvanced] = useState(isEdit);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare task data
      const taskData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        deadline: formData.deadline,
        location: formData.location,
        assignedTo: formData.assignedTo,
        inspectionLevel: formData.inspectionLevel,
        asset: formData.asset || null, // Ensure we handle empty string case properly
        isActive: formData.isActive,
        attachments: formData.attachments
      };
      
      console.log('Submitting task data:', taskData);
      console.log('Asset being submitted:', taskData.asset);
      
      // Call API to create or update task
      if (initialData._id) {
        // For updates, ensure we're passing the correct ID and data format
        const updateResult = await dispatch(updateTask({ 
          id: initialData._id, 
          data: taskData 
        })).unwrap();
        
        console.log('Task update result:', updateResult);
        
        if (updateResult) {
          toast.success('Task updated successfully');
          if (onCancel) onCancel(updateResult); // Pass the updated task back
        }
      } else {
        const createResult = await dispatch(createTask(taskData)).unwrap();
        toast.success('Task created successfully');
        if (onCancel) onCancel(createResult); // Pass the created task back
      }
    } catch (error) {
      console.error('Error in task form submission:', error);
      toast.error(`Failed to ${initialData._id ? 'update' : 'create'} task: ${error.message || 'Error occurred'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    }
    
    if (formData.assignedTo.length === 0) {
      newErrors.assignedTo = 'At least one user must be assigned';
    }
    
    if (!formData.inspectionLevel) {
      newErrors.inspectionLevel = 'An template must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCancel = () => {
    if (onCancel) onCancel();
  };
  
  const handleUserToggle = (userId) => {
    setFormData(prev => {
      const isAlreadyAssigned = prev.assignedTo.includes(userId);
      return {
        ...prev,
        assignedTo: isAlreadyAssigned 
          ? prev.assignedTo.filter(id => id !== userId) 
          : [...prev.assignedTo, userId]
      };
    });
  };
  
  const handleRemoveUser = (userId) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.filter(id => id !== userId)
    }));
  };
  
  const handleToggleActive = () => {
    setFormData(prev => ({
      ...prev,
      isActive: !prev.isActive
    }));
  };
  
  const handleAttachmentChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      
      // Create a FormData object
      const formData = new FormData();
      formData.append('file', file);
      
      // If task already exists, include the task ID
      const payload = initialData._id 
        ? { id: initialData._id, file } 
        : { file };
      
      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
      const result = await dispatch(uploadTaskAttachment(payload)).unwrap();
      
      if (result && result.data) {
        setFormData(prev => ({
          ...prev,
          attachments: [...prev.attachments, result.data]
        }));
        toast.success('File uploaded successfully');
      } else {
        toast.error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      console.error('Upload error details:', error.message);
      toast.error(`Error uploading file: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  };
  
  const handleRemoveAttachment = (index) => {
    const newAttachments = [...formData.attachments];
    newAttachments.splice(index, 1);
    setFormData(prev => ({ ...prev, attachments: newAttachments }));
  };
  
  useEffect(() => {
    if (users.length === 0 && usersProp.length === 0) {
      dispatch(fetchUsers());
    }
    if (inspectionLevels?.length === 0 && inspectionLevelsProp.length === 0) {
      dispatch(fetchInspectionLevels());
    }
    // Always fetch assets to ensure we have the latest data
    dispatch(fetchAssets());
  }, [dispatch, users.length, inspectionLevels?.length, usersProp.length, inspectionLevelsProp.length]);
  
  // Debug initial values
  useEffect(() => {
    console.log('TaskForm initialData:', initialData);
    console.log('Asset ID from initial data:', initialData.asset?._id || initialData.asset);
    console.log('Current formData:', formData);
  }, []);
  
  // Monitor asset field specifically
  useEffect(() => {
    console.log('Asset field updated in form:', formData.asset);
    console.log('Available assets:', assets);
  }, [formData.asset, assets]);
  
  useEffect(() => {
    // Handle clicks outside of user dropdown
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);
  
  // Show skeleton loader while data is loading
  if (initialLoading) {
    return <TaskFormSkeleton />;
  }
  
  return (
    <Form onSubmit={handleSubmit}>
      <FormRow>
        <FormGroup>
          <Label>Title *</Label>
          <Input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
          />
          {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
        </FormGroup>
        <FormGroup>
          <Label>Priority *</Label>
          <Select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </FormGroup>
      </FormRow>
      
      <FormGroup>
        <Label>Description</Label>
        <TextArea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter task description"
          rows={4}
          required
        />
        {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
      </FormGroup>
      
      <FormRow>
        <FormGroup>
          <Label>Deadline</Label>
          <DatePicker
            selected={formData.deadline}
            onChange={date => setFormData(prev => ({ ...prev, deadline: date }))}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
          />
          {errors.deadline && <ErrorMessage>{errors.deadline}</ErrorMessage>}
        </FormGroup>
      </FormRow>
      
      <FormGroup>
        <Label>Location</Label>
        <Input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Enter location (optional)"
        />
      </FormGroup>
      
      <FormGroup>
        <Label>Assigned Users</Label>
        <UserSelection ref={userDropdownRef}>
          <UserList>
            {formData.assignedTo.map(userId => {
              const user = users.find(u => u._id === userId);
              return user ? (
                <UserTag key={userId}>
                  <span>{user.name}</span>
                  <RemoveButton onClick={() => handleRemoveUser(userId)}>
                    <X size={14} />
                  </RemoveButton>
                </UserTag>
              ) : null;
            })}
          </UserList>
          
          <UserPickerButton 
            type="button" 
            onClick={() => setShowUserDropdown(!showUserDropdown)}
          >
            <Users size={16} />
            <span>Add Users</span>
            {showUserDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </UserPickerButton>
          
          {showUserDropdown && (
            <UserDropdown>
              {users?.map(user => (
                <UserOption 
                  key={user._id}
                  selected={formData.assignedTo.includes(user._id)}
                  onClick={(e) => {
                    e.stopPropagation();  // Prevent closing the dropdown
                    handleUserToggle(user._id);
                  }}
                >
                  <User size={16} />
                  <span>{user.name}</span>
                  {formData.assignedTo.includes(user._id) && <Check size={16} />}
                </UserOption>
              ))}
            </UserDropdown>
          )}
        </UserSelection>
        {errors.assignedTo && <ErrorMessage>{errors.assignedTo}</ErrorMessage>}
      </FormGroup>
      
      <FormRow>
        <FormGroup>
          <Label>Template *</Label>
          <Select
            name="inspectionLevel"
            value={formData.inspectionLevel}
            onChange={handleChange}
          >
            <option value="">Select template</option>
            {inspectionLevels?.map(level => (
              <option key={level._id} value={level._id}>
                {level.name}
              </option>
            ))}
          </Select>
          {errors.inspectionLevel && <ErrorMessage>{errors.inspectionLevel}</ErrorMessage>}
        </FormGroup>
        <FormGroup>
          <Label>Asset</Label>
          <Select
            name="asset"
            value={formData.asset}
            onChange={handleChange}
          >
            <option value="">Select asset (optional)</option>
            {assets.length > 0 ? (
              assets.map(asset => (
                <option key={asset._id} value={asset._id}>
                  {asset.displayName} ({asset.uniqueId} - {asset.type})
                </option>
              ))
            ) : (
              <option value="">Loading assets...</option>
            )}
          </Select>
          {formData.asset && <small>Selected Asset ID: {formData.asset}</small>}
        </FormGroup>
      </FormRow>

      <FormGroup>
        <ToggleSwitch>
          <ToggleIndicator 
            checked={formData.isActive}
            onClick={handleToggleActive}
          />
          <span>Active</span>
        </ToggleSwitch>
      </FormGroup>

      {isEdit && (
        <AdvancedToggle 
          type="button" 
          onClick={(e) => {
            e.preventDefault(); // Prevent form submission
            setShowAdvanced(!showAdvanced);
          }}
        >
          <span>Advanced Options</span>
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </AdvancedToggle>
      )}
      
      {isEdit && showAdvanced && (
        <>
          <FormGroup>
            <Label>Attachments</Label>
            <AttachmentList>
              {formData.attachments.map((attachment, index) => (
                <AttachmentItem key={index}>
                  <File size={16} />
                  <span>{attachment.filename || 'Attachment'}</span>
                  <AttachmentActions>
                    <IconButton 
                      type="button" 
                      title="Remove"
                      onClick={() => handleRemoveAttachment(index)}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                    {attachment.url && (
                      <IconButton 
                        type="button" 
                        as="a" 
                        href={attachment.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title="Open"
                      >
                        <ExternalLink size={14} />
                      </IconButton>
                    )}
                  </AttachmentActions>
                </AttachmentItem>
              ))}
              
              <AttachmentUpload>
                <input 
                  type="file" 
                  id="file-upload" 
                  onChange={handleAttachmentChange} 
                  style={{ display: 'none' }}
                />
                <UploadButton 
                  type="button" 
                  disabled={isUploading}
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  {isUploading ? <Spinner size={16} /> : <Plus size={16} />}
                  <span>{isUploading ? 'Uploading...' : 'Add Attachment'}</span>
                </UploadButton>
              </AttachmentUpload>
            </AttachmentList>
          </FormGroup>
        </>
      )}
      
      <ButtonGroup>
        <Button type="button" variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting ? <Spinner size={16} /> : null}
          {isSubmitting ? 'Saving...' : submitButtonText}
        </Button>
      </ButtonGroup>
    </Form>
  );
};

export default TaskForm;