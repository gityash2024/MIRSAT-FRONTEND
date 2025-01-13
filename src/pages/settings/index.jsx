import React, { useState } from 'react';
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

const Settings = () => {
  const [activeSection, setActiveSection] = useState('general');

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
      case 'backup':
        return <BackupSettings />;
      default:
        return <GeneralSettings />;
    }
  };

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