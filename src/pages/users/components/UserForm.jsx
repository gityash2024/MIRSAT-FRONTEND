import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar,
  MapPin,
  AlertTriangle,
  Building2,
  Lock
} from 'lucide-react';

const Form = styled.form`
  display: grid;
  gap: 24px;
`;

const FormSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  .icon {
    opacity: 0.7;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;

  .icon {
    opacity: 0.7;
  }
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

  &::placeholder {
    color: #9e9e9e;
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

const CheckboxGroup = styled.div`
  display: grid;
  gap: 12px;
  padding: 8px 0;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;

  input {
    width: 16px;
    height: 16px;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    cursor: pointer;
  }
`;

const ErrorMessage = styled.span`
  color: #dc2626;
  font-size: 12px;
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
      background: #9fa8da;
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

const roles = [
  { value: 'inspector', label: 'Inspector' },
  { value: 'management', label: 'Management' },
  { value: 'admin', label: 'Admin' }
];

const departments = [
  { value: 'field_operations', label: 'Field Operations' },
  { value: 'operations_management', label: 'Operations Management' },
  { value: 'administration', label: 'Administration' }
];

const permissions = {
  tasks: [
    { value: 'view_tasks', label: 'View Tasks' },
    { value: 'create_tasks', label: 'Create Tasks' },
    { value: 'edit_tasks', label: 'Edit Tasks' },
    { value: 'delete_tasks', label: 'Delete Tasks' },
    { value: 'assign_tasks', label: 'Assign Tasks' }
  ],
  reports: [
    { value: 'view_reports', label: 'View Reports' },
    { value: 'create_reports', label: 'Create Reports' },
    { value: 'download_reports', label: 'Download Reports' }
  ],
  users: [
    { value: 'view_users', label: 'View Users' },
    { value: 'create_users', label: 'Create Users' },
    { value: 'edit_users', label: 'Edit Users' },
    { value: 'delete_users', label: 'Delete Users' }
  ]
};

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
    role: 'inspector',
    department: 'field_operations',
    address: '',
    emergencyContact: '',
    status: 'active',
    permissions: [],
    password: '',
    confirmPassword: '',
    ...initialData
  });
  
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!initialData.id) { // Only validate password for new users
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
      onSubmit(formData);
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

  const handlePermissionChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, value]
        : prev.permissions.filter(p => p !== value)
    }));
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormSection>
        <SectionTitle>
          <User size={18} className="icon" />
          Personal Information
        </SectionTitle>
        <FormGrid>
          <FormGroup>
            <Label>
              <User size={14} className="icon" />
              Full Name
            </Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
            />
            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>
              <Mail size={14} className="icon" />
              Email Address
            </Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
            />
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>
              <Phone size={14} className="icon" />
              Phone Number
            </Label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
            {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>
              <AlertTriangle size={14} className="icon" />
              Emergency Contact
            </Label>
            <Input
              type="tel"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              placeholder="Enter emergency contact"
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <MapPin size={14} className="icon" />
              Address
            </Label>
            <Input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
            />
          </FormGroup>
        </FormGrid>
      </FormSection>

      <FormSection>
        <SectionTitle>
          <Shield size={18} className="icon" />
          Role & Access
        </SectionTitle>
        <FormGrid>
          <FormGroup>
            <Label>
              <Shield size={14} className="icon" />
              Role
            </Label>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>
              <Building2 size={14} className="icon" />
              Department
            </Label>
            <Select
              name="department"
              value={formData.department}
              onChange={handleChange}
            >
              {departments.map(dept => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </Select>
          </FormGroup>
        </FormGrid>

        <SectionTitle style={{ marginTop: '24px' }}>
          Permissions
        </SectionTitle>
        {Object.entries(permissions).map(([category, perms]) => (
          <div key={category}>
            <Label style={{ marginTop: '16px', marginBottom: '8px' }}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Label>
            <CheckboxGroup>
              {perms.map(permission => (
                <CheckboxLabel key={permission.value}>
                  <input
                    type="checkbox"
                    name="permissions"
                    value={permission.value}
                    checked={formData.permissions.includes(permission.value)}
                    onChange={handlePermissionChange}
                  />
                  {permission.label}
                </CheckboxLabel>
              ))}
            </CheckboxGroup>
          </div>
        ))}
      </FormSection>

      {!initialData.id && (
        <FormSection>
          <SectionTitle>
            <Lock size={18} className="icon" />
            Account Security
          </SectionTitle>
          <FormGrid>
            <FormGroup>
              <Label>
                <Lock size={14} className="icon" />
                Password
              </Label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
              />
              {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>
                <Lock size={14} className="icon" />
                Confirm Password
              </Label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
              />
              {errors.confirmPassword && (
                <ErrorMessage>{errors.confirmPassword}</ErrorMessage>
              )}
            </FormGroup>
          </FormGrid>
        </FormSection>
      )}

      <ButtonGroup>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {submitButtonText}
        </Button>
      </ButtonGroup>
    </Form>
  );
};

export default UserForm;