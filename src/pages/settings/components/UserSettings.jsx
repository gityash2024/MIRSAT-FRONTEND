import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Users,
  UserPlus,
  Lock,
  Shield,
  Save,
  AlertTriangle,
  Clock,
  Key,
  Bell,
  Mail,
  CheckCircle,
  Calendar
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
  display: flex;
  align-items: center;
  gap: 8px;

  .icon {
    opacity: 0.7;
  }
`;

const SectionDescription = styled.p`
  font-size: 14px;
  color: #64748b;
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 8px;

  .icon {
    color: #64748b;
  }
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;

  &:focus {
    outline: none;
    border-color: #1a237e;
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  background: white;

  &:focus {
    outline: none;
    border-color: #1a237e;
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
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

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #dcfce7;
  border: 1px solid #86efac;
  border-radius: 8px;
  color: #16a34a;
  font-size: 14px;
`;

const PolicyList = styled.div`
  display: grid;
  gap: 16px;
`;

const PolicyItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
`;

const PolicyInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PolicyTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: #334155;
`;

const PolicyDescription = styled.p`
  font-size: 13px;
  color: #64748b;
`;

const NotificationList = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 16px;
`;

const UserSettings = () => {
  const [settings, setSettings] = useState({
    registration: {
      allowSelfRegistration: false,
      requireEmailVerification: true,
      requireAdminApproval: true,
      allowedDomains: [],
      defaultRole: 'inspector',
      welcomeEmail: true,
      enforceStrongPassword: true
    },
    password: {
      minLength: 8,
      requireNumbers: true,
      requireSymbols: true,
      requireUppercase: true,
      maxAttempts: 5,
      lockoutDuration: 30,
      preventReuse: true,
      expiryDays: 90,
      warningDays: 7
    },
    session: {
      sessionTimeout: 30,
      allowMultipleSessions: false,
      rememberMeDuration: 7,
      enforceIPCheck: true,
      maxConcurrentSessions: 3
    },
    notifications: {
      loginAlerts: true,
      passwordExpiry: true,
      accountLockout: true,
      newDeviceLogin: true,
      securityEvents: true
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      // Show error message
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Section>
        <div>
          <SectionTitle>
            <UserPlus size={20} className="icon" />
            Registration Settings
          </SectionTitle>
          <SectionDescription>
            Configure user registration and onboarding settings
          </SectionDescription>
        </div>

        <Card>
          <PolicyList>
            <PolicyItem>
              <PolicyInfo>
                <PolicyTitle>Self Registration</PolicyTitle>
                <PolicyDescription>
                  Allow users to register their own accounts
                </PolicyDescription>
              </PolicyInfo>
              <Toggle>
                <ToggleInput
                  type="checkbox"
                  checked={settings.registration.allowSelfRegistration}
                  onChange={(e) => handleChange('registration', 'allowSelfRegistration', e.target.checked)}
                />
                <ToggleSlider />
              </Toggle>
            </PolicyItem>

            <PolicyItem>
              <PolicyInfo>
                <PolicyTitle>Email Verification</PolicyTitle>
                <PolicyDescription>
                  Require email verification for new accounts
                </PolicyDescription>
              </PolicyInfo>
              <Toggle>
                <ToggleInput
                  type="checkbox"
                  checked={settings.registration.requireEmailVerification}
                  onChange={(e) => handleChange('registration', 'requireEmailVerification', e.target.checked)}
                />
                <ToggleSlider />
              </Toggle>
            </PolicyItem>

            <PolicyItem>
              <PolicyInfo>
                <PolicyTitle>Admin Approval</PolicyTitle>
                <PolicyDescription>
                  Require administrator approval for new accounts
                </PolicyDescription>
              </PolicyInfo>
              <Toggle>
                <ToggleInput
                  type="checkbox"
                  checked={settings.registration.requireAdminApproval}
                  onChange={(e) => handleChange('registration', 'requireAdminApproval', e.target.checked)}
                />
                <ToggleSlider />
              </Toggle>
            </PolicyItem>

            <PolicyItem>
              <PolicyInfo>
                <PolicyTitle>Welcome Email</PolicyTitle>
                <PolicyDescription>
                  Send welcome email to new users
                </PolicyDescription>
              </PolicyInfo>
              <Toggle>
                <ToggleInput
                  type="checkbox"
                  checked={settings.registration.welcomeEmail}
                  onChange={(e) => handleChange('registration', 'welcomeEmail', e.target.checked)}
                />
                <ToggleSlider />
              </Toggle>
            </PolicyItem>

            <PolicyItem>
              <PolicyInfo>
                <PolicyTitle>Default Role</PolicyTitle>
                <PolicyDescription>
                  Set default role for new user accounts
                </PolicyDescription>
              </PolicyInfo>
              <Select
                value={settings.registration.defaultRole}
                onChange={(e) => handleChange('registration', 'defaultRole', e.target.value)}
                style={{ width: '150px' }}
              >
                <option value="inspector">Inspector</option>
                <option value="viewer">Viewer</option>
                <option value="reporter">Reporter</option>
              </Select>
            </PolicyItem>
          </PolicyList>
        </Card>
      </Section>

      <Section>
        <div>
          <SectionTitle>
            <Lock size={20} className="icon" />
            Password Policy
          </SectionTitle>
          <SectionDescription>
            Configure password requirements and restrictions
          </SectionDescription>
        </div>

        <Card>
          <FormGrid>
            <FormGroup>
              <Label>
                <Key size={14} className="icon" />
                Minimum Password Length
              </Label>
              <Input
                type="number"
                min="6"
                max="32"
                value={settings.password.minLength}
                onChange={(e) => handleChange('password', 'minLength', parseInt(e.target.value))}
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <Shield size={14} className="icon" />
                Maximum Failed Attempts
              </Label>
              <Input
                type="number"
                min="3"
                max="10"
                value={settings.password.maxAttempts}
                onChange={(e) => handleChange('password', 'maxAttempts', parseInt(e.target.value))}
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <Clock size={14} className="icon" />
                Account Lockout Duration (minutes)
              </Label>
              <Input
                type="number"
                min="5"
                max="1440"
                value={settings.password.lockoutDuration}
                onChange={(e) => handleChange('password', 'lockoutDuration', parseInt(e.target.value))}
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <Calendar size={14} className="icon" />
                Password Expiry Days
              </Label>
              <Input
                type="number"
                min="30"
                max="365"
                value={settings.password.expiryDays}
                onChange={(e) => handleChange('password', 'expiryDays', parseInt(e.target.value))}
              />
            </FormGroup>
          </FormGrid>

          <PolicyList style={{ marginTop: '16px' }}>
            <PolicyItem>
              <PolicyInfo>
                <PolicyTitle>Require Numbers</PolicyTitle>
                <PolicyDescription>
                  Require at least one number in passwords
                </PolicyDescription>
              </PolicyInfo>
              <Toggle>
                <ToggleInput
                  type="checkbox"
                  checked={settings.password.requireNumbers}
                  onChange={(e) => handleChange('password', 'requireNumbers', e.target.checked)}
                />
                <ToggleSlider />
              </Toggle>
            </PolicyItem>

            <PolicyItem>
              <PolicyInfo>
                <PolicyTitle>Require Symbols</PolicyTitle>
                <PolicyDescription>
                  Require at least one special character in passwords
                </PolicyDescription>
              </PolicyInfo>
              <Toggle>
                <ToggleInput
                  type="checkbox"
                  checked={settings.password.requireSymbols}
                  onChange={(e) => handleChange('password', 'requireSymbols', e.target.checked)}
                />
                <ToggleSlider />
              </Toggle>
            </PolicyItem>

              <PolicyItem>
                <PolicyInfo>
                  <PolicyTitle>Require Uppercase</PolicyTitle>
                  <PolicyDescription>
                    Require at least one uppercase letter in passwords
                  </PolicyDescription>
                </PolicyInfo>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={settings.password.requireUppercase}
                    onChange={(e) => handleChange('password', 'requireUppercase', e.target.checked)}
                  />
                  <ToggleSlider />
                </Toggle>
              </PolicyItem>
            </PolicyList>
          </Card>
        </Section>

        <Section>
          <div>
            <SectionTitle>
              <Clock size={20} className="icon" />
              Session Settings
            </SectionTitle>
            <SectionDescription>
              Configure user session and authentication settings
            </SectionDescription>
          </div>

          <Card>
            <FormGrid>
              <FormGroup>
                <Label>
                  <Clock size={14} className="icon" />
                  Session Timeout (minutes)
                </Label>
                <Input
                  type="number"
                  min="5"
                  max="1440"
                  value={settings.session.sessionTimeout}
                  onChange={(e) => handleChange('session', 'sessionTimeout', parseInt(e.target.value))}
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <Clock size={14} className="icon" />
                  "Remember Me" Duration (days)
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.session.rememberMeDuration}
                  onChange={(e) => handleChange('session', 'rememberMeDuration', parseInt(e.target.value))}
                />
              </FormGroup>
            </FormGrid>

            <PolicyItem style={{ marginTop: '16px' }}>
              <PolicyInfo>
                <PolicyTitle>Allow Multiple Sessions</PolicyTitle>
                <PolicyDescription>
                  Allow users to be logged in from multiple devices simultaneously
                </PolicyDescription>
              </PolicyInfo>
              <Toggle>
                <ToggleInput
                  type="checkbox"
                  checked={settings.session.allowMultipleSessions}
                  onChange={(e) => handleChange('session', 'allowMultipleSessions', e.target.checked)}
                />
                <ToggleSlider />
              </Toggle>
            </PolicyItem>
          </Card>
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

export default UserSettings;