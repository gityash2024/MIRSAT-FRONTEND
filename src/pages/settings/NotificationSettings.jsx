import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Save,
  AlertTriangle,
  Clock
} from 'lucide-react';

const Container = styled.div`
  display: grid;
  gap: 24px;
`;

const Section = styled.div`
  display: grid;
  gap: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 4px;
`;

const SectionDescription = styled.p`
  font-size: 14px;
  color: #64748b;
`;

const PreferenceList = styled.div`
  display: grid;
  gap: 16px;
`;

const PreferenceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  padding: 16px;
  background: ${props => props.active ? '#f8fafc' : 'white'};
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
  }
`;

const PreferenceInfo = styled.div`
  display: flex;
  gap: 16px;
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.background || '#e3f2fd'};
  color: ${props => props.color || '#1565c0'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PreferenceContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PreferenceTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: #334155;
`;

const PreferenceDescription = styled.p`
  font-size: 13px;
  color: #64748b;
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  margin-left: 16px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #1a237e;
  }

  &:checked + span:before {
    transform: translateX(20px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e2e8f0;
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  color: #334155;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #1a237e;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${props => props.variant === 'primary' ? '#1a237e' : 'white'};
  color: ${props => props.variant === 'primary' ? 'white' : '#1a237e'};
  border: 1px solid ${props => props.variant === 'primary' ? '#1a237e' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.variant === 'primary' ? '#151b4f' : '#f8fafc'};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const WarningMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff7ed;
  border: 1px solid #fdba74;
  border-radius: 8px;
  color: #c2410c;
  font-size: 14px;
  margin-top: 24px;
`;

const NotificationSettings = () => {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    taskUpdates: true,
    systemAlerts: true,
    mobileNotifications: false,
    dailyDigest: true,
    reminderFrequency: '24h'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (preference) => {
    setPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference]
    }));
    setHasChanges(true);
  };

  const handleFrequencyChange = (e) => {
    setPreferences(prev => ({
      ...prev,
      reminderFrequency: e.target.value
    }));
    setHasChanges(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      // Show success message
    } catch (error) {
      // Show error message
    } finally {
      setIsSubmitting(false);
    }
  };

  const notificationTypes = [
    {
      id: 'emailNotifications',
      title: 'Email Notifications',
      description: 'Receive notifications via email for important updates',
      icon: Mail,
      background: '#e3f2fd',
      color: '#1565c0'
    },
    {
      id: 'taskUpdates',
      title: 'Task Updates',
      description: 'Get notified when tasks are assigned, updated, or completed',
      icon: Bell,
      background: '#e8f5e9',
      color: '#2e7d32'
    },
    {
      id: 'systemAlerts',
      title: 'System Alerts',
      description: 'Receive critical system alerts and announcements',
      icon: AlertTriangle,
      background: '#fff3e0',
      color: '#ed6c02'
    },
    {
      id: 'dailyDigest',
      title: 'Daily Digest',
      description: 'Receive a daily summary of all activities',
      icon: MessageSquare,
      background: '#e8eaf6',
      color: '#3f51b5'
    }
  ];

  return (
    <Container>
      <Section>
        <div>
          <SectionTitle>Notification Preferences</SectionTitle>
          <SectionDescription>
            Customize how and when you want to receive notifications
          </SectionDescription>
        </div>

        <PreferenceList>
          {notificationTypes.map(type => (
            <PreferenceItem key={type.id} active={preferences[type.id]}>
              <PreferenceInfo>
                <IconWrapper background={type.background} color={type.color}>
                  <type.icon size={20} />
                </IconWrapper>
                <PreferenceContent>
                  <PreferenceTitle>{type.title}</PreferenceTitle>
                  <PreferenceDescription>{type.description}</PreferenceDescription>
                </PreferenceContent>
              </PreferenceInfo>
              <Toggle>
                <ToggleInput
                  type="checkbox"
                  checked={preferences[type.id]}
                  onChange={() => handleToggle(type.id)}
                />
                <ToggleSlider />
              </Toggle>
            </PreferenceItem>
          ))}
        </PreferenceList>
      </Section>

      <Section>
        <div>
          <SectionTitle>Reminder Settings</SectionTitle>
          <SectionDescription>
            Configure how often you want to receive reminders
          </SectionDescription>
        </div>

        <PreferenceItem>
          <PreferenceInfo>
            <IconWrapper>
              <Clock size={20} />
            </IconWrapper>
            <PreferenceContent>
              <PreferenceTitle>Reminder Frequency</PreferenceTitle>
              <PreferenceDescription>
                Set how often you want to receive task reminders
              </PreferenceDescription>
            </PreferenceContent>
          </PreferenceInfo>
          <Select
            value={preferences.reminderFrequency}
            onChange={handleFrequencyChange}
          >
            <option value="6h">Every 6 hours</option>
            <option value="12h">Every 12 hours</option>
            <option value="24h">Every 24 hours</option>
            <option value="48h">Every 48 hours</option>
            <option value="weekly">Weekly</option>
          </Select>
        </PreferenceItem>
      </Section>

      {hasChanges && (
        <WarningMessage>
          <AlertTriangle size={18} />
          You have unsaved changes. Please save your changes before leaving this page.
        </WarningMessage>
      )}

      <ButtonGroup>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!hasChanges || isSubmitting}
        >
          <Save size={16} />
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default NotificationSettings;