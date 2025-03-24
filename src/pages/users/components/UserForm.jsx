import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Eye, EyeOff } from 'lucide-react';
import { PERMISSIONS, ROLES, DEFAULT_PERMISSIONS } from '../../../utils/permissions';

const Form = styled.form`
  display: grid;
  gap: 24px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
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
  width: 100%;
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

const PasswordWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

const PasswordInput = styled(Input)`
  padding-right: 40px;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #666;
  display: flex;
  align-items: center;
`;

const Select = styled.select`
  width: 100%;
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

const ErrorMessage = styled.span`
  color: #dc2626;
  font-size: 12px;
`;

const PermissionsSection = styled.div`
  margin-top: 20px;
`;

const PermissionGroup = styled.div`
  margin-bottom: 20px;
`;

const PermissionGroupTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 12px;
`;

const PermissionList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
`;

const PermissionItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;

  input {
    width: 16px;
    height: 16px;
  }
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

const UserForm = ({ initialData = {}, onSubmit, onCancel, submitButtonText = 'Save', isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'inspector',
    department: '',
    address: '',
    emergencyContact: '',
    isActive: true,
    permissions: [],
    password: '',
    confirmPassword: '',
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (initialData._id) {
      setFormData({
        ...initialData,
        status: initialData.isActive ? 'active' : 'inactive'
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (formData.role && !initialData._id) {
      let newPermissions = [];
      
      if (formData.role === ROLES.ADMIN) {
        newPermissions = Object.values(PERMISSIONS).flatMap(group => Object.values(group));
      } else if (formData.role === ROLES.INSPECTOR) {
        const taskPermissions = PERMISSIONS.TASK_DASHBOARD ? Object.values(PERMISSIONS.TASK_DASHBOARD) : [];
        newPermissions = taskPermissions;
      } else if (!initialData.permissions) {
        newPermissions = DEFAULT_PERMISSIONS[formData.role] || [];
      }
      
      setFormData(prev => ({
        ...prev,
        permissions: newPermissions
      }));
    }
  }, [formData.role]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.role) newErrors.role = 'Role is required';
    
    if (!initialData._id) {
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = { ...formData };
      
      // Convert status to isActive boolean
      if (submitData.status === 'active') {
        submitData.isActive = true;
      } else if (submitData.status === 'inactive') {
        submitData.isActive = false;
      }
      
      delete submitData.confirmPassword;
      delete submitData.status;
      
      onSubmit(submitData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const renderPermissionGroup = (groupName, permissions) => {
    if (groupName === 'SETTINGS') return null;
    
    return (
      <PermissionGroup key={groupName}>
        <PermissionGroupTitle>{groupName.replace(/_/g, ' ')}</PermissionGroupTitle>
        <PermissionList>
          {Object.entries(permissions).map(([key, value]) => (
            <PermissionItem key={value}>
              <input
                type="checkbox"
                checked={formData.permissions?.includes(value)}
                onChange={() => handlePermissionChange(value)}
                disabled={formData.role === ROLES.ADMIN}
              />
              {key.replace(/_/g, ' ')}
            </PermissionItem>
          ))}
        </PermissionList>
      </PermissionGroup>
    );
  };

  const showPermissionsSection = formData.role === ROLES.MANAGER;
  const isEditMode = !!initialData._id;

  return (
    <Form onSubmit={handleSubmit}>
      <FormRow>
        <FormGroup>
          <Label>Full Name</Label>
          <Input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            placeholder="Enter full name"
          />
          {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Email Address</Label>
          <Input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            placeholder="Enter email address"
          />
          {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <Label>Phone Number</Label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            placeholder="Enter phone number"
          />
          {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Role</Label>
          <Select
            name="role"
            value={formData.role || ''}
            onChange={handleChange}
          >
            {Object.entries(ROLES).map(([key, value]) => (
              <option key={value} value={value}>
                {key.charAt(0) + key.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
          {errors.role && <ErrorMessage>{errors.role}</ErrorMessage>}
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <Label>Department</Label>
          <Select
            name="department"
            value={formData.department || ''}
            onChange={handleChange}
          >
            <option value="">Select Department</option>
            <option value="field_operations">Field Operations</option>
            <option value="operations_management">Operations Management</option>
            <option value="administration">Administration</option>
            <option value="support">Support</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Status</Label>
          <Select
            name="status"
            value={formData.status || (formData.isActive ? 'active' : 'inactive')}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </Select>
        </FormGroup>
      </FormRow>

      {!isEditMode && (
        <FormRow>
          <FormGroup>
            <Label>Password</Label>
            <PasswordWrapper>
              <PasswordInput
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password || ''}
                onChange={handleChange}
                placeholder="Enter password"
              />
              <PasswordToggle type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </PasswordToggle>
            </PasswordWrapper>
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>Confirm Password</Label>
            <PasswordWrapper>
              <PasswordInput
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword || ''}
                onChange={handleChange}
                placeholder="Confirm password"
              />
              <PasswordToggle type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </PasswordToggle>
            </PasswordWrapper>
            {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
          </FormGroup>
        </FormRow>
      )}

      <FormRow>
        <FormGroup>
          <Label>Address</Label>
          <Input
            type="text"
            name="address"
            value={formData.address || ''}
            onChange={handleChange}
            placeholder="Enter address"
          />
        </FormGroup>

        <FormGroup>
          <Label>Emergency Contact</Label>
          <Input
            type="text"
            name="emergencyContact"
            value={formData.emergencyContact || ''}
            onChange={handleChange}
            placeholder="Enter emergency contact"
          />
        </FormGroup>
      </FormRow>

      {showPermissionsSection && (
        <PermissionsSection>
          <PermissionGroupTitle>Permissions</PermissionGroupTitle>
          {Object.entries(PERMISSIONS).filter(([groupName]) => groupName !== 'SETTINGS').map(([groupName, groupPermissions]) =>
            renderPermissionGroup(groupName, groupPermissions)
          )}
        </PermissionsSection>
      )}

      <ButtonGroup>
        <Button type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitButtonText}
        </Button>
      </ButtonGroup>
    </Form>
  );
};

export default UserForm;