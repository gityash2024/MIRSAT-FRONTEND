import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  User, 
  AlertCircle, 
  CheckCircle,
  Edit3,
  Save,
  X
} from 'lucide-react';
import api from '../../utils/axios';
import { useAuth } from '../../hooks/useAuth';

const FormCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const FormHeader = styled.div`
  background: linear-gradient(135deg, var(--color-navy) 0%, #1e40af 100%);
  padding: 24px;
  color: white;
`;

const FormTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormBody = styled.div`
  padding: 24px;
`;

const Message = styled.div`
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  
  ${props => props.type === 'success' ? `
    background: #f0f9ff;
    border: 1px solid #0ea5e9;
    color: #0c4a6e;
  ` : `
    background: #fef2f2;
    border: 1px solid #ef4444;
    color: #dc2626;
  `}
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  background: ${props => props.disabled ? '#f9fafb' : 'white'};
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--color-navy);
    box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
  }

  &:disabled {
    cursor: not-allowed;
    color: #6b7280;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  background: ${props => props.disabled ? '#f9fafb' : 'white'};
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--color-navy);
    box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
  }

  &:disabled {
    cursor: not-allowed;
    color: #6b7280;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  
  ${props => props.variant === 'primary' ? `
    background: var(--color-navy);
    color: white;
    
    &:hover:not(:disabled) {
      background: #1e40af;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
    }
  ` : `
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover:not(:disabled) {
      background: #e5e7eb;
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const InfoCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid #e2e8f0;
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: #64748b;
  font-size: 14px;
`;

const InfoValue = styled.span`
  color: #1e293b;
  font-size: 14px;
`;

const DEPARTMENT_OPTIONS = [
  { value: '', label: 'Select Department' },
  { value: 'Field Operations', label: 'Field Operations' },
  { value: 'Operations Management', label: 'Operations Management' },
  { value: 'Administration', label: 'Administration' }
];

const ProfileForm = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    phone: user?.phone || '',
    address: user?.address || '',
    emergencyContact: user?.emergencyContact || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setMessage({ type: '', text: '' });
  };

  const startEdit = () => {
    setIsEditing(true);
    setMessage({ type: '', text: '' });
  };

  const cancelEdit = () => {
    // Reset form to original values
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      department: user?.department || '',
      phone: user?.phone || '',
      address: user?.address || '',
      emergencyContact: user?.emergencyContact || ''
    });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const validateForm = () => {
    if (!profileData.name.trim()) {
      setMessage({ type: 'error', text: 'Name is required.' });
      return false;
    }
    
    // Only require department for admin role (not for manager/inspector)
    if (!profileData.department && user?.role !== 'manager' && user?.role !== 'inspector') {
      setMessage({ type: 'error', text: 'Department is required.' });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!profileData.name.trim()) {
      setMessage({ type: 'error', text: 'Name is required.' });
      return;
    }
    
    if (!profileData.email.trim()) {
      setMessage({ type: 'error', text: 'Email is required.' });
      return;
    }
    
    // Only require department for admin role (not for manager/inspector)
    if (!profileData.department && user?.role !== 'manager' && user?.role !== 'inspector') {
      setMessage({ type: 'error', text: 'Department is required.' });
      return;
    }
    
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Prepare update data - exclude department for non-admin users
      const updateData = {
        name: profileData.name,
        email: profileData.email
      };
      
      // Only include department if user is admin/superadmin
      if (user?.role === 'admin' || user?.role === 'superadmin') {
        updateData.department = profileData.department;
      }
      
      // Include other fields
      if (profileData.phone !== undefined) updateData.phone = profileData.phone;
      if (profileData.address !== undefined) updateData.address = profileData.address;
      if (profileData.emergencyContact !== undefined) updateData.emergencyContact = profileData.emergencyContact;
      
      // Include password fields if provided
      if (profileData.currentPassword && profileData.newPassword) {
        updateData.currentPassword = profileData.currentPassword;
        updateData.newPassword = profileData.newPassword;
      }
      
      const response = await api.put('/users/profile', updateData);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setProfileData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: ''
        }));
        
        // Update local user data
        if (updateUser) {
          updateUser(response.data.data);
        }
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormCard>
      <FormHeader>
        <FormTitle>
          <User size={20} />
          Profile Information
        </FormTitle>
      </FormHeader>
      
      <FormBody>
        {message.text && (
          <Message type={message.type}>
            {message.type === 'success' ? (
              <CheckCircle size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            {message.text}
          </Message>
        )}

        {!isEditing ? (
          <>
            <InfoCard>
              <InfoRow>
                <InfoLabel>Full Name</InfoLabel>
                <InfoValue>{user?.name || 'Not provided'}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Email Address</InfoLabel>
                <InfoValue>{user?.email || 'Not provided'}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Department</InfoLabel>
                <InfoValue>
                  {user?.department || 'Not specified'}
                </InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Role</InfoLabel>
                <InfoValue>
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Inspector'}
                </InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Phone Number</InfoLabel>
                <InfoValue>
                  {user?.phone || 'Not provided'}
                </InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Address</InfoLabel>
                <InfoValue>
                  {user?.address || 'Not provided'}
                </InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Emergency Contact</InfoLabel>
                <InfoValue>
                  {user?.emergencyContact || 'Not provided'}
                </InfoValue>
              </InfoRow>
            </InfoCard>
            
            <ButtonGroup>
              <Button 
                type="button" 
                variant="primary" 
                onClick={startEdit}
              >
                <Edit3 size={16} />
                Edit Profile
              </Button>
            </ButtonGroup>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <FormRow>
              <FormGroup>
                <Label>Full Name *</Label>
                <Input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  name="email"
                  value={profileData.email}
                  disabled={true}
                  placeholder="Email cannot be changed"
                />
              </FormGroup>
            </FormRow>
            
            <FormGroup>
              <Label>
                Department{(user?.role !== 'manager' && user?.role !== 'inspector') ? ' *' : ''}
              </Label>
              <Select
                name="department"
                value={profileData.department}
                onChange={handleInputChange}
                required={user?.role !== 'manager' && user?.role !== 'inspector'}
                disabled={user?.role === 'manager' || user?.role === 'inspector'}
                style={{
                  opacity: (user?.role === 'manager' || user?.role === 'inspector') ? 0.6 : 1,
                  cursor: (user?.role === 'manager' || user?.role === 'inspector') ? 'not-allowed' : 'pointer'
                }}
              >
                {DEPARTMENT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {(user?.role === 'manager' || user?.role === 'inspector') && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  fontStyle: 'italic',
                  marginTop: '4px'
                }}>
                  Only admins can modify department
                </div>
              )}
            </FormGroup>
            
            <FormGroup>
              <Label>Phone Number</Label>
              <Input
                type="text"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Address</Label>
              <Input
                type="text"
                name="address"
                value={profileData.address}
                onChange={handleInputChange}
                placeholder="Enter address"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Emergency Contact</Label>
              <Input
                type="text"
                name="emergencyContact"
                value={profileData.emergencyContact}
                onChange={handleInputChange}
                placeholder="Enter emergency contact"
              />
            </FormGroup>
            
            <ButtonGroup>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={isLoading}
              >
                {isLoading ? (
                  'Saving...'
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                onClick={cancelEdit}
                disabled={isLoading}
              >
                <X size={16} />
                Cancel
              </Button>
            </ButtonGroup>
          </form>
        )}
      </FormBody>
    </FormCard>
  );
};

export default ProfileForm; 