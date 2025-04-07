import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Mail,
  Server,
  Lock,
  UserCheck,
  Send,
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
  CheckCircle
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

const PasswordInput = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  input {
    width: 100%;
    padding-right: 40px;
  }

  button {
    position: absolute;
    right: 8px;
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

const Textarea = styled.textarea`
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  min-height: 120px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #1a237e;
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
`;

const TemplateCard = styled(Card)`
  display: grid;
  gap: 16px;
`;

const TemplateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TemplateName = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: #334155;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: ${props => props.size === 'small' ? '6px 12px' : '10px 20px'};
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

const TestEmailCard = styled(Card)`
  margin-top: 24px;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  background: ${props => props.connected ? '#dcfce7' : '#fee2e2'};
  color: ${props => props.connected ? '#16a34a' : '#dc2626'};
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
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
  margin-top: 16px;
`;

const EmailSettings = () => {
  const [smtpSettings, setSmtpSettings] = useState({
    host: 'smtp.example.com',
    port: '587',
    username: 'noreply@example.com',
    password: 'password123',
    encryption: 'tls',
    fromName: 'MIRSAT System',
    fromEmail: 'noreply@example.com'
  });

  const [templates, setTemplates] = useState({
    taskAssignment: {
      subject: 'New Task Assignment: {taskName}',
      body: 'Dear {inspectorName},\n\nYou have been assigned a new task: {taskName}.\n\nDue Date: {dueDate}\nPriority: {priority}\n\nPlease log in to the system to view the task details.\n\nBest regards,\nMIRSAT Team'
    },
    taskUpdate: {
      subject: 'Task Update: {taskName}',
      body: 'Dear {userName},\n\nThe task "{taskName}" has been updated.\n\nStatus: {status}\nLast Updated: {updateTime}\n\nPlease log in to the system to view the changes.\n\nBest regards,\nMIRSAT Team'
    }
  });

  const [testEmail, setTestEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);

  const handleSMTPChange = (field, value) => {
    setSmtpSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleTemplateChange = (template, field, value) => {
    setTemplates(prev => ({
      ...prev,
      [template]: {
        ...prev[template],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleTestConnection = async () => {
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsConnected(true);
      // Show success message
    } catch (error) {
      setIsConnected(false);
      // Show error message
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) return;

    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTestEmailSent(true);
      setTimeout(() => setTestEmailSent(false), 5000);
    } catch (error) {
      // Show error message
    }
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

  return (
    <Container>
      <Section>
        <div>
          <SectionTitle>
            <Server size={20} className="icon" />
            SMTP Configuration
          </SectionTitle>
          <SectionDescription>
            Configure your email server settings for sending notifications
          </SectionDescription>
        </div>

        <Card>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <StatusBadge connected={isConnected}>
              {isConnected ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
              {isConnected ? 'Connected' : 'Not Connected'}
            </StatusBadge>
            <Button size="small" onClick={handleTestConnection}>
              <RefreshCw size={14} />
              Test Connection
            </Button>
          </div>

          <FormGrid>
            <FormGroup>
              <Label>
                <Server size={14} className="icon" />
                SMTP Host
              </Label>
              <Input
                type="text"
                value={smtpSettings.host}
                onChange={(e) => handleSMTPChange('host', e.target.value)}
                placeholder="e.g., smtp.gmail.com"
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <Settings size={14} className="icon" />
                SMTP Port
              </Label>
              <Input
                type="text"
                value={smtpSettings.port}
                onChange={(e) => handleSMTPChange('port', e.target.value)}
                placeholder="e.g., 587"
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <UserCheck size={14} className="icon" />
                Username
              </Label>
              <Input
                type="text"
                value={smtpSettings.username}
                onChange={(e) => handleSMTPChange('username', e.target.value)}
                placeholder="SMTP username"
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <Lock size={14} className="icon" />
                Password
              </Label>
              <PasswordInput>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={smtpSettings.password}
                  onChange={(e) => handleSMTPChange('password', e.target.value)}
                  placeholder="SMTP password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </PasswordInput>
            </FormGroup>

            <FormGroup>
              <Label>
                <Lock size={14} className="icon" />
                Encryption
              </Label>
              <Select
                value={smtpSettings.encryption}
                onChange={(e) => handleSMTPChange('encryption', e.target.value)}
              >
                <option value="none">None</option>
                <option value="ssl">SSL</option>
                <option value="tls">TLS</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                <Mail size={14} className="icon" />
                From Name
              </Label>
              <Input
                type="text"
                value={smtpSettings.fromName}
                onChange={(e) => handleSMTPChange('fromName', e.target.value)}
                placeholder="Sender name"
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <Mail size={14} className="icon" />
                From Email
              </Label>
              <Input
                type="email"
                value={smtpSettings.fromEmail}
                onChange={(e) => handleSMTPChange('fromEmail', e.target.value)}
                placeholder="Sender email"
              />
            </FormGroup>
          </FormGrid>
        </Card>
      </Section>

      <Section>
        <div>
          <SectionTitle>
            <Mail size={20} className="icon" />
            Email Templates
          </SectionTitle>
          <SectionDescription>
            Configure email templates for various notifications
          </SectionDescription>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          <TemplateCard>
            <TemplateHeader>
              <TemplateName>Task Assignment Notification</TemplateName>
            </TemplateHeader>
            <FormGroup>
              <Label>Subject Template</Label>
              <Input
                type="text"
                value={templates.taskAssignment.subject}
                onChange={(e) => handleTemplateChange('taskAssignment', 'subject', e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Email Body Template</Label>
              <Textarea
                value={templates.taskAssignment.body}
                onChange={(e) => handleTemplateChange('taskAssignment', 'body', e.target.value)}
              />
            </FormGroup>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Available variables: {'{inspectorName}'}, {'{taskName}'}, {'{dueDate}'}, {'{priority}'}
            </div>
          </TemplateCard>

          <TemplateCard>
            <TemplateHeader>
              <TemplateName>Task Update Notification</TemplateName>
            </TemplateHeader>
            <FormGroup>
              <Label>Subject Template</Label>
              <Input
                type="text"
                value={templates.taskUpdate.subject}
                onChange={(e) => handleTemplateChange('taskUpdate', 'subject', e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Email Body Template</Label>
              <Textarea
                value={templates.taskUpdate.body}
                onChange={(e) => handleTemplateChange('taskUpdate', 'body', e.target.value)}
              />
            </FormGroup>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Available variables: {'{userName}'}, {'{taskName}'}, {'{status}'}, {'{updateTime}'}
            </div>
          </TemplateCard>
        </div>
      </Section>

      <Section>
        <TestEmailCard>
          <SectionTitle>
            <Send size={20} className="icon" />
            Test Email Configuration
          </SectionTitle>
          <SectionDescription>
            Send a test email to verify your email configuration
          </SectionDescription>

          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter test email address"
              style={{ flex: 1 }}
            />
            {/* <Button 
              variant="primary" 
              size="small" 
              onClick={handleSendTestEmail}
              disabled={!testEmail || !isConnected}
            >
              <Send size={14} />
              Send Test Email
            </Button> */}
          </div>

          {testEmailSent && (
            <SuccessMessage>
              <CheckCircle size={18} />
              Test email sent successfully!
            </SuccessMessage>
          )}
        </TestEmailCard>
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

export default EmailSettings;