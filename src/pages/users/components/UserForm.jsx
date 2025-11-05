import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { PERMISSIONS, ROLES, DEFAULT_PERMISSIONS, MODULE_PERMISSIONS } from '../../../utils/permissions';
import { useAuth } from '../../../hooks/useAuth';

const Form = styled.form`
  display: grid;
  gap: 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    gap: 20px;
  }

  @media (max-width: 480px) {
    gap: 16px;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 768px) {
    gap: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
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
  color: #333;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
  max-width: 100%;
  box-sizing: border-box;

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

const PasswordWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
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
  max-width: 100%;
  box-sizing: border-box;

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

const ErrorMessage = styled.span`
  color: #dc2626;
  font-size: 12px;
`;

const PermissionsSection = styled.div`
  margin-top: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    margin-top: 16px;
  }
`;

const PermissionGroup = styled.div`
  margin-bottom: 20px;
`;

const PermissionGroupTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 12px;
`;

const PermissionList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
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
  flex-wrap: wrap;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: 8px;
    margin-top: 16px;

    button {
      width: 100%;
      justify-content: center;
    }
  }
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
  white-space: nowrap;
  flex-shrink: 0;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 13px;
    width: 100%;
    justify-content: center;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }

  ${props => props.variant === 'primary' ? `
    background: var(--color-navy);
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
    color: var(--color-navy);
    border: 1px solid var(--color-navy);

    &:hover {
      background: #f5f7fb;
    }
  `}
