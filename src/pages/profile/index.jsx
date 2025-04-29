import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  User, Mail, Building, Calendar, Clock, Shield, Camera,
  Save, CheckCircle, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const PageContainer = styled.div`
  padding: 24px;
  background-color: #f5f7fb;
  min-height: 100vh;
`;

const PageHeader = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 8px;
`;

const SubTitle = styled.p`
  color: #666;
  font-size: 14px;
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const ProfileCard = styled(Card)`
  padding: 0;
`;

const ProfileHeader = styled.div`
  background: linear-gradient(to right, var(--color-navy), #3949ab);
  height: 120px;
  position: relative;
`;

const ProfileAvatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: var(--color-navy);
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  
  .upload-icon {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--color-navy);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  input[type="file"] {
    display: none;
  }
`;

const ProfileInfo = styled.div`
  padding: 60px 24px 24px;
  text-align: center;
  
  .name {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-navy);
    margin-bottom: 4px;
  }
  
  .role {
    color: #666;
    font-size: 14px;
    margin-bottom: 16px;
  }
`;

const ProfileMetaList = styled.div`
  padding: 24px;
  border-top: 1px solid #f1f5f9;
`;

const ProfileMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid #f1f5f9;
  }
  
  .icon {
    color: var(--color-navy);
  }
  
  .label {
    font-size: 14px;
    color: #666;
    flex: 1;
  }
  
  .value {
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }
`;

const FormCard = styled(Card)`
  padding: 24px;
`;

const FormTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 10px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: var(--color-navy);
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Button = styled.button`
  padding: 10px 16px;
  background: var(--color-navy);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #151b4f;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const PasswordTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 24px 0 16px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
`;

const Message = styled.div`
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  
  ${props => props.type === 'success' ? `
    background-color: #e8f5e9;
    color: #2e7d32;
  ` : `
    background-color: #ffebee;
    color: #c62828;
  `}
`;

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    department: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);
  
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const toggleEdit = () => {
    if (isEditing) {
      // Revert changes if canceling edit
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    setIsEditing(!isEditing);
    setMessage({ type: '', text: '' });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Validate passwords if changing password
      if (profileData.newPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          setMessage({ type: 'error', text: 'New passwords do not match.' });
          setIsLoading(false);
          return;
        }
        
        if (!profileData.currentPassword) {
          setMessage({ type: 'error', text: 'Current password is required to set a new password.' });
          setIsLoading(false);
          return;
        }
      }
      
      // Update profile
      const updateData = {
        name: profileData.name,
        department: profileData.department
      };
      
      // Add password data if changing password
      if (profileData.newPassword && profileData.currentPassword) {
        updateData.currentPassword = profileData.currentPassword;
        updateData.newPassword = profileData.newPassword;
      }
      
      const response = await api.patch('/users/profile', updateData);
      
      // Update user in context
      if (response.data.success) {
        updateUser(response.data.user);
        setMessage({ type: 'success', text: 'Profile updated successfully.' });
        setIsEditing(false);
        
        // Reset password fields
        setProfileData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile.' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <PageContainer>
    
      
      <ProfileGrid>
        <ProfileCard>
          <ProfileHeader>
            <ProfileAvatar>
              {getInitials(user?.name)}
              <label htmlFor="avatar-upload" className="upload-icon">
                <Camera size={16} />
              </label>
              <input 
                type="file" 
                id="avatar-upload" 
                accept="image/*"
                onChange={() => toast.error('Avatar upload is not implemented yet.')}
              />
            </ProfileAvatar>
          </ProfileHeader>
          
          <ProfileInfo>
            <div className="name">{user?.name}</div>
            <div className="role">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Inspector'}</div>
          </ProfileInfo>
          
          <ProfileMetaList>
            <ProfileMetaItem>
              <Mail size={18} className="icon" />
              <div className="label">Email</div>
              <div className="value">{user?.email}</div>
            </ProfileMetaItem>
            
            <ProfileMetaItem>
              <Building size={18} className="icon" />
              <div className="label">Department</div>
              <div className="value">{user?.department || 'Not specified'}</div>
            </ProfileMetaItem>
            
            <ProfileMetaItem>
              <Shield size={18} className="icon" />
              <div className="label">Role</div>
              <div className="value">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Inspector'}</div>
            </ProfileMetaItem>
            
            {/* <ProfileMetaItem>
              <Calendar size={18} className="icon" />
              <div className="label">Joined</div>
              <div className="value">{formatDate(user?.createdAt)}</div>
            </ProfileMetaItem>
            
            <ProfileMetaItem>
              <Clock size={18} className="icon" />
              <div className="label">Last Login</div>
              <div className="value">{formatDate(user?.lastLogin)}</div>
            </ProfileMetaItem> */}
          </ProfileMetaList>
        </ProfileCard>
        
        <FormCard>
          <FormTitle>
            <User size={20} />
            Profile Information
          </FormTitle>
          
          <form onSubmit={handleSubmit}>
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
            
            <FormRow>
              <FormGroup>
                <Label>Full Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
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
                  required
                />
              </FormGroup>
            </FormRow>
            
            {/* <FormGroup>
              <Label>Department</Label>
              <Input
                type="text"
                name="department"
                value={profileData.department}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Your department"
              />
            </FormGroup> */}
            
            {isEditing && (
              <>
                <PasswordTitle>Change Password</PasswordTitle>
                
                <FormGroup>
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    name="currentPassword"
                    value={profileData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Enter current password"
                  />
                </FormGroup>
                
                <FormRow>
                  <FormGroup>
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      name="newPassword"
                      value={profileData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={profileData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm new password"
                    />
                  </FormGroup>
                </FormRow>
              </>
            )}
            
            <ButtonGroup>
              {isEditing ? (
                <>
                  <Button type="button" onClick={toggleEdit} style={{ background: '#f5f5f5', color: '#333' }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={toggleEdit}>
                  Edit Profile
                </Button>
              )}
            </ButtonGroup>
          </form>
        </FormCard>
      </ProfileGrid>
    </PageContainer>
  );
};

export default UserProfile;