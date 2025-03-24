import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Globe,
  Database,
  Mail,
  Users,
  Lock,
  Key,
  Server
} from 'lucide-react';

import GeneralSettings from './GeneralSettings';
import NotificationSettings from './NotificationSettings';
import SecuritySettings from './SecuritySettings';
import LocalizationSettings from './components/LocalizationSettings';
import APISettings from './components/APISettings';
import EmailSettings from './components/EmailSettings';
import UserSettings from './components/UserSettings';
import PermissionSettings from './components/PermissionSettings';
import Skeleton from '../../components/ui/Skeleton';

const PageContainer = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SubTitle = styled.p`
  color: #64748b;
  font-size: 14px;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const MenuList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  width: 100%;
  border: none;
  border-radius: 8px;
  background: ${props => props.active ? '#f1f5f9' : 'transparent'};
  color: ${props => props.active ? '#1a237e' : '#64748b'};
  font-size: 14px;
  font-weight: ${props => props.active ? '500' : 'normal'};
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    background: #f1f5f9;
    color: #1a237e;
  }

  .icon {
    opacity: ${props => props.active ? 1 : 0.7};
  }
`;

const ContentSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const menuItems = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'localization', label: 'Localization', icon: Globe },
  { id: 'api', label: 'API Settings', icon: Database },
  { id: 'email', label: 'Email Settings', icon: Mail },
  { id: 'users', label: 'User Settings', icon: Users },
  { id: 'permissions', label: 'Permissions', icon: Lock },
];

// Create a SettingsSkeleton component
const SettingsSkeleton = () => (
  <PageContainer>
    <Header>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Skeleton.Circle size="24px" />
        <Skeleton.Base width="120px" height="28px" />
      </div>
      <Skeleton.Base width="280px" height="16px" margin="8px 0 0 0" />
    </Header>

    <ContentGrid>
      <Sidebar>
        <MenuList>
          {Array(8).fill().map((_, i) => (
            <MenuItem key={i} as="div" style={{ cursor: 'default' }}>
              <Skeleton.Circle size="18px" />
              <Skeleton.Base width={`${80 + Math.random() * 40}px`} height="16px" />
            </MenuItem>
          ))}
        </MenuList>
      </Sidebar>

      <ContentSection>
        {/* Setting section header */}
        <div style={{ marginBottom: '24px' }}>
          <Skeleton.Base width="200px" height="24px" margin="0 0 8px 0" />
          <Skeleton.Base width="70%" height="16px" />
        </div>

        {/* Settings form fields */}
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* First settings section */}
          <div>
            <Skeleton.Base width="180px" height="20px" margin="0 0 16px 0" />
            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {Array(4).fill().map((_, i) => (
                  <div key={i}>
                    <Skeleton.Base width={`${100 + Math.random() * 60}px`} height="16px" margin="0 0 8px 0" />
                    <Skeleton.Base width="100%" height="40px" radius="8px" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Second settings section */}
          <div>
            <Skeleton.Base width="160px" height="20px" margin="0 0 16px 0" />
            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              {Array(3).fill().map((_, i) => (
                <div key={i} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Skeleton.Base width="24px" height="24px" radius="4px" />
                  <div>
                    <Skeleton.Base width={`${120 + Math.random() * 80}px`} height="16px" margin="0 0 4px 0" />
                    <Skeleton.Base width={`${200 + Math.random() * 100}px`} height="14px" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Skeleton.Button width="100px" />
            <Skeleton.Button width="100px" />
          </div>
        </div>
      </ContentSection>
    </ContentGrid>
  </PageContainer>
);

const Settings = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading settings data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'localization':
        return <LocalizationSettings />;
      case 'api':
        return <APISettings />;
      case 'email':
        return <EmailSettings />;
      case 'users':
        return <UserSettings />;
      case 'permissions':
        return <PermissionSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <PageContainer>
      <Header>
        <PageTitle>
          <SettingsIcon size={24} />
          Settings
        </PageTitle>
        <SubTitle>Manage your application settings and preferences</SubTitle>
      </Header>

      <ContentGrid>
        <Sidebar>
          <MenuList>
            {menuItems.map(item => (
              <MenuItem
                key={item.id}
                active={activeSection === item.id}
                onClick={() => setActiveSection(item.id)}
              >
                <item.icon size={18} className="icon" />
                {item.label}
              </MenuItem>
            ))}
          </MenuList>
        </Sidebar>

        <ContentSection>
          {renderContent()}
        </ContentSection>
      </ContentGrid>
    </PageContainer>
  );
};

export default Settings;