`;

const UserForm = ({ initialData = {}, onSubmit, onCancel, submitButtonText = 'Save', isSubmitting = false }) => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();

  const translateRole = (roleKey) => {
    const roleMap = {
      'INSPECTOR': t('common.inspector'),
      'SUPERVISOR': t('common.supervisor'),
      'MANAGER': t('common.manager'),
      'ADMIN': t('common.admin'),
      'SUPER_ADMIN': t('common.superAdmin')
    };
    return roleMap[roleKey] || roleKey;
  };

  const translateModuleName = (moduleName) => {
    const moduleMap = {
      'ASSETS': t('common.assets'),
      'TEMPLATE': t('common.template'),
      'USERS': t('common.users'),
      'PROFILE': t('common.profile'),
      'TASKS': t('common.tasks'),
      'CALENDAR': t('common.calendar'),
      'DASHBOARD': t('common.dashboard'),
      'QUESTIONNAIRES': t('common.questionnaires')
    };
    return moduleMap[moduleName] || moduleName.replace(/_/g, ' ');
  };
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
    if (initialData._id || initialData.id) {
      setFormData({
        ...initialData,
        status: initialData.isActive ? 'active' : 'inactive',
        permissions: initialData.permissions || [],
        // Ensure all fields are properly set
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        role: initialData.role || 'inspector',
        department: initialData.department || '',
        address: initialData.address || '',
        emergencyContact: initialData.emergencyContact || ''
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

  // Phone number validation function
  const validatePhoneNumber = (phone) => {
    // Remove all non-numeric characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if phone number is empty
    if (!cleanPhone) {
      return t('common.phoneRequired');
    }
    
    // Check if phone number has valid length (7-15 digits)
    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      return t('common.phoneLength');
    }
    
    // Check if phone number starts with valid country code or local format
    if (cleanPhone.length >= 10) {
      // International format validation (starts with country code)
      if (cleanPhone.startsWith('1') && cleanPhone.length === 11) {
        return null; // US/Canada format
      }
      if (cleanPhone.startsWith('966') && cleanPhone.length === 12) {
        return null; // Saudi Arabia format
      }
      if (cleanPhone.length === 10) {
        return null; // Local format (10 digits)
      }
    }
    
    return null; // Valid phone number
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = t('common.nameRequired');
    if (!formData.email) {
      newErrors.email = t('common.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('common.emailInvalid');
    }
    
    // Validate phone number
    const phoneError = validatePhoneNumber(formData.phone);
    if (phoneError) {
      newErrors.phone = phoneError;
    }
    
    if (!formData.role) newErrors.role = t('common.roleRequired');
    
    if (!(initialData._id || initialData.id)) {
      if (!formData.password) newErrors.password = t('common.passwordRequired');
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t('common.passwordsDoNotMatch');
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
    
    // For phone number field, only allow numeric characters
    let processedValue = value;
    if (name === 'phone') {
      // Remove all non-numeric characters
      processedValue = value.replace(/\D/g, '');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear existing error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    // Real-time validation for phone number
    if (name === 'phone' && processedValue) {
      const phoneError = validatePhoneNumber(processedValue);
      if (phoneError) {
        setErrors(prev => ({
          ...prev,
          [name]: phoneError
        }));
      }
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

  const renderModulePermissions = () => {
    return (
      <PermissionGroup>
        <PermissionGroupTitle>{t('common.moduleAccess')}</PermissionGroupTitle>
        <PermissionList>
          {Object.entries(MODULE_PERMISSIONS).map(([moduleName, permission]) => (
            <PermissionItem key={permission}>
              <input
                type="checkbox"
                checked={formData.permissions?.includes(permission)}
                onChange={() => handlePermissionChange(permission)}
              />
              {translateModuleName(moduleName)}
            </PermissionItem>
          ))}
        </PermissionList>
      </PermissionGroup>
    );
  };

  const showPermissionsSection = formData.role === ROLES.MANAGER; // Remove supervisor - no permission management
  const isEditMode = !!(initialData._id || initialData.id);

  return (
    <Form onSubmit={handleSubmit}>
      <FormRow>
        <FormGroup>
          <Label>{t('common.fullName')}</Label>
          <Input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            placeholder={t('common.enterFullName')}
          />
          {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>{t('common.emailAddress')}</Label>
          <Input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            placeholder={t('common.enterEmailAddress')}
          />
          {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <Label>{t('common.phoneNumber')}</Label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            placeholder={t('common.enterPhoneNumber')}
            maxLength="15"
            pattern="[0-9]*"
            inputMode="numeric"
          />
          {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>{t('common.role')}</Label>
          <Select
            name="role"
            value={formData.role || ''}
            onChange={handleChange}
          >
            {Object.entries(ROLES).map(([key, value]) => (
              <option key={value} value={value}>
                {translateRole(key)}
              </option>
            ))}
          </Select>
          {errors.role && <ErrorMessage>{errors.role}</ErrorMessage>}
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <Label>{t('common.department')}</Label>
          <Select
            name="department"
            value={formData.department || ''}
            onChange={handleChange}
            disabled={currentUser?.role === ROLES.MANAGER || currentUser?.role === ROLES.INSPECTOR || currentUser?.role === ROLES.SUPERVISOR}
            style={{ 
              opacity: (currentUser?.role === ROLES.MANAGER || currentUser?.role === ROLES.INSPECTOR || currentUser?.role === ROLES.SUPERVISOR) ? 0.6 : 1,
              cursor: (currentUser?.role === ROLES.MANAGER || currentUser?.role === ROLES.INSPECTOR || currentUser?.role === ROLES.SUPERVISOR) ? 'not-allowed' : 'pointer'
            }}
          >
            <option value="">{t('common.selectDepartment')}</option>
            <option value="Field Operations">{t('common.fieldOperations')}</option>
            <option value="Operations Management">{t('common.operationsManagement')}</option>
            <option value="Administration">{t('common.administration')}</option>
          </Select>
          {(currentUser?.role === ROLES.MANAGER || currentUser?.role === ROLES.INSPECTOR || currentUser?.role === ROLES.SUPERVISOR) && (
            <span style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
              {t('common.onlyAdminsCanModifyDepartment')}
            </span>
          )}
        </FormGroup>

        <FormGroup>
          <Label>{t('common.status')}</Label>
          <Select
            name="status"
            value={formData.status || (formData.isActive ? 'active' : 'inactive')}
            onChange={handleChange}
          >
            <option value="active">{t('common.active')}</option>
            <option value="inactive">{t('common.inactive')}</option>
            <option value="suspended">{t('common.suspended')}</option>
          </Select>
        </FormGroup>
      </FormRow>

      {!isEditMode && (
        <FormRow>
          <FormGroup>
            <Label>{t('common.password')}</Label>
            <PasswordWrapper>
              <PasswordInput
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password || ''}
                onChange={handleChange}
                placeholder={t('common.enterPassword')}
              />
              <PasswordToggle type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </PasswordToggle>
            </PasswordWrapper>
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>{t('common.confirmPassword')}</Label>
            <PasswordWrapper>
              <PasswordInput
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword || ''}
                onChange={handleChange}
                placeholder={t('common.confirmPasswordPlaceholder')}
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
          <Label>{t('common.address')}</Label>
          <Input
            type="text"
            name="address"
            value={formData.address || ''}
            onChange={handleChange}
            placeholder={t('common.enterAddress')}
          />
        </FormGroup>

        <FormGroup>
          <Label>{t('common.emergencyContact')}</Label>
          <Input
            type="text"
            name="emergencyContact"
            value={formData.emergencyContact || ''}
            onChange={handleChange}
            placeholder={t('common.enterEmergencyContact')}
          />
        </FormGroup>
      </FormRow>

      {showPermissionsSection && (
        <PermissionsSection>
          <PermissionGroupTitle>{t('common.permissions')}</PermissionGroupTitle>
          {formData.role === ROLES.MANAGER ? (
            renderModulePermissions()
          ) : (
            Object.entries(PERMISSIONS).filter(([groupName]) => groupName !== 'SETTINGS').map(([groupName, groupPermissions]) =>
              renderPermissionGroup(groupName, groupPermissions)
            )
          )}
        </PermissionsSection>
      )}

      <ButtonGroup>
        <Button type="button" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? t('common.saving') : submitButtonText}
        </Button>
      </ButtonGroup>
    </Form>
  );
};

export default UserForm;