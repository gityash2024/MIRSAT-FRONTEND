import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PERMISSIONS, ROLES, DEFAULT_PERMISSIONS } from '../../../utils/permissions';

const Form = styled.form`
  display: grid;
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

const UserForm = ({ 
  initialData = {}, 
  onSubmit, 
  onCancel,
  submitButtonText = 'Save',
  isSubmitting = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    department: '',
    address: '',
    emergencyContact: '',
    status: 'active',
    permissions: [],
    password: '',
    confirmPassword: '',
    ...initialData
  });

  const [errors, setErrors] = useState({});

  // Set default permissions when role changes
  useEffect(() => {
    if (formData.role && !initialData.permissions) {
      setFormData(prev => ({
        ...prev,
        permissions: DEFAULT_PERMISSIONS[formData.role] || []
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
    
    // Only validate password for new users
    if (!initialData.id) {
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
      // Remove confirmPassword before submitting
      const submitData = { ...formData };
      delete submitData.confirmPassword;
      onSubmit(submitData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
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

  const renderPermissionGroup = (groupName, permissions) => (
    <PermissionGroup key={groupName}>
      <PermissionGroupTitle>
        {groupName.replace(/_/g, ' ')}
      </PermissionGroupTitle>
      <PermissionList>
        {Object.entries(permissions).map(([key, value]) => (
          <PermissionItem key={value}>
            <input
              type="checkbox"
              checked={formData.permissions.includes(value)}
              onChange={() => handlePermissionChange(value)}
              disabled={formData.role === ROLES.SUPERADMIN}
            />
            {key.replace(/_/g, ' ')}
          </PermissionItem>
        ))}
      </PermissionList>
    </PermissionGroup>
  );

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter full name"
        />
        {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email address"
        />
        {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter phone number"
        />
        {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
      </FormGroup>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormGroup>
          <Label htmlFor="role">Role</Label>
          <Select
            id="role"
            name="role"
            value={formData.role}
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

        <FormGroup>
          <Label htmlFor="department">Department</Label>
          <Select
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
          >
            <option value="">Select Department</option>
            <option value="field_operations">Field Operations</option>
            <option value="operations_management">Operations Management</option>
            <option value="administration">Administration</option>
            <option value="support">Support</option>
          </Select>
        </FormGroup>
      </div>

      {!initialData.id && (
        <>
          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
            />
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
            />
            {errors.confirmPassword && (
              <ErrorMessage>{errors.confirmPassword}</ErrorMessage>
            )}
          </FormGroup>
        </>
      )}

      <FormGroup>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter address"
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="emergencyContact">Emergency Contact</Label>
        <Input
          id="emergencyContact"
          name="emergencyContact"
          value={formData.emergencyContact}
          onChange={handleChange}
          placeholder="Enter emergency contact"
        />
      </FormGroup>

      {/* Permissions Section */}
      <PermissionsSection>
        <PermissionGroupTitle>Permissions</PermissionGroupTitle>
        {Object.entries(PERMISSIONS).map(([groupName, groupPermissions]) =>
          renderPermissionGroup(groupName, groupPermissions)
        )}
      </PermissionsSection>

      <ButtonGroup>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : submitButtonText}
        </Button>
      </ButtonGroup>
    </Form>
  );
};

export default UserForm;