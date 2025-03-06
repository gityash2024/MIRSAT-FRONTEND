import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Shield,
  Key,
  Lock,
  Fingerprint,
  Smartphone,
  AlertTriangle,
  Save,
  Clock,
  Eye,
  EyeOff
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

const PolicyGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const PolicyCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  padding: 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
  }
`;

const PolicyInfo = styled.div`
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

const PolicyContent = styled.div`
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
  transition: all 0.2s;

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
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #1a237e;
  }
`;

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 4px 0;
`;

const ToggleLabel = styled.span`
  font-size: 14px;
  color: #334155;
  margin-right: 12px;
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  margin: 0;
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
`;

const SecurityBadge = styled.span`
  padding: 4px 8px;
  background: ${props => {
    switch (props.level) {
      case 'high':
        return '#dcfce7';
      case 'medium':
        return '#fff7ed';
      case 'low':
        return '#fee2e2';
      default:
        return '#f1f5f9';
    }
  }};
  color: ${props => {
    switch (props.level) {
      case 'high':
        return '#16a34a';
      case 'medium':
        return '#ea580c';
      case 'low':
        return '#dc2626';
      default:
        return '#64748b';
    }
  }};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const PasswordInput = styled.div`
  position: relative;
  
  input {
    padding-right: 40px;
  }

  button {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 4px;
    
    &:hover {
      color: #1a237e;
    }
  }
`;

