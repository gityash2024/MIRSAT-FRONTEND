import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  KeyRound, 
  AlertCircle, 
  CheckCircle,
  Lock,
  Save,
  X
} from 'lucide-react';
import api from '../../utils/axios';

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

const FormGroup = styled.div`
  margin-bottom: 16px;
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
  background: white;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--color-navy);
    box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
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

const Description = styled.p`
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const InfoCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: center;
`;

const InfoText = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
`;

const PasswordChangeTab = () => {
  const [isChanging, setIsChanging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setMessage({ type: '', text: '' });
  };

  const startChange = () => {
    setIsChanging(true);
    setMessage({ type: '', text: '' });
  };

  const cancelChange = () => {
    setIsChanging(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setMessage({ type: '', text: '' });
  };

  const validateForm = () => {
    if (!passwordData.currentPassword) {
      setMessage({ type: 'error', text: 'Current password is required.' });
      return false;
    }
    
    if (!passwordData.newPassword) {
      setMessage({ type: 'error', text: 'New password is required.' });
      return false;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return false;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return false;
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      setMessage({ type: 'error', text: 'New password must be different from current password.' });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updateData = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      };

      const response = await api.patch('/users/profile', updateData);
      
      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: response.data.message || 'Password changed successfully.' 
        });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsChanging(false);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to change password.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormCard>
      <FormHeader>
        <FormTitle>
          <KeyRound size={20} />
          Change Password
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

        {!isChanging ? (
          <>
            <InfoCard>
              <InfoText>
                Keep your account secure by regularly updating your password. 
                Make sure to use a strong password with a mix of letters, numbers, and symbols.
              </InfoText>
            </InfoCard>
            
            <ButtonGroup>
              <Button 
                type="button" 
                variant="primary" 
                onClick={startChange}
              >
                <Lock size={16} />
                Change Password
              </Button>
            </ButtonGroup>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <Description>
              Enter your current password and choose a new secure password.
            </Description>
            
            <FormGroup>
              <Label>Current Password *</Label>
              <Input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter your current password"
                required
              />
            </FormGroup>
            
            <FormRow>
              <FormGroup>
                <Label>New Password *</Label>
                <Input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Confirm New Password *</Label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                  required
                />
              </FormGroup>
            </FormRow>
            
            <ButtonGroup>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={isLoading}
              >
                {isLoading ? (
                  'Changing Password...'
                ) : (
                  <>
                    <Save size={16} />
                    Change Password
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                onClick={cancelChange}
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

export default PasswordChangeTab; 