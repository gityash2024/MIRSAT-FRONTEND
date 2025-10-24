import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Mail, 
  Building, 
  Shield,
  User,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import ProfileForm from './ProfileForm';
import PasswordChangeTab from './PasswordChangeTab';

const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  color: #1e293b;
  font-weight: 700;
  margin-bottom: 8px;
`;

const PageSubtitle = styled.p`
  color: #64748b;
  font-size: 16px;
  margin: 0;
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const ProfileCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  height: fit-content;
`;

const ProfileHeader = styled.div`
  background: linear-gradient(135deg, var(--color-navy) 0%, #1e40af 100%);
  padding: 24px;
  text-align: center;
  color: white;
`;

const ProfileAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: white;
  border: 3px solid rgba(255, 255, 255, 0.3);
`;

const ProfileInfo = styled.div`
  text-align: center;
  
  .name {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  
  .role {
    font-size: 14px;
    opacity: 0.9;
    font-weight: 500;
  }
`;

const ProfileBody = styled.div`
  padding: 20px;
`;

const ProfileMetaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const ProfileMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
  
  .icon {
    color: var(--color-navy);
    flex-shrink: 0;
  }
  
  .content {
    flex: 1;
  }
  
  .label {
    font-weight: 500;
    color: #64748b;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }
  
  .value {
    color: #1e293b;
    font-weight: 500;
    font-size: 14px;
  }
`;

const TabsContainer = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const TabsHeader = styled.div`
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 16px 20px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  
  &.active {
    background: white;
    color: var(--color-navy);
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--color-navy);
    }
  }
  
  &:hover:not(.active) {
    background: #f1f5f9;
    color: var(--color-navy);
  }
`;

const TabContent = styled.div`
  padding: 0;
`;

const UserProfile = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  const tabs = [
    {
      id: 'profile',
      label: t('common.profileUpdate'),
      icon: User,
      component: ProfileForm
    },
    {
      id: 'change-password',
      label: t('common.changePassword'),
      icon: KeyRound,
      component: PasswordChangeTab
    }
  ];

  const renderTabContent = () => {
    const activeTabData = tabs.find(tab => tab.id === activeTab);
    if (activeTabData) {
      const Component = activeTabData.component;
      return <Component />;
    }
    return null;
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>{t('common.profile')}</PageTitle>
        <PageSubtitle>{t('common.manageAccountSettings')}</PageSubtitle>
      </PageHeader>
      
      <ProfileGrid>
        <ProfileCard>
          <ProfileHeader>
            <ProfileAvatar>
              {getInitials(user?.name)}
            </ProfileAvatar>
            <ProfileInfo>
              <div className="name">{user?.name}</div>
              <div className="role">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || t('common.inspector')}</div>
            </ProfileInfo>
          </ProfileHeader>
          
          <ProfileBody>
            <ProfileMetaList>
              <ProfileMetaItem>
                <Mail size={16} className="icon" />
                <div className="content">
                  <div className="label">{t('common.email')}</div>
                  <div className="value">{user?.email}</div>
                </div>
              </ProfileMetaItem>
              
              <ProfileMetaItem>
                <Building size={16} className="icon" />
                <div className="content">
                  <div className="label">{t('common.department')}</div>
                  <div className="value">{user?.department || t('common.notSpecified')}</div>
                </div>
              </ProfileMetaItem>
              
              <ProfileMetaItem>
                <Shield size={16} className="icon" />
                <div className="content">
                  <div className="label">{t('common.role')}</div>
                  <div className="value">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || t('common.inspector')}</div>
                </div>
              </ProfileMetaItem>
            </ProfileMetaList>
          </ProfileBody>
        </ProfileCard>
        
        <TabsContainer>
          <TabsHeader>
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                className={activeTab === tab.id ? 'active' : ''}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={16} />
                {tab.label}
              </TabButton>
            ))}
          </TabsHeader>
          
          <TabContent>
            {renderTabContent()}
          </TabContent>
        </TabsContainer>
      </ProfileGrid>
    </PageContainer>
  );
};

export default UserProfile;