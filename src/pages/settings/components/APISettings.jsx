import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Database,
  Key,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Clock,
  AlertTriangle,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Lock,
  FileText,
  Activity,
  AlertCircle
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
  color: var(--color-navy);
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

const APIKeyCard = styled(Card)`
  display: grid;
  gap: 16px;
`;

const APIKeyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
`;

const APIKeyInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const APIKeyName = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: #334155;
`;

const APIKeyDescription = styled.p`
  font-size: 13px;
  color: #64748b;
`;

const APIKeyDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
  color: #64748b;

  span {
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const APIKeyValue = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  font-family: monospace;
  font-size: 14px;
  color: #334155;
`;

const UsageStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
`;

const StatCard = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StatLabel = styled.span`
  font-size: 13px;
  color: #64748b;
`;

const StatValue = styled.span`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-navy);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: ${props => props.size === 'small' ? '6px 12px' : '10px 20px'};
  background: ${props => {
    if (props.variant === 'primary') return 'var(--color-navy)';
    if (props.variant === 'danger') return '#dc2626';
    return 'white';
  }};
  color: ${props => {
    if (props.variant === 'primary' || props.variant === 'danger') return 'white';
    return 'var(--color-navy)';
  }};
  border: 1px solid ${props => {
    if (props.variant === 'primary') return 'var(--color-navy)';
    if (props.variant === 'danger') return '#dc2626';
    return '#e2e8f0';
  }};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => {
      if (props.variant === 'primary') return '#151b4f';
      if (props.variant === 'danger') return '#b91c1c';
      return '#f8fafc';
    }};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  background: ${props => props.status === 'active' ? '#dcfce7' : '#fee2e2'};
  color: ${props => props.status === 'active' ? '#16a34a' : '#dc2626'};
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 500px;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 16px;
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
  color: #334155;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;

  &:focus {
    outline: none;
    border-color: var(--color-navy);
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
    border-color: var(--color-navy);
  }
`;

const PermissionList = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 16px;
`;

const PermissionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: var(--color-navy);
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

const APISettings = () => {
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: 'Production API Key',
      key:  'prod_key_123456789',
      status: 'active',
      created: '2024-01-15',
      lastUsed: '2024-01-14',
      expiresAt: '2025-01-15',
      environment: 'production',
      permissions: {
        read: true,
        write: true,
        delete: false
      },
      usage: {
        requests: 15423,
        bandwidth: '1.2 GB',
        errors: 23
      }
    },
    {
      id: 2,
      name: 'Development API Key',
      key:  'dev_key_987654321',
      status: 'active',
      created: '2024-01-15',
      lastUsed: '2024-01-14',
      expiresAt: '2025-01-15',
      environment: 'development',
      permissions: {
        read: true,
        write: true,
        delete: true
      },
      usage: {
        requests: 8745,
        bandwidth: '645 MB',
        errors: 12
      }
    }
  ]);

  const [showKey, setShowKey] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    environment: 'development',
    expiresAt: '',
    permissions: {
      read: true,
      write: false,
      delete: false
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleCopyKey = async (key) => {
    try {
      await navigator.clipboard.writeText(key);
      setSuccessMessage('API key copied to clipboard');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to copy API key');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const toggleShowKey = (id) => {
    setShowKey(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCreateKey = () => {
    setEditingKey(null);
    setFormData({
      name: '',
      environment: 'development',
      expiresAt: '',
      permissions: {
        read: true,
        write: false,
        delete: false
      }
    });
    setShowModal(true);
  };

  const handleEditKey = (key) => {
    setEditingKey(key);
    setFormData({
      name: key.name,
      environment: key.environment,
      expiresAt: key.expiresAt,
      permissions: { ...key.permissions }
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Generate new API key
      const newKey = {
        id: editingKey ? editingKey.id : apiKeys.length + 1,
        key: editingKey ? editingKey.key : `key_${Math.random().toString(36).substring(7)}`,
        status: 'active',
        created: new Date().toISOString().split('T')[0],
        lastUsed: null,
        usage: {
          requests: 0,
          bandwidth: '0 B',
          errors: 0
        },
        ...formData
      };

      if (editingKey) {
        setApiKeys(prev => prev.map(key => 
          key.id === editingKey.id ? newKey : key
        ));
      } else {
        setApiKeys(prev => [...prev, newKey]);
      }

      setShowModal(false);
      setSuccessMessage(`API key successfully ${editingKey ? 'updated' : 'created'}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to generate API key');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeKey = async (keyId) => {
    try {
      // API call would go here
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      setSuccessMessage('API key successfully revoked');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to revoke API key');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  return (
    <Container>
      <Section>
        <div>
          <SectionTitle>
            <Database size={20} className="icon" />
            API Keys
          </SectionTitle>
          <SectionDescription>
            Manage API keys and control access to the MIRSAT API
          </SectionDescription>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <Button variant="primary" onClick={handleCreateKey}>
          <Plus size={16} />
            Generate New API Key
          </Button>
        </div>

        {apiKeys.map(key => (
          <APIKeyCard key={key.id}>
            <APIKeyHeader>
              <APIKeyInfo>
                <APIKeyName>{key.name}</APIKeyName>
                <APIKeyDetails>
                  <span>
                    <Clock size={14} />
                    Created: {key.created}
                  </span>
                  {key.lastUsed && (
                    <span>
                      <Activity size={14} />
                      Last used: {key.lastUsed}
                    </span>
                  )}
                  <StatusBadge status={key.status}>
                    {key.status.charAt(0).toUpperCase() + key.status.slice(1)}
                  </StatusBadge>
                </APIKeyDetails>
              </APIKeyInfo>
              <ButtonGroup>
                <Button size="small" onClick={() => handleEditKey(key)}>
                  <RefreshCw size={14} />
                  Update
                </Button>
                <Button 
                  variant="danger" 
                  size="small" 
                  onClick={() => handleRevokeKey(key.id)}
                >
                  <Trash2 size={14} />
                  Revoke
                </Button>
              </ButtonGroup>
            </APIKeyHeader>

            <APIKeyValue>
              {showKey[key.id] ? key.key : '•'.repeat(40)}
              <ButtonGroup>
                <Button size="small" onClick={() => toggleShowKey(key.id)}>
                  {showKey[key.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                </Button>
                <Button size="small" onClick={() => handleCopyKey(key.key)}>
                  <Copy size={14} />
                </Button>
              </ButtonGroup>
            </APIKeyValue>

            <APIKeyDescription>
              Environment: {key.environment.charAt(0).toUpperCase() + key.environment.slice(1)}
            </APIKeyDescription>

            <PermissionList>
              <PermissionItem>
                <span>Read Access</span>
                {key.permissions.read ? <CheckCircle size={16} color="#16a34a" /> : <XCircle size={16} color="#dc2626" />}
              </PermissionItem>
              <PermissionItem>
                <span>Write Access</span>
                {key.permissions.write ? <CheckCircle size={16} color="#16a34a" /> : <XCircle size={16} color="#dc2626" />}
              </PermissionItem>
              <PermissionItem>
                <span>Delete Access</span>
                {key.permissions.delete ? <CheckCircle size={16} color="#16a34a" /> : <XCircle size={16} color="#dc2626" />}
              </PermissionItem>
            </PermissionList>

            <UsageStats>
              <StatCard>
                <StatLabel>Total Requests</StatLabel>
                <StatValue>{key.usage.requests.toLocaleString()}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Bandwidth Used</StatLabel>
                <StatValue>{key.usage.bandwidth}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Error Rate</StatLabel>
                <StatValue>
                  {((key.usage.errors / key.usage.requests) * 100).toFixed(2)}%
                </StatValue>
              </StatCard>
            </UsageStats>
          </APIKeyCard>
        ))}
      </Section>

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalTitle>
              {editingKey ? 'Update API Key' : 'Generate New API Key'}
            </ModalTitle>

            <FormGroup>
              <Label>Key Name</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter a name for this API key"
              />
            </FormGroup>

            <FormGroup>
              <Label>Environment</Label>
              <Select
                value={formData.environment}
                onChange={(e) => setFormData(prev => ({ ...prev, environment: e.target.value }))}
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Expiration Date</Label>
              <Input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </FormGroup>

            <FormGroup>
              <Label>Permissions</Label>
              <PermissionList>
                <PermissionItem>
                  <span>Read Access</span>
                  <Toggle>
                    <ToggleInput
                      type="checkbox"
                      checked={formData.permissions.read}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        permissions: {
                          ...prev.permissions,
                          read: e.target.checked
                        }
                      }))}
                    />
                    <ToggleSlider />
                  </Toggle>
                </PermissionItem>
                <PermissionItem>
                  <span>Write Access</span>
                  <Toggle>
                    <ToggleInput
                      type="checkbox"
                      checked={formData.permissions.write}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        permissions: {
                          ...prev.permissions,
                          write: e.target.checked
                        }
                      }))}
                    />
                    <ToggleSlider />
                  </Toggle>
                </PermissionItem>
                <PermissionItem>
                  <span>Delete Access</span>
                  <Toggle>
                    <ToggleInput
                      type="checkbox"
                      checked={formData.permissions.delete}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        permissions: {
                          ...prev.permissions,
                          delete: e.target.checked
                        }
                      }))}
                    />
                    <ToggleSlider />
                  </Toggle>
                </PermissionItem>
              </PermissionList>
            </FormGroup>

            <ButtonGroup style={{ marginTop: '24px' }}>
              <Button onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.name || !formData.expiresAt}
              >
                {isSubmitting ? 'Generating...' : editingKey ? 'Update Key' : 'Generate Key'}
              </Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}

      {successMessage && (
        <SuccessMessage>
          <CheckCircle size={18} />
          {successMessage}
        </SuccessMessage>
      )}

      {errorMessage && (
        <WarningMessage>
          <AlertTriangle size={18} />
          {errorMessage}
        </WarningMessage>
      )}
    </Container>
  );
};

export default APISettings;