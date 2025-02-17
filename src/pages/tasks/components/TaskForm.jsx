import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Upload, Users, X, File } from 'lucide-react';
import { statusOptions, priorityOptions } from '../../../constants/taskOptions';
import { createTask, updateTask } from '../../../store/slices/taskSlice';
import { toast } from 'react-hot-toast';

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

const Switch = styled.div`
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

const TaskForm = React.memo(({ 
  initialData = {}, 
  onCancel, 
  submitButtonText = 'Save',
  isSubmitting: propIsSubmitting = false,
  usersProp = [],
  inspectionLevelsProp = []
}) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const stateUsers = useSelector(state => state.users.users);
  const stateInspectionLevels = useSelector(state => state.inspectionLevels?.levels?.results);

  const users = usersProp.length > 0 ? usersProp : stateUsers;
  const inspectionLevels = inspectionLevelsProp.length > 0 ? inspectionLevelsProp : stateInspectionLevels;

  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    assignedTo: initialData.assignedTo?.map(user => user._id) || [],
    status: initialData.status || 'pending',
    priority: initialData.priority || 'medium',
    deadline: initialData.deadline 
      ? new Date(initialData.deadline).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    location: initialData.location || '',
    inspectionLevel: initialData.inspectionLevel?._id || '',
    isActive: initialData.isActive !== undefined ? initialData.isActive : true,
  });

  const [attachmentFiles, setAttachmentFiles] = useState(
    initialData.attachments 
      ? initialData.attachments.map(attachment => ({
          name: attachment.filename,
          existing: true,
          _id: attachment._id,
          url: attachment.fileUrl,
          progress: 100
        })) 
      : []
  );
  const [errors, setErrors] = useState({});
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(propIsSubmitting);

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "https://chirag-backend.onrender.com/api/files/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log(responseData)
      return responseData.fileUrl;
    } catch (error) {
      toast.error(`Error uploading file: ${error.message}`);
      return null;
    }
  };

  const handleAttachmentChange = async (event) => {
    const files = Array.from(event.target.files);
    const uploadPromises = files.map(async (file) => {
      const newAttachment = {
        name: file.name,
        file,
        progress: 0,
        uploading: true
      };
      
      setAttachmentFiles(prev => [...prev, newAttachment]);

      try {
        const uploadedUrl = await handleFileUpload(file);
        
        if (uploadedUrl) {
          setAttachmentFiles(prev => 
            prev.map(att => 
              att.name === file.name 
                ? { 
                    ...att, 
                    url: uploadedUrl, 
                    progress: 100, 
                    uploading: false 
                  }
                : att
            )
          );
          return uploadedUrl;
        } else {
          setAttachmentFiles(prev => 
            prev.filter(att => att.name !== file.name)
          );
          return null;
        }
      } catch (error) {
        setAttachmentFiles(prev => 
          prev.filter(att => att.name !== file.name)
        );
        return null;
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (index) => {
    setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    const uploadedAttachments = attachmentFiles
      .filter(file => file.url)
      .map(file => file.url);
    const attachmentsData = uploadedAttachments.map(url => ({
      url: url,
      filename: url.split('/').pop(),
      contentType: ''
    }));
  
    const submissionData = {
      ...formData,
      assignedTo: Array.isArray(formData.assignedTo) 
        ? formData.assignedTo 
        : [formData.assignedTo],
      attachments: attachmentsData,
    };
  
    try {
      setIsSubmitting(true);
      
      if (initialData._id) {
        await dispatch(updateTask({ 
          id: initialData._id, 
          data: submissionData 
        })).unwrap();
      } else {
        await dispatch(createTask(submissionData)).unwrap();
      }
  
      toast.success(initialData._id ? 'Task updated successfully' : 'Task created successfully');
  
      handleCancel();
    } catch (error) {
      console.error('Task submission error:', error);
      toast.error(error.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.assignedTo.length === 0) newErrors.assignedTo = 'At least one assignee is required';
    if (!formData.inspectionLevel) newErrors.inspectionLevel = 'Inspection level is required';
    if (!formData.deadline) newErrors.deadline = 'Deadline is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleUserToggle = (userId) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter(id => id !== userId)
        : [...prev.assignedTo, userId]
    }));
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

  return (
    <Form onSubmit={handleSubmit}>
      <FormRow>
        <FormGroup>
          <Label>Task Title</Label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
          />
          {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Priority</Label>
          <Select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            {priorityOptions.map(option =>(
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
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
        />
        {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
      </FormGroup>

      <FormGroup>
        <Label>Assign Users</Label>
        <MultiSelect>
          <MultiSelectHeader onClick={() => setShowUserDropdown(!showUserDropdown)}>
            {formData.assignedTo.length > 0 ? (
              formData.assignedTo.map(userId => {
                const user = users?.find(u => u._id === userId);
                return user ? (
                  <SelectedItem key={userId}>
                    {user.name}
                    <button type="button" onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveUser(userId);
                    }}>
                      <X size={12} />
                    </button>
                  </SelectedItem>
                ) : null;
              })
            ) : (
              <span style={{ color: '#64748b' }}>Select users</span>
            )}
            <Users size={16} style={{ marginLeft: 'auto' }} />
          </MultiSelectHeader>
          {showUserDropdown && (
            <MultiSelectDropdown>
              {users?.map(user => (
                <Option
                  key={user._id}
                  onClick={() => handleUserToggle(user._id)}
                >
                  {user.name}
                </Option>
              ))}
            </MultiSelectDropdown>
          )}
        </MultiSelect>
        {errors.assignedTo && <ErrorMessage>{errors.assignedTo}</ErrorMessage>}
      </FormGroup>

      <FormRow>
        <FormGroup>
          <Label>Deadline</Label>
          <Input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.deadline && <ErrorMessage>{errors.deadline}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Location</Label>
          <Input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter location"
          />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <Label>Status</Label>
          <Select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Inspection Level</Label>
          <Select
            name="inspectionLevel"
            value={formData.inspectionLevel}
            onChange={handleChange}
            required
          >
            <option value="">Select Inspection Level</option>
            {inspectionLevels?.map(level => (
              <option key={level._id} value={level._id}>
                {level.name}
              </option>
            ))}
          </Select>
          {errors.inspectionLevel && <ErrorMessage>{errors.inspectionLevel}</ErrorMessage>}
        </FormGroup>
      </FormRow>

      <FormGroup>
        <ToggleSwitch>
          <Switch 
            checked={formData.isActive}
            onClick={handleToggleActive}
          />
          <span>Active</span>
        </ToggleSwitch>
      </FormGroup>

      <FormGroup>
        <Label>Attachments</Label>
        <AttachmentSection>
          <AttachmentInput
            ref={fileInputRef}
            type="file"
            id="attachments"
            multiple
            onChange={handleAttachmentChange}
          />
          <label htmlFor="attachments">
            <Button type="button" variant="secondary">
              <Upload size={16} />
              Upload Files
            </Button>
          </label>
          <AttachmentList>
            {attachmentFiles.map((file, index) => (
              <AttachmentItem key={index}>
                <File size={16} />
                <span>{file.name}</span>
                {file.uploading && (
                  <AttachmentProgress>
                    <ProgressBar progress={file.progress} />
                  </AttachmentProgress>
                )}
                <button type="button" onClick={() => handleRemoveAttachment(index)}>
                  <X size={16} />
                </button>
              </AttachmentItem>
            ))}
          </AttachmentList>
        </AttachmentSection>
      </FormGroup>

      <ButtonGroup>
        <Button type="button" variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitButtonText}
        </Button>
      </ButtonGroup>
    </Form>
  );
});

export default TaskForm;