const SecuritySettings = () => {
  const [settings, setSettings] = useState({
    passwordPolicy: {
      minLength: 8,
      requireNumbers: true,
      requireSymbols: true,
      requireUppercase: true,
      expiryDays: 90,
      preventReuse: true
    },
    twoFactorAuth: {
      enabled: true,
      method: 'authenticator'
    },
    sessionPolicy: {
      timeout: 30,
      maxAttempts: 5,
      lockoutDuration: 15
    },
    ipWhitelist: {
      enabled: false,
      addresses: ''
    }
  });

  const [showPasswords, setShowPasswords] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <Container>
      <Section>
        <div>
          <SectionTitle>
            <Key size={20} className="icon" />
            Password Policy
          </SectionTitle>
          <SectionDescription>
            Configure password requirements and expiration settings
          </SectionDescription>
        </div>

        <PolicyGrid>
          <PolicyCard>
            <PolicyInfo>
              <IconWrapper background="#e3f2fd" color="#1565c0">
                <Lock size={20} />
              </IconWrapper>
              <PolicyContent>
                <PolicyTitle>Minimum Password Length</PolicyTitle>
                <PolicyDescription>
                  Set the minimum number of characters required for passwords
                </PolicyDescription>
                <Input
                  type="number"
                  min="8"
                  max="32"
                  value={settings.passwordPolicy.minLength}
                  onChange={(e) => handleChange('passwordPolicy', 'minLength', parseInt(e.target.value))}
                  style={{ width: '100px', marginTop: '8px' }}
                />
              </PolicyContent>
            </PolicyInfo>
          </PolicyCard>

          <PolicyCard>
            <PolicyInfo>
              <IconWrapper background="#e8f5e9" color="#2e7d32">
                <Shield size={20} />
              </IconWrapper>
              <PolicyContent>
                <PolicyTitle>Password Requirements</PolicyTitle>
                <PolicyDescription>
                  Configure password complexity requirements
                </PolicyDescription>
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <ToggleWrapper>
                    <ToggleLabel>Require numbers</ToggleLabel>
                    <Toggle>
                      <ToggleInput
                        type="checkbox"
                        checked={settings.passwordPolicy.requireNumbers}
                        onChange={(e) => handleChange('passwordPolicy', 'requireNumbers', e.target.checked)}
                      />
                      <ToggleSlider />
                    </Toggle>
                  </ToggleWrapper>
                  <ToggleWrapper>
                    <ToggleLabel>Require symbols</ToggleLabel>
                    <Toggle>
                      <ToggleInput
                        type="checkbox"
                        checked={settings.passwordPolicy.requireSymbols}
                        onChange={(e) => handleChange('passwordPolicy', 'requireSymbols', e.target.checked)}
                      />
                      <ToggleSlider />
                    </Toggle>
                  </ToggleWrapper>
                  <ToggleWrapper>
                    <ToggleLabel>Require uppercase letters</ToggleLabel>
                    <Toggle>
                      <ToggleInput
                        type="checkbox"
                        checked={settings.passwordPolicy.requireUppercase}
                        onChange={(e) => handleChange('passwordPolicy', 'requireUppercase', e.target.checked)}
                      />
                      <ToggleSlider />
                    </Toggle>
                  </ToggleWrapper>
                </div>
              </PolicyContent>
            </PolicyInfo>
          </PolicyCard>

          <PolicyCard>
            <PolicyInfo>
              <IconWrapper background="#fff3e0" color="#ed6c02">
                <Clock size={20} />
              </IconWrapper>
              <PolicyContent>
                <PolicyTitle>Password Expiration</PolicyTitle>
                <PolicyDescription>
                  Set password expiration and reuse policies
                </PolicyDescription>
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <FormGroup>
                    <Label>Password expires after (days)</Label>
                    <Input
                      type="number"
                      value={settings.passwordPolicy.expiryDays}
                      onChange={(e) => handleChange('passwordPolicy', 'expiryDays', parseInt(e.target.value))}
                      style={{ width: '100px' }}
                    />
                  </FormGroup>
                  <ToggleWrapper>
                    <ToggleLabel>Prevent password reuse</ToggleLabel>
                    <Toggle>
                      <ToggleInput
                        type="checkbox"
                        checked={settings.passwordPolicy.preventReuse}
                        onChange={(e) => handleChange('passwordPolicy', 'preventReuse', e.target.checked)}
                      />
                      <ToggleSlider />
                    </Toggle>
                  </ToggleWrapper>
                </div>
              </PolicyContent>
            </PolicyInfo>
          </PolicyCard>
        </PolicyGrid>
      </Section>

      <Section>
        <div>
          <SectionTitle>
            <Fingerprint size={20} className="icon" />
            Two-Factor Authentication
          </SectionTitle>
          <SectionDescription>
            Configure two-factor authentication settings
          </SectionDescription>
        </div>

        <PolicyCard>
          <PolicyInfo>
            <IconWrapper background="#f3e5f5" color="#9c27b0">
              <Smartphone size={20} />
            </IconWrapper>
            <PolicyContent>
              <PolicyTitle>Two-Factor Authentication</PolicyTitle>
              <PolicyDescription>
                Enable and configure two-factor authentication method
              </PolicyDescription>
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <ToggleWrapper>
                  <ToggleLabel>Enable 2FA</ToggleLabel>
                  <Toggle>
                    <ToggleInput
                      type="checkbox"
                      checked={settings.twoFactorAuth.enabled}
                      onChange={(e) => handleChange('twoFactorAuth', 'enabled', e.target.checked)}
                    />
                    <ToggleSlider />
                  </Toggle>
                </ToggleWrapper>
                {settings.twoFactorAuth.enabled && (
                  <Select
                    value={settings.twoFactorAuth.method}
                    onChange={(e) => handleChange('twoFactorAuth', 'method', e.target.value)}
                    style={{ marginTop: '8px' }}
                  >
                    <option value="authenticator">Authenticator App</option>
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                  </Select>
                )}
              </div>
            </PolicyContent>
          </PolicyInfo>
        </PolicyCard>
      </Section>

      <Section>
        <div>
          <SectionTitle>
            <Shield size={20} className="icon" />
            Session Policy
          </SectionTitle>
          <SectionDescription>
            Configure session timeout and login attempt policies
          </SectionDescription>
        </div>

        <PolicyGrid>
          <PolicyCard>
            <PolicyInfo>
              <IconWrapper background="#e3f2fd" color="#1565c0">
                <Clock size={20} />
              </IconWrapper>
              <PolicyContent>
                <PolicyTitle>Session Timeout</PolicyTitle>
                <PolicyDescription>
                  Set the duration of inactivity before automatic logout (in minutes)
                </PolicyDescription>
                <Input
                  type="number"
                  min="5"
                  max="120"
                  value={settings.sessionPolicy.timeout}
                  onChange={(e) => handleChange('sessionPolicy', 'timeout', parseInt(e.target.value))}
                  style={{ width: '100px', marginTop: '8px' }}
                />
              </PolicyContent>
            </PolicyInfo>
          </PolicyCard>

          <PolicyCard>
            <PolicyInfo>
              <IconWrapper background="#fff3e0" color="#ed6c02">
                <AlertTriangle size={20} />
              </IconWrapper>
              <PolicyContent>
                <PolicyTitle>Failed Login Attempts</PolicyTitle>
                <PolicyDescription>
                  Configure maximum failed login attempts and lockout duration
                </PolicyDescription>
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <FormGroup>
                    <Label>Maximum attempts before lockout</Label>
                    <Input
                      type="number"
                      min="3"
                      max="10"
                      value={settings.sessionPolicy.maxAttempts}
                      onChange={(e) => handleChange('sessionPolicy', 'maxAttempts', parseInt(e.target.value))}
                      style={{ width: '100px' }}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Account lockout duration (minutes)</Label>
                    <Input
                      type="number"
                      min="5"
                      max="60"
                      value={settings.sessionPolicy.lockoutDuration}
                      onChange={(e) => handleChange('sessionPolicy', 'lockoutDuration', parseInt(e.target.value))}
                      style={{ width: '100px' }}
                    />
                  </FormGroup>
                </div>
              </PolicyContent>
            </PolicyInfo>
          </PolicyCard>
        </PolicyGrid>
      </Section>

      <Section>
        <div>
          <SectionTitle>
            <Shield size={20} className="icon" />
            IP Access Control
          </SectionTitle>
          <SectionDescription>
            Configure IP whitelist for additional security
          </SectionDescription>
        </div>

        <PolicyCard>
          <PolicyInfo>
            <IconWrapper background="#e8f5e9" color="#2e7d32">
              <Lock size={20} />
            </IconWrapper>
            <PolicyContent>
              <PolicyTitle>IP Whitelist</PolicyTitle>
              <PolicyDescription>
                Restrict access to specific IP addresses
              </PolicyDescription>
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <ToggleWrapper>
                  <ToggleLabel>Enable IP Whitelist</ToggleLabel>
                  <Toggle>
                    <ToggleInput
                      type="checkbox"
                      checked={settings.ipWhitelist.enabled}
                      onChange={(e) => handleChange('ipWhitelist', 'enabled', e.target.checked)}
                    />
                    <ToggleSlider />
                  </Toggle>
                </ToggleWrapper>
                {settings.ipWhitelist.enabled && (
                  <FormGroup>
                    <Label>Allowed IP Addresses (one per line)</Label>
                    <textarea
                      value={settings.ipWhitelist.addresses}
                      onChange={(e) => handleChange('ipWhitelist', 'addresses', e.target.value)}
                      placeholder="Enter IP addresses..."
                      style={{
                        width: '100%',
                        minHeight: '100px',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}
                    />
                  </FormGroup>
                )}
              </div>
            </PolicyContent>
          </PolicyInfo>
        </PolicyCard>
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

export default SecuritySettings;